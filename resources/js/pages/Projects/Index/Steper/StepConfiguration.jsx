import StatusMultiSelect from '@/components/StatusMultiSelect';
import UserMultiSelect from '@/components/UserMultiSelect';
import StatusSelect from '@/components/StatusSelect';

export default function StepConfiguration({
  form,
  dropdowns,
  updateValue,
  renderSelectOptionWithIcon,
  can,
}) {
  return (
    <>
      <StatusSelect
        label='Type Project'
        placeholder='Pick type kontrak project'
        mt='md'
        searchable
        clearable
        value={form.data.type_id ?? ''}
        onChange={v => updateValue('type_id', v)}
        data={dropdowns.types?.map(t => ({
          value: t.slug,
          label: t.name,
          icon: t.icon,
          color: t.color,
        }))}
        renderOption={renderSelectOptionWithIcon}
        error={form.errors.type_id}
        readOnly={!can('create project')}
      />

      <StatusMultiSelect
        label='Status'
        placeholder='Select status'
        searchable
        mt='md'
        statuses={dropdowns.status}
        value={form.data.status_ids || []}
        onChange={values => updateValue('status_ids', values)}
        readOnly={!can('create project')}
      />

      <UserMultiSelect
        label='Grant Access to Users'
        placeholder='Select users'
        searchable
        required
        mt='md'
        value={form.data.users}
        onChange={values => updateValue('users', values)}
        users={dropdowns.users}
        error={form.errors.users}
        readOnly={!can('create project')}
      />
    </>
  );
}
