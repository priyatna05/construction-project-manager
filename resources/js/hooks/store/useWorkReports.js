import { useState, useEffect } from 'react';
import { useWorkReportsFilter } from '../useWorkReportsFilter';
import { useFlashStore } from '@/hooks/store/useFlashStore';
import { useMaterialLogic } from './useMaterialLogic';
import { useLaborLogic } from './useLaborLogic';
import { useEquipmentLogic } from './useEquipmentLogic';
import {
  convertToHourlyCost,
  OVERTIME_MULTIPLIER,
  convertWorkDone,
  normalizeUnit,
} from '../../utils/unitConversion';
import dayjs from '@/utils/dayjsConfig';

export function useWorkReports(
  projectId,
  taskId,
  allocatedInventories = [],
  taskUnit = '',
  taskVolume = 0
) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [photoModalOpened, setPhotoModalOpened] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [fetchedAllocatedInventories, setFetchedAllocatedInventories] = useState([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);
  const [unitLabels, setUnitLabels] = useState([]);

  const [newReport, setNewReport] = useState({
    reportDate: null,
    progress: 0,
    workDone: 0,
    unit: '',
    actualCost: 0,
    remarks: '',
    // status: 'Pending', // Removed as status is handled via labels
    weather: '',
    photos: 0,
    name: '',
    equipmentDetails: [],
    laborDetails: [],
    materialDetails: [],
    manualProgress: false,
  });

  // Use separate logic hooks
  const materialLogic = useMaterialLogic();
  const laborLogic = useLaborLogic();
  const equipmentLogic = useEquipmentLogic();

  // Use filter hook
  const { search, setSearch, setSortOption, filteredReports } = useWorkReportsFilter(reports);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await window.axios.get(
        `/projects/${projectId}/tasks/${taskId}/work-reports`
      );
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching work reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocatedInventories = async () => {
    setAllocationsLoading(true);
    try {
      const response = await window.axios.get(
        `/projects/${projectId}/tasks/${taskId}/allocated-inventories`
      );
      setFetchedAllocatedInventories(response.data);
    } catch (error) {
      console.error('Error fetching allocated inventories:', error);
    } finally {
      setAllocationsLoading(false);
    }
  };

  const fetchUnitLabels = async () => {
    try {
      const response = await window.axios.get('/labels?type=task_inventory_unit_label');
      // Filter to only include specific units
      const allowedUnits = [
        // 📏 PANJANG
        'Millimeter',
        'Centimeter',
        'Meter',
        'Kilometer',
        // 📐 LUAS
        'Square Meter',
        'Are',
        'Hectare',
        // 🧱 VOLUME
        'Cubic Meter',
        'Liter',
        'Milliliter',
        // ⏱️ WAKTU
        'Hour',
        'Day',
        'Week',
        'Month',
      ];
      const filteredLabels = response.data.filter(label => allowedUnits.includes(label.name));
      setUnitLabels(filteredLabels);
    } catch (error) {
      console.error('Error fetching unit labels:', error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchAllocatedInventories();
    fetchUnitLabels();
    // console.log('allocatedInventories prop:', allocatedInventories);
  }, [projectId, taskId]);

  // Ensure unitLabels include units from existing reports
  useEffect(() => {
    if (reports.length > 0) {
      setUnitLabels(prev => {
        const newLabels = [...prev];
        reports.forEach(r => {
          if (r.unit_id && !newLabels.find(l => l.id === r.unit_id)) {
            newLabels.push({ id: r.unit_id, name: r.unit });
          }
        });
        return newLabels;
      });
    }
  }, [reports]);

  // Refetch allocated inventories when task inventories are updated
  useEffect(() => {
    if (allocatedInventories && allocatedInventories.length > 0) {
      fetchAllocatedInventories();
    }
  }, [allocatedInventories]);

  // Sync newReport details with logic lists and recalculate cost
  useEffect(() => {
    setNewReport(prev => ({
      ...prev,
      laborDetails: laborLogic.laborUsedList,
      materialDetails: materialLogic.materialsUsedList,
      equipmentDetails: equipmentLogic.equipmentUsedList,
    }));
    calculateActualCost();
  }, [laborLogic.laborUsedList, materialLogic.materialsUsedList, equipmentLogic.equipmentUsedList]);

  // Auto-calculate progress based on work done (converted to task unit)
  useEffect(() => {
    if (!taskVolume || !taskUnit || newReport.manualProgress) return;

    const selectedUnit = unitLabels.find(l => l.id === newReport.unit);
    if (!selectedUnit) return;

    const convertedWorkDone = convertWorkDone(
      Number(newReport.workDone || 0),
      selectedUnit.name,
      taskUnit
    );

    const progressValue =
      taskVolume > 0 ? Math.min(Math.round((convertedWorkDone / taskVolume) * 100), 100) : 0;

    setNewReport(prev => ({ ...prev, progress: progressValue }));
  }, [newReport.workDone, newReport.unit, taskVolume, taskUnit, unitLabels, newReport.manualProgress]);

  const allocationSource =
    (fetchedAllocatedInventories.length > 0 ? fetchedAllocatedInventories : allocatedInventories) ||
    [];

  const normalizedAllocations = allocationSource
    .map(alloc => {
      const inventory = alloc?.inventory || alloc; // support both shapes
      if (!inventory) return null;

      const typeFromLabels = inventory.labels?.find(
        label => label.type === 'inventory_type_label'
      )?.slug;
      const typeSlug = (
        inventory.type?.slug ||
        (typeof inventory.type === 'string' ? inventory.type : undefined) ||
        typeFromLabels ||
        ''
      )
        .toString()
        .toLowerCase();

      const quantityAllocated =
        alloc?.quantity_allocated ??
        alloc?.allocated_quantity ??
        alloc?.quantity ??
        0;

      return { inventory, typeSlug, quantityAllocated };
    })
    .filter(Boolean);

  const plannedEquipments = normalizedAllocations
    .filter(item => item.typeSlug === 'equipment')
    .map(item => item.inventory);

  const plannedLabor = normalizedAllocations
    .filter(item => item.typeSlug === 'labor')
    .map(item => item.inventory);

  const plannedMaterials = normalizedAllocations
    .filter(item => item.typeSlug === 'material')
    .map(item => ({
      ...item.inventory,
      planned_quantity: item.quantityAllocated,
      allocated_quantity: item.quantityAllocated,
    }));

  const handleAddEquipment = () => {
    const success = equipmentLogic.handleAddEquipment(plannedEquipments);
    if (success) {
      setNewReport(prev => ({
        ...prev,
        equipmentDetails: equipmentLogic.equipmentUsedList,
      }));
      calculateActualCost();
    }
  };

  const handleAddLabor = () => {
    const success = laborLogic.handleAddLabor(plannedLabor);
    if (success) {
      setNewReport(prev => ({
        ...prev,
        laborDetails: laborLogic.laborUsedList,
      }));
      calculateActualCost();
    }
  };

  const handleAddMaterial = () => {
    const success = materialLogic.handleAddMaterial(plannedMaterials, null);
    if (success) {
      setNewReport(prev => ({
        ...prev,
        materialDetails: materialLogic.materialsUsedList,
      }));
      calculateActualCost();
    }
  };

  const calculateActualCost = () => {
    // console.log('=== CALCULATE ACTUAL COST DEBUG ===');

    // Calculate material cost from individual material totals
    // console.log('Materials used list:', materialLogic.materialsUsedList);
    const materialCost = materialLogic.materialsUsedList.reduce((acc, m) => {
      const unitCost = Number(m.unit_cost) || 0;
      const usedQuantity = Number(m.used_quantity) || 0;
      const total = unitCost * usedQuantity;
      // console.log(`Material: ${m.name} - unit_cost: ${unitCost}, used_quantity: ${usedQuantity}, total: ${total}`);
      return acc + total;
    }, 0);
    // console.log('Total Material Cost:', materialCost);

    // Calculate labor cost from individual labor totals - now considering unit conversion
    const laborCost = laborLogic.laborUsedList.reduce((acc, l) => {
      const headcount = Number(l.headcount) || 0;
      const workHours = Number(l.work_hours) || 0;
      const overtimeHours = Number(l.overtime) || 0;
      const unitCost = Number(l.unit_cost) || 0;
      const unit = l.unit || 'hour';

      // Convert unit cost to hourly rate first, then calculate
      const hourlyCost = convertToHourlyCost(unitCost, unit);
      const regularCost = headcount * workHours * hourlyCost;
      const overtimeCost = headcount * overtimeHours * hourlyCost * OVERTIME_MULTIPLIER;
      const total = regularCost + overtimeCost;

      // console.log(`Labor: ${l.category} - headcount: ${headcount}, work_hours: ${workHours}, overtime: ${overtimeHours}, unit: ${unit}, unit_cost: ${unitCost}`);
      // console.log(`  Converted hourly cost: ${hourlyCost}, Regular cost: ${regularCost}, Overtime cost: ${overtimeCost}, Total: ${total}`);

      return acc + total;
    }, 0);
    // console.log('Total Labor Cost:', laborCost);

    // Calculate equipment cost from individual equipment totals - now considering unit conversion
    const equipmentCost = equipmentLogic.equipmentUsedList.reduce((acc, e) => {
      const hoursUsed = e.hours_used || 0;
      const unitCost = Number(e.unit_cost) || 0;
      const unit = e.unit || 'hour';
      const fuelUsed = e.fuel_used || 0;
      const fuelUnitCost = Number(e.fuel_unit_cost) || 0;

      // Convert equipment unit cost to hourly rate first, then calculate
      const hourlyCost = convertToHourlyCost(unitCost, unit);
      const equipmentCost = hoursUsed * hourlyCost;
      const fuelCost = e.use_fuel && fuelUsed > 0 ? fuelUsed * fuelUnitCost : 0;
      const total = equipmentCost + fuelCost;

      // console.log(`Equipment: ${e.name} - hours_used: ${hoursUsed}, unit: ${unit}, unit_cost: ${unitCost}, fuel_used: ${fuelUsed}, fuel_unit_cost: ${fuelUnitCost}`);
      // console.log(`  Converted hourly cost: ${hourlyCost}, Equipment cost: ${equipmentCost}, Fuel cost: ${fuelCost}, Total: ${total}`);

      return acc + total;
    }, 0);
    // console.log('Total Equipment Cost:', equipmentCost);
    // Tambahkan capture workdone sebagai bagian dari report
    const workDone = Number(newReport.workDone) || 0;

    // Setelah menghitung totalCost (materialCost + laborCost + equipmentCost) …
    let totalCost = materialCost + laborCost + equipmentCost;

    // Kemudian hitung actualUnitCost jika workDone > 0
    let actualUnitCost = workDone > 0 ? totalCost / workDone : null;

    // Use functional update to ensure we get the latest state
    setNewReport(prev => ({
      ...prev,
      actualCost: totalCost,
      actualUnitCost: actualUnitCost,
      workDone: workDone,
    }));
  };

  const handleUpdateEquipment = (idx, updatedEquipment) => {
    equipmentLogic.handleUpdateEquipment(idx, updatedEquipment, plannedEquipments);
    setNewReport(prev => ({
      ...prev,
      equipmentDetails: equipmentLogic.equipmentUsedList,
    }));
    calculateActualCost();
  };

  const handleDeleteEquipment = idx => {
    equipmentLogic.handleDeleteEquipment(idx);
    setNewReport(prev => ({
      ...prev,
      equipmentDetails: equipmentLogic.equipmentUsedList,
    }));
  };

  const handleUpdateLabor = (idx, updatedLabor) => {
    laborLogic.handleUpdateLabor(idx, updatedLabor, plannedLabor);
    setNewReport(prev => ({
      ...prev,
      laborDetails: laborLogic.laborUsedList,
    }));
    calculateActualCost();
  };

  const handleDeleteLabor = idx => {
    laborLogic.handleDeleteLabor(idx);
    setNewReport(prev => ({
      ...prev,
      laborDetails: laborLogic.laborUsedList,
    }));
  };

  const handleUpdateMaterial = (idx, updatedMaterial) => {
    materialLogic.handleUpdateMaterial(idx, updatedMaterial, plannedMaterials);
    setNewReport(prev => ({
      ...prev,
      materialDetails: materialLogic.materialsUsedList,
    }));
    calculateActualCost();
  };

  const handleDeleteMaterial = idx => {
    materialLogic.handleDeleteMaterial(idx);
    setNewReport(prev => ({
      ...prev,
      materialDetails: materialLogic.materialsUsedList,
    }));
  };

  const handleAddNewRow = () => {
    setIsAdding(true);
    setNewReport({
      reportDate: null,
      progress: 0,
      workDone: 0,
      unit: null,
      actualCost: 0,
      actualUnitCost: null,
      remarks: '',
      // status: 'Pending', // Removed as status is handled via labels
      weather: '',
      photos: 0,
      name: '',
      equipmentDetails: [],
      laborDetails: [],
      materialDetails: [],
      manualProgress: false,
    });
    // Reset logic states
    equipmentLogic.equipmentUsedList.length = 0;
    laborLogic.laborUsedList.length = 0;
    materialLogic.materialsUsedList.length = 0;
    setUploadedPhotos([]);
  };

  const handleSavePhotos = photos => {
    setUploadedPhotos(photos);
    setNewReport(prev => ({ ...prev, photos: photos.length }));
  };

  const handleSaveNewReport = async () => {
    setSaving(true);

    if (!newReport.reportDate) {
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'alert',
        title: 'Work Reports',
        message: `Please fill in the field!`,
      });
      setSaving(false);
      return;
    }

    // Check if report date is in the future
    const today = dayjs().tz('Asia/Jakarta').startOf('day');
    const reportDate = dayjs(newReport.reportDate).tz('Asia/Jakarta').startOf('day');
    if (reportDate.isAfter(today)) {
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'alert',
        title: 'Work Reports',
        message: 'Report date cannot be in the future.',
      });
      setSaving(false);
      return;
    }

    // Check if work done exceeds task volume
    const selectedUnitName = unitLabels.find(l => l.id === newReport.unit)?.name;
    if (selectedUnitName && taskUnit && taskVolume > 0) {
      const convertedWorkDone = convertWorkDone(
        newReport.workDone || 0,
        normalizeUnit(selectedUnitName),
        normalizeUnit(taskUnit)
      );
      if (convertedWorkDone > taskVolume) {
        const { setFlash } = useFlashStore.getState();
        setFlash({
          type: 'alert',
          title: 'Work Reports',
          message: `Work done (${convertedWorkDone} ${taskUnit}) exceeds task volume (${taskVolume} ${taskUnit}). Please adjust the work done or unit.`,
        });
        setSaving(false);
        return;
      }
    }

    const data = {
      name: newReport.name,
      report_date: dayjs(newReport.reportDate).tz('Asia/Jakarta').format('YYYY-MM-DD'),
      progress: newReport.progress,
      work_done: newReport.workDone,
      unit_id: newReport.unit,
      actual_cost: newReport.actualCost,
      actual_unit_cost: newReport.actualUnitCost,
      remarks: newReport.remarks,
      // status: 'Pending', // Removed as status is handled via labels
      weather: newReport.weather,
      photos_count: uploadedPhotos.length,
      labor_details: newReport.laborDetails,
      material_details: newReport.materialDetails,
      equipment_details: newReport.equipmentDetails,
    };

    try {
      let response;
      if (editingReport) {
        // Update existing report
        response = await window.axios.put(
          `/projects/${projectId}/tasks/${taskId}/work-reports/${editingReport.id}`,
          data
        );
      } else {
        // Create new report
        response = await window.axios.post(
          `/projects/${projectId}/tasks/${taskId}/work-reports`,
          data
        );
        if (response.status === 201) {
          // Upload photos if any were uploaded
          if (uploadedPhotos.length > 0) {
            const formData = new FormData();
            uploadedPhotos.forEach((photo, index) => {
              formData.append(`photos[${index}]`, photo);
            });

            await window.axios.post(
              `/projects/${projectId}/tasks/${taskId}/work-reports/${response.data.id}/upload-photos`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
          }
        }
      }

      await fetchReports();
      setIsAdding(false);
      setNewReport({
        reportDate: null,
        progress: 0,
        workDone: 0,
        unit: null,
        actualCost: 0,
        actualUnitCost: null,
        remarks: '',
        // status: 'Pending', // Removed as status is handled via labels
        weather: '',
      photos: 0,
      name: '',
      equipmentDetails: [],
      laborDetails: [],
      materialDetails: [],
      manualProgress: false,
    });
      // Reset logic states
      equipmentLogic.equipmentUsedList.length = 0;
      laborLogic.laborUsedList.length = 0;
      materialLogic.materialsUsedList.length = 0;
      setUploadedPhotos([]);

      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: editingReport ? 'Work Report Updated' : 'Work Report Added',
        message: `The work report has been successfully ${editingReport ? 'updated' : 'added'}.`,
      });
    } catch (error) {
      console.error('Error saving work report:', error);
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save the work report. Please try again.',
      });
    } finally {
      setSaving(false);
      setEditingReport(null);
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setEditingReport(null);
    // Reset logic states
    equipmentLogic.equipmentUsedList.length = 0;
    laborLogic.laborUsedList.length = 0;
    materialLogic.materialsUsedList.length = 0;
    setUploadedPhotos([]);
  };

  const handleEditReport = report => {
    setEditingReport(report);
    setIsAdding(true);
    // Populate the form with existing report data
    setNewReport({
      reportDate: report.report_date ? new Date(report.report_date) : null,
      progress: report.progress || 0,
      workDone: report.work_done || 0,
      unit: unitLabels.find(l => l.name === report.unit)?.id || null,
      actualCost: report.actual_cost || 0,
      actualUnitCost: report.actual_unit_cost || null,
      remarks: report.remarks || '',
      weather: report.weather || '',
      photos: report.photos_count || 0,
      name: report.name || '',
      equipmentDetails: report.equipment_details || [],
      laborDetails: report.labor_details || [],
      materialDetails: report.material_details || [],
      manualProgress: false,
    });
    // Populate the logic lists
    equipmentLogic.equipmentUsedList.splice(
      0,
      equipmentLogic.equipmentUsedList.length,
      ...(report.equipment_details || [])
    );
    laborLogic.laborUsedList.splice(
      0,
      laborLogic.laborUsedList.length,
      ...(report.labor_details || [])
    );
    materialLogic.materialsUsedList.splice(
      0,
      materialLogic.materialsUsedList.length,
      ...(report.material_details || [])
    );
    // TODO: Handle photos
  };

  const handleDeleteReport = async reportId => {
    setDeletingReportId(reportId);
    try {
      await window.axios.delete(`/projects/${projectId}/tasks/${taskId}/work-reports/${reportId}`);
      await fetchReports();
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Work Report Deleted',
        message: 'The work report has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting work report:', error);
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete the work report. Please try again.',
      });
    } finally {
      setDeletingReportId(null);
    }
  };

  const handleUpdateEquipmentDetails = async (reportId, updatedData) => {
    try {
      await window.axios.patch(
        `/projects/${projectId}/tasks/${taskId}/work-reports/${reportId}/details`,
        {
          equipment_details: updatedData,
        }
      );
      await fetchReports();
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Equipment Updated',
        message: 'Equipment details have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating equipment details:', error);
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update equipment details. Please try again.',
      });
    }
  };

  const handleUpdateLaborDetails = async (reportId, updatedData) => {
    try {
      await window.axios.patch(
        `/projects/${projectId}/tasks/${taskId}/work-reports/${reportId}/details`,
        {
          labor_details: updatedData,
        }
      );
      await fetchReports();
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Labor Updated',
        message: 'Labor details have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating labor details:', error);
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update labor details. Please try again.',
      });
    }
  };

  const handleUpdateMaterialDetails = async (reportId, updatedData) => {
    try {
      await window.axios.patch(
        `/projects/${projectId}/tasks/${taskId}/work-reports/${reportId}/details`,
        {
          material_details: updatedData,
        }
      );
      await fetchReports();
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Materials Updated',
        message: 'Material details have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating material details:', error);
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update material details. Please try again.',
      });
    }
  };

  const handleUpdateWorkDone = async (reportId, data) => {
    try {
      await window.axios.patch(
        `/projects/${projectId}/tasks/${taskId}/work-reports/${reportId}/details`,
        {
          work_done: data.name,
          progress: data.workDone,
        }
      );
      await fetchReports();
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Work Done Updated',
        message: 'Work done details have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating work done:', error);
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update work done. Please try again.',
      });
    }
  };

  const handleUpdatePhotos = async (reportId, photos) => {
    try {
      // Separate existing attachments and new files
      const existingAttachments = photos.filter(photo => photo.id);
      const newFiles = photos.filter(photo => !photo.id);

      // If there are new files to upload
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((photo, index) => {
          formData.append(`photos[${index}]`, photo);
        });

        await window.axios.post(
          `/projects/${projectId}/tasks/${taskId}/work-reports/${reportId}/upload-photos`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      // If some attachments were removed, we need to delete them
      // Get current attachments from the report
      const currentReport = reports.find(r => r.id === reportId);
      const currentAttachments = currentReport?.attachments || [];
      const attachmentsToDelete = currentAttachments.filter(
        att => !existingAttachments.find(existing => existing.id === att.id)
      );

      // Delete removed attachments
      for (const attachment of attachmentsToDelete) {
        await window.axios.delete(
          `/projects/${projectId}/tasks/${taskId}/work-reports/${reportId}/attachments/${attachment.id}`
        );
      }

      await fetchReports();
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Photos Updated',
        message: 'Photos have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating photos:', error);
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update photos. Please try again.',
      });
    }
  };

  const handleApproveWorkReport = async reportId => {
    try {
      await window.axios.patch(
        `/projects/${projectId}/tasks/${taskId}/work-reports/${reportId}/approve`,
        {
          approved: true,
        }
      );
      await fetchReports();
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Work Report Approved',
        message: 'The work report has been successfully approved.',
      });
    } catch (error) {
      console.error('Error approving work report:', error);
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'error',
        title: 'Approval Failed',
        message: 'Failed to approve the work report. Please try again.',
      });
      throw error;
    }
  };

  const handleRejectWorkReport = async (reportId, remarks = null) => {
    try {
      await window.axios.patch(
        `/projects/${projectId}/tasks/${taskId}/work-reports/${reportId}/approve`,
        {
          approved: false,
          remarks: remarks,
        }
      );
      await fetchReports();
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'success',
        title: 'Work Report Rejected',
        message: 'The work report has been rejected.',
      });
    } catch (error) {
      console.error('Error rejecting work report:', error);
      const { setFlash } = useFlashStore.getState();
      setFlash({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Failed to reject the work report. Please try again.',
      });
      throw error;
    }
  };

  return {
    // Data
    reports,
    filteredReports,
    loading,
    isAdding,
    photoModalOpened,
    setPhotoModalOpened,
    uploadedPhotos,
    newReport,
    setNewReport,
    equipmentUsedList: equipmentLogic.equipmentUsedList,
    newEquipment: equipmentLogic.newEquipment,
    setNewEquipment: equipmentLogic.setNewEquipment,
    laborUsedList: laborLogic.laborUsedList,
    newLabor: laborLogic.newLabor,
    setNewLabor: laborLogic.setNewLabor,
    materialsUsedList: materialLogic.materialsUsedList,
    newMaterial: materialLogic.newMaterial,
    setNewMaterial: materialLogic.setNewMaterial,
    plannedEquipments,
    plannedLabor,
    plannedMaterials,
    search,
    setSearch,
    setSortOption,
    saving,
    allocationsLoading,
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
    handleUpdateWorkDone,
    handleUpdatePhotos,
    handleApproveWorkReport,
    handleRejectWorkReport,
  };
}
