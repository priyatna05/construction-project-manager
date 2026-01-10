import { Group, Button, ActionIcon, Tooltip } from '@mantine/core';
import { IconArrowRight, IconArrowLeft } from '@tabler/icons-react';

export default function StepNavigation({ active, nextStep, prevStep, form, existingProjectNames = [] }) {
  const isFormValid = () => {
    const data = form.data;
    const isUniqueName = !existingProjectNames.includes(data.name?.trim());
    return (
      data.name &&
      (data.client_company_id || data.client_user_id) &&
      data.start_date &&
      data.end_date &&
      data.users && data.users.length > 0 &&
      isUniqueName
    );
  };

  return (
    <Group justify="center" mt="xl" gap="md">
      {active > 0 && (
        <Tooltip label="Previous step" color="blue" withArrow>
        <ActionIcon
          variant="light"
          color="blue"
          radius="xl"
          size="lg"
          onClick={prevStep}
          >
          <IconArrowLeft size={22} />
        </ActionIcon>
       </Tooltip>
      )}

      {active < 4 ? (
        <Tooltip label="Next step" color="blue" withArrow>
        <ActionIcon
          variant="filled"
          color="blue"
          radius="xl"
          size="lg"
          onClick={nextStep}
          >
          <IconArrowRight size={22} />
        </ActionIcon>
          </Tooltip>
      ) : (
        <Tooltip
          label={
            !isFormValid()
              ? existingProjectNames.includes(form.data.name?.trim())
                ? 'Project name already exists'
                : 'Please fill all required fields'
              : ''
          }
          disabled={isFormValid()}
          position="top"
        >
          <Button
            type="submit"
            loading={form.processing}
            radius="xl"
            size="md"
            disabled={!isFormValid()}
          >
            Create Project Now!
          </Button>
        </Tooltip>
      )}
    </Group>
  );
}
