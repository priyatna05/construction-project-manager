import { router } from '@inertiajs/react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useEffect, useRef } from 'react';

import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Group,
} from '@mantine/core';
import GuestLayout from '@/layouts/GuestLayout';
import LoginNotification from './LoginNotification';
import GoogleIcon from '@/icons/GoogleIcon';
import QrIcon from '@/icons/QrIcon';
import classes from './css/Login.module.css';

// Logika password strength meter bisa tetap ada, tapi kita sembunyikan dari render
// untuk meniru desain target.
// ... (fungsi getStrength dan requirements)

const LoginForm = ({ notify, onForgotPassword }) => {
  const passwordRef = useRef(null);

  const form = useForm('post', route('auth.login.attempt'), {
    email: route().params?.email || '',
    password: '',
    remember: false,
  });

  useEffect(() => route().params?.email && passwordRef.current?.focus(), [route().params?.email]);

  const submit = e => {
    e.preventDefault();
    form.submit({ preserveScroll: true });
  };

  return (
    <Paper
      className={`${classes.form} ${classes.blurBackground}`}
      radius='md'
      p='lg'
      withBorder
    >
      <Title
        order={2}
        className={classes.title}
      >
        CV Ajat Konstruksi Majalengka
      </Title>
      <Text
        c='dimmed'
        size='sm'
        ta='center'
        mt={5}
      >
        Login to your ConstPM account
      </Text>

      <LoginNotification notify={notify} />

      <form onSubmit={submit}>
        <TextInput
          label='Email'
          placeholder='your@example.com'
          required
          value={form.data.email}
          onChange={e => form.setData('email', e.target.value)}
          onBlur={() => form.validate('email')}
          error={form.errors.email}
          size='md'
          radius='md'
        />
        <PasswordInput
          ref={passwordRef}
          label='Password'
          placeholder='Your password'
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
        >
          Login
        </Button>

        <Divider
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
        </Group>

        <Text
          c='dimmed'
          size='sm'
          ta='center'
          mt='md'
        >
          Don`t have an account?{' '}
          <Anchor
            size='sm'
            component='a'
            onClick={() => router.get(route('coming.soon'))}
          >
            Sign up / Upcoming Feature
          </Anchor>
        </Text>
      </form>
    </Paper>
  );
};

LoginForm.layout = page => <GuestLayout title='Login'>{page}</GuestLayout>;

export default LoginForm;
