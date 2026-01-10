import {
  Table,
  TextInput,
  NumberInput,
  Select,
  UnstyledButton,
  Group,
  ActionIcon,
  Tooltip,
  Text,
  Textarea,
  Loader,
} from '@mantine/core';
import Modal from '@/components/Modal';
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { getIcon, renderSelectOptionWithIcon } from '@/components/helperLabel';
import MaterialsUsed from './Modal/MaterialsUsed';
import LaborUsed from './Modal/LaborUsed';
import EquipmentUsed from './Modal/EquipmentUsed';
import dayjs from '@/utils/dayjsConfig';
import { useEffect, useState } from 'react';
import useAuthorization from '../../../../../hooks/useAuthorization';
import { convertWorkDone } from '@/utils/unitConversion';

export default function AddRow({
  localReports,
  newReport,
  newMaterial,
  newLabor,
  newEquipment,
  equipmentUsedList,
  laborUsedList,
  materialsUsedList,
  plannedMaterials,
  plannedLabor,
  plannedEquipments,
  isAdding,
  isCalculating,
  handleAddMaterial,
  handleAddLabor,
  handleAddEquipment,
  handleUpdateEquipment,
  handleDeleteEquipment,
  handleUpdateLabor,
  handleDeleteLabor,
  handleUpdateMaterial,
  handleDeleteMaterial,
  handleSaveNewReport,
  handleCancelAdd,
  setNewReport,
  setNewMaterial,
  setNewLabor,
  setNewEquipment,
  taskStartDate,
  taskEndDate,
  taskVolume,
  taskUnit,
  onOpenPhotoModal,
  photoCount,
  saving,
  editingReport,
  unitLabels,
  manualProgressEnabled = false,
}) {
  const [tooltipOpened, setTooltipOpened] = useState(false);
  const [reportModalOpened, setReportModalOpened] = useState(false);
  const [remarksModalOpened, setRemarksModalOpened] = useState(false);
  const modalZIndex = 2300;

  const weatherOptions = [
    { value: 'Sunny', label: 'Sunny', icon: 'IconSun', color: '#f59f00' },
    { value: 'Cloudy', label: 'Cloudy', icon: 'IconCloud', color: '#748ffc' },
    { value: 'Rainy', label: 'Rainy', icon: 'IconCloudRain', color: '#4dabf7' },
    { value: 'Windy', label: 'Windy', icon: 'IconWind', color: '#66c2a5' },
  ];
  // Auto-recalculate cost and progress when newReport changes
  useEffect(() => {
    if (manualProgressEnabled) return;
    if (window.updateActualCost) {
      window.updateActualCost();
    }
    const workDone = Number(newReport?.workDone || 0);
    const volume = Number(taskVolume || 0);
    const selectedUnitName = unitLabels.find(l => l.id === newReport.unit)?.name;

    // Only calculate progress if unit is selected
    if (!selectedUnitName) {
      setNewReport(prev => ({ ...prev, progress: 0 }));
      setTooltipOpened(false);
      return;
    }

    const convertedWorkDone = convertWorkDone(workDone, selectedUnitName, taskUnit);

    // Calculate progress as percentage
    const progress = volume > 0 ? (convertedWorkDone / volume) * 100 : 0;

    // Update progress in newReport
    setNewReport(prev => ({ ...prev, progress: Math.round(progress * 100) / 100 })); // Round to 2 decimal places

    let timer;

    if (convertedWorkDone > volume) {
      setTooltipOpened(true);
      timer = setTimeout(() => setTooltipOpened(false), 3000);
    } else {
      setTooltipOpened(false);
    }

    return () => clearTimeout(timer);
  }, [
    newReport?.workDone,
    taskVolume,
    newReport?.unit,
    unitLabels,
    taskUnit,
    manualProgressEnabled,
  ]);

  const { isAdmin, isManager } = useAuthorization();

  const canViewActualCost = isAdmin() || isManager();

  // Check if form is valid (required fields filled)
  const isFormValid =
    newReport.reportDate &&
    newReport.name &&
    newReport.actualCost >= 0 &&
    newReport.progress >= 0 &&
    newReport.workDone >= 0 &&
    newReport.weather;

  // Determine if we are editing or adding
  const isEditing = !!editingReport;

  const selectedUnitLabel = unitLabels.find(l => l.id === newReport.unit);
  const selectedWeather = weatherOptions.find(w => w.value === newReport.weather);

  if (!isAdding) return null;

  // Calculate the number for the row
  const editingIndex = isEditing ? localReports.findIndex(r => r.id === editingReport.id) : -1;
  const rowNumber = isEditing && editingIndex !== -1 ? editingIndex + 1 : localReports.length + 1;

  return (
    <Table.Tr
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
        backgroundColor: 'white',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* 🔹 Nomor urut */}
      <Table.Td style={{ width: '50px', minWidth: '50px' }}>{rowNumber}</Table.Td>

      {/* 🔹 Report date */}
      <Table.Td>
        <DatePickerInput
          placeholder='Select'
          valueFormat='DD/MM/YYYY'
          value={newReport.reportDate}
          onChange={date => setNewReport(prev => ({ ...prev, reportDate: date }))}
          minDate={taskStartDate}
          required
          popoverProps={{ withinPortal: true, zIndex: 3500 }}
          renderDay={date => {
            const day = date.getDate();
            const dateTime = date.getTime();
            const startTime = taskStartDate ? taskStartDate.getTime() : null;
            const endTime = taskEndDate ? taskEndDate.getTime() : null;

            const isBeforeStart = startTime && dateTime < startTime;
            const isInRange = startTime && endTime && dateTime >= startTime && dateTime <= endTime;
            const isAfterEnd = endTime && dateTime > endTime;

            let bgColor = undefined;
            let tooltipLabel = 'No constraints';
            // highlite warna tanggal now()  dan before nya menjadi disabled
            if (isInRange) {
              bgColor = '#d4edda';
              tooltipLabel = `✅ Within task duration (${dayjs(taskStartDate).format('DD MMM')} - ${dayjs(taskEndDate).format('DD MMM')})`;
            } else if (isBeforeStart) {
              bgColor = '#ffffff';
              tooltipLabel = `⚠️ Before task start (${dayjs(taskStartDate).format('DD MMM')})`;
            } else if (isAfterEnd) {
              bgColor = '#f8d7da';
              tooltipLabel = `❌ After task end (${dayjs(taskEndDate).format('DD MMM')})`;
            }

            const circle = (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bgColor,
                  color: bgColor ? 'black' : undefined,
                  fontWeight: bgColor ? 'bold' : undefined,
                  cursor: 'pointer',
                }}
              >
                {day}
              </div>
            );

            return (
              <Tooltip
                label={tooltipLabel}
                withArrow
                zIndex={4200}
              >
                {circle}
              </Tooltip>
            );
          }}
        />
      </Table.Td>
      {/* 🔹 Name report */}
      <Table.Td
        onClick={() => setReportModalOpened(true)}
        style={{ cursor: 'pointer' }}
      >
        <TextInput
          required
          placeholder='Report name'
          value={newReport.name || ''}
          onChange={e => setNewReport(prev => ({ ...prev, name: e.currentTarget.value }))}
        />
      </Table.Td>

      {/* 🔹 Equipment Popover */}
      <Table.Td>
        <EquipmentUsed
          equipmentUsedList={equipmentUsedList}
          plannedEquipments={plannedEquipments}
          newEquipment={newEquipment}
          setNewEquipment={setNewEquipment}
          handleAddEquipment={handleAddEquipment}
          handleUpdateEquipment={handleUpdateEquipment}
          handleDeleteEquipment={handleDeleteEquipment}
          isEditMode={true}
        />
      </Table.Td>

      {/* 🔹 Labor Popover */}
      <Table.Td>
        <LaborUsed
          laborUsedList={laborUsedList}
          plannedLabor={plannedLabor}
          newLabor={newLabor}
          setNewLabor={setNewLabor}
          handleAddLabor={handleAddLabor}
          handleUpdateLabor={handleUpdateLabor}
          handleDeleteLabor={handleDeleteLabor}
          isEditMode={true}
        />
      </Table.Td>

      {/* 🔹 Material Popover */}
      <Table.Td>
        <MaterialsUsed
          materialsUsedList={materialsUsedList}
          plannedMaterials={plannedMaterials}
          newMaterial={newMaterial}
          setNewMaterial={setNewMaterial}
          handleAddMaterial={handleAddMaterial}
          handleUpdateMaterial={handleUpdateMaterial}
          handleDeleteMaterial={handleDeleteMaterial}
          isEditMode={true}
        />
      </Table.Td>

      {/* 🔹 Work done Report Info Popover */}
      <Table.Td>
        <Tooltip
          label={
            <>
              <Text size='xs'>
                Remind volume task: {taskVolume} {taskUnit}
              </Text>
              {(() => {
                const convertedWorkDone = convertWorkDone(
                  newReport.workDone || 0,
                  unitLabels.find(l => l.id === newReport.unit)?.name,
                  taskUnit
                );
                return convertedWorkDone > taskVolume ? (
                  <Text
                    size='xs'
                    c='red'
                  >
                    Work done exceeds task volume by {convertedWorkDone - taskVolume} {taskUnit}
                  </Text>
                ) : null;
              })()}
            </>
          }
          withArrow
          color={(() => {
            const convertedWorkDone = convertWorkDone(
              newReport.workDone || 0,
              unitLabels.find(l => l.id === newReport.unit)?.name,
              taskUnit
            );
            return convertedWorkDone > taskVolume ? 'red' : 'blue';
          })()}
          multiline
          zIndex={2200}
          position='top-start'
          transitionProps={{ transition: 'fade', duration: 1000 }}
          opened={tooltipOpened}
        >
          <NumberInput
            placeholder='Input work done'
            required
            value={newReport.workDone || 0}
            onChange={val => setNewReport(prev => ({ ...prev, workDone: val || 0 }))}
            min={0}
            onFocus={() => setTooltipOpened(true)}
            onBlur={() => {
              // tetap buka kalau melebihi batas, tapi tutup kalau normal
              const convertedWorkDone = convertWorkDone(
                newReport.workDone || 0,
                unitLabels.find(l => l.id === newReport.unit)?.name,
                taskUnit
              );
              if (convertedWorkDone <= taskVolume) setTooltipOpened(false);
            }}
          />
        </Tooltip>
      </Table.Td>

      {/* 🔹 Unit */}
      <Table.Td>
        <Tooltip
          label={<Text fw={500}>{selectedUnitLabel?.name || 'No unit selected'}</Text>}
          color='green'
          withArrow
          zIndex={2200}
          position='top'
        >
          <Select
            placeholder='Unit'
            value={newReport.unit ? newReport.unit.toString() : null}
            onChange={val =>
              setNewReport(prev => ({
                ...prev,
                unit: val ? parseInt(val) : null,
              }))
            }
            data={unitLabels.map(label => ({
              value: label.id.toString(),
              label: label.name,
              icon: label.icon,
              color: label.color,
            }))}
            searchable
            maxDropdownHeight={200}
            comboboxProps={{
              withinPortal: true,
              zIndex: 3500,
              styles: {
                dropdown: {
                  width: 'max-content',
                  minWidth: '10%',
                },
              },
            }}
            renderOption={renderSelectOptionWithIcon}
            leftSection={
              selectedUnitLabel?.icon
                ? getIcon(selectedUnitLabel.icon, {
                    size: 16,
                    color: selectedUnitLabel.color || 'currentColor',
                  })
                : null
            }
          />
        </Tooltip>
      </Table.Td>

      {/* 🔹 Actual unit Cost */}
      {canViewActualCost && (
        <>
          <Table.Td>
            <Tooltip
              label={
                <>
                  <Text fw={500}>Actual unit cost</Text>
                  <Text c='white'>
                    {newReport.actualUnitCost
                      ? `Rp ${newReport.actualUnitCost.toLocaleString('id-ID', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '-'}
                  </Text>
                </>
              }
              position='top'
              withArrow
              color='green'
              zIndex={2200}
              transitionProps={{ transition: 'fade', duration: 150 }}
            >
              <NumberInput
                placeholder='unit Cost'
                value={newReport.actualUnitCost}
                onChange={val => setNewReport(prev => ({ ...prev, actualUnitCost: val || 0 }))}
                min={0}
                thousandSeparator='.'
                decimalSeparator=','
                prefix='Rp '
                disabled={isCalculating || (isAdding && !newReport.manualActualUnitCost)}
                rightSection={isCalculating ? <Loader size='xs' /> : null}
                rightSectionWidth={isCalculating ? 34 : undefined}
              />
            </Tooltip>
          </Table.Td>

          {/* 🔹 Actual Cost */}
          <Table.Td>
            <Tooltip
              label={
                <>
                  <Text fw={500}>Budget Spending</Text>
                  <Text c='white'>
                    {newReport.actualCost
                      ? `Rp ${newReport.actualCost
                          .toLocaleString('id-ID', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                          .replace(/\./g, ',')
                          .replace(/,/g, '.')}`
                      : '-'}
                  </Text>
                </>
              }
              position='top'
              withArrow
              color='green'
              zIndex={2200}
              transitionProps={{ transition: 'fade', duration: 150 }}
            >
              <NumberInput
                placeholder='Actual Cost'
                value={newReport.actualCost}
                onChange={val => setNewReport(prev => ({ ...prev, actualCost: val || 0 }))}
                min={0}
                thousandSeparator='.'
                decimalSeparator=','
                prefix='Rp '
                disabled={isCalculating || (isAdding && !newReport.manualActualCost)}
                rightSection={isCalculating ? <Loader size='xs' /> : null}
                rightSectionWidth={isCalculating ? 34 : undefined}
              />
            </Tooltip>
          </Table.Td>
        </>
      )}

      {/* 🔹 Progress */}
      <Table.Td>
        <NumberInput
          placeholder='Progress'
          value={newReport.progress || 0}
          onChange={val => setNewReport(prev => ({ ...prev, progress: val || 0 }))}
          disabled={!manualProgressEnabled}
          min={0}
          max={1000}
          rightSectionWidth={32}
          rightSection={
            isCalculating ? (
              <Loader size='xs' />
            ) : (
              <Text
                size='sm'
                c='dimmed'
                pr='xs'
              >
                %
              </Text>
            )
          }
        />
      </Table.Td>

      {/* 🔹 Weather */}
      <Table.Td>
        <Tooltip
          label={
            newReport.weather && newReport.weather.length > 0 ? (
              <Text>{newReport.weather}</Text>
            ) : (
              <Text c='dimmed'>No Data</Text>
            )
          }
          position='top'
          withArrow
          color='green'
          zIndex={2200}
          transitionProps={{ transition: 'fade', duration: 150 }}
        >
          <Select
            placeholder='Select Weather'
            data={weatherOptions}
            value={newReport.weather}
            onChange={val => setNewReport(prev => ({ ...prev, weather: val }))}
            comboboxProps={{
              withinPortal: true,
              zIndex: 3500,
              styles: {
                dropdown: {
                  width: 'max-content',
                  minWidth: '8%',
                },
              },
            }}
            renderOption={renderSelectOptionWithIcon}
            leftSection={
              selectedWeather?.icon
                ? getIcon(selectedWeather.icon, {
                    size: 16,
                    color: selectedWeather.color || 'currentColor',
                  })
                : null
            }
          />
        </Tooltip>
      </Table.Td>

      {/* 🔹 Remarks */}
      <Table.Td
        onClick={() => setRemarksModalOpened(true)}
        style={{ cursor: 'pointer' }}
      >
        <TextInput
          placeholder='Remarks'
          value={newReport.remarks}
          onChange={e => setNewReport(prev => ({ ...prev, remarks: e.target.value }))}
        />
      </Table.Td>

      {/* 🔹 Photos */}
      <Table.Td>
        <Tooltip
          label={photoCount > 0 ? `View ${photoCount} photo(s)` : 'Upload photo'}
          position='top'
          withArrow
          color='green'
          zIndex={2200}
          transitionProps={{ transition: 'fade', duration: 150 }}
        >
          <UnstyledButton
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              padding: '6px 10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
            onClick={onOpenPhotoModal}
          >
            {photoCount > 0 ? (
              `${photoCount} photo(s)`
            ) : (
              <IconUpload
                size={20}
                color='blue'
                stroke={3}
              />
            )}
          </UnstyledButton>
        </Tooltip>
      </Table.Td>
      {!isAdding && (
        <Table.Td style={{ visibility: 'hidden' }}>
          <Select
            value={'Pending'}
            disabled
          />
        </Table.Td>
      )}

      {/* 🔹 Actions */}
      <Table.Td>
        <Group
          gap='xs'
          justify='flex-end'
          mt='xs'
          wrap='nowrap'
        >
          <Tooltip
            label={isEditing ? 'Update report' : 'Save report'}
            withArrow
            zIndex={2200}
            position='top'
            color='green'
          >
            <ActionIcon
              color='green'
              onClick={handleSaveNewReport}
              variant='filled'
              aria-label={isEditing ? 'Update report' : 'Save report'}
              disabled={!isFormValid}
              loading={saving}
            >
              <IconCheck size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip
            label='Cancel'
            withArrow
            zIndex={2200}
            position='top'
            color='red'
          >
            <ActionIcon
              color='red'
              onClick={handleCancelAdd}
              variant='filled'
              aria-label='Cancel adding report'
            >
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
      {/* Report Name Modal */}
      <Modal
        opened={reportModalOpened}
        loseButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        overlayProps={{ backgroundOpacity: 0.0, blur: 0 }}
        transitionProps={{ transition: 'fade', duration: 200 }}
        onClose={() => setReportModalOpened(false)}
        title='Report Name'
        size='lg'
        draggable
        centered
        zIndex={modalZIndex}
      >
        <TextInput
          required
          placeholder='Report name'
          value={newReport.name || ''}
          onChange={e => setNewReport(prev => ({ ...prev, name: e.currentTarget.value }))}
        />
      </Modal>

      {/**remark Modal */}
      <Modal
        opened={remarksModalOpened}
        loseButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        overlayProps={{ backgroundOpacity: 0.0, blur: 0 }}
        transitionProps={{ transition: 'fade', duration: 200 }}
        onClose={() => setRemarksModalOpened(false)}
        title='Remarks / Notes'
        size='lg'
        draggable
        centered
        zIndex={modalZIndex}
      >
        <Textarea
          placeholder='Add more detailed remarks or notes'
          minRows={6}
          autosize
          value={newReport.remarks}
          onChange={e => setNewReport(prev => ({ ...prev, remarks: e.currentTarget.value }))}
        />
      </Modal>
    </Table.Tr>
  );
}
