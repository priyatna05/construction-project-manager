export function isParent(taskId, allTasks = []) {
  return allTasks.some(
    task =>
      Array.isArray(task.dependencies) &&
      task.dependencies.some(dep => dep.depends_on_task_id === taskId)
  );
}

export function isChild(task = {}) {
  return Array.isArray(task.dependencies) && task.dependencies.length > 0;
}
