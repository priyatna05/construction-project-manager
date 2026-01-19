import { useState } from 'react';

export function useMaterialLogic() {
  const [materialsUsedList, setMaterialsUsedList] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    material_id: null,
    used_quantity: 0,
    used_quantity_base: 0,
    remaining_quantity: 0,
    source: '',
    unit: '',
    base_unit: '',
    conversion_factor: 1,
    manual_remaining: false,
    name: '',
    unit_cost: 0,
  });

  const normalizeUnitText = value => (value ?? '').toString().trim().toLowerCase();
  const unitsMatch = (left, right) => normalizeUnitText(left) === normalizeUnitText(right);

  const resolveConversionFactor = (inputUnit, baseUnit, rawFactor) => {
    if (!inputUnit || !baseUnit) return 0;
    if (unitsMatch(inputUnit, baseUnit)) return 1;
    const factor = Number(rawFactor) || 0;
    return factor > 0 ? factor : 0;
  };

  const handleAddMaterial = (plannedMaterials, materialToSave = null) => {
    const material = materialToSave || newMaterial;
    const isManual = !material.material_id && material.name?.trim() !== '';
    if (isManual) {
      const inputUnit = material.unit;
      const baseUnit = material.base_unit || inputUnit;
      const conversionFactor = resolveConversionFactor(inputUnit, baseUnit, material.conversion_factor);
      if (
        !material.name?.trim() ||
        material.used_quantity <= 0 ||
        !material.source?.trim() ||
        !inputUnit
      ) {
        alert('Please fill in all required fields for manual material.');
        return false;
      }
      if (!unitsMatch(inputUnit, baseUnit) && conversionFactor <= 0) {
        alert('Please provide a valid conversion factor to base unit.');
        return false;
      }
      const usedQuantityBase =
        conversionFactor > 0 ? (Number(material.used_quantity) || 0) / conversionFactor : 0;
      const remainingQuantity = Number(material.remaining_quantity) || 0;
      const materialWithDetails = {
        ...material,
        unit: inputUnit,
        base_unit: baseUnit,
        conversion_factor: conversionFactor,
        used_quantity_base: usedQuantityBase,
        remaining_quantity: remainingQuantity,
        manual_remaining: true,
      };
      setMaterialsUsedList(prev => [...prev, materialWithDetails]);
      setNewMaterial({
        material_id: null,
        used_quantity: 0,
        used_quantity_base: 0,
        remaining_quantity: 0,
        source: 'gudang',
        unit: '',
        base_unit: '',
        conversion_factor: 1,
        manual_remaining: false,
        name: '',
        unit_cost: 0,
      });
      return true;
    } else {
      if (!material.material_id || material.used_quantity <= 0) {
        alert('Please select material and enter used quantity.');
        return false;
      }
    }
    const selectedMaterial = plannedMaterials.find(
      m => m.id.toString() === material.material_id
    );
    if (!selectedMaterial) {
      alert('Selected material not found.');
      return false;
    }
    const baseUnit = material.base_unit || selectedMaterial.unit?.name || selectedMaterial.unit;
    const inputUnit = material.unit || baseUnit;
    const conversionFactor = resolveConversionFactor(inputUnit, baseUnit, material.conversion_factor);
    if (!unitsMatch(inputUnit, baseUnit) && conversionFactor <= 0) {
      alert('Please provide a valid conversion factor to base unit.');
      return false;
    }
    const usedQuantityBase =
      conversionFactor > 0 ? (Number(material.used_quantity) || 0) / conversionFactor : 0;
    const calculatedRemaining = Math.max(
      0,
      (selectedMaterial.planned_quantity || 0) - usedQuantityBase
    );
    const remainingQuantity = material.manual_remaining
      ? Number(material.remaining_quantity) || 0
      : calculatedRemaining;
    const materialWithDetails = {
      ...material,
      name: selectedMaterial.name,
      unit: inputUnit,
      base_unit: baseUnit,
      conversion_factor: conversionFactor,
      used_quantity_base: usedQuantityBase,
      unit_cost: selectedMaterial.unit_cost || material.unit_cost,
      remaining_quantity: remainingQuantity,
    };
    setMaterialsUsedList(prev => [...prev, materialWithDetails]);
    setNewMaterial({
      material_id: null,
      used_quantity: 0,
      used_quantity_base: 0,
      remaining_quantity: 0,
      source: 'gudang',
      unit: '',
      base_unit: '',
      conversion_factor: 1,
      manual_remaining: false,
      name: '',
      unit_cost: 0,
    });
    return true;
  };

  const handleUpdateMaterial = (idx, updatedMaterial, plannedMaterials) => {
    const isManual = !updatedMaterial.material_id && updatedMaterial.name?.trim() !== '';
    if (isManual) {
      const inputUnit = updatedMaterial.unit;
      const baseUnit = updatedMaterial.base_unit || inputUnit;
      const conversionFactor = resolveConversionFactor(
        inputUnit,
        baseUnit,
        updatedMaterial.conversion_factor
      );
      if (!unitsMatch(inputUnit, baseUnit) && conversionFactor <= 0) {
        alert('Please provide a valid conversion factor to base unit.');
        return;
      }
      const usedQuantityBase =
        conversionFactor > 0
          ? (Number(updatedMaterial.used_quantity) || 0) / conversionFactor
          : 0;
      const remainingQuantity = Number(updatedMaterial.remaining_quantity) || 0;
      const materialWithDetails = {
        ...updatedMaterial,
        unit: inputUnit,
        base_unit: baseUnit,
        conversion_factor: conversionFactor,
        used_quantity_base: usedQuantityBase,
        remaining_quantity: remainingQuantity,
        manual_remaining: true,
      };
      setMaterialsUsedList(prev => prev.map((mat, i) => (i === idx ? materialWithDetails : mat)));
      return;
    } else {
      const selectedMaterial = plannedMaterials.find(
        m => m.id.toString() === updatedMaterial.material_id
      );
      if (!selectedMaterial) {
        alert('Selected material not found.');
        return;
      }
      const baseUnit =
        updatedMaterial.base_unit || selectedMaterial.unit?.name || selectedMaterial.unit;
      const inputUnit = updatedMaterial.unit || baseUnit;
      const conversionFactor = resolveConversionFactor(
        inputUnit,
        baseUnit,
        updatedMaterial.conversion_factor
      );
      if (!unitsMatch(inputUnit, baseUnit) && conversionFactor <= 0) {
        alert('Please provide a valid conversion factor to base unit.');
        return;
      }
      const usedQuantityBase =
        conversionFactor > 0
          ? (Number(updatedMaterial.used_quantity) || 0) / conversionFactor
          : 0;
      const calculatedRemaining = Math.max(
        0,
        (selectedMaterial.planned_quantity || 0) - usedQuantityBase
      );
      const remainingQuantity = updatedMaterial.manual_remaining
        ? Number(updatedMaterial.remaining_quantity) || 0
        : calculatedRemaining;
      const materialWithDetails = {
        ...updatedMaterial,
        name: selectedMaterial.name,
        unit: inputUnit,
        base_unit: baseUnit,
        conversion_factor: conversionFactor,
        used_quantity_base: usedQuantityBase,
        unit_cost: selectedMaterial.unit_cost || updatedMaterial.unit_cost,
        remaining_quantity: remainingQuantity,
      };
      setMaterialsUsedList(prev => prev.map((mat, i) => (i === idx ? materialWithDetails : mat)));
      return;
    }
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
