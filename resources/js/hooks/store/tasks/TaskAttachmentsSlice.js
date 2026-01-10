import { onUploadProgress } from '@/utils/axios';
import { useFlashStore } from '@/hooks/store/useFlashStore';
import axios from 'axios';
import { produce } from 'immer';

const createTaskAttachmentsSlice = (set, get) => ({
  uploadAttachments: async (task, files) => {
    const index = get().tasks[task.group_id].findIndex(i => i.id === task.id);

    try {
      const formData = new FormData();
      files.forEach(file => {
        if (file instanceof File) {
          formData.append('attachments[]', file);
        }
      });

      const { data } = await axios.post(
        route('projects.tasks.attachments.upload', [task.project_id, task.id]),
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress
        }
      );

      set(
        produce(state => {
          state.tasks[task.group_id][index].attachment_files = [
            ...state.tasks[task.group_id][index].attachment_files,
            ...data.files,
          ];
          state.tasks[task.group_id][index]._attachmentUpdated = Date.now();
        })
      );

      // Show success flash message
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Upload successful',
        message: `${data.files.length} attachment(s) uploaded successfully.`,
      });
    } catch (e) {
      console.error('Upload error:', e);
      const message = e.response?.data?.message || e.response?.data?.error || e.message || 'Failed to upload attachments';
      alert(message);
    }
  },
  deleteAttachment: async (task, index) => {
    const taskIndex = get().tasks[task.group_id].findIndex(i => i.id === task.id);

    try {
      const deleteId = get().tasks[task.group_id][taskIndex].attachment_files[index].id;
      await axios.delete(
        route('projects.tasks.attachments.destroy', [task.project_id, task.id, deleteId])
      );

      set(
        produce(state => {
          state.tasks[task.group_id][taskIndex].attachment_files = [
            ...state.tasks[task.group_id][taskIndex].attachment_files.filter(i => i.id !== deleteId),
          ];
        })
      );

      // Show success flash message
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Delete successful',
        message: 'Attachment deleted successfully.',
      });
    } catch (e) {
      console.error('Delete error:', e);
      const message = e.response?.data?.message || 'Failed to delete attachment';
      alert(message);
    }
  },
});

export default createTaskAttachmentsSlice;
