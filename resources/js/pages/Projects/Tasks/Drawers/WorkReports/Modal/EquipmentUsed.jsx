import { useState, useMemo, useEffect } from 'react';
import {
  UnstyledButton,
  Text,
  Table,
  Select,
  NumberInput,
  ActionIcon,
  Group,
  Box,
  rem,
  Tooltip,
  Center,
  Switch,
  TextInput,
} from '@mantine/core';
import { IconEdit, IconTrash, IconInfoCircle, IconCheck } from '@tabler/icons-react';
import useAuthorization from '../../../../../../hooks/useAuthorization';
import Modal from '@/components/Modal';

export default function EquipmentUsed({
  equipmentUsedList,
  plannedEquipments,
  newEquipment,
  setNewEquipment,
  handleAddEquipment,
  handleUpdateEquipment,
  handleDeleteEquipment,
  reportData, // eslint-disable-line no-unused-vars
  isEditMode,
  isOpen,
  onClose,
  onUpdate,
}) {
  const { isAdmin, isManager } = useAuthorization();
  const canViewCosts = isAdmin() || isManager();
  const [opened, setOpened] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const modalZIndex = 2300;

  // console.log('[EquipmentUsed] props', {
  //   equipmentUsedList,
  //   plannedEquipments,
  //   newEquipment,
  //   isEditMode,
  //   isOpen,
  // });
  const equipmentOptions = plannedEquipments
    .filter(
      eq =>
        !equipmentUsedList.some(used => used.equipment_id?.toString() === eq.id.toString()) ||
        (editingIndex !== null &&
          equipmentUsedList[editingIndex]?.equipment_id?.toString() === eq.id.toString())
    )
    .map(eq => ({
      value: eq.id.toString(),
      label: `${eq.name} (${eq.unit?.name || eq.unit})`,
    }));
  // console.log('[EquipmentUsed] select options', equipmentOptions);

  useEffect(() => {
    setOpened(isOpen);
  }, [isOpen]);

  // ✅ 1. Cek apakah semua field sudah terisi
  const isFormFilled = useMemo(() => {
    const basicFields = newEquipment.equipment_id && newEquipment.hours_used > 0;
    const fuelFields =
      !newEquipment.use_fuel ||
      (newEquipment.fuel_name?.trim() &&
        newEquipment.fuel_unit?.trim() &&
        newEquipment.fuel_unit_cost > 0 &&
        newEquipment.fuel_used >= 0);
    return basicFields && fuelFields;
  }, [newEquipment]);

  // ✅ 2. Cek apakah ada perubahan ketika sedang edit
  const isEdited = useMemo(() => {
    if (editingIndex === null) return false;
    const original = equipmentUsedList[editingIndex];
    if (!original) return false;
    return (
      original.equipment_id.toString() !== newEquipment.equipment_id ||
      original.hours_used !== newEquipment.hours_used ||
      original.fuel_used !== newEquipment.fuel_used ||
      original.use_fuel !== newEquipment.use_fuel ||
      original.fuel_name !== newEquipment.fuel_name ||
      original.fuel_unit !== newEquipment.fuel_unit ||
      original.fuel_unit_cost !== newEquipment.fuel_unit_cost
    );
  }, [editingIndex, newEquipment, equipmentUsedList]);

  // ✅ 3. Tentukan judul dinamis berdasarkan kondisi
  const titleText = useMemo(() => {
    if (!isEditMode) {
      return 'View Equipment Used';
    }
    if (editingIndex !== null) {
      return isEdited ? 'Save Equipment' : 'Update Equipment';
    }
    return isFormFilled ? 'Save Equipment' : 'Add Equipment';
  }, [editingIndex, isEdited, isFormFilled, isEditMode]);

  // ✅ 4. Fungsi simpan data
  const handleSave = () => {
    if (isEditMode && onUpdate) {
      onUpdate(equipmentUsedList);
    } else {
      if (editingIndex !== null) {
        handleUpdateEquipment(editingIndex, newEquipment);
        setEditingIndex(null);
      } else {
        handleAddEquipment();
      }
      setNewEquipment({
        equipment_id: null,
        hours_used: 0,
        fuel_used: 0,
        use_fuel: false,
        fuel_name: '',
        fuel_unit: '',
        fuel_unit_cost: 0,
      });
    }
  };

  // ✅ 5. Komponen TitleBar
  const TitleBar = (
    <Group
      align='center'
      gap={8}
      wrap='nowrap'
    >
      {isEditMode && isFormFilled && (
        <Tooltip
          label='Save Equipment'
          color='green'
          zIndex={3200}
          withArrow
        >
          <ActionIcon
            onClick={handleSave}
            radius='xl'
            size='lg'
            color='green'
            variant='filled'
          >
            <IconCheck size={30} />
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
  );

  return (
    <>
      {/* Tombol pembuka modal - hanya tampil jika tidak dibuka dari table */}
      {!isOpen && (
        <Tooltip
          label={
            <div>
              {equipmentUsedList.length > 0 ? (
                equipmentUsedList.map((item, index) => (
                  <Text
                    key={index}
                    size='sm'
                  >
                    • {item.name} ( Used: {item.hours_used} Hour / Fuel: {item.fuel_used} Liter )
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
          zIndex={3200}
          position='top'
          transitionProps={{ transition: 'pop', duration: 150 }}
        >
          <UnstyledButton
            onClick={() => setOpened(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              padding: '6px 10px',
              height: '36px',
              fontSize: '14px',
              lineHeight: '20px',
              border: equipmentUsedList.length > 0 ? '1px solid #cce5ff' : '1px solid #ced4da',
              backgroundColor: equipmentUsedList.length > 0 ? '#e7f5ff' : '#fff',
              color: equipmentUsedList.length > 0 ? '#0b7285' : '#868e96',
              fontWeight: equipmentUsedList.length > 0 ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: equipmentUsedList.length > 0 ? '0 1px 4px rgba(0, 123, 255, 0.2)' : 'none',
            }}
            onMouseEnter={e => {
              if (equipmentUsedList.length > 0) {
                e.currentTarget.style.backgroundColor = '#d0ebff';
              } else {
                e.currentTarget.style.borderColor = '#adb5bd';
              }
            }}
            onMouseLeave={e => {
              if (equipmentUsedList.length > 0) {
                e.currentTarget.style.backgroundColor = '#e7f5ff';
              } else {
                e.currentTarget.style.borderColor = '#ced4da';
              }
            }}
          >
            {equipmentUsedList.length > 0 ? (
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
                  {equipmentUsedList.length}
                </span>
                Equipment(s)
              </>
            ) : (
              'Input'
            )}
          </UnstyledButton>
        </Tooltip>
      )}

      {/* Modal utama */}
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
        closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        title={TitleBar}
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
            paddingBottom: '0.5rem',
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
            Select equipment used for today’s work.
          </Text>
        )}

        {equipmentUsedList.length > 0 ? (
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
                <Table.Th>Equipment</Table.Th>
                {canViewCosts && <Table.Th>Equipment Unit Cost</Table.Th>}
                <Table.Th>Hours Used</Table.Th>
                <Table.Th>Fuel (L)</Table.Th>
                <Table.Th>Fuel Name</Table.Th>
                {canViewCosts && <Table.Th>Fuel Unit Cost</Table.Th>}
                {canViewCosts && <Table.Th>Total Costs</Table.Th>}
                {isEditMode && <Table.Th>Action</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {equipmentUsedList.map((eq, idx) => (
                <Table.Tr
                  key={idx}
                  style={{
                    backgroundColor: isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                    border: isEditMode && editingIndex === idx ? '2px solid #28a745' : 'none',
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
                    {eq.name}
                  </Table.Td>
                  {canViewCosts && (
                    <Table.Td
                      style={{
                        backgroundColor:
                          isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                        fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                      }}
                    >
                      {eq.unit_cost
                        ? `Rp ${Number(eq.unit_cost).toLocaleString('id-ID', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} ${eq.unit ? `/ ${eq.unit}` : ''}`
                        : '-'}
                    </Table.Td>
                  )}
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {eq.hours_used}
                  </Table.Td>
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {eq.fuel_used > 0 ? eq.fuel_used : '-'}
                  </Table.Td>
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {eq.use_fuel ? eq.fuel_name : '-'}
                  </Table.Td>
                  {canViewCosts && (
                    <Table.Td
                      style={{
                        backgroundColor:
                          isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                        fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                      }}
                    >
                      {eq.use_fuel
                        ? `Rp ${eq.fuel_unit_cost?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\./g, ',').replace(/,/g, '.')}`
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
                        const hoursUsed = eq.hours_used || 0;
                        const unitCost = eq.unit_cost || 0;
                        const fuelUsed = eq.fuel_used || 0;
                        const fuelUnitCost = eq.fuel_unit_cost || 0;

                        const equipmentCost = hoursUsed * unitCost;
                        const fuelCost = eq.use_fuel && fuelUsed > 0 ? fuelUsed * fuelUnitCost : 0;
                        const total = equipmentCost + fuelCost;

                        return total > 0
                          ? `Rp ${total.toLocaleString('id-ID', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
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
                          label='Edit equipment'
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
                              setNewEquipment({
                                equipment_id: eq.equipment_id.toString(),
                                hours_used: eq.hours_used,
                                fuel_used: eq.fuel_used,
                                use_fuel: eq.use_fuel || false,
                                fuel_name: eq.fuel_name || '',
                                fuel_unit: eq.fuel_unit || '',
                                fuel_unit_cost: eq.fuel_unit_cost || 0,
                              });
                            }}
                          >
                            <IconEdit size={20} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip
                          label='Delete equipment'
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
                            onClick={() => handleDeleteEquipment(idx)}
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
              No equipment added yet.
            </Text>
          </Group>
        )}
        <hr style={{ borderTop: '1px solid #eee', margin: '6px 0' }} />
        {isEditMode && (
          <Center>
            <Box
              mt='lg'
              mb='lg'
            >
              <Group
                justify='space-between'
                align='center'
              >
                <Select
                  label={
                    <Group align='center'>
                      <Switch
                        checked={newEquipment.use_fuel}
                        onChange={event =>
                          setNewEquipment(prev => ({
                            ...prev,
                            use_fuel: event.currentTarget.checked,
                            fuel_used: event.currentTarget.checked ? prev.fuel_used : 0,
                            fuel_name: event.currentTarget.checked ? prev.fuel_name : '',
                            fuel_unit: event.currentTarget.checked ? prev.fuel_unit : '',
                            fuel_unit_cost: event.currentTarget.checked ? prev.fuel_unit_cost : 0,
                          }))
                        }
                      />
                      <Tooltip
                        zIndex={3200}
                        label={newEquipment.use_fuel ? 'Disable' : 'Enable Used Fuel'}
                        withArrow
                        position='top'
                      >
                        <Text
                          size='14px'
                          fw={500}
                        >
                          Equpments
                          <Text
                            span
                            c='red'
                          >
                            {' '}
                            *
                          </Text>
                        </Text>
                      </Tooltip>
                    </Group>
                  }
                  placeholder='Select equipment'
                  data={equipmentOptions}
                  comboboxProps={{ withinPortal: true, zIndex: modalZIndex + 200 }}
                  value={newEquipment.equipment_id?.toString() || null}
                  onChange={val => {
                    const selected = plannedEquipments.find(eq => eq.id.toString() === val);
                    setNewEquipment(prev => ({
                      ...prev,
                      equipment_id: val,
                      name: selected?.name || '',
                    }));
                  }}
                  searchable
                  nothingFoundMessage='No data equipment found'
                  clearable
                />

                <NumberInput
                  label='Hours Used'
                  min={0}
                  required
                  value={newEquipment.hours_used}
                  onChange={val => setNewEquipment(prev => ({ ...prev, hours_used: val || 0 }))}
                />
              </Group>

              {newEquipment.use_fuel && (
                <>
                  <NumberInput
                    label='Fuel Used (L)'
                    min={0}
                    mt='sm'
                    value={newEquipment.fuel_used}
                    onChange={val => setNewEquipment(prev => ({ ...prev, fuel_used: val || 0 }))}
                    disabled={!newEquipment.use_fuel}
                  />

                  <TextInput
                    mt='sm'
                    label='Fuel Name'
                    placeholder='e.g., Solar, Diesel'
                    required
                    value={newEquipment.fuel_name}
                    onChange={e =>
                      setNewEquipment(prev => ({ ...prev, fuel_name: e.currentTarget.value }))
                    }
                  />

                  <Group
                    mt='sm'
                    grow
                  >
                    <Select
                      label='Fuel Unit'
                      placeholder='e.g., Liter'
                      required
                      data={[
                        { value: 'liter', label: 'Liter' },
                        { value: 'gallon', label: 'Gallon' },
                        { value: 'kg', label: 'Kilogram' },
                        { value: 'ton', label: 'Ton' },
                      ]}
                      value={newEquipment.fuel_unit || ''}
                      onChange={val => setNewEquipment(prev => ({ ...prev, fuel_unit: val }))}
                    />

                    <NumberInput
                      label='Fuel Unit Cost'
                      min={0}
                      required
                      thousandSeparator='.'
                      decimalSeparator=','
                      prefix='Rp '
                      value={newEquipment.fuel_unit_cost}
                      onChange={val =>
                        setNewEquipment(prev => ({ ...prev, fuel_unit_cost: val || 0 }))
                      }
                    />
                  </Group>
                </>
              )}
            </Box>
          </Center>
        )}
      </Modal>
    </>
  );
}
