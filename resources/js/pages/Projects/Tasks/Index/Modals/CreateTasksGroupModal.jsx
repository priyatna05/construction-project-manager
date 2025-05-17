import useForm from "@/hooks/useForm";
import { Button, Flex, Text, TextInput, NumberInput, Textarea} from "@mantine/core";
import { DateInput } from '@mantine/dates';
import { modals } from "@mantine/modals";

function ModalForm() {
  const [form, submit, updateValue] = useForm(
    "post",
    route("projects.task-groups.store", [route().params.project]),
    { name_group: "",
      description_group: "",
      start_date_group: "",
      end_date_group: "",
      budget_group: "",
      weight: "",
      progress_group:"",
      project_id: "",
      order_column: "",
    },
  );

  const submitModal = (event) => {
    submit(event, {
      onSuccess: () => modals.closeAll(),
      preserveScroll: true,
    });
  };

  return (
    <form onSubmit={submitModal}>
      <TextInput
        label="Name"
        placeholder="Group name"
        required
        data-autofocus
        value={form.data.name_group}
        onChange={(e) => updateValue("name_group", e.target.value)}
        error={form.errors.name_group}
      />

      <Textarea
        label="Description"
        placeholder="Group description"
        mt="md"
        autosize
        minRows={4}
        maxRows={8}
        value={form.data.description_group}
        onChange={(e) => updateValue("description_group", e.target.value)}
        error={form.errors.description_group}
      />

      <DateInput
        label="Start date"
        placeholder="Select start date"
        value={form.data.start_date_group}
        onChange={(date) => updateValue("start_date_group", date)}
        error={form.errors.start_date_group}
      />

      <DateInput
        label="End date"
        placeholder="Select end date"
        value={form.data.end_date_group}
        onChange={(date) => updateValue("end_date_group", date)}
        error={form.errors.end_date_group}
      />

      <NumberInput
        label="Budget"
        placeholder="Enter budget"
        mt="md"
        value={form.data.budget_group}
        onChange={(value) => updateValue("budget_group", value)}
        error={form.errors.budget_group}
      />

      <Flex justify="flex-end" mt="xl">
        <Button type="submit" w={100} loading={form.processing}>
          Create
        </Button>
      </Flex>
    </form>
  );
}

const CreateTasksGroupModal = () => {
  modals.open({
    title: (
      <Text size="xl" fw={700} mb={-10}>
        Create tasks group
      </Text>
    ),
    centered: true,
    padding: "xl",
    overlayProps: { backgroundOpacity: 0.55, blur: 3 },
    children: <ModalForm />,
  });
};

export default CreateTasksGroupModal;
