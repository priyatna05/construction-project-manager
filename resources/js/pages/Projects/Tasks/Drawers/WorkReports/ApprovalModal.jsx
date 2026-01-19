import {
  Text,
  Group,
  Button,
  Stack,
  Divider,
  Badge,
  ScrollArea,
  Paper,
  ThemeIcon,
  Box,
  Progress,
  Avatar,
  Timeline,
  Alert,
  Tooltip,
  Card,
  SimpleGrid,
  rem,
  Textarea,
  Center,
} from '@mantine/core';
import Modal from '@/components/Modal';
import {
  IconCheck,
  IconX,
  IconCalendar,
  IconRuler,
  IconCurrencyDollar,
  IconCloudRain,
  IconNotes,
  IconTool,
  IconUsers,
  IconPackage,
  IconPhoto,
  IconClock,
  IconAlertCircle,
  IconInfoCircle,
  IconTrendingUp,
  IconInbox,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import { isImage, isViewable } from '@/utils/file';
import JsFileDownloader from 'js-file-downloader';
import FileThumbnail from '@/components/FileThumbnail';
import ImageModal from '@/components/ImageModal';

export default function ApprovalModal({ onClose, workReport, onApprove, onReject, loading }) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openedImg, { close, open }] = useDisclosure(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove(workReport.id);
      onClose();
    } catch (error) {
      console.error('Error approving work report:', error);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await onReject(workReport.id, rejectRemarks);
      onClose();
    } catch (error) {
      console.error('Error rejecting work report:', error);
    } finally {
      setRejecting(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    setShowRejectModal(false);
    handleReject();
  };

  if (!workReport) return null;

  const getStatusColor = status => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'approved') return 'green';
    if (statusLower === 'pending') return 'yellow';
    if (statusLower === 'rejected') return 'red';
    return 'gray';
  };

  const openFile = file => {
    // Untuk file baru (objek File), kita perlu membuat URL objek
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

  const InfoCard = ({ icon: Icon, label, value, color = 'blue' }) => (
    <Paper
      p='md'
      radius='md'
      withBorder
    >
      <Group
        gap='sm'
        wrap='nowrap'
      >
        <ThemeIcon
          size='xl'
          radius='md'
          variant='light'
          color={color}
        >
          <Icon style={{ width: rem(24), height: rem(24) }} />
        </ThemeIcon>
        <Box style={{ flex: 1 }}>
          <Text
            size='xs'
            c='dimmed'
            tt='uppercase'
            fw={600}
          >
            {label}
          </Text>
          <Text
            size='md'
            fw={600}
            mt={4}
          >
            {value}
          </Text>
        </Box>
      </Group>
    </Paper>
  );

  const DetailRow = ({ icon: Icon, label, children, color = 'blue' }) => (
    <Group
      gap='md'
      align='flex-start'
      wrap='nowrap'
    >
      <ThemeIcon
        size='md'
        radius='md'
        variant='light'
        color={color}
      >
        <Icon style={{ width: rem(16), height: rem(16) }} />
      </ThemeIcon>
      <Box style={{ flex: 1 }}>
        <Text
          size='sm'
          fw={500}
          c='dimmed'
          mb={4}
        >
          {label}
        </Text>
        {children}
      </Box>
    </Group>
  );

  return (
    <Paper
      p='lg'
      radius='md'
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
      }}
    >
      <Group
        gap='sm'
        mb='lg'
      >
        <ThemeIcon
          size='lg'
          radius='md'
          variant='gradient'
          gradient={{ from: 'blue', to: 'cyan' }}
        >
          <IconClock style={{ width: rem(20), height: rem(20) }} />
        </ThemeIcon>
        <Box>
          <Text
            fw={700}
            size='lg'
          >
            Work Report Review
          </Text>
          <Text
            size='xs'
            c='dimmed'
          >
            Review and approve the submitted work report
          </Text>
        </Box>
      </Group>

      <Stack gap='lg'>
        {/* Status Alert */}
        {workReport.status?.toLowerCase() === 'pending' && (
          <Alert
            icon={<IconAlertCircle size={18} />}
            title='Awaiting Your Review'
            color='yellow'
            variant='light'
          >
            This work report is pending approval. Please review the details carefully before taking
            action.
          </Alert>
        )}

        <Divider />

        {/* Action Buttons */}
        <Group justify='space-between'>
          <Group gap='xs'>
            <ThemeIcon
              size='sm'
              radius='xl'
              variant='light'
              color='gray'
            >
              <IconInfoCircle style={{ width: rem(14), height: rem(14) }} />
            </ThemeIcon>
            <Text
              size='xs'
              c='dimmed'
            >
              Your decision will be recorded and cannot be undone
            </Text>
          </Group>
          <Group gap='sm'>
            <Button
              variant='light'
              color='red'
              leftSection={<IconX size={18} />}
              onClick={handleRejectClick}
              loading={rejecting}
              disabled={approving || loading}
              size='md'
            >
              Reject Report
            </Button>
            <Button
              variant='gradient'
              gradient={{ from: 'teal', to: 'lime', deg: 135 }}
              leftSection={<IconCheck size={18} />}
              onClick={handleApprove}
              loading={approving}
              disabled={rejecting || loading}
              size='md'
            >
              Approve Report
            </Button>
          </Group>
        </Group>

        {/* Header Card */}
        <Card
          withBorder
          radius='md'
          p='lg'
          style={{
            background:
              'linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, rgba(72, 187, 120, 0.1) 100%)',
          }}
        >
          <Group
            justify='space-between'
            align='flex-start'
            mb='md'
          >
            <Box style={{ flex: 1 }}>
              <Text
                fw={700}
                size='xl'
                mb={4}
              >
                {workReport.name ||
                  `Work Report - ${dayjs(workReport.report_date).format('DD MMM YYYY')}`}
              </Text>
              <Group gap='xs'>
                <Badge
                  variant='light'
                  color={getStatusColor(workReport.status)}
                  size='lg'
                  leftSection={
                    workReport.status?.toLowerCase() === 'approved' ? (
                      <IconCheck size={14} />
                    ) : workReport.status?.toLowerCase() === 'rejected' ? (
                      <IconX size={14} />
                    ) : (
                      <IconClock size={14} />
                    )
                  }
                >
                  {workReport.status}
                </Badge>
                {workReport.user && (
                  <Group gap={6}>
                    <Avatar
                      size='sm'
                      radius='xl'
                      color='blue'
                    >
                      {workReport.user.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Text
                      size='sm'
                      c='dimmed'
                    >
                      by {workReport.user.name}
                    </Text>
                  </Group>
                )}
              </Group>
            </Box>
            <Tooltip label='Overall Progress' zIndex={2200}>
              <Box style={{ textAlign: 'center' }}>
                <Text
                  size='xs'
                  c='dimmed'
                  mb={4}
                >
                  Progress
                </Text>
                <ThemeIcon
                  size='xl'
                  radius='xl'
                  variant='gradient'
                  gradient={{ from: 'teal', to: 'lime', deg: 135 }}
                >
                  <Text
                    size='lg'
                    fw={700}
                  >
                    {workReport.progress}%
                  </Text>
                </ThemeIcon>
              </Box>
            </Tooltip>
          </Group>
          <Progress
            value={workReport.progress}
            size='lg'
            radius='xl'
            color={
              workReport.progress < 50 ? 'orange' : workReport.progress < 100 ? 'blue' : 'green'
            }
            striped
            animated={workReport.progress < 100}
          />
        </Card>

        {/* Key Metrics */}
        <SimpleGrid
          cols={4}
          spacing='md'
        >
          <InfoCard
            icon={IconCalendar}
            label='Report Date'
            value={dayjs(workReport.report_date).format('DD MMM YYYY')}
            color='blue'
          />
          <InfoCard
            icon={IconCloudRain}
            label='Weather Conditions'
            color='cyan'
            value={`${workReport.weather}`}
          />
          <InfoCard
            icon={IconRuler}
            label='Work Done'
            value={`${workReport.work_done || 0} ${workReport.unit || ''}`}
            color='cyan'
          />

          {workReport.actual_cost && (
            <InfoCard
              icon={IconCurrencyDollar}
              label='Actual Cost'
              value={parseFloat(workReport.actual_cost).toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              color='green'
            />
          )}
        </SimpleGrid>

        {workReport.remarks && (
          <DetailRow
            icon={IconNotes}
            label='Remarks'
            color='violet'
          >
            <Text
              size='sm'
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {workReport.remarks}
            </Text>
          </DetailRow>
        )}

        <Divider
          label={
            <Group gap={4}>
              <IconNotes size={24} />
              <Text
                maw={600}
                c='black'
              >
                Detailed Information
              </Text>
            </Group>
          }
          labelPosition='center'
          style={{ flex: 1 }}
        />

        <ScrollArea
          h={300}
          offsetScrollbars
        >
          <Stack gap='lg'>
            {!workReport.equipment_details?.length &&
            !workReport.labor_details?.length &&
            !workReport.material_details?.length &&
            !workReport.photos_count &&
            (!Array.isArray(workReport.attachments) || workReport.attachments.length === 0) ? (
              // ✅ Jika tidak ada data, tampilkan tampilan kosong yang informatif
              <Center
                h={250}
                style={{ flexDirection: 'column', opacity: 0.7 }}
              >
                <ThemeIcon
                  variant='light'
                  color='gray'
                  size={80}
                  radius='xl'
                  mb='sm'
                >
                  <IconInbox size={40} />
                </ThemeIcon>
                <Text
                  fw={600}
                  size='lg'
                  c='dimmed'
                >
                  No detailed information available
                </Text>
                <Text
                  size='sm'
                  c='dimmed'
                >
                  There are no resources, materials, or attachments for this work report.
                </Text>
              </Center>
            ) : (
              <>
                {/* 🔸 Resources Timeline */}
                {(workReport.equipment_details?.length > 0 ||
                  workReport.labor_details?.length > 0 ||
                  workReport.material_details?.length > 0) && (
                  <Paper
                    p='md'
                    radius='md'
                    withBorder
                  >
                    <Group mb='md'>
                      <ThemeIcon
                        size='lg'
                        radius='md'
                        variant='light'
                        color='orange'
                      >
                        <IconTrendingUp style={{ width: rem(20), height: rem(20) }} />
                      </ThemeIcon>
                      <Text
                        fw={600}
                        size='md'
                      >
                        Resources Used
                      </Text>
                    </Group>

                    <Timeline
                      active={3}
                      bulletSize={28}
                      lineWidth={2}
                    >
                      {/* 🧰 Equipment */}
                      {workReport.equipment_details?.length > 0 && (
                        <Timeline.Item
                          bullet={<IconTool size={14} />}
                          title={
                            <Text
                              fw={600}
                              size='sm'
                            >
                              Equipment ({workReport.equipment_details.length})
                            </Text>
                          }
                          color='orange'
                        >
                          <Stack
                            gap='xs'
                            mt='xs'
                          >
                            {workReport.equipment_details.map((eq, idx) => (
                              <Paper
                                key={idx}
                                p='xs'
                                radius='sm'
                                withBorder
                              >
                                <Group gap='xl'>
                                  <Text
                                    size='sm'
                                    fw={500}
                                  >
                                    {eq.name}
                                  </Text>
                                  <Group gap='xs'>
                                    <Badge
                                      variant='light'
                                      size='sm'
                                    >
                                      {eq.hours_used}h
                                    </Badge>
                                    {eq.fuel_used && (
                                      <Badge
                                        variant='light'
                                        size='sm'
                                        color='red'
                                      >
                                        {eq.fuel_used}L fuel
                                      </Badge>
                                    )}
                                  </Group>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        </Timeline.Item>
                      )}

                      {/* 👷 Labor */}
                      {workReport.labor_details?.length > 0 && (
                        <Timeline.Item
                          bullet={<IconUsers size={14} />}
                          title={
                            <Text
                              fw={600}
                              size='sm'
                            >
                              Labor ({workReport.labor_details.length})
                            </Text>
                          }
                          color='blue'
                        >
                          <Stack
                            gap='xs'
                            mt='xs'
                          >
                            {workReport.labor_details.map((lab, idx) => (
                              <Paper
                                key={idx}
                                p='xs'
                                radius='sm'
                                withBorder
                              >
                                <Group gap='xl'>
                                  <Text
                                    size='sm'
                                    fw={500}
                                  >
                                    {lab.category}
                                  </Text>
                                  <Group gap='xs'>
                                    <Badge
                                      variant='light'
                                      size='sm'
                                    >
                                      {lab.headcount}p
                                    </Badge>
                                    <Badge
                                      variant='light'
                                      size='sm'
                                      color='cyan'
                                    >
                                      {lab.work_hours}h
                                    </Badge>
                                    {lab.overtime && (
                                      <Badge
                                        variant='light'
                                        size='sm'
                                        color='orange'
                                      >
                                        +{lab.overtime}h OT
                                      </Badge>
                                    )}
                                  </Group>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        </Timeline.Item>
                      )}

                      {/* 📦 Materials */}
                      {workReport.material_details?.length > 0 && (
                        <Timeline.Item
                          bullet={<IconPackage size={14} />}
                          title={
                            <Text
                              fw={600}
                              size='sm'
                            >
                              Materials ({workReport.material_details.length})
                            </Text>
                          }
                          color='teal'
                        >
                          <Stack
                            gap='xs'
                            mt='xs'
                          >
                            {workReport.material_details.map((mat, idx) => (
                              <Paper
                                key={idx}
                                p='xs'
                                radius='sm'
                                withBorder
                              >
                                <Group gap='xl'>
                                  <Text
                                    size='sm'
                                    fw={500}
                                  >
                                    {mat.name}
                                  </Text>
                                  <Badge
                                    variant='light'
                                    size='sm'
                                  >
                                    {mat.used_quantity} {mat.unit || mat.base_unit || ''}
                                    {mat.base_unit &&
                                      mat.unit &&
                                      mat.unit.toLowerCase() !== mat.base_unit.toLowerCase() &&
                                      ` (${mat.used_quantity_base ?? mat.used_quantity} ${mat.base_unit})`}
                                  </Badge>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        </Timeline.Item>
                      )}
                    </Timeline>
                  </Paper>
                )}

                {/* 📸 Photos */}
                {workReport.photos_count > 0 && (
                  <DetailRow
                    icon={IconPhoto}
                    label='Documentation'
                    color='pink'
                  >
                    <Badge
                      variant='light'
                      size='lg'
                      leftSection={<IconPhoto size={14} />}
                    >
                      {workReport.photos_count} photos uploaded
                    </Badge>
                  </DetailRow>
                )}

                {/* 📎 Attachments */}
                {Array.isArray(workReport.attachments) && workReport.attachments.length > 0 && (
                  <Group
                    mt='md'
                    gap='md'
                  >
                    {workReport.attachments.map(file => (
                      <FileThumbnail
                        key={file.id}
                        open={() => openFile(file)}
                        file={{
                          id: file.id,
                          name: file.name,
                          type: file.mime_type || 'unknown',
                          url: `/storage/${file.path}`,
                          thumb_url: `/storage/${file.thumb}`,
                        }}
                      />
                    ))}
                  </Group>
                )}

                <ImageModal
                  image={selectedImage}
                  opened={openedImg}
                  close={close}
                />
              </>
            )}
          </Stack>
        </ScrollArea>
      </Stack>

      <Modal
        opened={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title='Reject Work Report'
        centered
        draggable
        zIndex={2400}
        overlayProps={{ backgroundOpacity: 0.25, blur: 2 }}
      >
        <Stack gap='md'>
          <Text
            size='sm'
            c='dimmed'
          >
            Please provide remarks for rejecting this work report. These remarks will be saved and
            sent to the field team.
          </Text>
          <Textarea
            label='Remarks'
            placeholder='Enter rejection remarks...'
            value={rejectRemarks}
            onChange={event => setRejectRemarks(event.currentTarget.value)}
            minRows={3}
            required
          />
          <Group
            justify='flex-end'
            gap='sm'
          >
            <Button
              color='red'
              onClick={handleRejectConfirm}
              loading={rejecting}
              disabled={!rejectRemarks.trim()}
            >
              Reject Report
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
