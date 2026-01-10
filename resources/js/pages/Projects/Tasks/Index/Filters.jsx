import useTaskGroupsStore from '@/hooks/store/useTaskGroupsStore';
import useTaskFiltersStore from '@/hooks/store/useTaskFiltersStore';
import { usePage } from '@inertiajs/react';
import { ColorSwatch, Group, Stack, Text } from '@mantine/core';
import FilterButton from './Filters/FilterButton';
import * as TablerIcons from '@tabler/icons-react';

export default function Filters() {
  const { usersWithAccessToProject, labels } = usePage().props;

  const { groups } = useTaskGroupsStore();
  const { filters, toggleArrayFilter, toggleValueFilter, toggleObjectFilter } =
    useTaskFiltersStore();

  const handleGroupClick = item => {
    const id = Number(item.id);
    toggleArrayFilter('groups', id);
  };

  const handleAssigneeClick = item => {
    const id = Number(item.id);
    toggleArrayFilter('assignees', id);
  };

  const handleDueDateClick = property => {
    toggleObjectFilter('due_date', property);
  };

  const handleStatusClick = value => {
    toggleValueFilter('status', value);
  };

  const handleLabelClick = item => {
    const id = Number(item.id);
    toggleArrayFilter('labels', id);
  };

  return (
    <>
      <Stack
        justify='flex-start'
        gap={24}
      >
        <Group
          gap={8}
          align='center'
        >
          <TablerIcons.IconFilter
            size={18}
            color='white'
          />
          <Text
            c='white'
            fw={700}
          >
            Filtered
          </Text>
        </Group>
        {groups.length > 0 && (
          <div>
            <Text
              fz='xs'
              fw={700}
              tt='uppercase'
              mb='sm'
              c='white'
            >
              Task groups
            </Text>
            <Stack
              justify='flex-start'
              gap={6}
            >
              {groups.map(item => {
                const id = Number(item.id);
                const selected = (filters.groups || []).map(Number).includes(id);
                return (
                  <FilterButton
                    key={id}
                    selected={selected}
                    onClick={() => handleGroupClick(item)}
                  >
                    {item.name}
                  </FilterButton>
                );
              })}
            </Stack>
          </div>
        )}

        {usersWithAccessToProject.length > 0 && (
          <div>
            <Text
              fz='xs'
              fw={700}
              tt='uppercase'
              mb='sm'
              c='white'
            >
              Assignees
            </Text>
            <Stack
              justify='flex-start'
              gap={6}
            >
              {usersWithAccessToProject.map(item => {
                const id = Number(item.id);
                const selected = (filters.assignees || []).map(Number).includes(id);
                return (
                  <FilterButton
                    key={id}
                    selected={selected}
                    onClick={() => handleAssigneeClick(item)}
                  >
                    {item.name}
                  </FilterButton>
                );
              })}
            </Stack>
          </div>
        )}

        <div>
          <Text
            fz='xs'
            fw={700}
            tt='uppercase'
            mb='sm'
            c='white'
          >
            Due date
          </Text>
          <Stack
            justify='flex-start'
            gap={6}
          >
            <FilterButton
              selected={filters.due_date.overdue === 1}
              onClick={() => handleDueDateClick('overdue')}
            >
              Overdue
            </FilterButton>
          </Stack>
        </div>

        <div>
          <Text
            fz='xs'
            fw={700}
            tt='uppercase'
            mb='sm'
            c='white'
          >
            Status
          </Text>
          <Stack
            justify='flex-start'
            gap={6}
          >
            <FilterButton
              selected={filters.status === 'completed'}
              onClick={() => handleStatusClick('completed')}
            >
              Completed
            </FilterButton>
          </Stack>
        </div>
        <div>
          <Text
            fz='xs'
            fw={700}
            tt='uppercase'
            mb='sm'
            c='white'
          >
            Labels
          </Text>
          <Stack
            justify='flex-start'
            gap={6}
          >
            {labels
              .filter(label => ['pt_status'].includes(label.type))
              .map(item => {
                const IconComponent = item.icon && TablerIcons[item.icon];
                return (
                  <FilterButton
                    key={item.id}
                    selected={(filters.labels || []).map(Number).includes(Number(item.id))}
                    onClick={() => handleLabelClick(item)}
                    leftSection={
                      IconComponent ? (
                        <IconComponent
                          size={18}
                          color={item.color}
                        />
                      ) : (
                        <ColorSwatch
                          color={item.color}
                          size={18}
                        />
                      )
                    }
                  >
                    {item.name}
                  </FilterButton>
                );
              })}
          </Stack>
        </div>
      </Stack>
    </>
  );
}
