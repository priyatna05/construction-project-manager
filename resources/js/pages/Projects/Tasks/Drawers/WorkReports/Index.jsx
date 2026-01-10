import {
  ActionIcon,
  Box,
  Table,
  Text,
  TextInput,
  Group,
  Tooltip,
  Stack,
  Title,
  Divider,
  Badge,
  Skeleton,
  ScrollArea,
  Button,
  Checkbox,
} from '@mantine/core';
import Modal from '@/components/Modal';
import {
  IconPlus,
  IconSearch,
  IconFileAnalytics,
  IconTrash,
  IconEdit,
  IconArrowUp,
  IconClipboardText,
  IconLock,
} from '@tabler/icons-react';
import AddRow from './AddRow';
import PhotoUploadModal from './Modal/PhotoUploadModal';
import ApprovalModal from './ApprovalModal';
import SortMenu from './SortMenu';
import EquipmentUsed from './Modal/EquipmentUsed';
import LaborUsed from './Modal/LaborUsed';
import MaterialsUsed from './Modal/MaterialsUsed';
import { useWorkReports } from '../../../../../hooks/store/useWorkReports';
import useAuthorization from '../../../../../hooks/useAuthorization';
import { useEffect, useState } from 'react';
import dayjs from '@/utils/dayjsConfig';
import { convertWorkDone } from '@/utils/unitConversion';

export default function WorkReports({
  projectId,
  taskId,
  taskStartDate,
  taskEndDate,
  taskUnit,
  taskVolume,
  allocatedInventories = [],
  pendingApproval,
  onApprovalHandled,
  isLocked = false,
}) {
  const { isAdmin, isManager } = useAuthorization();

  const [editingModal, setEditingModal] = useState(null); // 'equipment' | 'labor' | 'material' | 'photo' | null
  const [editingReportData, setEditingReportData] = useState(null);
  const [showApproval, setShowApproval] = useState(false);
  const [selectedWorkReport, setSelectedWorkReport] = useState(null);
  const modalZIndex = 2300;

  const {
    // Data
    reports,
    filteredReports,
    loading,
    isAdding,
    saving,
    photoModalOpened,
    setPhotoModalOpened,
    uploadedPhotos,
    newReport,
    setNewReport,
    equipmentUsedList,
    newEquipment,
    setNewEquipment,
    laborUsedList,
    newLabor,
    setNewLabor,
    materialsUsedList,
    newMaterial,
    setNewMaterial,
    plannedEquipments,
    plannedLabor,
    plannedMaterials,
    search,
    setSearch,
    setSortOption,
    unitLabels,

    // Handlers
    handleAddEquipment,
    handleAddLabor,
    handleAddMaterial,
    handleUpdateEquipment,
    handleDeleteEquipment,
    handleUpdateLabor,
    handleDeleteLabor,
    handleUpdateMaterial,
    handleDeleteMaterial,
    handleAddNewRow,
    handleSavePhotos,
    handleSaveNewReport,
    handleCancelAdd,
    handleEditReport,
    handleDeleteReport,
    deletingReportId,
    editingReport,
    calculateActualCost,
    handleUpdateEquipmentDetails,
    handleUpdateLaborDetails,
    handleUpdateMaterialDetails,
    handleUpdatePhotos,
    handleApproveWorkReport,
    handleRejectWorkReport,
  } = useWorkReports(projectId, taskId, allocatedInventories, taskUnit, taskVolume);

  // Check if user can view actual cost (admin or manager)
  const canViewActualCost = isAdmin() || isManager();
  const isReadOnly = Boolean(isLocked);
  const lockMessage = 'Project is completed - work reports are locked.';

  // Calculate total work done from all reports (converted to task unit)
  const totalWorkDone = reports.reduce((acc, report) => {
    const workDone = Number(report.work_done) || 0;
    const converted = convertWorkDone(workDone, report.unit, taskUnit);
    return acc + converted;
  }, 0);
  const isTaskCompleted = totalWorkDone >= Number(taskVolume);
  const manualProgressEnabled = !!newReport?.manualProgress;

  useEffect(() => {
    if (isReadOnly && isAdding) {
      handleCancelAdd();
    }
  }, [isReadOnly, isAdding]);

  // Check for work_report_id in URL params to open approval modal
  useEffect(() => {
    if (pendingApproval && reports.length > 0) {
      const workReport = reports.find(r => r.id == pendingApproval.workReportId);
      if (workReport && workReport.status === 'Pending') {
        setSelectedWorkReport(workReport);
        setShowApproval(true);

        // Bersihkan URL
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('work_report_id');
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);

        // Jangan panggil onApprovalHandled di sini - tunggu sampai modal ditutup
      } else if (workReport && workReport.status !== 'Pending') {
        // Jika work report sudah tidak pending, clear state
        setShowApproval(false);
        setSelectedWorkReport(null);
        if (onApprovalHandled) onApprovalHandled();
      }
    } else if (!pendingApproval) {
      // Jika tidak ada pendingApproval, pastikan modal tertutup
      setShowApproval(false);
      setSelectedWorkReport(null);
    }
  }, [pendingApproval, reports, onApprovalHandled]);

  // Expose calculateActualCost to window for modal callbacks
  useEffect(() => {
    window.updateActualCost = calculateActualCost;
    return () => {
      delete window.updateActualCost;
    };
  }, [calculateActualCost]);

  // Auto-recalculate cost when reports change
  useEffect(() => {
    calculateActualCost();
  }, [reports]);

  const rows = filteredReports.map((r, i) => (
    <Table.Tr
      key={r.id}
      style={{
        backgroundColor: editingReport && editingReport.id === r.id ? '#f0f9ff' : undefined,
      }}
    >
      <Table.Td style={{ width: '50px', minWidth: '50px' }}>{i + 1}</Table.Td>
      <Table.Td>{dayjs(r.report_date).format('DD/MM/YYYY')}</Table.Td>
      <Table.Td style={{ maxWidth: 220 }}>
        <Tooltip
          label={r.name}
          withArrow
          color='green'
          zIndex={2200}
          multiline
          maw={320}
          position='top'
        >
          <Text
            size='xs'
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              margin: '0 auto',
            }}
          >
            {r.name}
          </Text>
        </Tooltip>
      </Table.Td>
      <Tooltip
        label='Click to view'
        multiline
        zIndex={2200}
        width={220}
        withArrow
        color='green'
        position='top'
      >
        <Table.Td
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setEditingModal('equipment');
            setEditingReportData(r);
          }}
        >
          {Array.isArray(r.equipment_details) && r.equipment_details.length > 0 ? (
            r.equipment_details
              .slice(0, 1)
              .map(e => `${e.name} (${e.hours_used}h)`)
              .join(', ') + (r.equipment_details.length > 1 ? ', ...' : '')
          ) : (
            <span style={{ color: 'red' }}>Empty record</span>
          )}
        </Table.Td>
      </Tooltip>
      <Tooltip
        label='Click to view'
        multiline
        zIndex={2200}
        width={220}
        withArrow
        color='green'
        position='top'
      >
        <Table.Td
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setEditingModal('labor');
            setEditingReportData(r);
          }}
        >
          {Array.isArray(r.labor_details) && r.labor_details.length > 0 ? (
            r.labor_details
              .slice(0, 1)
              .map(l => `${l.category} (${l.headcount}p)`)
              .join(', ') + (r.labor_details.length > 1 ? ', ...' : '')
          ) : (
            <span style={{ color: 'red' }}>Empty record</span>
          )}
        </Table.Td>
      </Tooltip>
      <Tooltip
        label='Click to view'
        multiline
        zIndex={2200}
        width={220}
        withArrow
        color='green'
        position='top'
      >
        <Table.Td
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setEditingModal('material');
            setEditingReportData(r);
          }}
        >
          {Array.isArray(r.material_details) && r.material_details.length > 0 ? (
            r.material_details
              .slice(0, 1)
              .map(m => `${m.name} (${m.used_quantity})`)
              .join(', ') + (r.material_details.length > 1 ? ', ...' : '')
          ) : (
            <span style={{ color: 'red' }}>Empty record</span>
          )}
        </Table.Td>
      </Tooltip>
      <Table.Td>
        {r.work_done > 0 ? `${r.work_done}` : <span style={{ color: 'red' }}>Empty record</span>}
      </Table.Td>
      <Table.Td>{r.unit}</Table.Td>
      {canViewActualCost && (
        <>
          <Table.Td>
            {r.actual_unit_cost
              ? parseFloat(r.actual_unit_cost).toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '0,00'}
          </Table.Td>
          <Table.Td>
            {' '}
            {r.actual_cost
              ? parseFloat(r.actual_cost).toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '0,00'}
          </Table.Td>
        </>
      )}
      <Table.Td>{r.progress}%</Table.Td>
      <Table.Td>{r.weather}</Table.Td>
      <Tooltip
        label='Click to view'
        multiline
        zIndex={2200}
        width={220}
        withArrow
        color='green'
        position='top'
      >
        <Table.Td
          style={{ cursor: 'pointer', maxWidth: 200 }}
          onClick={() => {
            setEditingModal('remarks');
            setEditingReportData(r);
          }}
        >
          {r.remarks ? (
            <Text
              size='sm'
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 200,
              }}
            >
              {r.remarks}
            </Text>
          ) : (
            <span style={{ color: 'red' }}>Empty record</span>
          )}
        </Table.Td>
      </Tooltip>
      <Tooltip
        label='Click to view'
        multiline
        zIndex={2200}
        width={220}
        withArrow
        color='green'
        position='top'
      >
        <Table.Td
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setEditingModal('photo');
            setEditingReportData(r);
          }}
        >
          {r.photos_count > 0 ? (
            `${r.photos_count} photos`
          ) : (
            <span style={{ color: 'red' }}>Empty record</span>
          )}
        </Table.Td>
      </Tooltip>
      {!isAdding && (
        <Table.Td>
          <Badge
            variant='light'
            color={
              r.status === 'Approved'
                ? 'green'
                : r.status === 'Pending'
                  ? 'yellow'
                  : r.status === 'Rejected'
                    ? 'red'
                    : 'grey'
            }
          >
            {r.status}
          </Badge>
        </Table.Td>
      )}

      <Table.Td>
        {editingReport && editingReport.id === r.id ? (
          <Tooltip
            label='Row is being edited'
            withArrow
            zIndex={2200}
            color='blue'
            position='top'
          >
            <ActionIcon
              color='blue'
              variant='filled'
              onClick={handleCancelAdd}
              aria-label='Row is being edited'
            >
              <IconArrowUp size={16} />
            </ActionIcon>
          </Tooltip>
        ) : r.status === 'Pending' || r.status === 'Rejected' ? (
          <Group
            gap='xs'
            justify='flex-end'
            wrap='nowrap'
          >
            <Tooltip
              label='Edit report'
              withArrow
              zIndex={2200}
              color='green'
              position='top'
            >
              <ActionIcon
                color='green'
                variant='filled'
                aria-label='Edit report'
                onClick={() => !isReadOnly && handleEditReport(r)}
                disabled={isReadOnly}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip
              label='Delete report'
              withArrow
              zIndex={2200}
              position='top'
              color='red'
            >
              <ActionIcon
                color='red'
                variant='filled'
                aria-label='Delete report'
                onClick={() => !isReadOnly && handleDeleteReport(r.id)}
                loading={deletingReportId === r.id}
                disabled={isReadOnly}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ) : (
          <Text
            size='sm'
            c='dimmed'
            ta='center'
          >
            Done
          </Text>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box
      mx='auto'
      mt='xl'
      pb='xl'
    >
      <Stack gap='md'>
        {/* Approval Modal - Show when approval is pending */}
        {!isReadOnly && showApproval && selectedWorkReport && (
          <ApprovalModal
            zIndex={2200}
            workReport={selectedWorkReport}
            onApprove={handleApproveWorkReport}
            onReject={(reportId, remarks) => handleRejectWorkReport(reportId, remarks)}
            onClose={() => {
              setShowApproval(false);
              setSelectedWorkReport(null);
              if (onApprovalHandled) onApprovalHandled();
            }}
            loading={false}
          />
        )}

        {/* Header */}
        {!showApproval && (
          <Box>
            <Group
              justify='space-between'
              mb='xs'
            >
              <Group gap='xs'>
                <IconFileAnalytics size={20} />
                <Title order={5}>Work Reports</Title>
              </Group>
            </Group>
            {isReadOnly ? (
              <Group
                gap='sm'
                mt='sm'
              >
                <IconLock size={16} />
                <Text size='sm' c='dimmed'>
                  {lockMessage}
                </Text>
              </Group>
            ) : (
              <Text
                size='sm'
                c='dimmed'
              >
                Track daily/weekly progress, resource usage, and work documentation for this task
              </Text>
            )}
            <Divider
              mb='md'
              mt='sm'
            />
          </Box>
        )}

        {/* Table Section */}
        {!showApproval && reports.length > 0 && (
          <Group
            mb='md'
            align='center'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <SortMenu setSortOption={setSortOption} />
            <TextInput
              placeholder='Search material, equipment, or remarks...'
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={e => setSearch(e.currentTarget.value)}
              style={{ width: '35ch' }}
              radius='md'
            />

            <Tooltip
              zIndex={2200}
              withArrow
              position='top'
              color='green'
              label={
                isReadOnly
                  ? lockMessage
                  : isTaskCompleted
                    ? 'Task completed - cannot add more reports'
                    : 'Add Work Report'
              }
            >
              <ActionIcon
                color={isTaskCompleted || isReadOnly ? 'gray' : 'green'}
                variant='filled'
                size='lg'
                onClick={() => {
                  if (isReadOnly || isTaskCompleted) return;
                  handleAddNewRow();
                }}
                disabled={isTaskCompleted || isReadOnly}
              >
                <IconPlus size={30} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
        {!showApproval && (
          <Box
            style={{
              maxHeight: '600px',
              overflowY: 'auto',
              overflowX: 'auto',
              backgroundColor: 'white',
            }}
          >
            <Table
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              horizontalSpacing='sm'
              content='center'
              stickyHeader
              style={{ width: '100%', overflow: 'visible' }}
              styles={{
                thead: {
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#f8f9fa',
                  zIndex: 1,
                },
                th: {
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  backgroundColor: '#f1f3f5',
                  fontSize: '13px',
                  padding: '8px',
                  borderBottom: '2px solid #dee2e6',
                },
                tr: {
                  width: '100%',
                },
                table: {
                  width: '100%',
                  tableLayout: 'auto',
                },
                td: {
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  fontSize: '12px',
                  width: 'auto',
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>No</Table.Th>
                  <Table.Th>
                    Report Date{isAdding ? <span style={{ color: 'red' }}> *</span> : ''}
                  </Table.Th>
                  <Table.Th>
                    Report Name{isAdding ? <span style={{ color: 'red' }}> *</span> : ''}
                  </Table.Th>
                  <Table.Th>Equipment Used</Table.Th>
                  <Table.Th>Labor Used</Table.Th>
                  <Table.Th>Materials Used</Table.Th>
                  <Table.Th>
                    Work Done{isAdding ? <span style={{ color: 'red' }}> *</span> : ''}
                  </Table.Th>
                  <Table.Th>
                    Unit{isAdding ? <span style={{ color: 'red' }}> *</span> : ''}
                  </Table.Th>
                  {canViewActualCost && (
                    <>
                      <Table.Th>
                        <Tooltip
                          label='Enable manual actual unit cost'
                          zIndex={2200}
                          withArrow
                        >
                          <Group
                            justify='center'
                            align='center'
                            gap={6}
                            wrap='nowrap'
                          >
                            {isAdding && (
                              <Checkbox
                                size='xs'
                                checked={newReport.manualActualUnitCost || false}
                                disabled={!isAdding}
                                onChange={e =>
                                  setNewReport(prev => ({
                                    ...prev,
                                    manualActualUnitCost: e.currentTarget.checked,
                                  }))
                                }
                                styles={{ label: { fontSize: 11 } }}
                              />
                            )}
                            <Text
                              size='sm'
                              fw={600}
                            >
                              Unit Cost{isAdding ? <span style={{ color: 'red' }}> *</span> : ''}
                            </Text>
                          </Group>
                        </Tooltip>
                      </Table.Th>
                      <Table.Th>
                        <Tooltip
                          label='Enable manual actual cost'
                          zIndex={2200}
                          withArrow
                        >
                          <Group
                            justify='center'
                            align='center'
                            gap={6}
                            wrap='nowrap'
                          >
                            {isAdding && (
                              <Checkbox
                                size='xs'
                                checked={newReport.manualActualCost || false}
                                disabled={!isAdding}
                                onChange={e =>
                                  setNewReport(prev => ({
                                    ...prev,
                                    manualActualCost: e.currentTarget.checked,
                                  }))
                                }
                                styles={{ label: { fontSize: 11 } }}
                              />
                            )}
                            <Text
                              size='sm'
                              fw={600}
                            >
                              Actual Cost{isAdding ? <span style={{ color: 'red' }}> *</span> : ''}
                            </Text>
                          </Group>
                        </Tooltip>
                      </Table.Th>
                    </>
                  )}
                  <Table.Th>
                    <Tooltip
                      label='Enable manual progress'
                      zIndex={2200}
                      withArrow
                    >
                      <Group
                        justify='center'
                        align='center'
                        gap={6}
                        wrap='nowrap'
                      >
                        {isAdding && (
                          <Checkbox
                            size='xs'
                            checked={manualProgressEnabled}
                            disabled={!isAdding}
                            onChange={e =>
                              setNewReport(prev => ({
                                ...prev,
                                manualProgress: e.currentTarget.checked,
                              }))
                            }
                            styles={{ label: { fontSize: 11 } }}
                          />
                        )}
                        <Text
                          size='sm'
                          fw={600}
                        >
                          Progress (%){isAdding ? <span style={{ color: 'red' }}> *</span> : ''}
                        </Text>
                      </Group>
                    </Tooltip>
                  </Table.Th>
                  <Table.Th>
                    Weather{isAdding ? <span style={{ color: 'red' }}> *</span> : ''}
                  </Table.Th>
                  <Table.Th>Remarks / Notes</Table.Th>
                  <Table.Th>Work Photos</Table.Th>
                  {!isAdding && <Table.Th>Status</Table.Th>}
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
            <Table.Tbody>
              {!isReadOnly && (
                <AddRow
                  localReports={reports}
                  newReport={newReport}
                  newMaterial={newMaterial}
                  newLabor={newLabor}
                  newEquipment={newEquipment}
                  equipmentUsedList={equipmentUsedList}
                  laborUsedList={laborUsedList}
                  materialsUsedList={materialsUsedList}
                  plannedMaterials={plannedMaterials}
                  plannedLabor={plannedLabor}
                  plannedEquipments={plannedEquipments}
                  isAdding={isAdding}
                  handleAddMaterial={handleAddMaterial}
                  handleAddLabor={handleAddLabor}
                  handleAddEquipment={handleAddEquipment}
                  handleUpdateEquipment={handleUpdateEquipment}
                  handleDeleteEquipment={handleDeleteEquipment}
                  handleUpdateLabor={handleUpdateLabor}
                  handleDeleteLabor={handleDeleteLabor}
                  handleUpdateMaterial={handleUpdateMaterial}
                  handleDeleteMaterial={handleDeleteMaterial}
                  handleSaveNewReport={handleSaveNewReport}
                  handleCancelAdd={handleCancelAdd}
                  setNewReport={setNewReport}
                  setNewMaterial={setNewMaterial}
                  setNewLabor={setNewLabor}
                  setNewEquipment={setNewEquipment}
                  taskStartDate={taskStartDate}
                  taskEndDate={taskEndDate}
                  taskVolume={taskVolume}
                  taskUnit={taskUnit}
                  onOpenPhotoModal={() => setPhotoModalOpened(true)}
                  photoCount={uploadedPhotos.length}
                  saving={saving}
                  editingReport={editingReport}
                  unitLabels={unitLabels}
                  manualProgressEnabled={manualProgressEnabled}
                />
              )}
              {rows}
            </Table.Tbody>
          </Table>
          </Box>
        )}

        {loading ? (
          // Saat masih loading → tampilkan skeleton
          <Stack
            gap='sm'
            p='md'
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <Box
                key={i}
                p='sm'
                style={{
                  border: '1px solid var(--mantine-color-gray-3)',
                  borderRadius: 8,
                }}
              >
                <Group
                  justify='space-between'
                  align='center'
                >
                  <Skeleton
                    height={12}
                    width='10%'
                  />
                  <Skeleton
                    height={12}
                    width='20%'
                  />
                  <Skeleton
                    height={12}
                    width='10%'
                  />
                  <Skeleton
                    height={12}
                    width='15%'
                  />
                  <Skeleton
                    height={12}
                    width='20%'
                  />
                </Group>
              </Box>
            ))}
          </Stack>
        ) : filteredReports.length === 0 && !isAdding ? (
          <Box
            p='xl'
            ta='center'
            bg='gray.0'
            style={{
              borderRadius: '16px',
              border: '1px dashed #d0d0d0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)')}
          >
            <Stack
              align='center'
              spacing='xs'
            >
              <IconClipboardText
                size={48}
                stroke={1.5}
                color='#ADB5BD'
              />
              <Text
                fz='lg'
                fw={600}
                c='gray.7'
              >
                No work report found
              </Text>
              <Text
                c='dimmed'
                fz='sm'
                maw={360}
              >
                You haven’t created any work reports yet. Click{' '}
                <Text
                  span
                  fw={600}
                  c='blue'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (isReadOnly) return;
                    handleAddNewRow();
                  }}
                >
                  “Add Work Report”
                </Text>{' '}
                to create your first one.
              </Text>

              <Group
                mt='md'
                position='center'
              >
                <Button
                  leftSection={
                    <IconPlus
                      size={18}
                      stroke={1.6}
                    />
                  }
                  color='blue'
                  radius='xl'
                  variant='gradient'
                  gradient={{ from: 'teal', to: 'blue', deg: 90 }}
                  onClick={() => {
                    if (isReadOnly) return;
                    handleAddNewRow();
                  }}
                  disabled={isReadOnly}
                >
                  Add Work Report
                </Button>
              </Group>
            </Stack>
          </Box>
        ) : null}
      </Stack>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        zIndex={2200}
        opened={photoModalOpened}
        onClose={() => setPhotoModalOpened(false)}
        onSave={handleSavePhotos}
        initialPhotos={uploadedPhotos}
        isEditMode={!isReadOnly}
      />

      {/* Edit Modals */}
      {editingModal === 'equipment' && editingReportData && (
        <EquipmentUsed
          equipmentUsedList={editingReportData.equipment_details || []}
          plannedEquipments={plannedEquipments}
          newEquipment={newEquipment}
          setNewEquipment={setNewEquipment}
          handleAddEquipment={handleAddEquipment}
          handleUpdateEquipment={handleUpdateEquipment}
          handleDeleteEquipment={handleDeleteEquipment}
          reportData={editingReportData}
          isEditMode={false}
          isOpen={editingModal === 'equipment'}
          onClose={() => {
            setEditingModal(null);
            setEditingReportData(null);
          }}
          onUpdate={updatedData => {
            handleUpdateEquipmentDetails(editingReportData.id, updatedData);
            setEditingModal(null);
            setEditingReportData(null);
          }}
        />
      )}

      {editingModal === 'labor' && editingReportData && (
        <LaborUsed
          laborUsedList={editingReportData.labor_details || []}
          plannedLabor={plannedLabor}
          newLabor={newLabor}
          setNewLabor={setNewLabor}
          handleAddLabor={handleAddLabor}
          handleUpdateLabor={handleUpdateLabor}
          handleDeleteLabor={handleDeleteLabor}
          reportData={editingReportData}
          isEditMode={false}
          isOpen={editingModal === 'labor'}
          onClose={() => {
            setEditingModal(null);
            setEditingReportData(null);
          }}
          onUpdate={updatedData => {
            handleUpdateLaborDetails(editingReportData.id, updatedData);
            setEditingModal(null);
            setEditingReportData(null);
          }}
        />
      )}

      {editingModal === 'material' && editingReportData && (
        <MaterialsUsed
          materialsUsedList={editingReportData.material_details || []}
          plannedMaterials={plannedMaterials}
          newMaterial={newMaterial}
          setNewMaterial={setNewMaterial}
          handleAddMaterial={handleAddMaterial}
          handleUpdateMaterial={handleUpdateMaterial}
          handleDeleteMaterial={handleDeleteMaterial}
          reportData={editingReportData}
          isEditMode={false}
          isOpen={editingModal === 'material'}
          onClose={() => {
            setEditingModal(null);
            setEditingReportData(null);
          }}
          onUpdate={updatedData => {
            handleUpdateMaterialDetails(editingReportData.id, updatedData);
            setEditingModal(null);
            setEditingReportData(null);
          }}
        />
      )}

      {editingModal === 'remarks' && editingReportData && (
        <Modal
          centered
          draggable
          title='Remarks Details'
          opened={true}
          zIndex={modalZIndex}
          closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
          overlayProps={{ backgroundOpacity: 0.0, blur: 0 }}
          transitionProps={{ transition: 'fade', duration: 200 }}
          onClose={() => {
            setEditingModal(null);
            setEditingReportData(null);
          }}
          isEditMode={true}
        >
          <ScrollArea
            h='auto'
            p='xs'
          >
            {editingReportData?.remarks ? (
              (() => {
                const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(editingReportData.remarks);
                const contentStyle = {
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: '#333',
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: hasHtmlTags ? undefined : 'pre-wrap',
                };

                return hasHtmlTags ? (
                  <div
                    style={contentStyle}
                    dangerouslySetInnerHTML={{ __html: editingReportData.remarks }}
                  />
                ) : (
                  <Text
                    size='sm'
                    style={contentStyle}
                  >
                    {editingReportData.remarks}
                  </Text>
                );
              })()
            ) : (
              <Text
                c='dimmed'
                ta='center'
              >
                No remarks available
              </Text>
            )}
          </ScrollArea>
        </Modal>
      )}

      {editingModal === 'photo' && editingReportData && (
        <PhotoUploadModal
          opened={true}
          onClose={() => {
            setEditingModal(null);
            setEditingReportData(null);
          }}
          onSave={photos => {
            if (!isReadOnly) {
              handleUpdatePhotos(editingReportData.id, photos);
            }
            setEditingModal(null);
            setEditingReportData(null);
          }}
          initialPhotos={editingReportData.attachments || []}
          isEditMode={!isReadOnly}
        />
      )}
    </Box>
  );
}
