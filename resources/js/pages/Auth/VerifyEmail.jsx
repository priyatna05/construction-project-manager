import { Link, useForm } from '@inertiajs/react';
import { Button, Text, Title, Paper, Stack, Center, Container } from '@mantine/core';
import GuestLayout from '@/layouts/GuestLayout';

export default function VerifyEmail({ status }) {
  const { post, processing } = useForm({});

  const submit = (e) => {
    e.preventDefault();
    post(route('verification.send'));
  };

  return (
    <GuestLayout title="Verify Email">
      <Container size={420} my={60}>
        <Paper withBorder shadow="md" radius="md" p="xl">
          <Stack>
            <Title order={2} ta="center" fw={700}>
              Verify your email
            </Title>

            <Text c="dimmed" size="sm" ta="center">
              Thanks for signing up! Please verify your email address by clicking the link we just sent. Didn’t receive it? No problem — we can send another.
            </Text>

            {status === 'verification-link-sent' && (
              <Text c="green" fw={500} size="sm" ta="center">
                A new verification link has been sent to your email address.
              </Text>
            )}

            <form onSubmit={submit}>
              <Stack gap="xs" mt="sm">
                <Button type="submit" loading={processing} fullWidth>
                  Resend Verification Email
                </Button>

                <Center>
                  <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Log out
                  </Link>
                </Center>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </GuestLayout>
  );
}
