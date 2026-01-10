import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  UnstyledButton,
  Stack,
  Text,
  Select,
  NumberInput,
  Group,
  ActionIcon,
  Box,
  Center,
  rem,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconTrash, IconInfoCircle, IconCheck } from '@tabler/icons-react';
import { convertToHourlyCost, OVERTIME_MULTIPLIER } from '@/utils/unitConversion';
import useAuthorization from '../../../../../../hooks/useAuthorization';
import Modal from '@/components/Modal';

export default function LaborUsed({
  laborUsedList,
  plannedLabor = [],
  newLabor,
  setNewLabor,
  handleAddLabor,
  handleUpdateLabor,
  handleDeleteLabor,
  reportData, // eslint-disable-line no-unused-vars
  isEditMode,
  isOpen,
  onClose,
  onUpdate,
}) {
  const { isAdmin, isManager } = useAuthorization();
  const canViewCosts = isAdmin() || isManager();
  console.log('[LaborUsed] props', {
    laborUsedList,
    plannedLabor,
    newLabor,
    isEditMode,
    isOpen,
  });

  const [opened, setOpened] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
   const modalZIndex = 2300;

  const laborOptions = plannedLabor
    .filter(
      l =>
        !laborUsedList.some(used => used.category === l.name) ||
        (editingIndex !== null && laborUsedList[editingIndex]?.category === l.name)
    )
    .map(l => ({
      value: l.name,
      label: `${l.name} (${l.unit?.name || l.unit})`,
    }));
  console.log('[LaborUsed] select options', laborOptions);

  useEffect(() => {
    setOpened(isOpen);
  }, [isOpen]);

  /**
   * ✅ Cek apakah semua field sudah diisi
   */
  const isFormFilled = useMemo(() => {
    return newLabor.category && Number(newLabor.headcount) > 0 && Number(newLabor.work_hours) > 0;
  }, [newLabor]);

  /**
   * ✅ Deteksi apakah data yang sedang di-edit berbeda dengan data asli
   */
  const isEdited = useMemo(() => {
    if (editingIndex === null) return false;
    const original = laborUsedList[editingIndex];
    if (!original) return false;

    return (
      original.category !== newLabor.category ||
      original.headcount !== newLabor.headcount ||
      original.work_hours !== newLabor.work_hours ||
      original.overtime !== newLabor.overtime
    );
  }, [editingIndex, newLabor, laborUsedList]);

  /**
   * ✅ Tentukan teks judul dinamis
   */
  const titleText = useMemo(() => {
    if (!isEditMode) {
      return 'View Labor Used';
    }
    if (editingIndex !== null) {
      return isEdited ? 'Save Changes' : 'Update Labor';
    }
    return isFormFilled ? 'Save Labor' : 'Add Labor';
  }, [editingIndex, isEdited, isFormFilled, isEditMode]);

  /**
   * ✅ Handler simpan data
   */
  const handleSave = () => {
    if (isEditMode && onUpdate) {
      onUpdate(laborUsedList);
    } else {
      if (editingIndex !== null) {
        handleUpdateLabor(editingIndex, newLabor);
        setEditingIndex(null);
      } else {
        handleAddLabor();
      }

      setNewLabor({
        category: '',
        headcount: 0,
        work_hours: 0,
        overtime: 0,
      });
    }
  };

  /**
   * ✅ TitleBar komponen
   */
  const TitleBar = (
    <Stack spacing={4}>
      <Group
        align='center'
        spacing='xs'
        wrap='nowrap'
      >
        {isEditMode && isFormFilled && (
          <Tooltip
            label={
              editingIndex !== null
                ? isEdited
                  ? 'Save changes'
                  : 'No changes detected'
                : 'Add new labor'
            }
            withArrow
            color='green'
            position='top'
            zIndex={3200}
            transitionProps={{ transition: 'fade', duration: 150 }}
          >
            <ActionIcon
              onClick={handleSave}
              color='green'
              radius='xl'
              size='lg'
              variant='filled'
            >
              <IconCheck size={28} />
            </ActionIcon>
          </Tooltip>
        )}
        <Text
          fz={rem(20)}
          fw={600}
          my='sm'
        >
          {titleText}
        </Text>
      </Group>
    </Stack>
  );

  return (
    <>
      {!isOpen && (
        <Tooltip
          label={
            <div>
              {laborUsedList.length > 0 ? (
                laborUsedList.map((item, index) => (
                  <Text
                    key={index}
                    size='sm'
                  >
                    • {item.name} ( Qty: {item.headcount} / Working Time: {item.work_hours} Hour /
                    Overtime: {item.overtime} Hour )
                  </Text>
                ))
              ) : (
                <Text
                  size='sm'
                  c='dimmed'
                >
                  No data
                </Text>
              )}
            </div>
          }
          color='green'
          withArrow
          position='top'
          zIndex={3200}
          transitionProps={{ transition: 'pop', duration: 150 }}
        >
          <UnstyledButton
            onClick={() => setOpened(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '6px 10px',
              height: '36px',
              fontSize: '14px',
              lineHeight: '20px',
              border: laborUsedList.length > 0 ? '1px solid #cce5ff' : '1px solid #ced4da',
              backgroundColor: laborUsedList.length > 0 ? '#e7f5ff' : '#fff',
              color: laborUsedList.length > 0 ? '#0b7285' : '#868e96',
              fontWeight: laborUsedList.length > 0 ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: laborUsedList.length > 0 ? '0 1px 4px rgba(0, 123, 255, 0.2)' : 'none',
            }}
            onMouseEnter={e => {
              if (laborUsedList.length > 0) {
                e.currentTarget.style.backgroundColor = '#d0ebff';
              } else {
                e.currentTarget.style.borderColor = '#adb5bd';
              }
            }}
            onMouseLeave={e => {
              if (laborUsedList.length > 0) {
                e.currentTarget.style.backgroundColor = '#e7f5ff';
              } else {
                e.currentTarget.style.borderColor = '#ced4da';
              }
            }}
          >
            {laborUsedList.length > 0 ? (
              <>
                <span
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    marginRight: '6px',
                  }}
                >
                  {laborUsedList.length}
                </span>
                Labor(s)
              </>
            ) : (
              'Input'
            )}
          </UnstyledButton>
        </Tooltip>
      )}

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          if (onClose) onClose();
        }}
        size='auto'
        centered
        draggable
        zIndex={modalZIndex}
        title={TitleBar}
        closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        overlayProps={{ backgroundOpacity: 0.0, blur: 0 }}
        transitionProps={{ transition: 'fade', duration: 200 }}
        styles={{
          content: {
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
          header: {
            backgroundColor: '#fff',
            borderBottom: 'none',
          },
          title: {
            color: '#000',
            fontWeight: 600,
          },
        }}
      >
        {!isOpen && (
          <Text
            size='sm'
            fw={600}
            ta='center'
            mb='md'
          >
            Input workforce data used for this report.
          </Text>
        )}

        {laborUsedList.length > 0 ? (
          <Table
            striped
            highlightOnHover
            withColumnBorders
            stickyHeader
            withTableBorder
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>No</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Headcount</Table.Th>
                <Table.Th>Hours</Table.Th>
                <Table.Th>OT</Table.Th>
                {canViewCosts && <Table.Th>Unit Cost Labor</Table.Th>}
                {canViewCosts && <Table.Th>Total Cost</Table.Th>}
                {isEditMode && <Table.Th>Action</Table.Th>}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {laborUsedList.map((lb, idx) => (
                <Table.Tr
                  key={idx}
                  style={{
                    backgroundColor: isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                    fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                  }}
                >
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {idx + 1}
                  </Table.Td>
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {lb.category}
                  </Table.Td>
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {lb.headcount}
                  </Table.Td>
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {lb.work_hours}
                  </Table.Td>
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {lb.overtime > 0 ? lb.overtime : '-'}
                  </Table.Td>
                  {canViewCosts && (
                    <Table.Td
                      style={{
                        backgroundColor:
                          isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                        fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                      }}
                    >
                      {lb.unit_cost
                        ? `Rp ${Number(lb.unit_cost).toLocaleString('id-ID', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} ${lb.unit ? `/ ${lb.unit}` : ''}`
                        : '-'}
                    </Table.Td>
                  )}
                  {canViewCosts && (
                    <Table.Td
                      style={{
                        backgroundColor:
                          isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                        fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                      }}
                    >
                      {(() => {
                        const headcount = Number(lb.headcount) || 0;
                        const workHours = Number(lb.work_hours) || 0;
                        const overtimeHours = Number(lb.overtime) || 0;
                        const unit = lb.unit || 'hour';
                        const unitCost = Number(lb.unit_cost) || 0;

                        const perHourCost = convertToHourlyCost(unitCost, unit);

                        const regularCost = headcount * workHours * perHourCost;
                        const overtimeCost =
                          headcount * overtimeHours * perHourCost * OVERTIME_MULTIPLIER;

                        const total = regularCost + overtimeCost;

                        return total > 0
                          ? `Rp ${total
                              .toLocaleString('id-ID', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                              .replace(/\./g, ',')
                              .replace(/,/g, '.')}`
                          : '-';
                      })()}
                    </Table.Td>
                  )}

                  {isEditMode && (
                    <Table.Td>
                      <Group
                        gap={4}
                        wrap='nowrap'
                      >
                        <Tooltip
                          label='Edit Labor'
                          color='blue'
                          position='top'
                          zIndex={3200}
                          transitionProps={{ transition: 'fade', duration: 150 }}
                          withArrow
                        >
                          <ActionIcon
                            size='sm'
                            color='blue'
                            variant='subtle'
                            onClick={() => {
                              setEditingIndex(idx);
                              setNewLabor({
                                category: lb.category,
                                headcount: lb.headcount,
                                work_hours: lb.work_hours,
                                overtime: lb.overtime,
                              });
                            }}
                          >
                            <IconEdit size={20} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip
                          label='Delete Labor'
                          color='red'
                          position='top'
                          zIndex={3200}
                          transitionProps={{ transition: 'fade', duration: 150 }}
                          withArrow
                        >
                          <ActionIcon
                            size='sm'
                            color='red'
                            variant='subtle'
                            onClick={() => handleDeleteLabor(idx)}
                          >
                            <IconTrash size={20} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Group
            justify='center'
            gap={6}
          >
            <IconInfoCircle
              size={14}
              color='gray'
            />
            <Text
              size='xs'
              c='dimmed'
              fs='italic'
              ta='center'
            >
              No labor data added yet.
            </Text>
          </Group>
        )}

        {isEditMode && (
          <Center>
            <Box
              mt='sm'
              mb='lg'
            >
              <hr style={{ borderTop: '1px solid #eee', margin: '6px 0' }} />

              <Select
                label='Labor Category'
                required
                placeholder='Select category'
                data={laborOptions}
                comboboxProps={{ withinPortal: true, zIndex: modalZIndex + 200 }}
                value={newLabor.category?.toString() || null}
                onChange={val => {
                  const selected = plannedLabor.find(l => l.name === val);
                  setNewLabor(prev => ({
                    ...prev,
                    category: val,
                    name: selected?.name || '',
                  }));
                }}
                nothingFoundMessage='No data labor found'
                searchable
                clearable
              />

              <Group
                mt='sm'
                grow
              >
                <NumberInput
                  label='Headcount'
                  min={0}
                  required
                  value={newLabor.headcount}
                  onChange={val => setNewLabor(prev => ({ ...prev, headcount: val || 0 }))}
                />

                <NumberInput
                  label='Work Hours'
                  min={0}
                  required
                  value={newLabor.work_hours}
                  onChange={val => setNewLabor(prev => ({ ...prev, work_hours: val || 0 }))}
                />

                <NumberInput
                  label='Overtime (Hours)'
                  min={0}
                  value={newLabor.overtime}
                  onChange={val => setNewLabor(prev => ({ ...prev, overtime: val || 0 }))}
                />
              </Group>
            </Box>
          </Center>
        )}
      </Modal>
    </>
  );
}
