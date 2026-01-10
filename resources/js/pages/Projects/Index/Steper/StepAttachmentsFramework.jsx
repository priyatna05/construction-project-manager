import { Text, Select, Center } from '@mantine/core';
import Dropzone from '@/components/Dropzone';
import { FrameworkDescriptionCard } from '../FrameworkDescriptionCard';


export default function StepAttachmentsFramework({
  form,
  project,
  // eslint-disable-next-line no-unused-vars
  dropdowns,
  updateValue,
  removeAttachment,
  getFrameworkDropdownData,
  can,
}) {
  return (
    <>
    <Center>
      <Text fw={600} mt='lg' mb='xs'>
       Add your files and pick a framework for the project.
      </Text>
      </Center>

      <Dropzone
        mt='md'
        selected={form.data.attachment_files}
        onAddFiles={(files) => form.setData('attachment_files', [...form.data.attachment_files, ...files])}
        onRemoveAttachment={removeAttachment}
        project={project}
        readOnly={!can('create project')}
      />

      <Select
        label='Initial Task Group Type'
        placeholder='Do not generate task groups'
        mt='xs'
        value={form.data.generate_task_groups}
        onChange={(v) => updateValue('generate_task_groups', v)}
        data={getFrameworkDropdownData()}
        error={form.errors.generate_task_groups}
      />

      <FrameworkDescriptionCard selectedValue={form.data.generate_task_groups} />
    </>
  );
}
