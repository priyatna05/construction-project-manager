import Layout from '@/layouts/MainLayout';
import { Link, usePage } from '@inertiajs/react';
import {
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuilding,
  IconCircleCheck,
  IconEye,
  IconUsers,
} from '@tabler/icons-react';
import TableRowEmpty from '@/components/TableRowEmpty';
import { getInitials } from '@/utils/user';
import { Tooltip } from 'recharts';
import { useState } from 'react';

const formatCount = value => {
  const numericValue = Number(value ?? 0);
  if (Number.isNaN(numericValue)) return '0';
  return numericValue.toLocaleString();
};

const normalizeCollection = value => (Array.isArray(value) ? value : value?.data || []);

const StatCard = ({ label, value, description, icon, color }) => (
  <Card
    withBorder
    radius='md'
    p='md'
  >
    <Group
      justify='space-between'
      align='center'
    >
      <Stack gap={2}>
        <Text
          c='dimmed'
          tt='uppercase'
          fw={700}
          fz='xs'
        >
          {label}
        </Text>
        <Text
          fw={700}
          fz='xl'
        >
          {formatCount(value)}
        </Text>
        {description && (
          <Text
            fz='xs'
            c='dimmed'
          >
            {description}
          </Text>
        )}
      </Stack>
      <ThemeIcon
        color={color}
        variant='light'
        size={46}
        radius='md'
      >
        {icon}
      </ThemeIcon>
    </Group>
  </Card>
);

const ActionCard = ({ title, description, icon, href, buttonLabel }) => {
  const [isHovered, setIsHovered] = useState(false);
    const iconSize = icon?.props?.size ?? 22;
    const tooltipLabel = buttonLabel || 'View';

  return (
  <Card
    withBorder
    radius='md'
    p='md'
    component={Link}
    href={href}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    style={{ textDecoration: 'none' }}
  >
    <Group
      justify='space-between'
      align='flex-start'
    >
      <Group
        gap='sm'
        align='flex-start'
      >
        <Tooltip  label={tooltipLabel} position="top" withArrow>
        <ThemeIcon
          variant='light'
          color='blue'
          size={46}
          radius='md'
        >
           {isHovered ? <IconEye size={iconSize} /> : icon}
        </ThemeIcon>
        </Tooltip>
        <Stack gap={2}>
          <Text fw={600}>{title}</Text>
          <Text
            fz='sm'
            c='dimmed'
          >
            {description}
          </Text>
        </Stack>
      </Group>
    </Group>
  </Card>
);
};

const DistributionList = ({ title, items, color, maxValue, renderLabel }) => (
  <Stack gap='sm'>
    <Text
      fz='sm'
      fw={600}
    >
      {title}
    </Text>
    {items.length === 0 ? (
      <Text
        fz='sm'
        c='dimmed'
      >
        No data available yet.
      </Text>
    ) : (
      <Stack gap='sm'>
        {items.map((item, index) => {
          const total = Number(item.total ?? 0);
          const label = renderLabel(item) || '-';
          const progress = maxValue > 0 ? Math.round((total / maxValue) * 100) : 0;
          return (
            <Stack
              gap={6}
              key={`${label}-${index}`}
            >
              <Group
                justify='space-between'
                align='center'
              >
                <Text
                  fz='sm'
                  fw={500}
                >
                  {label}
                </Text>
                <Badge
                  variant='light'
                  color={color}
                >
                  {formatCount(total)}
                </Badge>
              </Group>
              <Progress
                value={progress}
                color={color}
                radius='xl'
                size='sm'
              />
            </Stack>
          );
        })}
      </Stack>
    )}
  </Stack>
);

export default function ClientIndex() {
  const { stats = {}, recentUsers: recentUsersProp, recentCompanies: recentCompaniesProp, distribution = {} } =
    usePage().props;

  const recentUsers = normalizeCollection(recentUsersProp);
  const recentCompanies = normalizeCollection(recentCompaniesProp);
  const topCountries = Array.isArray(distribution.topCountries) ? distribution.topCountries : [];
  const topCurrencies = Array.isArray(distribution.topCurrencies) ? distribution.topCurrencies : [];

  const newUsers = Number(stats.new_users ?? 0);
  const newCompanies = Number(stats.new_companies ?? 0);
  const unverifiedUsers = Number(stats.unverified_users ?? 0);
  const usersWithoutCompany = Number(stats.users_without_company ?? 0);
  const companiesWithoutClients = Number(stats.companies_without_clients ?? 0);
  const archivedUsers = Number(stats.archived_users ?? 0);
  const archivedCompanies = Number(stats.archived_companies ?? 0);

  const countryMax = Math.max(...topCountries.map(item => Number(item.total ?? 0)), 0);
  const currencyMax = Math.max(...topCurrencies.map(item => Number(item.total ?? 0)), 0);

  const healthItems = [
    {
      label: 'Unverified users',
      value: unverifiedUsers,
      color: unverifiedUsers > 0 ? 'orange' : 'teal',
      href: route('clients.users.index'),
    },
    {
      label: 'Users without company',
      value: usersWithoutCompany,
      color: usersWithoutCompany > 0 ? 'orange' : 'teal',
      href: route('clients.users.index'),
    },
    {
      label: 'Companies without clients',
      value: companiesWithoutClients,
      color: companiesWithoutClients > 0 ? 'orange' : 'teal',
      href: route('clients.companies.index'),
    },
    {
      label: 'Archived users',
      value: archivedUsers,
      color: archivedUsers > 0 ? 'gray' : 'teal',
      href: route('clients.users.index', { archived: 1 }),
    },
    {
      label: 'Archived companies',
      value: archivedCompanies,
      color: archivedCompanies > 0 ? 'gray' : 'teal',
      href: route('clients.companies.index', { archived: 1 }),
    },
  ];

  return (
    <>
      <Breadcrumbs
        fz='sm'
        mb='xl'
        separator={<Text c='dimmed'>/</Text>}
      >
        <Text c='dimmed'>Clients</Text>
        <Text
          c='white'
          fw={500}
        >
          Overview
        </Text>
      </Breadcrumbs>

      <Group
        justify='space-between'
        align='center'
        mb='lg'
      >
        <Title style={{ color: 'white' }}>Client Overview</Title>
      </Group>

      <Stack gap='xl'>
        <Stack gap='md'>
          <Text
            fz='sm'
             c='white'
            fw={600}
          >
            Overview
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            <StatCard
              label='Client Users'
              value={stats.total_users}
              description={newUsers > 0 ? `+${formatCount(newUsers)} this month` : 'No new users this month'}
              icon={<IconUsers size={22} />}
              color='blue'
            />
            <StatCard
              label='Client Companies'
              value={stats.total_companies}
              description={
                newCompanies > 0 ? `+${formatCount(newCompanies)} this month` : 'No new companies this month'
              }
              icon={<IconBuilding size={22} />}
              color='indigo'
            />
            <StatCard
              label='Unverified Users'
              value={unverifiedUsers}
              description='Need email verification'
              icon={<IconAlertTriangle size={22} />}
              color={unverifiedUsers > 0 ? 'orange' : 'teal'}
            />
            <StatCard
              label='Companies Without Clients'
              value={companiesWithoutClients}
              description='No linked client users'
              icon={<IconAlertTriangle size={22} />}
              color={companiesWithoutClients > 0 ? 'orange' : 'teal'}
            />
          </SimpleGrid>
        </Stack>

        <Stack gap='md'>
          <Text
            fz='sm'
             c='white'
            fw={600}
          >
            Quick Actions
          </Text>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {can('view client users') && (
              <ActionCard
                title='Client Users'
                description='Manage client accounts, access, and credentials.'
                icon={<IconUsers size={22} />}
                href={route('clients.users.index')}
                buttonLabel='Open Users'
              />
            )}
            {can('view client companies') && (
              <ActionCard
                title='Client Companies'
                description='Manage companies, contacts, and client mapping.'
                icon={<IconBuilding size={22} />}
                href={route('clients.companies.index')}
                buttonLabel='Open Companies'
              />
            )}
          </SimpleGrid>
        </Stack>

        <Grid gutter='xl'>
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap='xl'>
              <Card
                withBorder
                radius='md'
                p='md'
              >
                <Group
                  justify='space-between'
                  align='center'
                  mb='sm'
                >
                  <Text fw={600}>Recent Client Users</Text>
                  <Button
                    component={Link}
                    href={route('clients.users.index')}
                    variant='subtle'
                    size='xs'
                    rightSection={<IconArrowRight size={12} />}
                  >
                    View all
                  </Button>
                </Group>
                <Table
                  highlightOnHover
                  verticalSpacing='sm'
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Companies</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {recentUsers.length > 0 ? (
                      recentUsers.map(user => (
                        <Table.Tr key={user.id}>
                          <Table.Td>
                            <Group gap='sm'>
                              <Avatar
                                src={user.avatar}
                                radius='xl'
                                alt={user.name}
                              >
                                {!user.avatar && getInitials(user.name || '')}
                              </Avatar>
                              <Stack gap={0}>
                                <Text
                                  fz='sm'
                                  fw={500}
                                >
                                  {user.name || '-'}
                                </Text>
                                <Text
                                  fz='xs'
                                  c='dimmed'
                                >
                                  {user.job_title || 'Client user'}
                                </Text>
                              </Stack>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text fz='sm'>{user.email || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              variant='light'
                              color='blue'
                            >
                              {formatCount(user.companies?.length ?? 0)} companies
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    ) : (
                      <TableRowEmpty colSpan={3} />
                    )}
                  </Table.Tbody>
                </Table>
              </Card>

              <Card
                withBorder
                radius='md'
                p='md'
              >
                <Group
                  justify='space-between'
                  align='center'
                  mb='sm'
                >
                  <Text fw={600}>Recent Client Companies</Text>
                  <Button
                    component={Link}
                    href={route('clients.companies.index')}
                    variant='subtle'
                    size='xs'
                    rightSection={<IconArrowRight size={12} />}
                  >
                    View all
                  </Button>
                </Group>
                <Table
                  highlightOnHover
                  verticalSpacing='sm'
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Company</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Clients</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {recentCompanies.length > 0 ? (
                      recentCompanies.map(company => {
                        const logoSrc = company.logo || company.avatar || null;
                        return (
                          <Table.Tr key={company.id}>
                            <Table.Td>
                              <Group gap='sm'>
                                <Avatar
                                  src={logoSrc}
                                  radius='xl'
                                  alt={company.name}
                                >
                                  {!logoSrc && getInitials(company.name || '')}
                                </Avatar>
                                <Stack gap={0}>
                                  <Text
                                    fz='sm'
                                    fw={500}
                                  >
                                    {company.name || '-'}
                                  </Text>
                                  <Text
                                    fz='xs'
                                    c='dimmed'
                                  >
                                    {company.city || 'Client company'}
                                  </Text>
                                </Stack>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Text fz='sm'>{company.email || '-'}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                variant='light'
                                color='teal'
                              >
                                {formatCount(company.clients?.length ?? 0)} clients
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    ) : (
                      <TableRowEmpty colSpan={3} />
                    )}
                  </Table.Tbody>
                </Table>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Stack gap='xl'>
              <Card
                withBorder
                radius='md'
                p='md'
              >
                <Group
                  justify='space-between'
                  align='center'
                  mb='sm'
                >
                  <Text fw={600}>Data Health</Text>
                  <ThemeIcon
                    color='orange'
                    variant='light'
                    size={36}
                    radius='md'
                  >
                    <IconAlertTriangle size={18} />
                  </ThemeIcon>
                </Group>
                <Stack gap='md'>
                  {healthItems.map((item, index) => (
                    <Stack
                      key={item.label}
                      gap='xs'
                    >
                      <Group
                        justify='space-between'
                        align='center'
                      >
                        <Text fz='sm'>{item.label}</Text>
                        <Group gap='xs'>
                          <Badge
                            color={item.color}
                            variant='light'
                          >
                            {formatCount(item.value)}
                          </Badge>
                          <Button
                            component={Link}
                            href={item.href}
                            variant='subtle'
                            size='xs'
                            rightSection={<IconArrowRight size={12} />}
                          >
                            View
                          </Button>
                        </Group>
                      </Group>
                      {index < healthItems.length - 1 && <Divider />}
                    </Stack>
                  ))}
                </Stack>
              </Card>

              <Card
                withBorder
                radius='md'
                p='md'
              >
                <Group
                  justify='space-between'
                  align='center'
                  mb='sm'
                >
                  <Text fw={600}>Distribution</Text>
                  <ThemeIcon
                    color='blue'
                    variant='light'
                    size={36}
                    radius='md'
                  >
                    <IconCircleCheck size={18} />
                  </ThemeIcon>
                </Group>
                <Stack gap='md'>
                  <DistributionList
                    title='Top Countries'
                    items={topCountries}
                    color='blue'
                    maxValue={countryMax}
                    renderLabel={item => item.label}
                  />
                  <Divider />
                  <DistributionList
                    title='Top Currencies'
                    items={topCurrencies}
                    color='teal'
                    maxValue={currencyMax}
                    renderLabel={item => {
                      const labelParts = [item.symbol, item.code].filter(Boolean);
                      return labelParts.length ? labelParts.join(' ') : item.label;
                    }}
                  />
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </>
  );
}

ClientIndex.layout = page => <Layout title='Clients'>{page}</Layout>;
