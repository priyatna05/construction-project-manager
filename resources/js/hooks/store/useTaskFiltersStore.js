import { currentUrlParams, reloadWithQuery, reloadWithoutQueryParams } from '@/utils/route';
import { produce } from 'immer';
import isArray from 'lodash/isArray';
import omit from 'lodash/omit';
import { create } from 'zustand';

const normalizeArray = value => {
  if (Array.isArray(value)) return value.map(Number);
  if (value === undefined || value === null || value === '') return [];
  return [Number(value)];
};

const params = currentUrlParams();

const useTaskFiltersStore = create((set, get) => ({
  openedDrawer: false,
  filters: {
    groups: normalizeArray(params.groups),
    assignees: normalizeArray(params.assignees),
    due_date: {
      not_set: params.not_set || 0,
      overdue: params.overdue || 0,
    },
    status: params.status || 0,
    labels: normalizeArray(params.labels),
  },
  hasUrlParams: (exclude = []) => {
    const params = omit(currentUrlParams(), exclude);

    return Object.keys(params).length > 0;
  },
  hasFilters: () => {
    const filters = get().filters;
    const keys = Object.keys(filters);

    return keys.some(key => {
      if (isArray(filters[key])) {
        return filters[key].length > 0;
      } else {
        const keys = Object.keys(filters[key]);
        return keys.some(k => !!filters[key][k]);
      }
    });
  },
  clearFilters: () => {
    reloadWithoutQueryParams({ keep: ['archive'] });

    return set(() => ({
      filters: {
        groups: [],
        assignees: [],
        due_date: {
          not_set: 0,
          overdue: 0,
        },
        status: 0,
        labels: [],
      },
    }));
  },
  toggleArrayFilter: (field, id) => {
    return set(
      produce(state => {
        const numericId = Number(id);
        const index = state.filters[field].findIndex(i => i === numericId);

        if (index !== -1) {
          state.filters[field].splice(index, 1);
        } else {
          state.filters[field].push(numericId);
        }
        reloadWithQuery({ [field]: state.filters[field] }, true);
      })
    );
  },
  toggleObjectFilter: (field, property) => {
    return set(
      produce(state => {
        if (state.filters[field][property] === 0) {
          state.filters[field][property] = 1;
          reloadWithQuery({ [property]: 1 }, true);
        } else {
          state.filters[field][property] = 0;
          reloadWithoutQueryParams({ exclude: [property] });
        }
      })
    );
  },
  toggleValueFilter: (field, value) => {
    return set(
      produce(state => {
        if (!state.filters[field]) {
          state.filters[field] = value;
          reloadWithQuery({ [field]: value }, true);
        } else {
          state.filters[field] = 0;
          reloadWithoutQueryParams({ exclude: [field] });
        }
      })
    );
  },
  openDrawer: () => {
    return set(
      produce(state => {
        state.openedDrawer = true;
      })
    );
  },
  closeDrawer: () => {
    return set(
      produce(state => {
        state.openedDrawer = false;
      })
    );
  },
  syncFromUrl: () => {
    const params = currentUrlParams();
    return set(
      produce(state => {
        state.filters.groups = normalizeArray(params.groups);
        state.filters.assignees = normalizeArray(params.assignees);
        state.filters.due_date = {
          not_set: params.not_set || 0,
          overdue: params.overdue || 0,
        };
        state.filters.status = params.status || 0;
        state.filters.labels = normalizeArray(params.labels || []);
      })
    );
  },
}));

export default useTaskFiltersStore;
