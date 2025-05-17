import ArchivedFilterButton from "@/components/ArchivedFilterButton";
import EmptyWithIcon from "@/components/EmptyWithIcon";
import useAuthorization from "@/hooks/useAuthorization";
import Layout from "@/layouts/MainLayout";
import { redirectTo } from "@/utils/route";
import { usePage } from "@inertiajs/react";
import { Button, Center, Flex, Grid, Group } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import ProjectCard from "./Index/ProjectCard";

const ProjectsIndex = () => {
  const { items } = usePage().props;
  const { isAdmin } = useAuthorization();


  return (
    <>
      <Grid justify="space-between" align="center">
        <Grid.Col span="content">
          <Group>
          {can("create project") && (
            <Button
            leftSection={<IconPlus size={14} />}
            radius="xl"
            variant="default"
            onClick={() => redirectTo("projects.create")}
            >
              Create
            </Button>
          )}
          {isAdmin() && <ArchivedFilterButton />}
          </Group>
          </Grid.Col>
      </Grid>

      {items.length ? (
        <Flex mt="xl" gap="lg" justify="flex-start" align="flex-start" direction="row" wrap="wrap">
          {items.map((item) => (
            <ProjectCard item={item} key={item.id} />
          ))}
        </Flex>
      ) : (
        <Center mih={400}>
          <EmptyWithIcon
            title="No projects found"
            subtitle="or you do not have access to any of them"
            icon={IconSearch}
          />
        </Center>
      )}
    </>
  );
};

ProjectsIndex.layout = (page) => <Layout title="Projects">{page}</Layout>;

export default ProjectsIndex;
