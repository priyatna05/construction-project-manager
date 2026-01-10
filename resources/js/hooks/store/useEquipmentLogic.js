import { useState } from 'react';

export function useEquipmentLogic() {
  const [equipmentUsedList, setEquipmentUsedList] = useState([]);
  const [newEquipment, setNewEquipment] = useState({
    equipment_id: null,
    hours_used: 0,
    fuel_used: 0,
    use_fuel: false,
    fuel_name: '',
    fuel_unit: '',
    fuel_unit_cost: 0,
  });

  const handleAddEquipment = (plannedEquipments) => {
    if (!newEquipment.equipment_id) {
      alert('Please select an equipment.');
      return false;
    }
    if (newEquipment.use_fuel && (!newEquipment.fuel_name?.trim() || !newEquipment.fuel_unit?.trim() || newEquipment.fuel_unit_cost <= 0)) {
      alert('Please fill in all fuel fields when using fuel.');
      return false;
    }
    const selectedEquipment = plannedEquipments.find(
      eq => eq.id.toString() === newEquipment.equipment_id
    );
    const equipmentWithDetails = {
      ...newEquipment,
      name: selectedEquipment.name,
      unit_cost: selectedEquipment.unit_cost || 0,
      unit: selectedEquipment.unit?.name || selectedEquipment.unit || '',
    };
    setEquipmentUsedList(prev => [...prev, equipmentWithDetails]);
    setNewEquipment({
      equipment_id: null,
      hours_used: 0,
      fuel_used: 0,
      use_fuel: false,
      fuel_name: '',
      fuel_unit: '',
      fuel_unit_cost: 0,
    });
    return true;
  };

  const handleUpdateEquipment = (idx, updatedEquipment, plannedEquipments) => {
    if (updatedEquipment.use_fuel && (!updatedEquipment.fuel_name?.trim() || !updatedEquipment.fuel_unit?.trim() || updatedEquipment.fuel_unit_cost <= 0)) {
      alert('Please fill in all fuel fields when using fuel.');
      return false;
    }
    const selectedEquipment = plannedEquipments.find(
      eq => eq.id.toString() === updatedEquipment.equipment_id
    );
    const equipmentWithDetails = {
      ...updatedEquipment,
      name: selectedEquipment.name,
      unit_cost: selectedEquipment.unit_cost || 0,
      unit: selectedEquipment.unit?.name || selectedEquipment.unit || '',
    };
    setEquipmentUsedList(prev => prev.map((eq, i) => (i === idx ? equipmentWithDetails : eq)));
    return true;
  };

  const handleDeleteEquipment = (idx) => {
    setEquipmentUsedList(prev => prev.filter((_, i) => i !== idx));
  };

  return {
    equipmentUsedList,
    newEquipment,
    setNewEquipment,
    handleAddEquipment,
    handleUpdateEquipment,
    handleDeleteEquipment,
  };
}
