import { ActionIcon, Badge, Box, Group, Paper, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconDownload, IconRefresh, IconTrash } from '@tabler/icons-react';
import EmptyState from './EmptyState';
import SectionCard from './SectionCard';
import {
  REPORT_TYPES,
  formatDateTime,
  formatFilterSummary,
  resolveStatusColor,
} from '../../../utils/reportConfig';

const QueueTable = ({ exportQueue, onRetry, onDelete, onDownload }) => (
  <Table.ScrollContainer miw={760}>
    <Table verticalSpacing='sm'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Export</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Format</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Created</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {exportQueue.map(item => (
          <Table.Tr key={item.id}>
            <Table.Td>
              <Text fw={600}>{item.name}</Text>
              <Text size='xs' c='dimmed'>
                {formatFilterSummary(item.filters)}
              </Text>
            </Table.Td>
            <Table.Td>
              {REPORT_TYPES.find(option => option.value === item.report_type)?.label || item.report_type}
            </Table.Td>
            <Table.Td>{item.format?.toUpperCase() || '-'}</Table.Td>
            <Table.Td>
              <Badge variant='light' color={resolveStatusColor(item.status)}>
                {item.status}
              </Badge>
            </Table.Td>
            <Table.Td>{formatDateTime(item.created_at)}</Table.Td>
            <Table.Td>
              <Group gap='xs'>
                <Tooltip label='Download'>
                  <ActionIcon
                    variant='light'
                    color='blue'
                    disabled={!item.can_download}
                    onClick={() => item.can_download && onDownload(item)}
                  >
                    <IconDownload size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label='Retry'>
                  <ActionIcon
                    variant='light'
                    color='orange'
                    disabled={item.status !== 'failed'}
                    onClick={() => onRetry(item)}
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label='Delete'>
                  <ActionIcon
                    variant='light'
                    color='red'
                    onClick={() => onDelete(item)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              {item.error_message && (
                <Text size='xs' c='red' mt={6}>
                  {item.error_message}
                </Text>
              )}
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  </Table.ScrollContainer>
);

const QueueCards = ({ exportQueue, onRetry, onDelete, onDownload }) => (
  <Stack gap='sm'>
    {exportQueue.map(item => (
      <Paper
        key={item.id}
        withBorder
        radius='md'
        p='sm'
      >
        <Stack gap='xs'>
          <Box>
            <Text fw={600}>{item.name}</Text>
            <Text size='xs' c='dimmed'>
              {formatFilterSummary(item.filters)}
            </Text>
          </Box>
          <Group gap='xs' wrap='wrap'>
            <Badge variant='light'>
              {REPORT_TYPES.find(option => option.value === item.report_type)?.label || item.report_type}
            </Badge>
            <Badge variant='light'>{item.format?.toUpperCase() || '-'}</Badge>
            <Badge variant='light' color={resolveStatusColor(item.status)}>
              {item.status}
            </Badge>
          </Group>
          <Group justify='space-between' align='center'>
            <Text size='xs' c='dimmed'>
              {formatDateTime(item.created_at)}
            </Text>
            <Group gap='xs'>
              <Tooltip label='Download'>
                <ActionIcon
                  variant='light'
                  color='blue'
                  disabled={!item.can_download}
                  onClick={() => item.can_download && onDownload(item)}
                >
                  <IconDownload size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Retry'>
                <ActionIcon
                  variant='light'
                  color='orange'
                  disabled={item.status !== 'failed'}
                  onClick={() => onRetry(item)}
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Delete'>
                <ActionIcon
                  variant='light'
                  color='red'
                  onClick={() => onDelete(item)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
          {item.error_message && (
            <Text size='xs' c='red'>
              {item.error_message}
            </Text>
          )}
        </Stack>
      </Paper>
    ))}
  </Stack>
);

export default function ExportQueue({
  exportQueue,
  onRetry,
  onDelete,
  onDownload = () => {},
  variant = 'card',
}) {
  return (
    <SectionCard
      variant={variant}
    >
      {exportQueue.length === 0 ? (
        <EmptyState
          message='No export requests yet.'
          height={140}
        />
      ) : (
        <>
          <Box visibleFrom='sm'>
            <QueueTable
              exportQueue={exportQueue}
              onRetry={onRetry}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          </Box>
          <Box hiddenFrom='sm'>
            <QueueCards
              exportQueue={exportQueue}
              onRetry={onRetry}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          </Box>
        </>
      )}
    </SectionCard>
  );
}
