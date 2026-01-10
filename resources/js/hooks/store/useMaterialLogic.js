import { useState } from 'react';

export function useMaterialLogic() {
  const [materialsUsedList, setMaterialsUsedList] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    material_id: null,
    used_quantity: 0,
    remaining_quantity: 0,
    source: '',
    unit: '',
    name: '',
    unit_cost: 0,
  });

  const handleAddMaterial = (plannedMaterials, materialToSave = null) => {
    const material = materialToSave || newMaterial;
    const isManual = !material.material_id && material.name?.trim() !== '';
    if (isManual) {
      if (!material.name?.trim() || material.used_quantity <= 0 || !material.source?.trim() || !material.unit) {
        alert('Please fill in all required fields for manual material.');
        return false;
      }
    } else {
      if (!material.material_id || material.used_quantity <= 0) {
        alert('Please select material and enter used quantity.');
        return false;
      }
    }
    let materialWithDetails;
    if (isManual) {
      materialWithDetails = {
        ...material,
        name: material.name,
        unit: material.unit,
        unit_cost: material.unit_cost,
        remaining_quantity: material.remaining_quantity || 0, // For manual, use provided or 0
      };
    } else {
      const selectedMaterial = plannedMaterials.find(
        m => m.id.toString() === material.material_id
      );
      if (!selectedMaterial) {
        alert('Selected material not found.');
        return false;
      }
      // Always calculate remaining_quantity for planned materials
      const calculatedRemaining = Math.max(0, (selectedMaterial.planned_quantity || 0) - (material.used_quantity || 0));
      materialWithDetails = {
        ...material,
        name: selectedMaterial.name,
        unit: selectedMaterial.unit?.name || selectedMaterial.unit,
        unit_cost: selectedMaterial.unit_cost || material.unit_cost,
        remaining_quantity: calculatedRemaining,
      };
    }
    setMaterialsUsedList(prev => [...prev, materialWithDetails]);
    setNewMaterial({
      material_id: null,
      used_quantity: 0,
      remaining_quantity: 0,
      source: 'gudang',
      unit: '',
      name: '',
      unit_cost: 0,
    });
    return true;
  };

  const handleUpdateMaterial = (idx, updatedMaterial, plannedMaterials) => {
    const isManual = !updatedMaterial.material_id && updatedMaterial.name?.trim() !== '';
    let materialWithDetails;
    if (isManual) {
      materialWithDetails = {
        ...updatedMaterial,
        name: updatedMaterial.name,
        unit: updatedMaterial.unit,
        unit_cost: updatedMaterial.unit_cost,
        remaining_quantity: updatedMaterial.remaining_quantity || 0, // For manual, use provided or 0
      };
    } else {
      const selectedMaterial = plannedMaterials.find(
        m => m.id.toString() === updatedMaterial.material_id
      );
      // Always calculate remaining_quantity for planned materials
      const calculatedRemaining = selectedMaterial ? Math.max(0, (selectedMaterial.planned_quantity || 0) - (updatedMaterial.used_quantity || 0)) : updatedMaterial.remaining_quantity || 0;
      materialWithDetails = {
        ...updatedMaterial,
        name: selectedMaterial ? selectedMaterial.name : updatedMaterial.name,
        unit: selectedMaterial ? (selectedMaterial.unit?.name || selectedMaterial.unit) : updatedMaterial.unit,
        unit_cost: selectedMaterial ? (selectedMaterial.unit_cost || updatedMaterial.unit_cost) : updatedMaterial.unit_cost,
        remaining_quantity: calculatedRemaining,
      };
    }
    setMaterialsUsedList(prev => prev.map((mat, i) => (i === idx ? materialWithDetails : mat)));
  };

  const handleDeleteMaterial = (idx) => {
    setMaterialsUsedList(prev => prev.filter((_, i) => i !== idx));
  };

  return {
    materialsUsedList,
    newMaterial,
    setNewMaterial,
    handleAddMaterial,
    handleUpdateMaterial,
    handleDeleteMaterial,
  };
}
