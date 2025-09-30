import { useState } from 'react';
import { Button, Modal, Table, TextInput, Group, ActionIcon, ScrollArea } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';

export default function DetailProgress() {
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [progressData, setProgressData] = useState([
    // contoh dummy data
    {
      id: 1,
      date: '2025-06-01',
      progress: 80,
      cost: 2000000,
      labor: 2,
      material: 'Cement',
      status: 'In progress',
    },
  ]);

  const filtered = progressData.filter(item =>
    item.material.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Button
        mt='xl'
        variant='white'
        onClick={() => setOpened(true)}
      >
        Daily or Weekly Form Progress Task
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title='Task Progress Daily/Weekly Details'
        size='xl'
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Group
          mb='md'
          position='apart'
        >
          <TextInput
            placeholder='Search material or task...'
            icon={<IconSearch size={16} />}
            value={search}
            onChange={e => setSearch(e.currentTarget.value)}
          />
          <Button leftSection={<IconPlus size={14} />}>Add Progress</Button>
        </Group>

        <Table
          striped
          highlightOnHover
          withBorder
          withColumnBorders
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Progress (%)</th>
              <th>Actual Cost</th>
              <th>Labor</th>
              <th>Material</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.progress}</td>
                <td>{item.cost.toLocaleString()}</td>
                <td>{item.labor}</td>
                <td>{item.material}</td>
                <td>{item.progress >= 100 ? 'Completed' : item.status}</td>
                <td>
                  <Group gap='xs'>
                    <ActionIcon
                      color='blue'
                      variant='light'
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color='red'
                      variant='light'
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal>
    </>
  );
}
