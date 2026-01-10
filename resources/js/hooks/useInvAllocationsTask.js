import { useDisclosure } from '@mantine/hooks';
import { useState, useMemo } from 'react';
import { openConfirmModal } from '@/components/ConfirmModal';

export function useInvAllocationsTask({
  selected,
  onChange,
  availableResources,
  disabled = false,
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [editing, setEditing] = useState(new Set());
  const [adding, setAdding] = useState(false);
  const [newResource, setNewResource] = useState(null);
  const [sortOption, setSortOption] = useState('name-asc');
  const isDisabled = Boolean(disabled);

  // Filter and sort selected items
  const filteredSelected = useMemo(() => {
    let filtered = [...selected];
    if (modalSearch) {
      filtered = selected.filter(item =>
        item.name.toLowerCase().includes(modalSearch.toLowerCase())
      );
    }

    // Apply sorting
    const [field, order] = sortOption.split('-');
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (field === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (field === 'type') {
        aVal = (a.type?.name || a.type || '').toLowerCase();
        bVal = (b.type?.name || b.type || '').toLowerCase();
      } else if (field === 'qty') {
        aVal = a.quantity || 0;
        bVal = b.quantity || 0;
      }

      if (order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [selected, modalSearch, sortOption]);

  // Build autocomplete options
  const autocompleteOptions = useMemo(() => {
    const selectedIds = selected.map(s => s.id.toString());
    const available = availableResources.filter(r => !selectedIds.includes(r.id.toString()));

    const grouped = available.reduce((acc, res) => {
      const type = res.type?.name || res.type || 'Other';
      acc[type] = acc[type] || [];
      acc[type].push(res);
      return acc;
    }, {});

    return Object.entries(grouped).flatMap(([type, list]) => [
      { value: `type-${type}`, label: `${type} (${list.length})`, disabled: true },
      ...list.map(res => ({
        value: res.id.toString(),
        label: `  ${res.name} (Stok: ${Math.round(res.quantity_on_hand || 0)} ${res.unit?.slug || ''})`,
      })),
    ]);
  }, [availableResources, selected]);

  // Add from autocomplete
  const handleAdd = val => {
    if (isDisabled) return;
    const resource = availableResources.find(r => r.id.toString() === val);
    if (!resource || selected.some(s => s.id === resource.id)) return;
    onChange([...selected, { ...resource, quantity: 1 }]);
    setSearchValue('');
  };

  // Update quantity
  const handleQtyChange = (id, qty) => {
    if (isDisabled) return;
    onChange(selected.map(i => (i.id === id ? { ...i, quantity: parseFloat(qty) || 0 } : i)), true); // Skip flash for individual changes
  };

  // Toggle edit mode
  const toggleEdit = id =>
    !isDisabled &&
    setEditing(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const confirmDelete = (resource) =>
    !isDisabled &&
    openConfirmModal({
      type: 'danger',
      title: 'Delete Resource Allocation',
      content: `Are you sure you want to remove ${resource.name}? This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: () => onChange(selected.filter(i => i.id !== resource.id)),
    });

  const saveEdit = id => {
    if (isDisabled) return;
    setEditing(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    // Trigger save to backend when clicking save changes
    onChange(selected, false); // Don't skip flash for save action
  };

  return {
    opened, open, close,
    searchValue, setSearchValue,
    modalSearch, setModalSearch,
    editing, toggleEdit, saveEdit,
    adding, setAdding,
    newResource, setNewResource,
    sortOption, setSortOption,
    filteredSelected, autocompleteOptions,
    handleAdd, handleQtyChange, confirmDelete,
  };
}
