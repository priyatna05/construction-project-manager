import { Box, Center, Stack, Stepper, Text, ThemeIcon, Title, Transition } from '@mantine/core';
import { useState } from 'react';
import Modal from '@/components/Modal';
import StepBasicInfo from '../Projects/Index/Steper/StepBasicInfo';
import StepTimelineBudget from '../Projects/Index/Steper/StepTimelineBudget';
import StepConfiguration from '../Projects/Index/Steper/StepConfiguration';
import StepAttachmentsFramework from '../Projects/Index/Steper/StepAttachmentsFramework';
import StepNavigation from '../Projects/Index/Steper/StepNavigation';
import StepReview from '../Projects/Index/Steper/StepReview';
import { IconCircleCheck } from '@tabler/icons-react';

export default function CreateProject({
  opened,
  onClose,
  form,
  dropdowns,
  project,
  can,
  currencySymbol,
  updateValue,
  removeAttachment,
  getFrameworkDropdownData,
  selectedType,
  getIcon,
  renderSelectOptionWithIcon,
  suggestion,
  existingProjectNames,
}) {
  const TOTAL_STEPS = 5;
  const [active, setActive] = useState(0);

  const nextStep = () => setActive(cur => (cur < TOTAL_STEPS ? cur + 1 : cur));

  const prevStep = () => setActive(cur => (cur > 0 ? cur - 1 : cur));

  const handleSubmit = e => {
    e.preventDefault();
  const formatLocalDate = d => {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const payload = {
    ...form.data,
    start_date: form.data.start_date ? formatLocalDate(form.data.start_date) : null,
    end_date: form.data.end_date ? formatLocalDate(form.data.end_date) : null,
  };

    form.post(route('projects.store'), {
      onSuccess: () => {
        setActive(TOTAL_STEPS);
        setTimeout(() => {
          onClose();
          form.reset();
          setActive(0);
        }, 2500);
      },
      data: payload,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title='Create New Project'
      size='auto'
      radius='md'
      padding='xl'
      centered
      draggable
      closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
      overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      <form onSubmit={handleSubmit}>
        <Stepper
          active={active}
          onStepClick={setActive}
          allowNextStepsSelect={false}
          color='blue'
          size='sm'
        >
          <Stepper.Step
            label='Basic Info'
            description='Project details'
          >
            <Center>
              <Box
                w='80%'
                maw={720}
              >
                <StepBasicInfo
                  form={form}
                  dropdowns={dropdowns}
                  updateValue={updateValue}
                  suggestion={suggestion}
                  can={can}
                />
              </Box>
            </Center>
          </Stepper.Step>

          <Stepper.Step
            label='Timeline & Budget'
            description='Dates and funding'
          >
            <Center>
              <Box
                w='80%'
                maw={720}
              >
                <StepTimelineBudget
                  form={form}
                  updateValue={updateValue}
                  currencySymbol={currencySymbol}
                  can={can}
                />
              </Box>
            </Center>
          </Stepper.Step>

          <Stepper.Step
            label='Configuration'
            description='Project setup'
          >
            <Center>
              <Box
                w='80%'
                maw={720}
              >
                <StepConfiguration
                  form={form}
                  dropdowns={dropdowns}
                  updateValue={updateValue}
                  selectedType={selectedType}
                  getIcon={getIcon}
                  renderSelectOptionWithIcon={renderSelectOptionWithIcon}
                  can={can}
                />
              </Box>
            </Center>
          </Stepper.Step>

          <Stepper.Step
            label='Attachments'
            description='Files and framework'
          >
            <Center>
              <Box
                w='80%'
                maw={720}
              >
                <StepAttachmentsFramework
                  form={form}
                  project={project}
                  dropdowns={dropdowns}
                  updateValue={updateValue}
                  removeAttachment={removeAttachment}
                  getFrameworkDropdownData={getFrameworkDropdownData}
                  can={can}
                />
              </Box>
            </Center>
          </Stepper.Step>

          <Stepper.Step
            label='Review'
            description='Confirm details'
          >
            <Center>
              <Box
                w='80%'
                maw={720}
              >
                <StepReview
                  form={form}
                  currencySymbol={currencySymbol}
                  selectedType={selectedType}
                  dropdowns={dropdowns}
                  existingProjectNames={existingProjectNames}
                />
              </Box>
            </Center>
          </Stepper.Step>

          <Stepper.Completed>
            <Center mih={260}>
              <Transition
                mounted={active === TOTAL_STEPS}
                transition='pop'
                duration={300}
                timingFunction='ease-out'
              >
                {styles => (
                  <Stack
                    align='center'
                    gap='xs'
                    style={styles}
                  >
                    <ThemeIcon
                      radius='xl'
                      size={72}
                      color='green'
                      variant='light'
                    >
                      <IconCircleCheck size={40} />
                    </ThemeIcon>

                    <Title
                      order={3}
                      ta='center'
                      mt='sm'
                    >
                      Project created!
                    </Title>

                    <Text
                      size='sm'
                      c='dimmed'
                      ta='center'
                      maw={320}
                    >
                      Your project has been created successfully. You can close this dialog or start
                      working on the project from the list.
                    </Text>
                                  </Stack>
                )}
              </Transition>
            </Center>
          </Stepper.Completed>
        </Stepper>

        <StepNavigation
          active={active}
          nextStep={nextStep}
          prevStep={prevStep}
          form={form}
          existingProjectNames={existingProjectNames}
        />
      </form>
    </Modal>
  );
}
