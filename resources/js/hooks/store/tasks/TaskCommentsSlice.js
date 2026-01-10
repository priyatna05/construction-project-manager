import axios from 'axios';
import { produce } from 'immer';

const safeFinish = onFinish => {
  if (typeof onFinish === 'function') {
    onFinish();
  }
};

const createTaskCommentsSlice = set => ({
  comments: [],
  fetchComments: async (task, onFinish) => {
    if (!task?.project_id || !task?.id) {
      safeFinish(onFinish);
      return;
    }

    try {
      const { data } = await axios.get(
        route('projects.tasks.comments', [task.project_id, task.id])
      );
      safeFinish(onFinish);

      return set(
        produce(state => {
          state.comments = data;
        })
      );
    } catch (e) {
      safeFinish(onFinish);
      console.error(e);
      alert('Failed to load comments');
    }
  },
  saveComment: async (task, comment, onFinish) => {
    if (!task?.project_id || !task?.id) {
      safeFinish(onFinish);
      return;
    }

    try {
      const { data } = await axios.post(
        route('projects.tasks.comments.store', [task.project_id, task.id]),
        { content: comment },
        { progress: true }
      );
      safeFinish(onFinish);

      return set(
        produce(state => {
          state.comments = [data.comment, ...state.comments];
        })
      );
    } catch (e) {
      safeFinish(onFinish);
      console.error(e);
      alert('Failed to save comment');
    }
  },
});

export default createTaskCommentsSlice;
