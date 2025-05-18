import ArchivedFilterButton from "@/components/ArchivedFilterButton";
import ClearFiltersButton from "@/components/ClearFiltersButton";
import useTaskDrawerStore from "@/hooks/store/useTaskDrawerStore";
import useTaskFiltersStore from "@/hooks/store/useTaskFiltersStore";
import usePreferences from "@/hooks/usePreferences";
import { usePage } from "@inertiajs/react";
import { ActionIcon, Button, Grid, Group, Text, Title, Stack, Tooltip } from "@mantine/core";
import {
  IconFilter,
  IconFilterCog,
  IconLayoutKanban,
  IconLayoutList,
  IconPlus,
} from "@tabler/icons-react";

export default function Header() {
  const { project } = usePage().props;

  const { tasksView, setTasksView } = usePreferences();
  const { openDrawer } = useTaskFiltersStore();

  const { openCreateTask } = useTaskDrawerStore();
  const { hasUrlParams } = useTaskFiltersStore();
  const usingFilters = hasUrlParams(["archived"]);

  return (
    <Grid justify="space-between" align="end">
      <Grid.Col span="content">
        <Group mb="lg" c="white">
        <Stack spacing="xs">
      <Title>{project.name_project}</Title>
      {project.description_project && (
        <Text size="md">
          {project.description_project}
        </Text>
      )}
      <Group spacing="md">
        {project.client_company?.name && (
          <Text>
            Client : {project.client_company.name}
          </Text>
        )}

      </Group>
      <Group spacing="md">
        {project.start_date_project && (
          <Text>
            Start : {new Date(project.start_date_project).toLocaleDateString()}
          </Text>
        )}
        {project.end_date_project && (
          <Text>
            End : {new Date(project.end_date_project).toLocaleDateString()}
          </Text>
        )}
        Duration : start to end in here
        {project.budget_project && (
          <Text>
            Budget : {`Rp. ${project.budget_project}`}
          </Text>
        )}
      </Group>
      </Stack>
    </Group>
        <Group>
          {project.archived_at && (
            <Text size="sm" fw={500} c="red.8">
          (Archived)
        </Text>
      )}
          {can("create task") && (
         <Button
         leftSection={<IconPlus size={20} />}
         radius="xl"
         variant="white"
         onClick={() => openCreateTask()}
         >
              Add task
            </Button>
          )}
          <ActionIcon.Group>
            {tasksView === "kanban" && (
              <Tooltip label="Filters" openDelay={500} withArrow>
                <ActionIcon variant="filled" size="lg" onClick={() => openDrawer()}>
                  {usingFilters ? (
                    <IconFilterCog style={{ width: "60%", height: "60%" }} stroke={1.5} />
                  ) : (
                    <IconFilter style={{ width: "60%", height: "60%" }} stroke={1.5} />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
            {usingFilters && <ClearFiltersButton />}
          </ActionIcon.Group>
          <ArchivedFilterButton />
        </Group>
      </Grid.Col>
      <Grid.Col span="content">
        <Group>
          <Group mr="sm" gap={10}>
            <ActionIcon.Group>
              <ActionIcon
                size="lg"
                variant={tasksView === "list" ? "filled" : "default"}
                onClick={() => setTasksView("list")}
              >
                <Tooltip label="List view" openDelay={250} withArrow>
                  <IconLayoutList style={{ width: "40%", height: "40%" }} />
                </Tooltip>
              </ActionIcon>
              <ActionIcon
                size="lg"
                variant={tasksView === "kanban" ? "filled" : "default"}
                onClick={() => setTasksView("kanban")}
              >
                <Tooltip label="Kanban view" openDelay={250} withArrow>
                  <IconLayoutKanban style={{ width: "45%", height: "45%" }} />
                </Tooltip>
              </ActionIcon>
            </ActionIcon.Group>
          </Group>
        </Group>
      </Grid.Col>
    </Grid>
  );
}
