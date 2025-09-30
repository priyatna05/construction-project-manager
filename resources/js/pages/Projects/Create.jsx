import { useEffect, useRef, useState } from 'react';
import { Group, MultiSelect, Select, TextInput, Text } from '@mantine/core';
import { NumericFormat } from 'react-number-format';
import { DateInput } from '@mantine/dates';
import Dropzone from '@/components/Dropzone';
import useForm from '@/hooks/useForm';
import ActionButton from '@/components/ActionButton';
import RichTextEditor from '@/components/RichTextEditor';
import LabelsDropdown from '@/pages/Projects/Tasks/Drawers/LabelsDropdown';
import createSuggestion from '@/components/RichTextEditor/Mention/suggestion.js';
import { getFrameworkDropdownData } from '@/utils/selectFramework';
import { FrameworkDescriptionCard } from './Index/FrameworkDescriptionCard';
import Modal from '@/components/Modal';
import useAuthorization from '@/hooks/useAuthorization';

export default function ProjectCreate({ project = null, dropdowns, opened, setOpen }) {
  const { can } = useAuthorization() || { can: () => true };
  const editorRef = useRef(null);
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [step, setStep] = useState(1);
  const [form, submit, updateValue] = useForm(
    project ? 'put' : 'post',
    project ? route('projects.update', project.id) : route('projects.store'),
    {
      name: project?.name || '',
      description: project?.description || '',
      start_date: project?.start_date ? new Date(project.start_date) : '',
      end_date: project?.end_date ? new Date(project.end_date) : '',
      budget_project:
        project?.budget_project != null ? (project.budget_project / 100).toString() : '',
      client_company_id: project?.client_company_id?.toString() || '',
      users: project?.users?.map(u => u.id.toString()) || [],
      attachments: project?.attachments || [],
      generate_task_groups: '',
    }
  );
  const suggestion = createSuggestion(project?.id);

  useEffect(() => {
    if (
      form.data.start_date &&
      form.data.end_date &&
      new Date(form.data.start_date) > new Date(form.data.end_date)
    ) {
      form.setError('end_date', 'End date must be after start date or equals start date');
    } else {
      form.clearErrors('end_date');
    }
  }, [form.data.start_date, form.data.end_date]);

  useEffect(() => {
    const selectedCompany = dropdowns.currencies.find(currency =>
      currency.client_companies?.some(c => c.id.toString() === form.data.client_company_id)
    );
    setCurrencySymbol(selectedCompany?.symbol || '');
  }, [form.data.client_company_id, dropdowns.currencies]);

  useEffect(() => {
    if (opened && !project) {
      setStep(1);
      form.reset();
    }
  }, [opened]);

  const handleSubmit = e => {
    e.preventDefault();

    form.setData('budget_project', Math.round(parseFloat(form.data.budget_project) * 100));

    submit(e, {
      preserveState: true,
      onSuccess: () => {
        setOpen(false);
        setStep(1);
        form.reset();
      },
    });
  };

  const removeAttachment = index => {
    const files = [...form.data.attachments];
    files.splice(index, 1);
    updateValue('attachments', files);
  };

  return (
    <Modal
      // key={editingProject?.id || 'new'}
      opened={opened}
      onClose={() => setOpen(false)}
      title={project ? 'Edit Project' : 'Create Project'}
    >
      <div data-ignore-link>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <Dropzone
                mt='xl'
                selected={form.data.attachments}
                onChange={files => updateValue('attachments', files)}
                remove={index => removeAttachment(index)}
                project={project}
                readOnly={!can('edit project')}
              />
              <Select
                label='User or Company requesting work'
                placeholder='Select User or Company'
                required
                withAsterisk
                mt='md'
                searchable
                value={form.data.client_company_id}
                onChange={value => updateValue('client_company_id', value)}
                data={dropdowns.companies}
                error={form.errors.client_company_id}
                readOnly={!can('edit project')}
              />

              <TextInput
                label='Project Name'
                placeholder='Project name'
                required
                withAsterisk
                mt='md'
                value={form.data.name}
                onChange={e => updateValue('name', e.target.value)}
                error={form.errors.name}
                readOnly={!can('edit project')}
              />

              <RichTextEditor
                ref={editorRef}
                mt='md'
                placeholder='Project description'
                content={form.data.description}
                onChange={content => updateValue('description', content)}
                error={form.errors.description}
                height={120}
                suggestion={suggestion}
                readOnly={!can('edit project')}
              />


              <Group
                mt='md'
                grow
              >
                <DateInput
                  clearable
                  required
                  withAsterisk
                  valueFormat='DD MMM YYYY'
                  minDate={new Date()}
                  label='Start Date'
                  placeholder='Pick start date'
                  value={form.data.start_date}
                  onChange={value => updateValue('start_date', value)}
                  error={form.errors.start_date}
                  readOnly={!can('edit project')}
                />

                <DateInput
                  clearable
                  required
                  withAsterisk
                  valueFormat='DD MMM YYYY'
                  minDate={new Date()}
                  label='End Date'
                  placeholder='Pick end date'
                  value={form.data.end_date}
                  onChange={value => updateValue('end_date', value)}
                  error={form.errors.end_date}
                  readOnly={!can('edit project')}
                />
              </Group>

              <NumericFormat
                customInput={TextInput}
                label='Budget'
                placeholder='budget project'
                thousandSeparator='.'
                decimalSeparator=','
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                prefix={currencySymbol}
                value={form.data.budget_project}
                onValueChange={values => updateValue('budget_project', values.value)}
                required
                mt='md'
                withAsterisk
                error={form.errors.budget_project}
                readOnly={!can('edit project')}
              />

              <LabelsDropdown
                items={dropdowns.labels || []}
                selected={form.data.labels || []}
                onChange={values => updateValue('labels', values)}
                filterTypes={['pt_status']}
                mt='md'
                readOnly={!can('edit project')}
              />

              <MultiSelect
                label='Grant Access to Users'
                placeholder='Select users'
                mt='md'
                searchable
                value={form.data.users}
                onChange={values => updateValue('users', values)}
                data={dropdowns.users}
                error={form.errors.users}
                readOnly={!can('edit project')}
              />

              <Group
                justify='flex-end'
                mt='xl'
              >
                {project ? (
                  <ActionButton
                    type='submit'
                    loading={form.processing}
                    disabled={form.processing}
                  >
                    Update
                  </ActionButton>
                ) : (
                  <ActionButton
                    type='button'
                    onClick={() => setStep(2)}
                    disabled={
                      !form.data.name ||
                      !form.data.client_company_id ||
                      !form.data.start_date ||
                      !form.data.end_date ||
                      form.errors.start_date ||
                      form.errors.end_date
                    }
                  >
                    Next
                  </ActionButton>
                )}
              </Group>
            </>
          )}

          {step === 2 && !project && (
            <>
              <Text
                size='md'
                fw={600}
                mt='md'
                mb='xs'
              >
                Choose a project framework
              </Text>
              <Select
                label='Initial Task Group Type'
                placeholder='Do not generate task groups'
                mt='md'
                value={form.data.generate_task_groups}
                onChange={value => updateValue('generate_task_groups', value)}
                data={getFrameworkDropdownData()}
                error={form.errors.generate_task_groups}
              />
              <FrameworkDescriptionCard selectedValue={form.data.generate_task_groups} />

              <Group
                justify='space-between'
                mt='xl'
              >
                <ActionButton
                  variant='default'
                  type='button'
                  onClick={() => setStep(1)}
                >
                  Back
                </ActionButton>

                <ActionButton
                  type='submit'
                  loading={form.processing}
                  disabled={form.processing}
                >
                  Create Project
                </ActionButton>
              </Group>
            </>
          )}
        </form>
      </div>
    </Modal>
  );
}
