import useForm from '@/hooks/useForm';
import { Button, Flex, Text, TextInput, Textarea } from '@mantine/core';
import { modals } from '@mantine/modals';

function ModalForm({ item }) {
  const [form, submit, updateValue] = useForm(
    'post',
    route('projects.task-groups.update', [route().params.project, item.id]),
    {
      _method: 'put',
      name: item.name || '',
      description: item.description || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      budget_group: item.budget_group || '',
    }
  );

  const submitModal = event => {
    submit(event, {
      onSuccess: () => modals.closeAll(),
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

      {/*<DateInput
        label="Start date"
        placeholder="Select start date"
        value={form.data.start_date}
        onChange={(date) => updateValue("start_date", date)}
        error={form.errors.start_date}
      />

      <DateInput
        label="End date"
        placeholder="Select end date"
        value={form.data.end_date}
        onChange={(date) => updateValue("end_date", date)}
        error={form.errors.end_date}
      />

      <NumberInput
        label="Budget"
        placeholder="Enter budget"
        mt="md"
        value={form.data.budget_group}
        onChange={(value) => updateValue("budget_group", value)}
        error={form.errors.budget_group}
      /> */}

      <Flex
        justify='flex-end'
        mt='xl'
      >
        <Button
          type='submit'
          w={100}
          loading={form.processing}
        >
          Update
        </Button>
      </Flex>
    </form>
  );
}

const EditTasksGroupModal = item => {
  modals.open({
    title: (
      <Text
        size='xl'
        fw={700}
        mb={-10}
      >
        Edit tasks group
      </Text>
    ),
    centered: true,
    padding: 'xl',
    overlayProps: { backgroundOpacity: 0.55, blur: 3 },
    children: <ModalForm item={item} />,
  });
};

export default EditTasksGroupModal;
