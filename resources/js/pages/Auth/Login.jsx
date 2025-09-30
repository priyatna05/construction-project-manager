import { useState } from 'react';
import LoginForm from './FormLogin';
import GuestLayout from '@/layouts/GuestLayout';
import ForgotPasswordForm from './ForgotPassword';
import classes from './css/Login.module.css';

export default function AuthPage({ notify, status }) {
  const [view, setView] = useState('login');

  return (
    <div className={classes.wrapper}>
      <div className={classes.overlay}>
        {view === 'login' ? (
          <LoginForm
            notify={notify}
            onForgotPassword={() => setView('forgot')}
          />
        ) : (
          <ForgotPasswordForm
            status={status}
            onBack={() => setView('login')}
          />
        )}
      </div>
    </div>
  );
}

AuthPage.layout = page => <GuestLayout title='Authentication'>{page}</GuestLayout>;
