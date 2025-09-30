import { Title, Text, Divider, Table, Group, Button, Grid, Card, ScrollArea } from '@mantine/core';
import { usePage } from '@inertiajs/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Layout from '@/layouts/MainLayout';
import { dateSlash } from '@/utils/datetime';

export default function ProjectDetail() {
  const { project } = usePage().props;
  const evmData =
    project.evm_records?.map(record => ({
      period: record.period,
      PV: record.planned_value,
      EV: record.earned_value,
      AC: record.actual_cost,
    })) ?? [];

  const latest = evmData.length ? evmData[evmData.length - 1] : { EV: 0, AC: 1, PV: 1 };
  const CPI = (latest.EV / latest.AC).toFixed(2);
  const SPI = (latest.EV / latest.PV).toFixed(2);
  const ETC = 100000 - latest.EV;
  const EAC = parseFloat(latest.AC) + ETC;

  const formatCurrency = (amount = 0) => `Rp ${Number(amount).toLocaleString('id-ID')}`;

  return (
    <Layout title='Project Report'>
      <Card
        shadow='md'
        p='lg'
        radius='md'
        mt='md'
      >
        <Group position='apart'>
          <Title order={2}>{project.name}</Title>
          <Group>
            <Button
              variant='outline'
              color='blue'
              component='a'
              href={`/projects/${project.id}/download-pdf`}
              target='_blank'
            >
              Download PDF
            </Button>
            <Button
              variant='outline'
              color='green'
              component='a'
              href={`/projects/${project.id}/export-excel`}
              target='_blank'
            >
              Export Excel
            </Button>
            <Button
              variant='outline'
              color='gray'
              onClick={() => window.print()}
            >
              Print
            </Button>
          </Group>
        </Group>

        <div dangerouslySetInnerHTML={{ __html: project.description }} />
        <Divider my='md' />

        <Grid>
          <Grid.Col span={4}>
            <Text>
              <strong>Client:</strong> {project.clientCompany?.name ?? '-'}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text>
              <strong>Start Date:</strong> {dateSlash(project.start_date)}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text>
              <strong>End Date:</strong> {dateSlash(project.end_date)}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text>
              <strong>Budget:</strong> {formatCurrency(project.budget_project)}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text>
              <strong>Status:</strong> {project.status}
            </Text>
          </Grid.Col>
        </Grid>

        <Title
          order={4}
          mt='lg'
          mb='xs'
        >
          Tasks
        </Title>
        <Divider mb='sm' />
        <ScrollArea>
          <Table
            striped
            withColumnBorders
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Name</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ textAlign: 'left' }}>Start</th>
                <th style={{ textAlign: 'left' }}>End</th>
                <th style={{ textAlign: 'left' }}>Budget task</th>
              </tr>
            </thead>
            <tbody>
              {project.tasks?.map(task => (
                <tr key={task.id}>
                  <td>
                    <Text>{task.name}</Text>
                  </td>
                  <td>
                    <Text>{task.labels?.map(label => label.name).join(', ')}</Text>
                  </td>
                  <td>
                    <Text>{dateSlash(task.start_date)}</Text>
                  </td>
                  <td>
                    <Text>{dateSlash(task.end_date)}</Text>
                  </td>
                  <td>
                    <Text>
                      {task.budget_task?.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }) ?? '-'}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>
                  <Text fw={700}>Total</Text>
                </td>
                <td>
                  <Text
                    fw={700}
                    color='blue'
                  >
                    {project.tasks
                      ?.reduce((sum, task) => sum + (parseFloat(task.budget_task) || 0), 0)
                      .toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </Text>
                </td>
              </tr>
            </tfoot>
          </Table>
        </ScrollArea>

        <Title
          order={4}
          mt='lg'
          mb='xs'
        >
          Inventory Allocation
        </Title>
        <Divider mb='sm' />
        <ScrollArea>
          <Table
            striped
            withColumnBorders
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Name</th>
                <th style={{ textAlign: 'left' }}>type</th>
                <th style={{ textAlign: 'left' }}>unit</th>
                <th style={{ textAlign: 'left' }}>Quantity</th>
                <th style={{ textAlign: 'left' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {project.inventories?.map(item => {
                const totalQuantityAllocated =
                  item.allocations?.reduce(
                    (sum, alloc) => sum + parseFloat(alloc.quantity_allocated || 0),
                    0
                  ) ?? 0;
                const totalCostAtAllocation =
                  item.allocations?.reduce(
                    (sum, alloc) => sum + parseFloat(alloc.cost_at_alloaction || 0),
                    0
                  ) ?? 0;

                return (
                  <tr key={item.id}>
                    <td>
                      <Text>{item.name}</Text>
                    </td>
                    <td>
                      <Text>{item.type?.name ?? '-'}</Text>
                    </td>
                    <td>
                      <Text>{item.unit?.name ?? '-'}</Text>
                    </td>
                    <td>
                      <Text>{totalQuantityAllocated.toFixed(2)}</Text>
                    </td>
                    <td>
                      <Text>{formatCurrency(totalCostAtAllocation)}</Text>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ScrollArea>

        <Title
          order={4}
          mt='lg'
          mb='xs'
        >
          Team Members
        </Title>
        <Divider mb='sm' />
        <Table withColumnBorders>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Name</th>
              <th style={{ textAlign: 'left' }}>Email</th>
              <th style={{ textAlign: 'left' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {project.users?.map(user => (
              <tr key={user.id}>
                <td>
                  <Text>{user.name ?? '-'}</Text>
                </td>
                <td>
                  <Text>{user.email ?? '-'}</Text>
                </td>
                <td>
                  <Text>{user.roles ?? '-'}</Text>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Title
          order={4}
          mt='lg'
          mb='xs'
        >
          Earned Value Management
        </Title>
        <Divider mb='sm' />
        <ResponsiveContainer
          width='100%'
          height={300}
        >
          <LineChart data={evmData}>
            <XAxis dataKey='period' />
            <YAxis />
            <CartesianGrid stroke='#ccc' />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='PV'
              stroke='#8884d8'
            />
            <Line
              type='monotone'
              dataKey='EV'
              stroke='#82ca9d'
            />
            <Line
              type='monotone'
              dataKey='AC'
              stroke='#ff7300'
            />
          </LineChart>
        </ResponsiveContainer>

        <Grid mt='md'>
          <Grid.Col span={4}>
            <Text>
              <strong>CPI:</strong> {CPI}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text>
              <strong>SPI:</strong> {SPI}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text>
              <strong>ETC:</strong> {formatCurrency(ETC)}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text>
              <strong>EAC:</strong> {formatCurrency(EAC)}
            </Text>
          </Grid.Col>
        </Grid>
      </Card>
    </Layout>
  );
}
