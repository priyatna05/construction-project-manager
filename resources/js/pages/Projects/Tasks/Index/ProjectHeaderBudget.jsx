import {
  Grid,
  Text,
  Group,
  Avatar,
  Skeleton,
  Badge,
  ActionIcon,
  Paper,
  Stack,
  Box,
  ThemeIcon,
  SimpleGrid,
  rem,
  Tooltip,
  Title,
  Popover,
  SegmentedControl,
  Center,
  Divider,
} from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { getInitials } from '@/utils/user';
import { dateSlash, convertDurationFromDays, getUnitLabel } from '@/utils/datetime';
import * as TablerIcons from '@tabler/icons-react';
import {
  IconCalendar,
  IconClock,
  IconChartBar,
  IconBuilding,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import EvmChart from '../../Analitics/EvmChart';
import BudgetOverview from '../../Analitics/BudgetOverview';
import Index from '../../Analitics/Info/Index';
import FileThumbnail from '@/components/FileThumbnail';
import JsFileDownloader from 'js-file-downloader';
import { isImage, isViewable } from '@/utils/file';
import ImageModal from '@/components/ImageModal';
import { useDisclosure } from '@mantine/hooks';
import RichTextEditor from '@/components/RichTextEditor';
import useAuthorization from '@/hooks/useAuthorization';
import ProjectCardActions from '../../Index/ProjectCardActions';

export default function ProjectHeaderBudget({ project, item = null, onEdit, disabled = false }) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAdmin, isManager } = useAuthorization();
  const canView = isAdmin() || isManager();
  const [openedSection, setOpenedSection] = useState(null);
  const [opened, { close, open }] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const actionProject = item || project;
  const handleEdit = () => {
    if (onEdit) {
      onEdit(actionProject);
      return;
    }
  };

  const openFile = file => {
    const fileUrl = file instanceof File ? URL.createObjectURL(file) : file.url;

    if (isImage(file)) {
      setSelectedImage({ ...file, url: fileUrl });
      open();
    } else if (isViewable(file)) {
      window.open(fileUrl, '_blank');
    } else {
      new JsFileDownloader({
        url: fileUrl,
        filename: file.name,
        contentType: file.type,
        nativeFallbackOnError: true,
      }).catch(error => console.error('Failed to download file', error));
    }
  };

  const [durationUnit, setDurationUnit] = useState('day');

  const durationInUnit = convertDurationFromDays(project?.duration || 0, durationUnit);

  const avatarUrl = project?.clientCompany?.users?.[0]?.avatar || project?.clientUser?.avatar;
  const clientName = project?.clientCompany?.name || project?.clientUser?.name;
  const TypeIcon = project?.type?.icon ? TablerIcons[project.type.icon] : null;
  const statusSlugs = (project?.status || []).map(st =>
    (st.slug || st.name || '').toString().toLowerCase()
  );
  const isCompleted = Boolean(project?.is_completed);
  const isPreCompleted = !isCompleted && statusSlugs.some(slug => ['completed', 'done'].includes(slug));

  function ProjectInfoCard({
    icon: Icon,
    label,
    value,
    color = 'blue',
    tooltip,
    opened = false,
    onClick,
    isDark = false,
  }) {
    return (
      <Paper
        p='sm'
        withBorder
        radius='md'
        onClick={onClick}
        style={{
          cursor: 'pointer',
          borderRadius: 'var(--mantine-radius-md)',
          transition: 'all 0.2s ease',
          background: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = isDark
            ? 'var(--mantine-color-dark-5)'
            : 'var(--mantine-color-gray-1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isDark
            ? 'var(--mantine-color-dark-6)'
            : 'var(--mantine-color-gray-0)';
        }}
      >
        <Group
          justify='space-between'
          align='center'
        >
          <Group gap='sm'>
            <ThemeIcon
              size='md'
              radius='md'
              variant='light'
              color={color}
            >
              <Icon style={{ width: rem(36), height: rem(36) }} />
            </ThemeIcon>
            <Text
              size='sm'
              fw={600}
              c={isDark ? 'white' : 'dark.7'}
            >
              {label}
            </Text>
          </Group>

          {label === 'Duration' ? (
            <Popover
              opened={openedSection === 'duration'}
              onChange={open => setOpenedSection(open ? 'duration' : null)}
              position='top'
              withArrow
              shadow='none'
              radius='lg'
              offset={20}
              closeOnClickOutside={false}
            >
              <Popover.Target>
                <Tooltip
                  label={tooltip}
                  color={color}
                  withArrow
                >
                  <ActionIcon
                    variant='subtle'
                    color={color}
                    size='sm'
                    style={{
                      transition: 'transform 0.3s ease',
                      transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <IconChevronUp style={{ width: rem(16), height: rem(16) }} />
                  </ActionIcon>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown
                style={{
                  border: 'none',
                  boxShadow: 'none',
                  padding: 0,
                  margin: 0,
                }}
                onClick={e => e.stopPropagation()}
              >
                <SegmentedControl
                  color={color}
                  radius='md'
                  value={durationUnit}
                  onChange={val => {
                    setDurationUnit(val);
                    setOpenedSection(null);
                  }}
                  data={[
                    {
                      value: 'day',
                      label: (
                        <Group
                          gap={4}
                          align='center'
                          justify='center'
                          wrap='nowrap'
                        >
                          <IconClock size={16} />
                          <Text size='sm'>Days</Text>
                        </Group>
                      ),
                    },
                    {
                      value: 'week',
                      label: (
                        <Group
                          gap={4}
                          align='center'
                          justify='center'
                          wrap='nowrap'
                        >
                          <IconCalendar size={16} />
                          <Text size='sm'>Weeks</Text>
                        </Group>
                      ),
                    },
                    {
                      value: 'month',
                      label: (
                        <Group
                          gap={4}
                          align='center'
                          justify='center'
                          wrap='nowrap'
                        >
                          <TablerIcons.IconCalendarTime size={16} />
                          <Text size='sm'>Months</Text>
                        </Group>
                      ),
                    },
                  ]}
                />
              </Popover.Dropdown>
            </Popover>
          ) : tooltip ? (
            <Tooltip
              label={tooltip}
              color={color}
              withArrow
            >
              <ActionIcon
                variant='subtle'
                color={color}
                size='sm'
              >
                <IconChevronDown style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            </Tooltip>
          ) : null}

          {value && (
            <Text
              size='md'
              ml={10}
              fw={600}
            >
              {value}
            </Text>
          )}
        </Group>
      </Paper>
    );
  }

  return (
    <Stack gap='lg'>
      {/* Header Section */}
      <Paper
        p='xl'
        radius='md'
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(34, 139, 230, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(34, 139, 230, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
        }}
      >
        <Grid
          gutter='md'
          align='center'
        >
          <Grid.Col span={{ base: 12, md: 6 }}>
            {project ? (
              <Group gap='md'>
                <Stack
                  spacing='xs'
                  w='100%'
                  c='white'
                >
                  <Group
                    spacing='xs'
                    align='center'
                  >
                    {/* Judul proyek */}
                    <Title
                      order={1}
                      style={{
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        lineHeight: 1.3,
                      }}
                    >
                      <ProjectCardActions
                        item={actionProject}
                        onEdit={handleEdit}
                      />
                      <span style={{ marginLeft: '8px' }}>
                        {project.code} - {project.name}
                      </span>
                    </Title>
                  </Group>
                </Stack>
                <Avatar
                  src={avatarUrl}
                  size={100}
                  radius='50%'
                  alt='Client avatar'
                  style={{
                    border: '2px solid #e9ecef',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {!avatarUrl && getInitials(clientName || 'NA')}
                </Avatar>

                <Box style={{ flex: 1 }}>
                  <Group
                    gap='xs'
                    mb='xs'
                  >
                    <IconBuilding
                      size={18}
                      color={isDark ? 'var(--mantine-color-gray-7)' : 'var(--mantine-color-gray-9)'}
                    />
                    <Text
                      size='sm'
                      c={isDark ? 'gray.7' : 'gray.9'}
                      fw={500}
                    >
                      Client
                    </Text>
                  </Group>
                  <Text
                    size='xl'
                    fw={700}
                    c={isDark ? 'white' : 'white'}
                  >
                    {clientName || 'Unknown Client'}
                  </Text>
                  {(isCompleted || isPreCompleted) && (
                    <Group
                      gap='xs'
                      mt={4}
                    >
                      <Badge
                        color={isCompleted ? 'green' : 'yellow'}
                        variant='filled'
                        size='md'
                      >
                        {isCompleted ? 'Completed' : 'Pre-Completed'}
                      </Badge>
                    </Group>
                  )}
                </Box>
              </Group>
            ) : (
              <Group gap='md'>
                <Skeleton
                  circle
                  height={64}
                  width={64}
                />
                <Box style={{ flex: 1 }}>
                  <Skeleton
                    height={20}
                    width={100}
                    mb='xs'
                  />
                  <Skeleton
                    height={28}
                    width={200}
                    mb='xs'
                  />
                  <Skeleton
                    height={24}
                    width={80}
                  />
                </Box>
              </Group>
            )}
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            {project ? (
              <SimpleGrid
                cols={4}
                spacing='md'
              >
                <ProjectInfoCard
                  icon={IconCalendar}
                  label='Start Date'
                  color='blue'
                  value={project.start_date ? dateSlash(project.start_date) : 'N/A'}
                  isDark={isDark}
                />

                <ProjectInfoCard
                  icon={IconCalendar}
                  label='End Date'
                  color='red'
                  value={project.end_date ? dateSlash(project.end_date) : 'N/A'}
                  isDark={isDark}
                />

                <ProjectInfoCard
                  icon={IconClock}
                  label='Duration'
                  color='violet'
                  value={`${durationInUnit} ${getUnitLabel(durationUnit, durationInUnit)}`}
                  isDark={isDark}
                  tooltip='Change duration unit'
                  opened={openedSection === 'duration'}
                  onClick={() => setOpenedSection(openedSection === 'duration' ? null : 'duration')}
                />

                <ProjectInfoCard
                  icon={TablerIcons.IconStatusChange}
                  label='Status'
                  color='blue'
                  tooltip='View status'
                  value={
                    Array.isArray(project.status) && project.status.length > 0
                      ? project.status[project.status.length - 1].name
                      : project.type?.name || 'N/A'
                  }
                  opened={openedSection === 'status'}
                  onClick={() => setOpenedSection(openedSection === 'status' ? null : 'status')}
                  isDark={isDark}
                />

                <ProjectInfoCard
                  icon={TablerIcons.IconBox}
                  label='Resource'
                  color='black'
                  tooltip='View resources'
                  opened={openedSection === 'resource'}
                  onClick={() => setOpenedSection(openedSection === 'resource' ? null : 'resource')}
                  isDark={isDark}
                />
                {canView && (
                  <ProjectInfoCard
                    icon={IconChartBar}
                    label='Budget'
                    color='blue'
                    tooltip='View Budget'
                    opened={openedSection === 'budget'}
                    onClick={() => setOpenedSection(openedSection === 'budget' ? null : 'budget')}
                    isDark={isDark}
                  />
                )}
                {canView && (
                  <ProjectInfoCard
                    icon={TablerIcons.IconActivity}
                    label='Analytics'
                    color='green'
                    tooltip='View EVM Analytics'
                    opened={openedSection === 'evm'}
                    onClick={() => setOpenedSection(openedSection === 'evm' ? null : 'evm')}
                    isDark={isDark}
                  />
                )}
                <ProjectInfoCard
                  icon={TablerIcons.IconBookmarkQuestion}
                  label='FAQ'
                  color='gray'
                  tooltip='View project info'
                  opened={openedSection === 'faq'}
                  onClick={() => setOpenedSection(openedSection === 'faq' ? null : 'faq')}
                  isDark={isDark}
                />
              </SimpleGrid>
            ) : (
              <SimpleGrid
                cols={2}
                spacing='md'
              >
                {[1, 2, 3].map(i => (
                  <Skeleton
                    key={i}
                    height={80}
                    radius='md'
                  />
                ))}
              </SimpleGrid>
            )}
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Budget Overview Cards */}
      <AnimatePresence>
        {openedSection === 'budget' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <BudgetOverview project={project} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* EvmChart Cards */}
      <AnimatePresence>
        {openedSection === 'evm' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Paper
              p='xl'
              radius='md'
              withBorder
            >
              <EvmChart projectId={project.id} />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FaQ Cards */}
      <AnimatePresence>
        {openedSection === 'faq' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Paper
              p='xl'
              radius='md'
              withBorder
            >
              <Index />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* desc + Resource attachment */}
      <AnimatePresence>
        {openedSection === 'resource' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Paper
              p='xl'
              radius='md'
              withBorder
              shadow='sm'
              style={{
                background: isDark ? 'var(--mantine-color-dark-6)' : 'white',
                borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)',
                transition: 'box-shadow 0.3s ease, transform 0.2s ease',
              }}
            >
              {/* Section: Description */}
              <Box mb='xl'>
                <Text
                  size='lg'
                  fw={700}
                  mb='sm'
                  c={isDark ? 'white' : 'dark.7'}
                >
                  Project Description
                </Text>

                <RichTextEditor
                  placeholder='Describe the project goals, scope, or deliverables...'
                  content={project?.description || ''}
                  readOnly
                  style={{
                    borderRadius: 'var(--mantine-radius-md)',
                    border: `1px solid var(--mantine-color-gray-3)`,
                    background: isDark
                      ? 'var(--mantine-color-dark-7)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                />
              </Box>

              {/* Divider subtle */}
              <Divider
                my='md'
                labelPosition='center'
                label={
                  <Text
                    size='sm'
                    c='dimmed'
                  >
                    Attachments
                  </Text>
                }
                color={isDark ? 'dark.4' : 'gray.3'}
              />

              {/* Section: Photos */}
              <Box mt='lg'>
                <Group
                  mb='sm'
                  gap='xs'
                  align='center'
                >
                  <ThemeIcon
                    size='lg'
                    radius='md'
                    variant='gradient'
                    gradient={{ from: 'blue', to: 'cyan' }}
                  >
                    <TablerIcons.IconPhoto style={{ width: rem(20), height: rem(20) }} />
                  </ThemeIcon>

                  <Text
                    size='lg'
                    fw={700}
                    c={isDark ? 'white' : 'dark.7'}
                  >
                    Project Photos
                  </Text>
                </Group>

                {project?.attachments?.length > 0 ? (
                  <SimpleGrid
                    cols={{ base: 2, sm: 3, md: 4 }}
                    spacing='md'
                    mt='md'
                  >
                    {project.attachments.map((file, index) => (
                      <Box
                        key={file.id || file.name || `file-${index}`}
                        pos='relative'
                        sx={{
                          borderRadius: 'var(--mantine-radius-md)',
                          overflow: 'hidden',
                          boxShadow: 'var(--mantine-shadow-xs)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 'var(--mantine-shadow-md)',
                          },
                        }}
                      >
                        <FileThumbnail
                          file={file}
                          open={() => openFile(file)}
                          disabled={disabled}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Center
                    mt='lg'
                    mih={100}
                    style={{
                      border: `1px dashed var(--mantine-color-gray-4)`,
                      borderRadius: 'var(--mantine-radius-md)',
                    }}
                  >
                    <Text
                      size='sm'
                      c='dimmed'
                    >
                      No photos uploaded
                    </Text>
                  </Center>
                )}
              </Box>

              {/* Modal for image preview */}
              <ImageModal
                image={selectedImage}
                opened={opened}
                close={close}
              />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* status*/}
      <AnimatePresence>
        {openedSection === 'status' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Paper
              p='xl'
              radius='md'
              withBorder
              shadow='sm'
              style={{
                backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'white',
                borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)',
              }}
            >
              <SimpleGrid
                cols={{ base: 1, sm: 2 }}
                spacing='md'
                mb='xl'
              >
                {/* Project Type Header */}
                {project.type && (
                  <Box
                    p='md'
                    style={{
                      backgroundColor: isDark
                        ? 'var(--mantine-color-dark-7)'
                        : 'var(--mantine-color-gray-0)',
                      borderRadius: 'var(--mantine-radius-md)',
                      border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)'}`,
                    }}
                  >
                    <Group
                      gap='sm'
                      wrap='nowrap'
                    >
                      <ThemeIcon
                        size='xl'
                        radius='md'
                        variant='light'
                        color={project.type?.color || 'gray'}
                      >
                        {TypeIcon && <TypeIcon size={20} />}
                      </ThemeIcon>
                      <Box style={{ flex: 1 }}>
                        <Text
                          size='md'
                          fw={600}
                          c={isDark ? 'white' : 'dark.7'}
                        >
                          Project Type
                        </Text>
                        <Text
                          size='xs'
                          c='dimmed'
                        >
                          Current project type indicators
                        </Text>
                      </Box>
                    </Group>

                    <Group
                      gap='sm'
                      mt={15}
                    >
                      <Badge
                        color={project?.type?.color || 'gray'}
                        variant='filled'
                        size='lg'
                        radius='md'
                        style={{
                          textTransform: 'capitalize',
                          paddingLeft: 12,
                          paddingRight: 12,
                        }}
                      >
                        {project?.type?.name || 'N/A'}
                      </Badge>
                    </Group>
                  </Box>
                )}

                {/* Status Section */}
                <Box
                  p='md'
                  style={{
                    backgroundColor: isDark
                      ? 'var(--mantine-color-dark-7)'
                      : 'var(--mantine-color-gray-0)',
                    borderRadius: 'var(--mantine-radius-md)',
                    border: `1px dashed ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
                  }}
                >
                  <Group
                    gap='xs'
                    mb='md'
                  >
                    <ThemeIcon
                      variant='light'
                      color='pink'
                      radius='md'
                      size='lg'
                    >
                      <TablerIcons.IconTag size={18} />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Text
                        size='md'
                        fw={600}
                        c={isDark ? 'white' : 'dark.7'}
                      >
                        Project Status
                      </Text>
                      <Text
                        size='xs'
                        c='dimmed'
                      >
                        Current project status indicators
                      </Text>
                    </Box>
                  </Group>

                  {project?.status && project.status.length > 0 ? (
                    <Box>
                      <Group gap='sm'>
                        {project.status.map(st => (
                          <Badge
                            key={st.id}
                            color={st.color || 'gray'}
                            variant='filled'
                            size='lg'
                            radius='md'
                            style={{
                              textTransform: 'capitalize',
                              paddingLeft: 12,
                              paddingRight: 12,
                            }}
                          >
                            {st.name}
                          </Badge>
                        ))}
                      </Group>
                    </Box>
                  ) : (
                    <Box
                      p='md'
                      ta='center'
                      style={{
                        backgroundColor: isDark
                          ? 'var(--mantine-color-dark-7)'
                          : 'var(--mantine-color-gray-0)',
                        borderRadius: 'var(--mantine-radius-md)',
                        border: `1px dashed ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
                      }}
                    >
                      <TablerIcons.IconInfoCircle
                        size={24}
                        style={{
                          color: 'var(--mantine-color-dimmed)',
                          marginBottom: 8,
                        }}
                      />
                      <Text
                        size='sm'
                        c='dimmed'
                        fs='italic'
                      >
                        No status assigned yet
                      </Text>
                    </Box>
                  )}
                </Box>
              </SimpleGrid>

              <Divider
                my='xl'
                label={
                  <Group gap={6}>
                    <TablerIcons.IconShieldCheck size={16} />
                    <Text
                      size='xs'
                      fw={600}
                      tt='uppercase'
                    >
                      Access Control
                    </Text>
                  </Group>
                }
                labelPosition='center'
              />

              {/* Users with Access Section */}
              <Box>
                <Group
                  gap='xs'
                  mb='md'
                >
                  <ThemeIcon
                    variant='light'
                    color='blue'
                    radius='md'
                    size='lg'
                  >
                    <TablerIcons.IconUsers size={18} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Group gap='xs'>
                      <Text
                        size='md'
                        fw={600}
                        c={isDark ? 'white' : 'dark.7'}
                      >
                        Users with Access
                      </Text>
                      {project?.users_with_access && project.users_with_access.length > 0 && (
                        <Badge
                          size='sm'
                          variant='light'
                          color='blue'
                          circle
                        >
                          {project.users_with_access.length}
                        </Badge>
                      )}
                    </Group>
                    <Text
                      size='xs'
                      c='dimmed'
                    >
                      Team members who can view and edit this project
                    </Text>
                  </Box>
                </Group>

                {project?.users_with_access && project.users_with_access.length > 0 ? (
                  <SimpleGrid
                    cols={{ base: 1, sm: 2, lg: 3 }}
                    spacing='sm'
                  >
                    {project.users_with_access.map(user => (
                      <Box
                        key={user.id}
                        p='sm'
                        style={{
                          backgroundColor: isDark
                            ? 'var(--mantine-color-dark-7)'
                            : 'var(--mantine-color-gray-0)',
                          borderRadius: 'var(--mantine-radius-md)',
                          border: `1px solid ${isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
                          transition: 'all 0.2s ease',
                          cursor: 'default',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = isDark
                            ? 'var(--mantine-color-dark-5)'
                            : 'var(--mantine-color-gray-1)';
                          e.currentTarget.style.borderColor = isDark
                            ? 'var(--mantine-color-blue-9)'
                            : 'var(--mantine-color-blue-3)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = isDark
                            ? 'var(--mantine-color-dark-7)'
                            : 'var(--mantine-color-gray-0)';
                          e.currentTarget.style.borderColor = isDark
                            ? 'var(--mantine-color-dark-5)'
                            : 'var(--mantine-color-gray-2)';
                        }}
                      >
                        <Group
                          gap='sm'
                          wrap='nowrap'
                        >
                          <Avatar
                            src={user.avatar || null}
                            radius='xl'
                            size='md'
                            color='blue'
                            style={{
                              border: `2px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
                            }}
                          >
                            {user.name?.[0]?.toUpperCase()}
                          </Avatar>

                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              fw={600}
                              size='sm'
                              c={isDark ? 'white' : 'dark.7'}
                              truncate
                            >
                              {user.name}
                            </Text>
                            <Group
                              gap={6}
                              mt={2}
                            >
                              <TablerIcons.IconMail
                                size={12}
                                style={{ color: 'var(--mantine-color-dimmed)', flexShrink: 0 }}
                              />
                              <Text
                                size='xs'
                                c='dimmed'
                                truncate
                              >
                                {user.email || '—'}
                              </Text>
                            </Group>
                            {user.reason && (
                              <Group
                                gap={6}
                                mt={2}
                              >
                                <TablerIcons.IconKey
                                  size={12}
                                  style={{ color: 'var(--mantine-color-dimmed)', flexShrink: 0 }}
                                />
                                <Text
                                  size='xs'
                                  c='dimmed'
                                  truncate
                                >
                                  {user.reason}
                                </Text>
                              </Group>
                            )}
                          </Box>
                        </Group>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box
                    p='xl'
                    ta='center'
                    style={{
                      backgroundColor: isDark
                        ? 'var(--mantine-color-dark-7)'
                        : 'var(--mantine-color-gray-0)',
                      borderRadius: 'var(--mantine-radius-md)',
                      border: `1px dashed ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
                    }}
                  >
                    <ThemeIcon
                      size={48}
                      radius='xl'
                      variant='light'
                      color='gray'
                      mb='sm'
                      mx='auto'
                    >
                      <TablerIcons.IconUsersOff size={24} />
                    </ThemeIcon>
                    <Text
                      size='sm'
                      fw={500}
                      c='dimmed'
                      mb={4}
                    >
                      No users with access
                    </Text>
                    <Text
                      size='xs'
                      c='dimmed'
                      fs='italic'
                    >
                      Add team members to collaborate on this project
                    </Text>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
}
