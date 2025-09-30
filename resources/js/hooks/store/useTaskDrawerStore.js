import { replaceUrlWithoutReload } from '@/utils/route';
import { produce } from 'immer';
import { create } from 'zustand';

const useTaskDrawerStore = create((set, get) => ({
  create: {
    opened: false,
    group_id: null,
  },
  edit: {
    opened: false,
    task: {}, // Inisialisasi sebagai objek kosong sudah OK
  },

  // Fungsi openCreateTask dan closeCreateTask sudah benar, tidak perlu diubah.
  openCreateTask: (groupId = null) => {
    return set(
      produce(state => {
        state.create.opened = true;
        state.create.group_id = groupId;
      })
    );
  },
  closeCreateTask: () => {
    return set(
      produce(state => {
        state.create.opened = false;
        state.create.group_id = null;
      })
    );
  },

  // Fungsi openEditTask sudah benar.
  openEditTask: task => {
    // Pastikan task adalah objek yang valid sebelum melanjutkan
    if (task && task.id && task.project_id) {
      replaceUrlWithoutReload(route('projects.tasks.open', [task.project_id, task.id]));

      return set(
        produce(state => {
          state.edit.opened = true;
          state.edit.task = task;
        })
      );
    } else {
      console.error('openEditTask called with invalid task object:', task);
    }
  },

  // ====================================================================
  // ===== BLOK KODE PERBAIKAN ADA DI SINI ==============================
  // ====================================================================
  closeEditTask: () => {
    // 1. Ambil task saat ini dari state SEBELUM kita mengubahnya.
    const currentTask = get().edit.task;

    // 2. Hanya ubah URL jika ada task yang valid di dalam state.
    // Ini mencegah error jika `currentTask` adalah objek kosong.
    if (currentTask && currentTask.project_id) {
      replaceUrlWithoutReload(route('projects.tasks', currentTask.project_id));
    }

    // 3. Update state: tutup drawer DAN reset/bersihkan data task.
    return set(
      produce(state => {
        state.edit.opened = false;
        // Ini adalah langkah paling penting untuk mencegah "state basi".
        // `edit.task` sekarang kembali ke kondisi awal yang bersih.
        state.edit.task = {};
      })
    );
  },
}));

export default useTaskDrawerStore;
