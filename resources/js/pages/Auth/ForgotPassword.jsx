import { Alert, Anchor, Button, Group, Text, TextInput, Title, Paper } from '@mantine/core';
import { IconArrowLeft, IconInfoCircle, IconMail } from '@tabler/icons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import classes from './css/Login.module.css';
import { useComputedColorScheme } from '@mantine/core';

export default function ForgotPasswordForm({ status, onBack }) {
  const form = useForm('post', route('auth.forgotPassword.sendLink'), {
    email: '',
  });
  const scheme = useComputedColorScheme('light');
  const cardClass = `${classes.form} ${classes.blurBackground} ${scheme === 'dark' ? classes.darkCard : ''}`;

  const submit = e => {
    e.preventDefault();
    form.clearErrors();

    form.submit({ preserveScroll: true });
  };

  return (
    <>
      <Paper
        className={cardClass}
        radius='md'
        p='lg'
        withBorder
      >
        <Title
          className={classes.title}
          ta='center'
        >
          Forgot your password?
        </Title>
        <Text
          c='dimmed'
          fz='sm'
          ta='center'
        >
          Enter your email to get a reset link
        </Text>
        <Text
          c='dimmed'
          fz='sm'
          mb={20}
          ta='center'
        >
          That will allow you to choose a new one.
        </Text>

        {status && (
          <Alert
            radius='md'
            title={status}
            icon={<IconInfoCircle />}
            mb={10}
          >
            Please read instruction in the email to set a new password for your account.
          </Alert>
        )}

        <form onSubmit={submit}>
          <TextInput
            label='Email'
            placeholder='Your email'
            leftSection={
                          <IconMail
                            size={18}
                            stroke={1.5}
                          />
                        }
            required
            onChange={e => form.setData('email', e.target.value)}
            onBlur={() => form.validate('email')}
            error={form.errors.email}
          />
          <Group
            justify='space-between'
            mt='lg'
          >
            <Anchor
              onClick={onBack}
              size='sm'
              c='dimmed'
            >
              <IconArrowLeft
                size={14}
                style={{ marginRight: 5 }}
              />
              Back to login
            </Anchor>
            <Button
              type='submit'
              disabled={form.processing}
              loading={form.processing}
            >
              Reset Password
            </Button>
          </Group>
        </form>
      </Paper>
    </>
  );
}
