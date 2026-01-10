import {
  NumberInput,
  Text,
  Group,
  Badge,
  Table,
  ActionIcon,
  Paper,
  Stack,
  Box,
  ThemeIcon,
  Progress,
  Card,
  Divider,
  SimpleGrid,
  rem,
  RingProgress,
  Center,
  Tooltip,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCurrencyDollar,
  IconChartBar,
  IconCheck,
  IconEdit,
  IconAlertTriangle,
  IconPercentage,
  IconReceipt,
  IconChartLine,
} from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { useFlashStore } from '@/hooks/store/useFlashStore';
import axios from 'axios';
import { money } from '@/utils/currency';

export default function BudgetOverview({ project }) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isLocked = Boolean(project?.is_completed);

  const [overheadRate, setOverheadRate] = useState(project?.overhead_site_rate || 10);
  const [adminRate, setAdminRate] = useState(project?.administrative_rate || 5);
  const [contRate, setContRate] = useState(project?.contingency_rate || 3);
  const [profitRate, setProfitRate] = useState(project?.profit_rate || 0);
  const [taxRate, setTaxRate] = useState(project?.tax_rate || 0);
  const [editableColumn, setEditableColumn] = useState(null);
  const [loadingColumn, setLoadingColumn] = useState(null);

  const directCostPlan = project?.direct_cost_plan || 0;
  const directCostActual = project?.direct_cost_actual || 0;

  // Calculated values from backend plan
  const overheadCostPlan = project?.overhead_site_cost_plan || 0;
  const adminCostPlan = project?.administrative_cost_plan || 0;
  const contingencyCostPlan = project?.contingency_cost_plan || 0;
  const profitCostPlan = project?.profit_cost_plan || 0;
  const taxCostPlan = project?.tax_cost_plan || 0;
  // Calculated values from backend actual
  const overheadCostActual = project?.overhead_site_cost_actual || 0;
  const adminCostActual = project?.administrative_cost_actual || 0;
  const contingencyCostActual = project?.contingency_cost_actual || 0;
  const profitCostActual = project?.profit_cost_actual || 0;
  const taxCostActual = project?.tax_cost_actual || 0;

  const budgetFinal = project?.budget_project_final_plan || 0;
  const budgetActual = project?.budget_project_actual || 0;

  // const budgetEstimate = project?.budget_project_estimate || 0;
  const budgetGrandTotalPlan = project?.budget_project_grandtotal_plan || 0;
  const budgetGrandTotalActual = project?.budget_project_grandtotal_actual || 0;

  const toggleEditable = async (label, field, value) => {
    if (isLocked) return;
    if (editableColumn === label) {
      setLoadingColumn(label);
      try {
        await axios.post(route('projects.update', project.id), {
          [field]: value,
        });

        const { setFlash } = useFlashStore.getState();
        setFlash({
          type: 'success',
          title: 'Budget Updated',
          message: `${label} updated to ${value}`,
        });
        setEditableColumn(null);
      } catch (err) {
        console.error(err);
        const { setFlash } = useFlashStore.getState();
        setFlash({
          type: 'error',
          title: 'Update Failed',
          message: err.response?.data?.message || 'Failed to update project budget',
        });
      } finally {
        setLoadingColumn(null);
      }
    } else {
      setEditableColumn(label);
    }
  };

  const budgetProgress = directCostPlan > 0 ? (directCostActual / directCostPlan) * 100 : 0;
  const isOverBudget = directCostActual > directCostPlan;

  const BudgetCard = ({
    icon: Icon,
    label,
    value,
    color = 'blue',
    subtitle,
    editable,
    rate,
    setRate,
    field,
  }) => (
    <Card
      withBorder
      radius='md'
      p='md'
    >
      <Group
        justify='space-between'
        mb='xs'
      >
        <Group gap='xs'>
          <ThemeIcon
            size='md'
            radius='md'
            variant='light'
            color={color}
          >
            <Icon style={{ width: rem(18), height: rem(18) }} />
          </ThemeIcon>
          <Box>
            <Text
              size='xs'
              c='dimmed'
              tt='uppercase'
              fw={600}
            >
              {label}
            </Text>
            {subtitle && (
              <Text
                size='xs'
                c='dimmed'
              >
                {subtitle}
              </Text>
            )}
          </Box>
        </Group>
        {editable && !isLocked && typeof window !== 'undefined' && window.can?.('edit project') && (
          <Tooltip
            label={
              loadingColumn === label
                ? 'Saving...'
                : editableColumn === label
                  ? 'Click to save'
                  : 'Edit'
            }
            color='green'
          >
            <ActionIcon
              size='sm'
              variant='light'
              color={editableColumn === label ? 'green' : 'gray'}
              onClick={() => toggleEditable(label, field, rate)}
              loading={loadingColumn === label}
            >
              {editableColumn === label ? <IconCheck size={16} /> : <IconEdit size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      {editable && rate !== undefined ? (
        <NumberInput
          variant='filled'
          size='sm'
          disabled={editableColumn !== label}
          value={rate}
          onChange={setRate}
          min={0}
          max={100}
          step={0.1}
          suffix='%'
          rightSection={<IconPercentage size={14} />}
        />
      ) : (
        <Text
          size='xl'
          fw={700}
          c={color}
        >
          {value}
        </Text>
      )}
    </Card>
  );

  return (
    <Paper
      p='xl'
      radius='md'
      withBorder
    >
      <Group
        justify='space-between'
        mb='xl'
      >
        <Box>
          <Group
            gap='xs'
            mb='xs'
          >
            <ThemeIcon
              size='lg'
              radius='md'
              variant='gradient'
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              <IconChartBar style={{ width: rem(20), height: rem(20) }} />
            </ThemeIcon>
            <Text
              size='xl'
              fw={700}
              c={isDark ? 'white' : 'dark.7'}
            >
              Budget Overview
            </Text>
          </Group>
          <Text
            size='sm'
            c='dimmed'
          >
            Project cost breakdown and financial metrics
          </Text>
          {/* Estimate project : {money(Number(budgetEstimate), 'IDR', { round: true })} */}
        </Box>

        {/* Budget Progress Ring */}
        <RingProgress
          size={100}
          thickness={8}
          sections={[
            {
              value: Math.min(budgetProgress, 100),
              color: isOverBudget ? 'red' : budgetProgress > 80 ? 'orange' : 'green',
            },
          ]}
          label={
            <Center>
              <Stack
                gap={0}
                align='center'
              >
                <Text
                  size='xs'
                  c='dimmed'
                  fw={600}
                >
                  Used
                </Text>
                <Text
                  size='sm'
                  fw={700}
                  c={isOverBudget ? 'red' : 'green'}
                >
                  {budgetProgress.toFixed(0)}%
                </Text>
              </Stack>
            </Center>
          }
        />
      </Group>

      {/* Direct Costs */}
      <SimpleGrid
        cols={{ base: 1, sm: 2 }}
        spacing='md'
        mb='xl'
      >
        <Card
          withBorder
          radius='md'
          p='lg'
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          }}
        >
          <Group
            gap='xs'
            mb='md'
          >
            <ThemeIcon
              size='lg'
              radius='md'
              variant='light'
              color='blue'
            >
              <IconReceipt style={{ width: rem(20), height: rem(20) }} />
            </ThemeIcon>
            <Box>
              <Text
                size='xs'
                tt='uppercase'
                fw={700}
                c='blue'
              >
                Direct Cost Plan
              </Text>
              <Text
                size='xs'
                c='dimmed'
              >
                Budget allocation
              </Text>
            </Box>
          </Group>
          <Text
            size='xl'
            fw={700}
            c='blue'
          >
            {money(Number(directCostPlan), 'IDR', { round: true })}
          </Text>
        </Card>

        <Card
          withBorder
          radius='md'
          p='lg'
          style={{
            background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          }}
        >
          <Group
            gap='xs'
            mb='md'
          >
            <ThemeIcon
              size='lg'
              radius='md'
              variant='light'
              color={isOverBudget ? 'red' : 'green'}
            >
              {isOverBudget ? (
                <IconTrendingUp style={{ width: rem(20), height: rem(20) }} />
              ) : (
                <IconTrendingDown style={{ width: rem(20), height: rem(20) }} />
              )}
            </ThemeIcon>
            <Box>
              <Text
                size='xs'
                tt='uppercase'
                fw={700}
                c={isOverBudget ? 'red' : 'green'}
              >
                Direct Cost Actual
              </Text>
              <Text
                size='xs'
                c='dimmed'
              >
                Current spending
              </Text>
            </Box>
          </Group>
          <Text
            size='xl'
            fw={700}
            c={isOverBudget ? 'red' : 'green'}
          >
            {money(Number(directCostActual), 'IDR', { round: true })}
          </Text>
          {isOverBudget && (
            <Badge
              color='red'
              variant='light'
              leftSection={<IconAlertTriangle size={12} />}
              mt='xs'
            >
              Over budget by{' '}
              {money(Number(directCostActual - directCostPlan), 'IDR', { round: true })}
            </Badge>
          )}
        </Card>
      </SimpleGrid>
      {/* Variance Cards */}
      <SimpleGrid
        cols={{ base: 1, sm: 2 }}
        spacing='md'
        mb='xl'
      >
        <Card
          withBorder
          radius='md'
          p='lg'
          style={{
            background: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
          }}
        >
          <Group
            gap='xs'
            mb='md'
          >
            <ThemeIcon
              size='lg'
              radius='md'
              variant='light'
              color={directCostActual > directCostPlan ? 'red' : 'green'}
            >
              <IconChartBar style={{ width: rem(20), height: rem(20) }} />
            </ThemeIcon>
            <Box>
              <Text
                size='xs'
                tt='uppercase'
                fw={700}
                c='purple'
              >
                Direct Cost Variance
              </Text>
              <Text
                size='xs'
                c='dimmed'
              >
                Plan vs Actual
              </Text>
            </Box>
          </Group>
          <Text
            size='xl'
            fw={700}
            c={directCostActual > directCostPlan ? 'red' : 'green'}
          >
            {money(directCostActual - directCostPlan)}
          </Text>
          <Progress
            value={Math.min((directCostActual / directCostPlan) * 100, 100)}
            color={directCostActual > directCostPlan ? 'red' : 'green'}
            size='sm'
            mt='xs'
          />
        </Card>

        <Card
          withBorder
          radius='md'
          p='lg'
          style={{
            background: isDark ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.05)',
          }}
        >
          <Group
            gap='xs'
            mb='md'
          >
            <ThemeIcon
              size='lg'
              radius='md'
              variant='light'
              color={budgetActual > budgetFinal ? 'red' : 'green'}
            >
              <IconChartLine style={{ width: rem(20), height: rem(20) }} />
            </ThemeIcon>
            <Box>
              <Text
                size='xs'
                tt='uppercase'
                fw={700}
                c='orange'
              >
                Budget Variance
              </Text>
              <Text
                size='xs'
                c='dimmed'
              >
                Actual vs Final
              </Text>
            </Box>
          </Group>
          <Text
            size='xl'
            fw={700}
            c={budgetActual > budgetFinal ? 'red' : 'green'}
          >
            {money(budgetActual - budgetFinal)}
          </Text>
          <Progress
            value={Math.min((budgetActual / budgetFinal) * 100, 100)}
            color={budgetActual > budgetFinal ? 'red' : 'green'}
            size='sm'
            mt='xs'
          />
        </Card>
      </SimpleGrid>

      <Progress
        value={budgetProgress}
        size='xl'
        radius='xl'
        color={isOverBudget ? 'red' : budgetProgress > 80 ? 'orange' : 'green'}
        striped
        animated={budgetProgress < 100}
        mb='xl'
      />

      {/* Editable Rates */}
      <Divider
        label='Cost Components'
        labelPosition='center'
        mb='xl'
      />

      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 5 }}
        spacing='md'
        mb='xl'
      >
        <BudgetCard
          icon={IconCurrencyDollar}
          label='Overhead Rate'
          color='orange'
          editable
          rate={Math.floor(overheadRate)}
          setRate={setOverheadRate}
          field='overhead_site_rate'
        />
        <BudgetCard
          icon={IconCurrencyDollar}
          label='Administrative Rate'
          color='grape'
          editable
          rate={Math.floor(adminRate)}
          setRate={setAdminRate}
          field='administrative_rate'
        />
        <BudgetCard
          icon={IconCurrencyDollar}
          label='Contingency Rate'
          color='red'
          editable
          rate={Math.floor(contRate)}
          setRate={setContRate}
          field='contingency_rate'
        />
        <BudgetCard
          icon={IconCurrencyDollar}
          label='Profit Rate'
          color='green'
          editable
          rate={Math.floor(profitRate)}
          setRate={setProfitRate}
          field='profit_rate'
        />
        <BudgetCard
          icon={IconCurrencyDollar}
          label='Tax Rate'
          color='blue'
          editable
          rate={Math.floor(taxRate)}
          setRate={setTaxRate}
          field='tax_rate'
        />
      </SimpleGrid>

      {/* Cost Breakdown Table */}
      <Divider
        label='Detailed Breakdown'
        labelPosition='center'
        mb='xl'
      />

      <Table
        highlightOnHover
        withTableBorder
        withColumnBorders
      >
        <Table.Thead>
          <Table.Tr
            style={{
              background: isDark ? 'rgba(100, 116, 139, 0.1)' : 'rgba(100, 116, 139, 0.05)',
            }}
          >
            <Table.Td
              ta='left'
              fw={700}
            >
              Indirect Costs
            </Table.Td>
            <Table.Td
              ta='left'
              fw={700}
            >
              Plan (IDR)
            </Table.Td>
            <Table.Td
              ta='left'
              fw={700}
            >
              Actual (IDR)
            </Table.Td>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td
              fw={500}
              pl='xl'
            >
              Overhead ({Math.floor(overheadRate)}%)
            </Table.Td>
            <Table.Td ta='left'>{money(Number(overheadCostPlan), 'IDR', { round: true })}</Table.Td>
            <Table.Td ta='left'>
              {money(Number(overheadCostActual), 'IDR', { round: true })}
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td
              fw={500}
              pl='xl'
            >
              Administrative ({Math.floor(adminRate)}%)
            </Table.Td>
            <Table.Td ta='left'>{money(Number(adminCostPlan), 'IDR', { round: true })}</Table.Td>
            <Table.Td ta='left'>{money(Number(adminCostActual), 'IDR', { round: true })}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td
              fw={500}
              pl='xl'
            >
              Contingency ({Math.floor(contRate)}%)
            </Table.Td>
            <Table.Td ta='left'>
              {money(Number(contingencyCostPlan), 'IDR', { round: true })}
            </Table.Td>
            <Table.Td ta='left'>
              {money(Number(contingencyCostActual), 'IDR', { round: true })}
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td
              fw={500}
              pl='xl'
            >
              Profit ({Math.floor(profitRate)}%)
            </Table.Td>
            <Table.Td ta='left'>{money(Number(profitCostPlan), 'IDR', { round: true })}</Table.Td>
            <Table.Td ta='left'>{money(Number(profitCostActual), 'IDR', { round: true })}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td
              fw={500}
              pl='xl'
            >
              Tax ({Math.floor(taxRate)}%)
            </Table.Td>
            <Table.Td ta='left'>{money(Number(taxCostPlan), 'IDR', { round: true })}</Table.Td>
            <Table.Td ta='left'>{money(Number(taxCostActual), 'IDR', { round: true })}</Table.Td>
          </Table.Tr>

          {/* Total Budget Section */}
          <Table.Tr
            style={{
              background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
            }}
          >
            <Table.Td fw={700}>Total Budget</Table.Td>
            <Table.Td
              ta='left'
              fw={700}
            >
              {money(Number(budgetFinal), 'IDR', { round: true })}
            </Table.Td>
            <Table.Td
              ta='left'
              fw={700}
            >
              {money(Number(budgetActual), 'IDR', { round: true })}
            </Table.Td>
          </Table.Tr>

          {/* Grand Total Section */}
          <Table.Tr
            style={{
              background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
            }}
          >
            <Table.Td fw={700}>Grand Total Budget</Table.Td>
            <Table.Td
              ta='left'
              fw={700}
            >
              {money(Number(budgetGrandTotalPlan), 'IDR', { round: true })}
            </Table.Td>
            <Table.Td
              ta='left'
              fw={700}
            >
              {money(Number(budgetGrandTotalActual), 'IDR', { round: true })}
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
