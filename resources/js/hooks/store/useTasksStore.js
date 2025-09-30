import createTaskAttachmentsSlice from '@/hooks/store/tasks/TaskAttachmentsSlice';
import createTaskCommentsSlice from '@/hooks/store/tasks/TaskCommentsSlice';
import createTaskWebSocketUpdatesSlice from '@/hooks/store/tasks/TaskWebSocketUpdatesSlice';
import { move, reorder } from '@/utils/reorder';
import axios from 'axios';
import { produce } from 'immer';
import { create } from 'zustand';

const normalizePayload = payload => {
  const normalized = {};

  for (const [key, value] of Object.entries(payload)) {
    // Menangani ID yang mungkin kosong
    if (
      ['depends_on_task_id', 'relation_type_id', 'assigned_to_user_id', 'group_id'].includes(key)
    ) {
      normalized[key] = value === '' || value === null ? null : Number(value);
    }
    // Menangani relasi yang nilainya array
    else if (['labels', 'subscribed_users', 'inventories'].includes(key)) {
      normalized[key] = Array.isArray(value)
        ? value.map(v => (typeof v === 'object' ? v.id : Number(v)))
        : [];
    } else if (key === 'dependencies') {
      // Kirim apa adanya, backend yang akan menangani formatnya
      normalized[key] = value;
    }
    // Menangani attachments (biasanya ini untuk upload file baru, bukan update)
    else if (key === 'attachments') {
      normalized[key] = Array.isArray(value) ? value : value ? [value] : [];
    }
    // Untuk properti lainnya
    else {
      normalized[key] = value;
    }
  }

  return normalized;
};

const useTasksStore = create((set, get) => ({
  ...createTaskAttachmentsSlice(set, get),
  ...createTaskCommentsSlice(set, get),
  ...createTaskWebSocketUpdatesSlice(set, get),

  tasks: {},
  setTasks: tasks => set(() => ({ tasks: { ...tasks } })),

  addTask: task => {
    return set(
      produce(state => {
        // Pastikan grup sudah ada sebelum menambah task
        if (!state.tasks[task.group_id]) {
          state.tasks[task.group_id] = [];
        }
        const index = state.tasks[task.group_id].findIndex(i => i.id === task.id);
        if (index === -1) {
          state.tasks[task.group_id].push(task);
        }
      })
    );
  },

  findTask: id => {
    const numericId = Number(id);
    for (const groupId in get().tasks) {
      const task = get().tasks[groupId].find(i => i.id === numericId);
      if (task) {
        return task;
      }
    }
    return null;
  },

  updateTaskProperty: async (task, property, value, options = null) => {
    try {
      const payload = { [property]: value };
      const normalizedPayload = normalizePayload(payload);

      await axios.patch(
        route('projects.tasks.update', [task.project_id, task.id]),
        normalizedPayload, // Payload sekarang kecil dan bersih, misal: { description: "teks baru" }
        { progress: false }
      );

      return set(
        produce(state => {
          const currentTask = get().findTask(task.id);
          if (!currentTask) return; // Jika task tidak ditemukan, hentikan.

          const index = state.tasks[currentTask.group_id].findIndex(i => i.id === task.id);
          if (index === -1) return;

          // Logika untuk memindahkan task antar grup jika group_id berubah
          if (property === 'group_id' && currentTask.group_id !== value) {
            const destinationGroupId = Number(value);
            const result = move(state.tasks, currentTask.group_id, destinationGroupId, index, 0); // Pindah ke paling atas
            state.tasks = result; // Ganti seluruh objek tasks dengan hasil dari 'move'

            // Update group_id di task yang baru dipindahkan
            const movedTask = state.tasks[destinationGroupId].find(t => t.id === task.id);
            if (movedTask) {
              movedTask.group_id = destinationGroupId;
            }
          }
          // Logika untuk update properti biasa
          else {
            // 'options' digunakan untuk update visual yang lebih kaya di UI,
            // misal untuk label, kita ingin menampilkan objek label, bukan hanya ID.
            state.tasks[currentTask.group_id][index][property] = options || value;
          }
        })
      );
    } catch (e) {
      console.error('Failed to update task:', e);
      // Tampilkan pesan error yang lebih informatif dari server jika ada
      const serverMessage = e.response?.data?.message;
      alert(`Update failed: ${serverMessage || e.message}`);

      // TODO: Implementasikan mekanisme rollback jika update gagal.
      // Ini adalah langkah lanjutan untuk membatalkan perubahan di UI jika server error.
    }
  },
  updateTaskDependencies: async (task, dependencyId, relationTypeId) => {
    try {
      //log
      console.log('2. [useTasksStore] updateTaskDependencies dipanggil:', {
        dependencyId,
        relationTypeId,
      });
      const payload = {
        dependencies:
          dependencyId && relationTypeId
            ? [{ id: dependencyId, relation_type_id: relationTypeId }]
            : [], // Kirim array kosong untuk menghapus dependensi
      };

      // Kirim request PATCH dengan payload 'dependencies'
      console.log('3. [useTasksStore] Payload yang akan dikirim:', payload);

      const response = await axios.patch(
        route('projects.tasks.update', [task.project_id, task.id]),
        payload,
        { progress: false }
      );
      const updatedTaskFromServer = response.data;
      set(
        produce(state => {
          const currentTask = get().findTask(task.id);
          if (currentTask) {
            const index = state.tasks[currentTask.group_id].findIndex(t => t.id === task.id);
            if (index !== -1) {
              // Ganti seluruh objek task di store dengan versi terbaru dari server
              state.tasks[currentTask.group_id][index] = updatedTaskFromServer;
            }
          }
        })
      );
    } catch (e) {
      console.error('Failed to update task dependencies:', e);
      const serverMessage = e.response?.data?.message;
      alert(`Dependency update failed: ${serverMessage || e.message}`);
    }
  },
  updateTaskSubscribers: async (task, subscribers) => {
    try {
      const payload = {
        subscribed_users: subscribers.map(id => Number(id)), // kirim sebagai array of integer
      };

      const response = await axios.patch(
        route('projects.tasks.update', [task.project_id, task.id]),
        payload,
        { progress: false }
      );

      const updatedTaskFromServer = response.data;

      set(
        produce(state => {
          const currentTask = get().findTask(task.id);
          if (!currentTask) return;

          const index = state.tasks[currentTask.group_id].findIndex(t => t.id === task.id);
          if (index !== -1) {
            state.tasks[currentTask.group_id][index] = updatedTaskFromServer;
          }
        })
      );
    } catch (e) {
      console.error('Failed to update subscribers:', e);
      const msg = e.response?.data?.message;
      alert(`Failed to update subscribers: ${msg || e.message}`);
    }
  },
  complete: (task, checked) => {
    const newState = checked ? new Date().toISOString() : null;
    const currentTask = get().findTask(task.id);
    if (!currentTask) return;

    set(
      produce(state => {
        const index = state.tasks[currentTask.group_id].findIndex(i => i.id === task.id);
        if (index !== -1) {
          state.tasks[currentTask.group_id][index].completed_at = newState;
        }
      })
    );

    // Kirim request ke server
    axios
      .post(route('projects.tasks.complete', [task.project_id, task.id]), { completed: checked })
      .catch(e => {
        console.error('Failed to save task completion:', e);
        alert('Failed to save task completion status.');
        // Rollback state jika gagal
        set(
          produce(state => {
            const index = state.tasks[currentTask.group_id].findIndex(i => i.id === task.id);
            if (index !== -1) {
              state.tasks[currentTask.group_id][index].completed_at = currentTask.completed_at;
            }
          })
        );
      });
  },

  // Fungsi reorderTask dan moveTask sudah baik karena mereka memang perlu mengirim
  // data yang lebih kompleks (urutan ID, ID grup asal dan tujuan).
  reorderTask: (source, destination) => {
    const sourceGroupId = +source.droppableId.split('-')[1];

    const result = reorder(get().tasks[sourceGroupId], source.index, destination.index);

    const data = {
      ids: result.map(i => i.id),
      group_id: sourceGroupId,
      from_index: source.index,
      to_index: destination.index,
    };

    axios
      .post(route('projects.tasks.reorder', [route().params.project]), data, { progress: false })
      .catch(() => alert('Failed to save task reorder action'));

    return set(
      produce(state => {
        state.tasks[sourceGroupId] = result;
      })
    );
  },
  moveTask: (source, destination) => {
    const sourceGroupId = +source.droppableId.split('-')[1];
    const destinationGroupId = +destination.droppableId.split('-')[1];

    const result = move(
      get().tasks,
      sourceGroupId,
      destinationGroupId,
      source.index,
      destination.index
    );

    const data = {
      ids: result[destinationGroupId].map(i => i.id),
      from_group_id: sourceGroupId,
      to_group_id: destinationGroupId,
      from_index: source.index,
      to_index: destination.index,
    };

    axios
      .post(route('projects.tasks.move', [route().params.project]), data, { progress: false })
      .catch(() => alert('Failed to save task move action'));

    return set(
      produce(state => {
        state.tasks[sourceGroupId] = result[sourceGroupId];
        state.tasks[destinationGroupId] = result[destinationGroupId];
      })
    );
  },
}));

export default useTasksStore;
