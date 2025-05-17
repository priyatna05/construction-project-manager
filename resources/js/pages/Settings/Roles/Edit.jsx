import ActionButton from "@/components/ActionButton";
import BackButton from "@/components/BackButton";
import Card from "@/components/Card";
import useForm from "@/hooks/useForm";
import Layout from "@/layouts/MainLayout";
import { usePage } from "@inertiajs/react";
import {
  Chip,
  Fieldset,
  Grid,
  Group,
  TextInput,
  Title,
} from "@mantine/core";

const RoleEdit = () => {
  const { item, allPermissionsGrouped } = usePage().props;

  const [form, submit, updateValue] = useForm(
    "post",
    route("settings.roles.update", item.id),
    {
      _method: "put",
      name: item.name,
      permissions: item.permissions,
    },
  );

  const toggle = (permission) => {
    form.data.permissions.includes(permission)
      ? updateValue(
          "permissions",
          form.data.permissions.filter((p) => p !== permission),
        )
      : updateValue("permissions", [...form.data.permissions, permission]);
  };

  return (
    <>
      <Card justify="space-between" align="center" gutter="xl" mb="lg">
      <Grid justify="space-between" align="flex-end" gutter="xl" mb="lg">
        <Grid.Col span="auto">
          <Title order={1}>Edit role</Title>
        </Grid.Col>
        <Grid.Col span="content"></Grid.Col>
      </Grid>
        <form onSubmit={submit}>
          {form.data.name !== "client" && (
            <TextInput
              label="Name"
              placeholder="Role name"
              required
              value={form.data.name}
              onChange={(e) => updateValue("name", e.target.value)}
              error={form.errors.name}
            />
          )}

          <Title order={3} mt={form.data.name !== "client" ? "xl" : ""}>
            Permissions
          </Title>

          {Object.keys(allPermissionsGrouped).map((group) => (
            <Fieldset legend={group} key={group} tt="capitalize" mt="sm">
              <Chip.Group multiple>
                <Group justify="start" gap="sm">
                  {allPermissionsGrouped[group].map((permission) => (
                    <Chip
                      key={permission}
                      radius="sm"
                      checked={form.data.permissions.includes(permission)}
                      onClick={() => toggle(permission)}
                    >
                      {permission}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </Fieldset>
          ))}

          <Group justify="space-between" mt="xl">
            <BackButton route="settings.roles.index" />
            <ActionButton loading={form.processing}>Update</ActionButton>
          </Group>
        </form>
      </Card>
    </>
  );
};

RoleEdit.layout = (page) => <Layout title="Edit role">{page}</Layout>;

export default RoleEdit;
