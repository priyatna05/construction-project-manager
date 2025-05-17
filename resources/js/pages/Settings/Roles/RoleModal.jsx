import Modal from "@/components/Modal";
import useForm from "@/hooks/useForm";
import { usePage } from "@inertiajs/react";
import { Chip, Fieldset, Group, TextInput, Title } from "@mantine/core";
import ActionButton from "@/components/ActionButton";

export default function RoleModal({ opened, onClose, initialValues = null }) {
  const { shared: { permissions } } = usePage().props;

  const [form, submit, updateValue] = useForm(
    initialValues ? "put" : "post",
    initialValues
      ? route("settings.roles.update", initialValues.id)
      : route("settings.roles.store"),
    {
      name: initialValues?.name || "",
      permissions: initialValues?.permissions || [],
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    submit({
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initialValues ? "Edit Role" : "Create Role"}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {(!initialValues || initialValues.name !== "client") && (
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

        {permissions && Object.keys(permissions).length > 0 && Object.keys(permissions).map((group) => (
          <Fieldset legend={group} key={group} tt="capitalize" mt="sm">
            <Chip.Group
              multiple
              value={form.data.permissions}
              onChange={(values) => updateValue('permissions', values)}
            >
              <Group justify="start" gap="sm">
                {permissions[group].map((permission) => (
                  <Chip
                    key={permission}
                    value={permission}
                    radius="sm"
                    >
                    {permission}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </Fieldset>
        ))}

        <Group justify="flex-end" mt="xl">
          <ActionButton variant="light" onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton loading={form.processing}>
            {initialValues ? "Update" : "Create"}
          </ActionButton>
        </Group>
      </form>
    </Modal>
  );
}
