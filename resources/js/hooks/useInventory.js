import { usePage } from '@inertiajs/react';
import {
  IconTruck,
  IconUser,
  IconTool,
  IconDots,
  IconRulerMeasure,
  IconDroplet,
  IconWeight,
  IconBox,
  IconClockHour4,
  IconCalendar,
  IconPackage,
} from '@tabler/icons-react';

export default function useInventory() {
  const { types = [], statuses = [], units = [] } = usePage().props;

  const typeIcons = {
    material: IconTruck,
    labor: IconUser,
    equipment: IconTool,
    other: IconDots,
  };

  const unitIcons = {
    meter: IconRulerMeasure,
    m2: IconRulerMeasure,
    m3: IconRulerMeasure,
    liter: IconDroplet,
    kg: IconWeight,
    ton: IconWeight,
    piece: IconBox,
    sak: IconBox,
    hour: IconClockHour4,
    day: IconCalendar,
    month: IconCalendar,
    year: IconCalendar,
    unit: IconPackage,
  };

  const statusColors = {
    active: 'green',
    inactive: 'gray',
    deleted: 'red',
  };

  const getDropdownValues = (items = [], { except = [] } = {}, enhancer = null) => {
    return items
      .filter(item => !except.includes(item.value))
      .map(item => ({
        ...item,
        ...(enhancer?.(item) || {}),
      }));
  };

  return {
    types: {
      getDropdownValues: opt =>
        getDropdownValues(types, opt, item => ({
          icon: typeIcons[item.value] || IconDots,
        })),
    },
    statuses: {
      getDropdownValues: opt =>
        getDropdownValues(statuses, opt, item => ({
          color: statusColors[item.value] || 'gray',
        })),
    },
    units: {
      getDropdownValues: opt =>
        getDropdownValues(units, opt, item => ({
          icon: unitIcons[item.value] || IconDots,
        })),
    },
  };
}
