import { EmptyResult } from '@/components/EmptyResult';
import { Text } from '@mantine/core';
import ArchivedTask from './ArchivedTask';
import ArchivedTaskGroup from './ArchivedTaskGroup';

export default function ArchivedItems({ groups, tasks }) {
  const hasTasks = Object.keys(tasks).some(key => tasks[key].length > 0);

  return groups.length || hasTasks ? (
    <>
      {groups.length > 0 && (
        <>
          <Text
            fz={24}
            fw={600}
            mt={35}
            mb={20}
            c='white'
          >
            Task groups
          </Text>
          {groups.map(group => (
            <div key={`group-${group.id}`}>
              <ArchivedTaskGroup
                group={group}
              />
              {/* Display tasks under this group */}
              {tasks[group.id] && tasks[group.id].length > 0 && (
                <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                  {tasks[group.id].map(task => (
                    <ArchivedTask
                      key={`task-${task.id}`}
                      task={task}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}
      {/* Display tasks without groups separately if any */}
      {Object.keys(tasks).some(key => !groups.some(g => g.id == key) && tasks[key].length > 0) && (
        <>
          <Text
            fz={24}
            fw={600}
            mt={35}
            mb={20}
            c='white'
          >
            Tasks (without group)
          </Text>
          {Object.keys(tasks).map(key =>
            !groups.some(g => g.id == key) && tasks[key].map(task => (
              <ArchivedTask
                key={`task-${task.id}`}
                task={task}
              />
            ))
          )}
        </>
      )}
    </>
  ) : (
    <EmptyResult
      title='No tasks or groups found'
      description='or none match your search criteria'
    />
  );
}
