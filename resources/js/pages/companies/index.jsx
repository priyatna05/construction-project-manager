import {
  Title,
  Text,
  Button,
  Group,
  Stack,
  ThemeIcon,
  Box,
} from '@mantine/core';
import { IconHammer, IconLogin } from '@tabler/icons-react';
import { router } from '@inertiajs/react';
import classes from './index.module.css';

export default function Index() {
  const goToLogin = () => router.visit('/login');

  return (
    <div className={classes.wrapper}>
      <video
        autoPlay
        muted
        loop
        playsInline
        className={classes.videoBackground}
      >
        <source src="/storage/assets/background.mp4" type="video/mp4" />
      </video>

      <Box className={classes.content}>
        <Stack spacing="xl" align="center">
          <ThemeIcon radius="xl" size={64} color="blue" variant="light">
            <IconHammer size={32} />
          </ThemeIcon>

          <Title order={1}>Exciting Feature Incoming!</Title>

          <Text size="lg" c="gray.1">
            We’re building something powerful for construction project managers.
            Soon, you’ll be able to manage tasks, inventory, team members, and more — all in one intuitive platform.
          </Text>

          <Text size="sm" c="gray.3">
            This page is still under development, but you can already log in and explore the rest of the system.
          </Text>

          <Group mt="md">
            <Button
              leftSection={<IconLogin size={16} />}
              onClick={goToLogin}
              variant="filled"
              color="blue"
              radius="xl"
            >
              Go to Login
            </Button>
          </Group>
        </Stack>
      </Box>
    </div>
  );
}
