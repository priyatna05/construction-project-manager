import { useState } from 'react';
import LoginForm from './FormLogin';
import GuestLayout from '@/layouts/GuestLayout';
import ForgotPasswordForm from './ForgotPassword';
import classes from './css/Login.module.css';
import FloatingNavbar from '../Landing/Dist/FloatingNavbar';
import { motion } from 'motion/react';
import { usePage } from '@inertiajs/react';

export default function AuthPage({ notify, status }) {
  const { item } = usePage().props;
  const [view, setView] = useState('login');

  return (
    <div className={classes.wrapper}>
      <FloatingNavbar item={item} consultationButton={false} menuPosition="flex-end"/>
      <div className={classes.videoContainer}>
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={classes.videoBackground}
          >
          <source
            src='/storage/assets/background.mp4'
            type='video/mp4'
            />
        </motion.video>
            </div>
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
