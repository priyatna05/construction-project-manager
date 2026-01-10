import { useState } from 'react';

export function useLaborLogic() {
  const [laborUsedList, setLaborUsedList] = useState([]);
  const [newLabor, setNewLabor] = useState({
    category: '',
    headcount: 0,
    work_hours: 0,
    overtime: 0,
  });

  const handleAddLabor = (plannedLabor) => {
    if (!newLabor.category || newLabor.headcount <= 0) {
      alert('Please select labor category and headcount.');
      return false;
    }
    const selectedLabor = plannedLabor.find(l => l.name === newLabor.category);
    const laborWithDetails = {
      ...newLabor,
      name: selectedLabor?.name || newLabor.category,
      unit_cost: selectedLabor?.unit_cost || 0,
      unit: selectedLabor?.unit?.name || selectedLabor?.unit || '',
    };
    setLaborUsedList(prev => [...prev, laborWithDetails]);
    setNewLabor({ category: '', headcount: 0, work_hours: 0, overtime: 0 });
    return true;
  };

  const handleUpdateLabor = (idx, updatedLabor, plannedLabor) => {
    const selectedLabor = plannedLabor.find(l => l.name === updatedLabor.category);
    const laborWithDetails = {
      ...updatedLabor,
      name: selectedLabor?.name || updatedLabor.category,
      unit_cost: selectedLabor?.unit_cost || 0,
      unit: selectedLabor?.unit?.name || selectedLabor?.unit || '',
    };
    setLaborUsedList(prev => prev.map((lb, i) => (i === idx ? laborWithDetails : lb)));
  };

  const handleDeleteLabor = (idx) => {
    setLaborUsedList(prev => prev.filter((_, i) => i !== idx));
  };

  return {
    laborUsedList,
    newLabor,
    setNewLabor,
    handleAddLabor,
    handleUpdateLabor,
    handleDeleteLabor,
  };
}
