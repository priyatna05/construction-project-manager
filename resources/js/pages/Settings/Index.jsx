import { useState } from 'react';
import Layout from '@/layouts/MainLayout';
import { Link, usePage } from '@inertiajs/react';
import {
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  ColorSwatch,
  Divider,
  Grid,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArchive,
  IconArrowRight,
  IconBuilding,
  IconCircleCheck,
  IconEye,
  IconKey,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import TableRowEmpty from '@/components/TableRowEmpty';
import { getInitials } from '@/utils/user';

const formatCount = value => {
  const numericValue = Number(value ?? 0);
  if (Number.isNaN(numericValue)) return '0';
  return numericValue.toLocaleString();
};

const formatDateTime = value => (value ? new Date(value).toLocaleString() : '-');

const labelTypeLabels = {
  pt_status: 'Project/Task Status',
  ptb_status: 'Project/Task Billing Status',
  kontrak_label: 'Kontrak Type Project',
  task_relation: 'Task Relation',
  task_type_label: 'Task Type Status',
  task_priority_label: 'Task Priority Status',
  task_inventory_unit_label: 'Task/Inventory Unit',
  inventory_status_label: 'Inventory Status',
  inventory_type_label: 'Inventory Type',
  work_report_status: 'Work Report Status',
};

const formatLabelType = type => {
  if (!type) return '-';
  if (labelTypeLabels[type]) return labelTypeLabels[type];
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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
    >
      <Group
        justify='space-between'
        align='flex-start'
      >
        <Group
          gap='sm'
          align='flex-start'
        >
          <Tooltip
            label={tooltipLabel}
            withArrow
          >
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

const DistributionList = ({ title, items, color, maxValue }) => (
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
          const label = formatLabelType(item.type);
          const progress = maxValue > 0 ? Math.round((total / maxValue) * 100) : 0;
          return (
            <Stack
              gap={6}
              key={`${item.type || 'type'}-${index}`}
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

export default function SettingsIndex() {
  const {
    company,
    companyHealth = {},
    stats = {},
    health = {},
    labelTypeCounts: labelTypeCountsProp = [],
    recentChanges: recentChangesProp = [],
  } = usePage().props;

  const labelTypeCounts = Array.isArray(labelTypeCountsProp) ? labelTypeCountsProp : [];
  const recentChanges = Array.isArray(recentChangesProp) ? recentChangesProp : [];
  const missingFields = Array.isArray(companyHealth.missing_fields)
    ? companyHealth.missing_fields
    : [];

  const completionRate = Number(companyHealth.completion_rate ?? 0);
  const companyName = company?.name || 'Owner Company';
  const companyAddress = [
    company?.address,
    company?.city,
    company?.postal_code,
    company?.country?.name,
  ]
    .filter(Boolean)
    .join(', ');
  const currencyLabel = company?.currency
    ? `${company.currency.symbol || ''} ${company.currency.code || company.currency.name || ''}`.trim()
    : '';
  const companyCurrency = currencyLabel || '-';

  const rolesTotal = Number(stats.roles_total ?? 0);
  const labelsTotal = Number(stats.labels_total ?? 0);
  const permissionsTotal = Number(stats.permissions_total ?? 0);
  const rolesArchived = Number(stats.roles_archived ?? 0);
  const labelsArchived = Number(stats.labels_archived ?? 0);

  const rolesWithoutPermissions = Number(health.roles_without_permissions ?? 0);
  const labelsWithoutIcon = Number(health.labels_without_icon ?? 0);
  const labelsWithoutColor = Number(health.labels_without_color ?? 0);
  const companyMissingCount = Number(health.company_missing_fields ?? missingFields.length);

  const alertTotal =
    companyMissingCount + rolesWithoutPermissions + labelsWithoutIcon + labelsWithoutColor;

  const labelTypeMax = Math.max(...labelTypeCounts.map(item => Number(item.total ?? 0)), 0);

  const healthItems = [
    can('view owner company') && {
      label: 'Company profile missing fields',
      value: companyMissingCount,
      color: companyMissingCount > 0 ? 'orange' : 'teal',
      href: route('settings.company.edit'),
    },
    can('view roles') && {
      label: 'Roles without permissions',
      value: rolesWithoutPermissions,
      color: rolesWithoutPermissions > 0 ? 'orange' : 'teal',
      href: route('settings.roles.index'),
    },
    can('view labels') && {
      label: 'Labels without icon',
      value: labelsWithoutIcon,
      color: labelsWithoutIcon > 0 ? 'orange' : 'teal',
      href: route('settings.labels.index'),
    },
    can('view labels') && {
      label: 'Labels without color',
      value: labelsWithoutColor,
      color: labelsWithoutColor > 0 ? 'orange' : 'teal',
      href: route('settings.labels.index'),
    },
  ].filter(Boolean);

  const archivedItems = [
    can('view roles') && {
      label: 'Archived roles',
      value: rolesArchived,
      href: route('settings.roles.index', { archived: 1 }),
    },
    can('view labels') && {
      label: 'Archived labels',
      value: labelsArchived,
      href: route('settings.labels.index', { archived: 1 }),
    },
  ].filter(Boolean);

  const quickActions = [
    can('view owner company') && {
      title: 'Owner Company',
      description: 'Update logo, address, and contact information.',
      icon: <IconBuilding size={22} />,
      href: route('settings.company.edit'),
      buttonLabel: can('edit owner company') ? 'Edit Company' : 'View Company',
    },
    (can('create role') || can('view roles')) && {
      title: 'Roles & Permissions',
      description: 'Create roles and manage permission sets.',
      icon: <IconUsers size={22} />,
      href: can('create role')
        ? route('settings.roles.index', { create: 1 })
        : route('settings.roles.index'),
      buttonLabel: can('create role') ? 'Create Role' : 'View Roles',
    },
    (can('create label') || can('view labels')) && {
      title: 'Labels & Statuses',
      description: 'Organize statuses, types, and label rules.',
      icon: <IconTag size={22} />,
      href: can('create label')
        ? route('settings.labels.index', { create: 1 })
        : route('settings.labels.index'),
      buttonLabel: can('create label') ? 'Create Label' : 'View Labels',
    },
  ].filter(Boolean);

  return (
    <>
      <Breadcrumbs
        fz='sm'
        mb='xl'
        separator={<Text c='dimmed'>/</Text>}
      >
        <Text c='dimmed'>Settings</Text>
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
        <Title style={{ color: 'white' }}>Settings Overview</Title>
        <Group>
          {can('view roles') && (
            <Button
              component={Link}
              href={route('settings.roles.index')}
              variant='default'
              radius='xl'
            >
              Manage Roles
            </Button>
          )}
          {can('view labels') && (
            <Button
              component={Link}
              href={route('settings.labels.index')}
              variant='default'
              radius='xl'
            >
              Manage Labels
            </Button>
          )}
          {can('view owner company') && (
            <Button
              component={Link}
              href={route('settings.company.edit')}
              variant='default'
              radius='xl'
            >
              Company Profile
            </Button>
          )}
        </Group>
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
              label='Roles'
              value={rolesTotal}
              description={`${formatCount(rolesArchived)} archived`}
              icon={<IconUsers size={22} />}
              color='blue'
            />
            <StatCard
              label='Labels'
              value={labelsTotal}
              description={`${formatCount(labelsArchived)} archived`}
              icon={<IconTag size={22} />}
              color='indigo'
            />
            <StatCard
              label='Permissions'
              value={permissionsTotal}
              description='Total available permissions'
              icon={<IconKey size={22} />}
              color='teal'
            />
            <StatCard
              label='Data Alerts'
              value={alertTotal}
              description='Missing fields or config gaps'
              icon={<IconAlertTriangle size={22} />}
              color={alertTotal > 0 ? 'orange' : 'teal'}
            />
          </SimpleGrid>
        </Stack>

        {quickActions.length > 0 && (
          <Stack gap='md'>
            <Text
              fz='sm'
              c='white'
              fw={600}
            >
              Quick Actions
            </Text>
            <SimpleGrid cols={{ base: 1, md: 3 }}>
              {quickActions.map(action => (
                <ActionCard
                  key={action.title}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                  buttonLabel={action.buttonLabel}
                />
              ))}
            </SimpleGrid>
          </Stack>
        )}

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
                  <Text fw={600}>Company Profile</Text>
                  {can('edit owner company') && (
                    <Button
                      component={Link}
                      href={route('settings.company.edit')}
                      variant='subtle'
                      size='xs'
                      rightSection={<IconArrowRight size={12} />}
                    >
                      Edit
                    </Button>
                  )}
                </Group>
                {company ? (
                  <Stack gap='md'>
                    <Group
                      align='center'
                      gap='md'
                    >
                      <Avatar
                        src={company.logo}
                        size={64}
                        radius='md'
                        alt={companyName}
                      >
                        {!company.logo && getInitials(companyName)}
                      </Avatar>
                      <Stack gap={2}>
                        <Text
                          fw={600}
                          fz='lg'
                        >
                          {companyName}
                        </Text>
                        <Text
                          fz='sm'
                          c='dimmed'
                        >
                          {companyCurrency}
                        </Text>
                        <Text fz='sm'>{company.email || '-'}</Text>
                      </Stack>
                    </Group>
                    <Divider />
                    <Stack gap={6}>
                      <Group
                        justify='space-between'
                        align='center'
                      >
                        <Text fz='sm'>Phone</Text>
                        <Text
                          fz='sm'
                          fw={500}
                        >
                          {company.phone || '-'}
                        </Text>
                      </Group>
                      <Group
                        justify='space-between'
                        align='center'
                      >
                        <Text fz='sm'>Website</Text>
                        <Text
                          fz='sm'
                          fw={500}
                        >
                          {company.web || '-'}
                        </Text>
                      </Group>
                      <Group
                        justify='space-between'
                        align='center'
                      >
                        <Text fz='sm'>Address</Text>
                        <Text
                          fz='sm'
                          fw={500}
                        >
                          {companyAddress || '-'}
                        </Text>
                      </Group>
                    </Stack>
                    <Divider />
                    <Stack gap={6}>
                      <Group
                        justify='space-between'
                        align='center'
                      >
                        <Text fz='sm'>Profile completeness</Text>
                        <Badge
                          variant='light'
                          color={completionRate >= 80 ? 'teal' : 'orange'}
                        >
                          {completionRate}%
                        </Badge>
                      </Group>
                      <Progress
                        value={completionRate}
                        color={completionRate >= 80 ? 'teal' : 'orange'}
                        radius='xl'
                        size='sm'
                      />
                      {missingFields.length > 0 ? (
                        <Group
                          gap='xs'
                          mt='xs'
                        >
                          {missingFields.map(field => (
                            <Badge
                              key={field}
                              variant='light'
                              color='orange'
                            >
                              {field}
                            </Badge>
                          ))}
                        </Group>
                      ) : (
                        <Group
                          gap='xs'
                          mt='xs'
                        >
                          <ThemeIcon
                            color='teal'
                            variant='light'
                            size={24}
                            radius='xl'
                          >
                            <IconCircleCheck size={14} />
                          </ThemeIcon>
                          <Text
                            fz='sm'
                            c='dimmed'
                          >
                            Company profile is complete.
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Stack>
                ) : (
                  <Text
                    fz='sm'
                    c='dimmed'
                  >
                    Owner company profile is not configured yet.
                  </Text>
                )}
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
                  <Text fw={600}>Recent Changes</Text>
                </Group>
                <Table
                  highlightOnHover
                  verticalSpacing='sm'
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Detail</Table.Th>
                      <Table.Th>Updated</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {recentChanges.length > 0 ? (
                      recentChanges.map(item => (
                        <Table.Tr key={item.id}>
                          <Table.Td>
                            <Badge
                              variant='light'
                              color={item.type === 'role' ? 'blue' : 'teal'}
                            >
                              {item.type === 'role' ? 'Role' : 'Label'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap='sm'>
                              {item.type === 'label' && item.color && (
                                <ColorSwatch
                                  color={item.color}
                                  size={14}
                                />
                              )}
                              <Text
                                fz='sm'
                                fw={500}
                              >
                                {item.name}
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text fz='sm'>
                              {item.type === 'role'
                                ? `${formatCount(item.permissions_count)} permissions`
                                : formatLabelType(item.label_type)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text
                              fz='sm'
                              c='dimmed'
                            >
                              {formatDateTime(item.updated_at)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    ) : (
                      <TableRowEmpty colSpan={4} />
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
                {healthItems.length > 0 ? (
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
                ) : (
                  <Text
                    fz='sm'
                    c='dimmed'
                  >
                    No health alerts available.
                  </Text>
                )}
              </Card>

              {can('view labels') && (
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
                    <Text fw={600}>Label Distribution</Text>
                    <ThemeIcon
                      color='blue'
                      variant='light'
                      size={36}
                      radius='md'
                    >
                      <IconCircleCheck size={18} />
                    </ThemeIcon>
                  </Group>
                  <DistributionList
                    title='Label types'
                    items={labelTypeCounts}
                    color='blue'
                    maxValue={labelTypeMax}
                  />
                </Card>
              )}

              {archivedItems.length > 0 && (
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
                    <Text fw={600}>Archived Records</Text>
                    <ThemeIcon
                      color='gray'
                      variant='light'
                      size={36}
                      radius='md'
                    >
                      <IconArchive size={18} />
                    </ThemeIcon>
                  </Group>
                  <Stack gap='md'>
                    {archivedItems.map((item, index) => (
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
                              color='gray'
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
                        {index < archivedItems.length - 1 && <Divider />}
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </>
  );
}

SettingsIndex.layout = page => <Layout title='Settings'>{page}</Layout>;
