import { Group, Menu, ActionIcon, TextInput, Tooltip } from '@mantine/core';
import { IconFilter, IconPlus, IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons-react';

export default function Toolbar({
  // eslint-disable-next-line no-unused-vars
  sortOption,
  setSortOption,
  modalSearch,
  setModalSearch,
  onAdd,
  disabled = false,
}) {
  return (
    <Group mb='md'>
      <Menu
        shadow='md'
        width={200}
        trigger='hover'
        zIndex={2500}
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
          <Menu.Label>Sort by Name</Menu.Label>
          <Menu.Item
            leftSection={<IconSortAscending size={14} />}
            onClick={() => setSortOption('name-asc')}
          >
            A-Z
          </Menu.Item>
          <Menu.Item
            leftSection={<IconSortDescending size={14} />}
            onClick={() => setSortOption('name-desc')}
          >
            Z-A
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Sort by Type</Menu.Label>
          <Menu.Item
            leftSection={<IconSortAscending size={14} />}
            onClick={() => setSortOption('type-asc')}
          >
            A-Z
          </Menu.Item>
          <Menu.Item
            leftSection={<IconSortDescending size={14} />}
            onClick={() => setSortOption('type-desc')}
          >
            Z-A
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Sort by Quantity</Menu.Label>
          <Menu.Item
            leftSection={<IconSortAscending size={14} />}
            onClick={() => setSortOption('qty-asc')}
          >
            Lowest to Highest
          </Menu.Item>
          <Menu.Item
            leftSection={<IconSortDescending size={14} />}
            onClick={() => setSortOption('qty-desc')}
          >
            Highest to Lowest
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <TextInput
        placeholder='Search allocated items...'
        leftSection={<IconSearch size={16} />}
        value={modalSearch}
        onChange={e => setModalSearch(e.target.value)}
      />
      {!disabled && (
        <Tooltip
          label='Add new resource'
          withArrow
          position='top'
          color='green'
        >
          <ActionIcon
            color='green'
            variant='filled'
            size='lg'
            onClick={onAdd}
          >
            <IconPlus size={20} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
