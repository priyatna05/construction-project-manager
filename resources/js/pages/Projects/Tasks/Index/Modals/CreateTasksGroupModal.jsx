import useForm from '@/hooks/useForm';
import { Button, Flex, Text, TextInput, Textarea } from '@mantine/core';
import { modals } from '@mantine/modals';

function ModalForm() {
  const [form, submit, updateValue] = useForm(
    'post',
    route('projects.task-groups.store', [route().params.project]),
    {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      budget_group: '',
      weight: '',
      progress_group: '',
      project_id: route().params.project,
      order_column: '',
    }
  );

  const submitModal = event => {
    event.preventDefault();
    submit(event, {
      onSuccess: () => modals.closeAll(),
      onError: errors => {
        console.error('Validation errors:', errors);
      },
      preserveScroll: true,
    });
  };

  return (
    <form onSubmit={submitModal}>
      <TextInput
        label='Name'
        placeholder='Group name'
        required
        data-autofocus
        value={form.data.name}
        onChange={e => updateValue('name', e.target.value)}
        error={form.errors.name}
      />

      <Textarea
        label='Description'
        placeholder='Group description'
        mt='md'
        autosize
        minRows={4}
        maxRows={8}
        value={form.data.description}
        onChange={e => updateValue('description', e.target.value)}
        error={form.errors.description}
      />

      <Flex
        justify='flex-end'
        mt='xl'
      >
        <Button
          type='submit'
          w={100}
          loading={form.processing}
        >
          Create
        </Button>
      </Flex>
    </form>
  );
}

const CreateTasksGroupModal = () => {
  modals.open({
    title: (
      <Text
        size='xl'
        fw={700}
        mb={-10}
      >
        Create tasks group
      </Text>
    ),
    centered: true,
    padding: 'xl',
    overlayProps: { backgroundOpacity: 0.55, blur: 3 },
    children: <ModalForm />,
  });
};

export default CreateTasksGroupModal;
