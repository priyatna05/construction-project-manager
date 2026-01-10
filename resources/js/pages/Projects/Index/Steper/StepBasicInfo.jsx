import { TextInput } from '@mantine/core';
import RichTextEditor from '@/components/RichTextEditor';
import ClientSelect from '@/components/ClientSelect';

export default function StepBasicInfo({ form, dropdowns, updateValue, suggestion, can }) {
  const companiesWithUsers = (dropdowns.companies || []).filter(company => company.users_count > 0);

  const individualClientUsers = (dropdowns.clientUsers || []).map(user => ({
    value: 'user_' + user.id,
    label: user.name,
    avatar: user.avatar,
    initial: user.name.charAt(0).toUpperCase(),
  }));

  return (
    <>
      <ClientSelect
        label='Requesting Work'
        placeholder='Select'
        searchable
        required
        mt='md'
        value={
          form.data.client_company_id
            ? form.data.client_company_id
            : form.data.client_user_id
              ? 'user_' + form.data.client_user_id
              : null
        }
        onChange={value => {
          if (value && value.startsWith('user_')) {
            const userId = value.replace('user_', '');
            updateValue('client_user_id', userId);
            updateValue('client_company_id', null);
          } else {
            updateValue('client_company_id', value);
            updateValue('client_user_id', null);
          }
        }}
        data={[...companiesWithUsers, ...individualClientUsers]}
        nothingFoundMessage='No client data found'
        error={form.errors.client_company_id || form.errors.client_user_id}
        readOnly={!can('create project')}
      />

      <TextInput
        label='Project Name'
        placeholder='Enter project name'
        required
        mt='md'
        value={form.data.name}
        onChange={e => updateValue('name', e.target.value)}
        error={form.errors.name}
        readOnly={!can('create project')}
      />

      <RichTextEditor
        mt='md'
        placeholder='Project description'
        content={form.data.description}
        onChange={content => updateValue('description', content)}
        error={form.errors.description}
        suggestion={suggestion}
        height={120}
        readOnly={!can('create project')}
      />
    </>
  );
}
