import { useState, useMemo, useEffect } from 'react';
import {
  Select,
  NumberInput,
  TextInput,
  Table,
  Text,
  UnstyledButton,
  Group,
  Box,
  Center,
  ActionIcon,
  rem,
  Tooltip,
  Switch,
  Skeleton,
} from '@mantine/core';
import { IconEdit, IconTrash, IconInfoCircle, IconCheck } from '@tabler/icons-react';
import useAuthorization from '../../../../../../hooks/useAuthorization';
import Modal from '@/components/Modal';
import { money } from '@/utils/currency';

export default function MaterialsUsed({
  materialsUsedList = [],
  plannedMaterials = [],
  handleAddMaterial,
  newMaterial,
  setNewMaterial,
  handleUpdateMaterial,
  handleDeleteMaterial,
  allocationsLoading,
  reportData, // eslint-disable-line no-unused-vars
  isEditMode,
  isOpen,
  onClose,
  onUpdate,
}) {
  const { isAdmin, isManager } = useAuthorization();
  const canViewCosts = isAdmin() || isManager();
  console.log('[MaterialsUsed] props', {
    materialsUsedList,
    plannedMaterials,
    newMaterial,
    isEditMode,
    isOpen,
  });

  const [opened, setOpened] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isManualInput, setIsManualInput] = useState(false);
  const [autoCalculateRemaining, setAutoCalculateRemaining] = useState(false);
  const modalZIndex = 2300;

  useEffect(() => {
    setOpened(isOpen);
  }, [isOpen]);

  const isFormFilled = useMemo(() => {
    return (
      (isManualInput ? newMaterial.name?.trim() !== '' : newMaterial.material_id) &&
      newMaterial.used_quantity > 0 &&
      newMaterial.source?.trim() !== ''
    );
  }, [newMaterial, isManualInput]);

  // Calculate remaining quantity automatically for planned materials
  const calculatedRemaining = useMemo(() => {
    if (isManualInput || !newMaterial.material_id) return 0;
    const selected = plannedMaterials.find(m => m.id.toString() === newMaterial.material_id);
    if (!selected) return 0;
    // console.log('Selected material:', selected);
    // console.log('Planned quantity:', selected.planned_quantity);
    // console.log('Used quantity:', newMaterial.used_quantity);
    const remaining = (selected.planned_quantity || 0) - (newMaterial.used_quantity || 0);
    // console.log('Calculated remaining:', remaining);
    return remaining;
  }, [newMaterial.material_id, newMaterial.used_quantity, plannedMaterials, isManualInput]);

  // Get the actual remaining value (auto-calculated or manual)
  const actualRemaining = autoCalculateRemaining
    ? newMaterial.remaining_quantity
    : calculatedRemaining;
  const titleText = !isEditMode
    ? 'View Materials Used'
    : editingIndex !== null
      ? 'Update Material'
      : 'Add Material';

  const handleSave = () => {
    if (isEditMode && onUpdate) {
      onUpdate(materialsUsedList);
    } else {
      // For planned materials with auto-calculate, ensure remaining_quantity is set to calculated value
      const materialToSave = { ...newMaterial };
      if (!isManualInput && !autoCalculateRemaining) {
        materialToSave.remaining_quantity = calculatedRemaining;
        // console.log('Saving with auto-calculated remaining:', calculatedRemaining);
      }

      // console.log('Material to save:', materialToSave);

      if (editingIndex !== null) {
        handleUpdateMaterial(editingIndex, materialToSave);
        setEditingIndex(null);
      } else {
        handleAddMaterial(materialToSave);
      }

      setNewMaterial({
        material_id: null,
        used_quantity: 0,
        remaining_quantity: 0,
        source: 'gudang',
        unit: '',
        name: '',
        unit_cost: 0,
      });
      setIsManualInput(false);
      setAutoCalculateRemaining(false);
      setEditingIndex(null);
    }
  };

  const TitleBar = (
    <Group
      align='center'
      gap={8}
      wrap='nowrap'
    >
      {isEditMode && isFormFilled && !(!autoCalculateRemaining && calculatedRemaining < 0) && (
        <Tooltip
          label='Save Material'
          color='#27F55B'
          zIndex={3200}
          withArrow
        >
          <ActionIcon
            onClick={handleSave}
            radius='xl'
            size='lg'
            color='#27F55B'
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
      {!isOpen && (
        <Tooltip
          label={
            <div>
              {materialsUsedList.length > 0 ? (
                materialsUsedList.map((item, index) => (
                  <Text
                    key={index}
                    size='sm'
                  >
                    • {item.name} ( Used Qty: {item.used_quantity} {item.unit} ( {item.unit_cost} )
                    / Total cost: {item.unit_cost * item.used_quantity} / Source: {item.source})
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
              textAlign: 'center',
              padding: '6px 10px',
              height: '36px',
              fontSize: '14px',
              lineHeight: '20px',
              border: materialsUsedList.length > 0 ? '1px solid #cce5ff' : '1px solid #ced4da',
              backgroundColor: materialsUsedList.length > 0 ? '#e7f5ff' : '#fff',
              color: materialsUsedList.length > 0 ? '#0b7285' : '#868e96',
              fontWeight: materialsUsedList.length > 0 ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: materialsUsedList.length > 0 ? '0 1px 4px rgba(0, 123, 255, 0.2)' : 'none',
            }}
            onMouseEnter={e => {
              if (materialsUsedList.length > 0) {
                e.currentTarget.style.backgroundColor = '#d0ebff';
              } else {
                e.currentTarget.style.borderColor = '#adb5bd';
              }
            }}
            onMouseLeave={e => {
              if (materialsUsedList.length > 0) {
                e.currentTarget.style.backgroundColor = '#e7f5ff';
              } else {
                e.currentTarget.style.borderColor = '#ced4da';
              }
            }}
          >
            {materialsUsedList.length > 0 ? (
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
                  {materialsUsedList.length}
                </span>
                Material(s)
              </>
            ) : (
              'Input'
            )}
          </UnstyledButton>
        </Tooltip>
      )}

      {/* === MODAL UTAMA === */}
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
            Input Materials used for today’s work.
          </Text>
        )}

        {/* === DAFTAR MATERIAL === */}
        {materialsUsedList.length > 0 ? (
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
                <Table.Th>Material</Table.Th>
                <Table.Th>Used</Table.Th>
                {canViewCosts && <Table.Th>Unit Cost</Table.Th>}
                {canViewCosts && <Table.Th>Total Cost</Table.Th>}
                <Table.Th>Remaining</Table.Th>
                <Table.Th>Source</Table.Th>
                {isEditMode && <Table.Th>Action</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {materialsUsedList.map((mat, idx) => (
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
                    {mat.name}
                  </Table.Td>
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {mat.used_quantity} {mat.unit}
                  </Table.Td>
                  {canViewCosts && (
                    <Table.Td
                      style={{
                        backgroundColor:
                          isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                        fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                      }}
                    >
                      {mat.unit_cost !== null && mat.unit_cost !== undefined
                        ? money(Number(mat.unit_cost) || 0, 'IDR', { round: true })
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
                      {mat.unit_cost != null && mat.used_quantity != null
                        ? money(
                            (Number(mat.unit_cost) || 0) * (Number(mat.used_quantity) || 0),
                            'IDR',
                            {
                              round: true,
                            }
                          )
                        : '-'}
                    </Table.Td>
                  )}
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                      color: mat.remaining_quantity < 0 ? 'red' : 'inherit',
                    }}
                  >
                    {(mat.remaining_quantity ?? mat.remaining_quantity === 0)
                      ? mat.remaining_quantity
                      : '-'}{' '}
                    {mat.unit}
                  </Table.Td>
                  <Table.Td
                    style={{
                      backgroundColor:
                        isEditMode && editingIndex === idx ? '#27F55B' : 'transparent',
                      fontWeight: isEditMode && editingIndex === idx ? 'bold' : 'normal',
                    }}
                  >
                    {mat.source || '-'}
                  </Table.Td>
                  {isEditMode && (
                    <Table.Td>
                      <Group
                        gap={4}
                        justify='center'
                        wrap='nowrap'
                      >
                        <Tooltip
                          label='Edit Material'
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
                              setNewMaterial({
                                material_id: mat.material_id?.toString() || null,
                                used_quantity: mat.used_quantity,
                                remaining_quantity: mat.remaining_quantity,
                                source: mat.source,
                                unit: mat.unit,
                                name: mat.name,
                                unit_cost: mat.unit_cost || 0,
                              });
                              const isManual = !mat.material_id && mat.name?.trim() !== '';
                              setIsManualInput(isManual);
                              setAutoCalculateRemaining(false); // default to auto-calc for planned materials
                              if (isManual) {
                                setNewMaterial(prev => ({ ...prev, source: 'purchase local' }));
                              } else {
                                setNewMaterial(prev => ({ ...prev, source: 'gudang' }));
                                // For planned materials, try to get unit_cost from plannedMaterials if not already set
                                if (!mat.unit_cost && mat.material_id) {
                                  const plannedMat = plannedMaterials.find(
                                    m => m.id.toString() === mat.material_id
                                  );
                                  if (plannedMat?.unit_cost) {
                                    setNewMaterial(prev => ({
                                      ...prev,
                                      unit_cost: plannedMat.unit_cost,
                                    }));
                                  }
                                }
                              }
                            }}
                          >
                            <IconEdit size={20} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip
                          label='Delete material'
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
                            onClick={() => handleDeleteMaterial(idx)}
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
              No material has been reported yet
            </Text>
          </Group>
        )}
        {isEditMode && (
          <Center>
            <Box
              mt='sm'
              mb='lg'
            >
              {/* === FORM INPUT === */}
              <hr style={{ borderTop: '1px solid #eee', margin: '6px 0' }} />

              <Group
                align='center'
                mt='xl'
              >
                <Switch
                  checked={isManualInput}
                  onChange={event => {
                    setIsManualInput(event.currentTarget.checked);
                    setAutoCalculateRemaining(!event.currentTarget.checked); // auto-calc when manual input is off
                    if (event.currentTarget.checked) {
                      setNewMaterial(prev => ({
                        ...prev,
                        material_id: null,
                        source: 'purchase local',
                      }));
                    } else {
                      setNewMaterial(prev => ({
                        ...prev,
                        name: '',
                        unit: '',
                        unit_cost: 0,
                        source: 'gudang',
                      }));
                    }
                  }}
                  size='xs'
                  label={
                    <Tooltip
                      label={
                        isManualInput
                          ? 'Disable Manual input (purchase localy)'
                          : 'Enable Manual input (purchase localy)'
                      }
                      withArrow
                      zIndex={3200}
                      position='top'
                    >
                      <Text
                        size='14px'
                        fw={500}
                      >
                        Material
                        <Text
                          span
                          c='red'
                        >
                          {' '}
                          *
                        </Text>
                      </Text>
                    </Tooltip>
                  }
                />
              </Group>

              {isManualInput ? (
                <>
                  <Group
                    grow
                    align='flex-end'
                  >
                    <TextInput
                      label=''
                      placeholder='Enter material name'
                      value={newMaterial.name || ''}
                      onChange={e =>
                        setNewMaterial(prev => ({ ...prev, name: e.currentTarget.value }))
                      }
                    />

                    <Select
                      required
                      label='Unit'
                      placeholder='Select unit'
                      data={[
                        { value: 'piece', label: 'Piece' },
                        { value: 'kg', label: 'Kilogram' },
                        { value: 'liter', label: 'Liter' },
                        { value: 'meter', label: 'Meter' },
                        { value: 'm2', label: 'Square Meter' },
                        { value: 'm3', label: 'Cubic Meter' },
                        { value: 'ton', label: 'Ton' },
                        { value: 'bag', label: 'Bag' },
                        { value: 'drum', label: 'Drum' },
                        { value: 'roll', label: 'Roll' },
                        { value: 'sheet', label: 'Sheet' },
                      ]}
                      value={newMaterial.unit || ''}
                      onChange={val => setNewMaterial(prev => ({ ...prev, unit: val }))}
                      searchable
                    />
                  </Group>

                  <NumberInput
                    required
                    mt='sm'
                    label='Unit Cost'
                    placeholder='Cost per unit'
                    min={0}
                    value={newMaterial.unit_cost || 0}
                    onChange={val => setNewMaterial(prev => ({ ...prev, unit_cost: val || 0 }))}
                    thousandSeparator='.'
                    decimalSeparator=','
                    prefix='Rp '
                  />
                </>
              ) : plannedMaterials.length === 0 && allocationsLoading ? (
                <Skeleton
                  height={36}
                  radius='md'
                />
              ) : (
                <Select
                  mt='sm'
                  placeholder='Select material on planned task'
                  data={plannedMaterials
                    .filter(
                      m =>
                        !materialsUsedList.some(
                          used => used.material_id?.toString() === m.id.toString()
                        ) ||
                        (editingIndex !== null &&
                          materialsUsedList[editingIndex]?.material_id?.toString() ===
                            m.id.toString())
                    )
                    .map(m => ({
                      value: m.id.toString(),
                      label: `${m.name} (${m.unit?.name || m.unit}) - Planned: ${m.planned_quantity}`,
                    }))}
                  comboboxProps={{ withinPortal: true, zIndex: modalZIndex + 200 }}
                  value={newMaterial.material_id?.toString() || null}
                  onChange={val => {
                    const selected = plannedMaterials.find(m => m.id.toString() === val);
                    setNewMaterial(prev => ({
                      ...prev,
                      material_id: val,
                      name: selected?.name || '',
                      unit: selected?.unit?.name || selected?.unit || '',
                      unit_cost: selected?.unit_cost || 0,
                    }));
                  }}
                  searchable
                  clearable
                  nothingFoundMessage='No data material found'
                />
              )}

              <Group
                mt='sm'
                grow
              >
                <NumberInput
                  required
                  label='Used Quantity'
                  placeholder='Jumlah digunakan'
                  min={0}
                  value={newMaterial.used_quantity}
                  onChange={val => setNewMaterial(prev => ({ ...prev, used_quantity: val || 0 }))}
                  rightSectionWidth={60}
                />
                {!isManualInput && (
                  <NumberInput
                    label={
                      <Group
                        justify='space-between'
                        align='center'
                      >
                        <Switch
                          size='xs'
                          checked={autoCalculateRemaining}
                          onChange={e => {
                            const enabled = e.currentTarget.checked;
                            setAutoCalculateRemaining(enabled);
                            if (!enabled && !isManualInput) {
                              setNewMaterial(prev => ({
                                ...prev,
                                remaining_quantity: calculatedRemaining,
                              }));
                            }
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                        <Tooltip
                          label={
                            autoCalculateRemaining
                              ? 'Disable manual remaining'
                              : 'Enable manual remaining'
                          }
                          withArrow
                          zIndex={3200}
                          position='top'
                        >
                          <Text
                            size='14px'
                            fw={500}
                          >
                            Remaining Qty
                          </Text>
                        </Tooltip>
                      </Group>
                    }
                    placeholder='Sisa stok'
                    value={actualRemaining}
                    onChange={val =>
                      setNewMaterial(prev => ({ ...prev, remaining_quantity: val || 0 }))
                    }
                    disabled={!autoCalculateRemaining}
                    rightSectionWidth={60}
                    styles={{
                      input: {
                        color: actualRemaining < 0 ? 'red' : 'inherit',
                        fontWeight: actualRemaining < 0 ? 'bold' : 'normal',
                      },
                    }}
                  />
                )}
              </Group>

              <TextInput
                required
                mt='sm'
                label='Sumber Material'
                placeholder='Gudang / Pembelian lokal'
                value={newMaterial.source}
                onChange={e => setNewMaterial(prev => ({ ...prev, source: e.currentTarget.value }))}
              />
            </Box>
          </Center>
        )}
      </Modal>
    </>
  );
}
