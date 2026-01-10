import { useForm } from 'laravel-precognition-react-inertia';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Group,
  Alert,
} from '@mantine/core';
import GuestLayout from '@/layouts/GuestLayout';
import LoginNotification from './LoginNotification';
import classes from './css/Login.module.css';
import ContactDialog from './ContactDialog';
import { IconLock, IconMail, IconAlertTriangle } from '@tabler/icons-react';
import { useComputedColorScheme } from '@mantine/core';


const LoginForm = ({ notify, onForgotPassword }) => {
  const [opened, setOpened] = useState(false);
  const resetAndClose = () => setOpened(false);
  const passwordRef = useRef(null);
  const scheme = useComputedColorScheme('light');
  const cardClass = `${classes.form} ${classes.blurBackground} ${scheme === 'dark' ? classes.darkCard : ''}`;

  const form = useForm('post', route('auth.login.attempt'), {
    email: route().params?.email || '',
    password: '',
    remember: false,
  });

  useEffect(() => {
    (async () => {
      try {
        await axios.get(route('sanctum.csrf-cookie'));
      } catch (err) {
        // ignore - endpoint may not exist or not necessary
      }
    })();
  }, []);

  useEffect(() => route().params?.email && passwordRef.current?.focus(), [route().params?.email]);

  const submit = e => {
    e.preventDefault();
    (async () => {
      try {
        await axios.get(route('sanctum.csrf-cookie'));
      } catch (err) {
        // Not fatal — we'll still attempt to submit; logging for diagnostics
      }
      form.submit({ preserveScroll: true });
    })();
  };

  return (
    <Paper
      className={cardClass}
      radius='md'
      p='lg'
      withBorder
    >
      <Title
        order={2}
        className={classes.title}
      >
        Log in to Your ConstPM Account
      </Title>
      <Text
        c='dimmed'
        size='sm'
        ta='center'
        mt={5}
      >
        Access your projects and tasks securely.
      </Text>

      <LoginNotification notify={notify} />

      {form.errors.email && (
        <Alert
          radius='md'
          title='Login failed'
          icon={<IconAlertTriangle size={18} />}
          color='red'
          mb='md'
        >
          {form.errors.email}
        </Alert>
      )}

      <form onSubmit={submit}>
        <TextInput
          label='Email'
          placeholder='Your Email'
          required
          leftSection={
            <IconMail
              size={18}
              stroke={1.5}
            />
          }
          value={form.data.email}
          onChange={e => form.setData('email', e.target.value)}
          onBlur={() => form.validate('email')}
          error={false}
          size='md'
          radius='md'
        />
        <PasswordInput
          ref={passwordRef}
          label='Password'
          placeholder='Your password'
          leftSection={
            <IconLock
              size={18}
              stroke={1.5}
            />
          }
          required
          mt='md'
          size='md'
          radius='md'
          value={form.data.password}
          onChange={e => form.setData('password', e.target.value)}
        />
        <Group
          justify='space-between'
          mt='lg'
        >
          <Checkbox
            label='Remember me'
            checked={form.data.remember}
            onChange={event => form.setData('remember', event.currentTarget.checked)}
          />
          <Anchor
            type='button'
            size='sm'
            onClick={onForgotPassword}
          >
            Forgot password?
          </Anchor>
        </Group>
        {/* Password strength meter disembunyikan */}
        <Button
          type='submit'
          fullWidth
          mt='xl'
          size='md'
          radius='md'
          disabled={form.processing}
          loading={form.processing}
        >
          Login
        </Button>
        {/* FEATURE UPCOMING}
        {/* <Divider
          className={classes.divider}
          label='Or continue with'
          labelPosition='center'
          my='lg'
        />

        <Group
          className={classes.altLogin}
          grow
          mb='md'
          mt='md'
        >
          <Button
            size='md'
            radius='md'
            variant='default'
            leftSection={<GoogleIcon />}
            component='a'
            href={route('auth.login.social.google')}
          >
            Google
          </Button>
          <Button
            size='md'
            radius='md'
            variant='default'
            leftSection={<QrIcon />}
          >
            Scan QR
          </Button>
        </Group> */}
      </form>

      <Text
        c='dimmed'
        size='sm'
        ta='center'
        mt='md'
      >
        Don`t have an account?{' '}
        <Anchor
          component='button'
          size='sm'
          onClick={() => setOpened(true)}
          style={{ cursor: 'pointer' }}
        >
          Contact us
        </Anchor>
      </Text>
      <ContactDialog
        opened={opened}
        resetAndClose={resetAndClose}
        initialEmail={form.data.email}
      />
    </Paper>
  );
};

LoginForm.layout = page => <GuestLayout title='Login'>{page}</GuestLayout>;

export default LoginForm;
