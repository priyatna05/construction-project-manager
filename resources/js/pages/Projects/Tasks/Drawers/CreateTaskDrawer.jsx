import { openConfirmModal } from "@/components/ConfirmModal";
import Dropzone from "@/components/Dropzone";
import RichTextEditor from "@/components/RichTextEditor";
import useTaskDrawerStore from "@/hooks/store/useTaskDrawerStore";
import useForm from "@/hooks/useForm";
import { usePage } from "@inertiajs/react";
import {
  Button,
  Drawer,
  Flex,
  MultiSelect,
  NumberInput,
  Select,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useEffect } from "react";
import LabelsDropdown from "./LabelsDropdown";
import classes from "./css/TaskDrawer.module.css";
// import ResourcesPlanner from "./AddResources";

export function CreateTaskDrawer() {
  const { create, closeCreateTask } = useTaskDrawerStore();
  const {
    usersWithAccessToProject,
    taskGroups,
    labels,
    auth: { user },
    tasks = []
  } = usePage().props;

  // Get the next task number by finding the maximum task number and adding 1
  const nextTaskNumber = tasks.length > 0
    ? Math.max(...tasks.map(task => task.number)) + 1
    : 1;

  const initial = {
    group_id: create.group_id ? create.group_id.toString() : "",
    assigned_to_user_id: "",
    name_task: "",
    description_task: "",
    start_date_task: "",
    end_date_task: "",
    budget_task: "",
    subscribed_users: [user.id.toString()],
    labels: [],
    attachments: [],
    number: nextTaskNumber,
  };

  const [form, submit, updateValue] = useForm(
    "post",
    route("projects.tasks.store", [route().params.project]),
    {
      ...initial,
    },
  );

  useEffect(() => {
    updateValue({ ...initial });
  }, [create.opened]);

  const closeDrawer = (force = false) => {
    if (force || (JSON.stringify(form.data) === JSON.stringify(initial) && !form.processing)) {
      closeCreateTask();
    } else {
      openConfirmModal({
        type: "danger",
        title: "Discard changes?",
        content: `All unsaved changes will be lost.`,
        confirmLabel: "Discard",
        confirmProps: { color: "red" },
        onConfirm: () => closeCreateTask(),
      });
    }
  };

  const removeAttachment = (index) => {
    const files = [...form.data.attachments];
    files.splice(index, 1);
    updateValue("attachments", files);
  };

  return (
    <Drawer
      opened={create.opened}
      onClose={closeDrawer}
      title={
        <Text fz={rem(28)} fw={600} ml={25} my="sm">
          Add new task
        </Text>
      }
      position="right"
      size={1000}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{
        transition: "slide-left",
        duration: 400,
        timingFunction: "ease",
      }}
    >
      <form
        onSubmit={(event) =>
          submit(event, {
            onSuccess: () => closeDrawer(true),
            forceFormData: true,
          })
        }
        className={classes.inner}
      >
        <div className={classes.content}>
          <TextInput
            label="Name"
            placeholder="Task name"
            required
            data-autofocus
            value={form.data.name_task}
            onChange={(e) => updateValue("name_task", e.target.value)}
            error={form.errors.name_task}
          />

          <RichTextEditor
            mt="xl"
            placeholder="Task description"
            height={260}
            onChange={(content) => updateValue("description_task", content)}
          />

          <Dropzone
            mt="xl"
            selected={form.data.attachments}
            onChange={(files) => updateValue("attachments", files)}
            remove={(index) => removeAttachment(index)}
          />

          <MultiSelect
            label="Subscribers"
            placeholder="Select subscribers"
            searchable
            mt="md"
            value={form.data.subscribed_users}
            onChange={(values) => updateValue("subscribed_users", values)}
            data={usersWithAccessToProject.map((i) => ({
              value: i.id.toString(),
              label: i.name,
            }))}
            error={form.errors.subscribed_users}
          />

          <Flex justify="space-between" mt="xl">
            <Button variant="transparent" w={100} disabled={form.processing} onClick={closeDrawer}>
              Cancel
            </Button>

            <Button  variant="white" type="submit" w={120} loading={form.processing}>
              Add task
            </Button>
          </Flex>
        </div>
        <div className={classes.sidebar}>
          <Select
            label="Task group"
            placeholder="Select task group"
            required
            value={form.data.group_id}
            onChange={(value) => updateValue("group_id", value)}
            data={taskGroups.map((i) => ({
              value: i.id.toString(),
              label: i.name_group,
            }))}
            error={form.errors.group_id}
          />

          <Select
            label="Assignee"
            placeholder="Select assignee"
            searchable
            mt="md"
            value={form.data.assigned_to_user_id}
            onChange={(value) => updateValue("assigned_to_user_id", value)}
            data={usersWithAccessToProject.map((i) => ({
              value: i.id.toString(),
              label: i.name,
            }))}
            error={form.errors.assigned_to_user_id}
          />

          <DateInput
            clearable
            valueFormat="DD MMM YYYY"
            minDate={new Date()}
            mt="md"
            label="Start date"
            placeholder="Pick task start date"
            value={form.data.start_date_task}
            onChange={(value) => updateValue("start_date_task", value)}
            error={form.errors.start_date_task}
          />

          <DateInput
            clearable
            valueFormat="DD MMM YYYY"
            minDate={new Date()}
            mt="md"
            label="End date"
            placeholder="Pick task end date"
            value={form.data.end_date_task}
            onChange={(value) => updateValue("end_date_task", value)}
            error={form.errors.end_date_task}
          />

          <NumberInput
            label="Budget allocated"
            mt="md"
            decimalScale={2}
            fixedDecimalScale
            defaultValue={0}
            min={0}
            allowNegative={false}
            step={0.5}
            precision={2}
            value={form.data.budget_task}
            onChange={(value) => updateValue("budget_task", value)}
            error={form.errors.budget_task}
            />

          <LabelsDropdown
            items={labels}
            selected={form.data.labels}
            onChange={(values) => updateValue("labels", values)}
            mt="md"
          />

          {/* <ResourcesPlanner /> */}

        </div>
      </form>
    </Drawer>
  );
}
