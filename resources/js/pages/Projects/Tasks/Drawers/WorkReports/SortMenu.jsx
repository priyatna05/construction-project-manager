import { Menu, ActionIcon } from '@mantine/core';
import { IconFilter, IconSortAscending, IconSortDescending } from '@tabler/icons-react';

export default function SortMenu({ setSortOption }) {
  return (
    <Menu
      shadow='md'
      width={200}
      trigger='hover'
      openDelay={100}
      closeDelay={400}
      withArrow
      position='right-start'
      offset={4}
      transitionProps={{ transition: 'pop', duration: 150 }}
    >
      <Menu.Target>
        <ActionIcon
          variant='default'
          size='lg'
        >
          <IconFilter
            size={20}
            color='blue'
            stroke={3}
          />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Sort by Date</Menu.Label>
        <Menu.Item
          leftSection={<IconSortAscending size={14} />}
          onClick={() => setSortOption('date-asc')}
        >
          Oldest First
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSortDescending size={14} />}
          onClick={() => setSortOption('date-desc')}
        >
          Newest First
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>Sort by Progress</Menu.Label>
        <Menu.Item
          leftSection={<IconSortAscending size={14} />}
          onClick={() => setSortOption('progress-asc')}
        >
          Lowest to Highest
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSortDescending size={14} />}
          onClick={() => setSortOption('progress-desc')}
        >
          Highest to Lowest
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>Sort by Status</Menu.Label>
        <Menu.Item
          leftSection={<IconSortAscending size={14} />}
          onClick={() => setSortOption('status-asc')}
        >
          A-Z
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSortDescending size={14} />}
          onClick={() => setSortOption('status-desc')}
        >
          Z-A
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
