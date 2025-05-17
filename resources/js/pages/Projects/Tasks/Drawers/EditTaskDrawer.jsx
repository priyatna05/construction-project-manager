import Dropzone from "@/components/Dropzone";
import RichTextEditor from "@/components/RichTextEditor";
import useTaskDrawerStore from "@/hooks/store/useTaskDrawerStore";
import useTasksStore from "@/hooks/store/useTasksStore";
import useWebSockets from "@/hooks/useWebSockets";
import { date } from "@/utils/datetime";
import { usePage } from "@inertiajs/react";
import {
  Breadcrumbs,
  Checkbox,
  Drawer,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import Comments from "./Comments";
import LabelsDropdown from "./LabelsDropdown";
import classes from "./css/TaskDrawer.module.css";
// import ResourcesPlanner from "./AddResources";

export function EditTaskDrawer() {
  const editorRef = useRef(null);
  const { edit, openEditTask, closeEditTask } = useTaskDrawerStore();
  const { initTaskWebSocket } = useWebSockets();
  const { findTask, updateTaskProperty, complete, deleteAttachment, uploadAttachments } =
    useTasksStore();

  // Check if the user has permission to perform certain actions
  // need adjustment for permission userRole to access this feature based on the permission
  const {
    usersWithAccessToProject,
    taskGroups,
    labels,
    openedTask,
  } = usePage().props;

  useEffect(() => {
    if (openedTask) setTimeout(() => openEditTask(openedTask), 50);
  }, []);

  const task = findTask(edit.task.id);

  const [data, setData] = useState({
    group_id: "",
    assigned_to_user_id: "",
    name_task: "",
    description_task: "",
    start_date_task: "",
    end_date_task: "",
    budget_task: "",
    subscribed_users: [],
    labels: [],
  });

  useEffect(() => {
    if (edit.opened) {
      return initTaskWebSocket(task);
    }
  }, [edit.opened]);

  useEffect(() => {
    if (edit.opened) {
      setData({
        group_id: task?.group_id || "",
        assigned_to_user_id: task?.assigned_to_user_id || "",
        name_task: task?.name || "",
        description_task: task?.description || "",
        start_date_task: task?.start_date ? dayjs(task?.start_date).toDate() : "",
        end_date_task: task?.end_date ? dayjs(task?.end_date).toDate() : "",
        budget_task: task?.budget || 0,
        subscribed_users: (task?.subscribed_users || []).map((i) => i.id.toString()),
        labels: (task?.labels || []).map((i) => i.id),
      });
      editorRef.current?.setContent(task?.description_task || "");
    }
  }, [edit.opened, task]);

  const updateValue = (field, value) => {
    setData({ ...data, [field]: value });

    const dropdowns = ["labels", "subscribed_users"];
    const onBlurInputs = ["name_task", "description_task"];

    if (dropdowns.includes(field)) {
      const options = {
        labels: value.map((id) => labels.find((i) => i.id === id)),
        subscribed_users: value.map((id) =>
          usersWithAccessToProject.find((i) => i.id.toString() === id),
        ),
      };
      updateTaskProperty(task, field, value, options[field]);
    } else if (!onBlurInputs.includes(field)) {
      updateTaskProperty(task, field, value);
    }
  };

  const onBlurUpdate = (property) => {
    if (data.name_task.length > 0) {
      updateTaskProperty(task, property, data[property]);
    }
  };

  return (
    <Drawer
      opened={edit.opened}
      onClose={closeEditTask}
      title={
        <Group ml={25} my="sm" wrap="nowrap">
          <Checkbox
            size="md"
            radius="xl"
            color="green"
            checked={task?.completed_at !== null}
            onChange={(e) => complete(task, e.currentTarget.checked)}
            className={can("complete task") ? classes.checkbox : classes.disabledCheckbox}
          />
          <Text
            fz={rem(27)}
            fw={600}
            lh={1.2}
            td={task?.completed_at !== null ? "line-through" : null}
          >
            #{task?.number}: {data.name_task}
          </Text>
        </Group>
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
      {task ? (
        <>
          <Breadcrumbs
            c="dark.3"
            ml={24}
            mb="xs"
            separator="I"
            separatorMargin="sm"
            styles={{ separator: { opacity: 0.3 } }}
          >
            {/* Project name  need verify */}
            <Text size="xs">{task.project.name_project}</Text>
            <Text size="xs">Task #{task.number}</Text>
            <Text size="xs">
              Created by {task.created_by_user.name} on {date(task.created_at)}
            </Text>
          </Breadcrumbs>
          <form className={classes.inner}>
            <div className={classes.content}>
              <TextInput
                label="Name"
                placeholder="Task name"
                value={data.name_task}
                onChange={(e) => updateValue("name_task", e.target.value)}
                onBlur={() => onBlurUpdate("name_task")}
                error={data.name_task.length === 0}
                readOnly={!can("edit task")}
              />

              <RichTextEditor
                ref={editorRef}
                mt="xl"
                placeholder="Task description"
                content={data.description_task}
                height={260}
                onChange={(content) => updateValue("description_task", content)}
                onBlur={() => onBlurUpdate("description_task")}
                readOnly={!can("edit task")}
              />

              {can("edit task") && (
                <Dropzone
                  mt="xl"
                  selected={task.attachments}
                  onChange={(files) => uploadAttachments(task, files)}
                  remove={(index) => deleteAttachment(task, index)}
                />
              )}

              {can("view comments") && <Comments task={task} />}
            </div>
            <div className={classes.sidebar}>
              <Select
                label="Task group"
                placeholder="Select task group"
                allowDeselect={false}
                value={data.group_id.toString()}
                onChange={(value) => updateValue("group_id", value)}
                data={taskGroups.map((i) => ({
                  value: i.id.toString(),
                  label: i.name_group,
                }))}
                readOnly={!can("edit task")}
              />

              <Select
                label="Assignee"
                placeholder="Select assignee"
                searchable
                mt="md"
                value={data.assigned_to_user_id?.toString()}
                onChange={(value) => updateValue("assigned_to_user_id", value)}
                data={usersWithAccessToProject.map((i) => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can("edit task")}
              />

              <DateInput
                clearable
                valueFormat="DD MMM YYYY"
                minDate={new Date()}
                mt="md"
                label="Start date"
                placeholder="Pick task start date"
                value={data.start_date_task}
                onChange={(value) => updateValue("start_date_task", value)}
                onBlur={() => onBlurUpdate("start_date_task")}
                readOnly={!can("edit task")}
              />
              <DateInput
                clearable
                valueFormat="DD MMM YYYY"
                minDate={new Date()}
                mt="md"
                label="End date"
                placeholder="Pick task End date"
                value={data.end_date_task}
                onChange={(value) => updateValue("end_date_task", value)}
                onBlur={() => onBlurUpdate("end_date_task")}
                readOnly={!can("edit task")}
              />

              <NumberInput
                label="Budget allocated"
                mt="md"
                decimalScale={2}
                fixedDecimalScale
                value={data.budget_task}
                min={0}
                allowNegative={false}
                step={0.5}
                precision={2}
                onChange={(value) => updateValue("budget_task", value)}
                onBlur={() => onBlurUpdate("budget_task")}
                readOnly={!can("edit task")}
                error={data.budget_task < 0}
              />

              <LabelsDropdown
                items={labels}
                selected={data.labels}
                onChange={(values) => updateValue("labels", values)}
                mt="md"
              />

              {/* <ResourcesPlanner /> */}

              <MultiSelect
                label="Subscribers"
                placeholder={!data.subscribed_users.length ? "Select subscribers" : null}
                mt="lg"
                value={data.subscribed_users}
                onChange={(values) => updateValue("subscribed_users", values)}
                data={usersWithAccessToProject.map((i) => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can("edit task")}
              />
            </div>
          </form>
        </>
      ) : (
        <></>
      )}
    </Drawer>
  );
}
