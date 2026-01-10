import { move, reorder } from '@/utils/reorder';
import { produce } from 'immer';

const createTaskWebSocketUpdatesSlice = (set, get) => ({
  addTaskLocally: task => {
    return set(
      produce(state => {
        state.tasks[task.group_id] = [task, ...state.tasks[task.group_id]];
      })
    );
  },
  updateTaskLocally: (taskId, property, value) => {
    set(
      produce(state => {
        const task = get().findTask(taskId);
        const index = state.tasks[task.group_id].findIndex(i => i.id === task.id);

        if (property === 'group_id' && task.group_id !== value) {
          const result = move(state.tasks, task.group_id, value, index, 0);

          state.tasks[task.group_id] = result[task.group_id];
          state.tasks[value] = result[value];

          state.tasks[value][0][property] = value;
        } else {
          state.tasks[task.group_id][index][property] = value;
        }
      })
    );


  },
  removeTaskLocally: taskId => {
    return set(
      produce(state => {
        const task = get().findTask(taskId);

        state.tasks[task.group_id] = state.tasks[task.group_id].filter(i => i.id !== task.id);
      })
    );
  },
  restoreTaskLocally: (groupId, newTask) => {
    return set(
      produce(state => {
        state.tasks[groupId] = [newTask, ...state.tasks[groupId]].sort((a, b) =>
          a.order_column > b.order_column ? 1 : -1
        );
      })
    );
  },
  addCommentLocally: comment => {
    return set(
      produce(state => {
        state.comments = [comment, ...state.comments];
      })
    );
  },
  addAttachmentsLocally: attachments => {
    return set(
      produce(state => {
        const task = get().findTask(attachments[0].task_id);
        const index = state.tasks[task.group_id].findIndex(i => i.id === task.id);

        state.tasks[task.group_id][index].attachments = [
          ...state.tasks[task.group_id][index].attachments,
          ...attachments,
        ];
      })
    );
  },
  removeAttachmentLocally: (taskId, attachmentId) => {
    return set(
      produce(state => {
        const task = get().findTask(taskId);
        const index = state.tasks[task.group_id].findIndex(i => i.id === taskId);

        state.tasks[task.group_id][index].attachments = state.tasks[task.group_id][
          index
        ].attachments.filter(i => i.id !== attachmentId);
      })
    );
  },
  addInventoryLocally: (taskId, inventoryId) => {
    // Nama dan parameter kurang tepat
    return set(
      produce(state => {
        // 1. Fungsi findInventory tidak ada di store
        const inventory = get().findInventory(taskId);

        // 2. Logika pencarian index salah
        const index = state.tasks[inventory.group_id].findIndex(i => i.id === taskId);

        // 3. Logika pembaruan state salah total.
        //    - Mengakses state.inventories (seharusnya state.tasks)
        //    - Mengakses inventory.group_id[index] (tidak masuk akal)
        //    - Menggunakan .filter seolah-olah ingin menghapus, bukan menambah/memperbarui.
        state.inventories[inventory.group_id[index]].inventories = state.inventories[
          inventory.group_id
        ][index].inventories.filter(i => i.id !== inventoryId);
      })
    );
  },
  updateTaskInventoryLocally: (taskId, inventories) => {
    return set(
      produce(state => {
        // 1. Temukan tugas yang relevan menggunakan findTask yang sudah ada.
        const task = get().findTask(taskId);

        // Jika tugas tidak ditemukan di state (mungkin belum dimuat), hentikan.
        if (!task) {
          console.warn(
            `[WebSocket] Task with ID ${taskId} not found in local store. Cannot update inventory.`
          );
          return;
        }

        // 2. Temukan indeks tugas di dalam grupnya.
        const taskIndex = state.tasks[task.group_id].findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
          console.warn(`[WebSocket] Task with ID ${taskId} not found in group ${task.group_id}.`);
          return;
        }

        // 3. Transform WebSocket data to match API format for consistency
        const transformedInventories = inventories.map(allocation => ({
          inventory_id: allocation.inventory_id,
          task_id: allocation.task_id,
          quantity_allocated: allocation.quantity_allocated,
          cost_at_allocation: allocation.cost_at_allocation,
          notes: allocation.notes,
          inventory: allocation.inventory,
        }));

        // 4. Perbarui properti 'allocated_inventories' pada objek tugas tersebut.
        // Kita mengganti seluruh array dengan data baru dari server.
        state.tasks[task.group_id][taskIndex].allocated_inventories = transformedInventories;

        // 5. Trigger re-render by updating a dummy property to force component updates
        state.tasks[task.group_id][taskIndex]._inventoryUpdated = Date.now();
      })
    );
  },
  reorderTaskLocally: (groupId, fromIndex, toIndex) => {
    const result = reorder(get().tasks[groupId], fromIndex, toIndex);
    return set(
      produce(state => {
        state.tasks[groupId] = result;
      })
    );
  },
  moveTaskLocally: (fromGroupId, toGroupId, fromIndex, toIndex) => {
    const result = move(get().tasks, fromGroupId, toGroupId, fromIndex, toIndex);

    return set(
      produce(state => {
        state.tasks[fromGroupId] = result[fromGroupId];
        state.tasks[toGroupId] = result[toGroupId];
        state.tasks[toGroupId][toIndex] = {
          ...state.tasks[toGroupId][toIndex],
          group_id: toGroupId,
        };
      })
    );
  },
});

export default createTaskWebSocketUpdatesSlice;
