import { useForm, usePage } from '@inertiajs/react';
import { Anchor, Button, Title, Text, Center, Group, TextInput, Alert } from '@mantine/core';
import { useRef, useState } from 'react';
import FloatingNavbar from '../Landing/Dist/FloatingNavbar';
import ContainerBox from '@/layouts/ContainerBox';
import { motion } from 'motion/react';
import classes from './css/ResetPassword.module.css';
import { IconInfoCircle, IconMailCheck } from '@tabler/icons-react';

export default function VerifyOtp() {
  const { item } = usePage().props;
  const { data, setData, post, processing, errors } = useForm({
    otp: '',
  });

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    // Hanya terima angka
    if (value && !/^\d$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Update form data dengan gabungan semua nilai
    setData('otp', newOtpValues.join(''));

    // Auto focus ke input berikutnya jika ada nilai
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: hapus current value, atau pindah ke previous jika kosong
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Arrow keys navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = e => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    // Hanya terima angka
    if (!/^\d+$/.test(pastedData)) return;

    const newOtpValues = pastedData.split('');
    while (newOtpValues.length < 6) {
      newOtpValues.push('');
    }

    setOtpValues(newOtpValues);
    setData('otp', newOtpValues.join(''));

    // Focus ke input terakhir yang terisi atau yang kosong pertama
    const nextEmptyIndex = newOtpValues.findIndex(val => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const submit = e => {
    e.preventDefault();
    post(route('otp.verify.post'));
  };

  const handleResendCode = () => {
    post(route('otp.resend'), {
      onSuccess: () => {
        setResendSuccess(true);
        // Reset OTP values
        setOtpValues(['', '', '', '', '', '']);
        setData('otp', '');
        inputRefs.current[0]?.focus();

        // Hide success message after 5 seconds
        setTimeout(() => {
          setResendSuccess(false);
        }, 5000);
      },
    });
  };

  return (
    <div className={classes.pageWrapper}>
      {/* Floating Navbar */}
      <FloatingNavbar
      item={item}
        consultationButton={false}
        menuPosition='flex-end'
      />

      {/* VIDEO BACKGROUND */}
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
        className={classes.videoBackground}
      >
        <source
          src='/storage/assets/background.mp4'
          type='video/mp4'
        />
      </motion.video>

      {/* FORM CARD */}
      <Center className={classes.centerBox}>
        <ContainerBox
          shadow='md'
          p={30}
          radius='md'
          className={classes.formBox}
        >
          <Title
            className={classes.title}
            ta='center'
          >
            Verify your account
          </Title>

          <div
            style={{
              minHeight: '80px',
              marginBottom: '1.5rem',
              marginTop: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '100%' }}>
              {errors.otp ? (
                <Alert
                  icon={<IconInfoCircle size={20} />}
                  color='red'
                  variant='light'
                  styles={{
                    root: {
                      animation: 'slideDown 0.3s ease-out',
                    },
                  }}
                >
                  <Text
                    size='sm'
                    fw={500}
                  >
                    {errors.otp}
                  </Text>
                </Alert>
              ) : resendSuccess ? (
                // Success Alert
                <Alert
                  icon={<IconMailCheck size={20} />}
                  color='green'
                  variant='light'
                  styles={{
                    root: {
                      animation: 'slideDown 0.3s ease-out',
                    },
                  }}
                >
                  <Text
                    size='sm'
                    fw={500}
                  >
                    The OTP code has been successfully resend!
                  </Text>
                  <Text
                    size='xs'
                    c='dimmed'
                    mt={4}
                  >
                    Please chek your email to get a new OTP.
                  </Text>
                </Alert>
              ) : (
                // Default Text
                <Text
                  ta='center'
                  c='dimmed'
                >
                  Enter the code that has been sent to your email to activate the account
                </Text>
              )}
            </div>
          </div>
          <form onSubmit={submit}>
            <div>
              <Center>
                <Group
                  spacing='xs'
                  mb='xs'
                >
                  {otpValues.map((value, index) => (
                    <TextInput
                      key={index}
                      ref={el => (inputRefs.current[index] = el)}
                      value={value}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      maxLength={1}
                      styles={{
                        input: {
                          width: 40,
                          height: 56,
                          textAlign: 'center',
                          fontSize: '24px',
                          fontWeight: 600,
                          padding: 0,
                          borderWidth: 2,
                          borderColor: 'blue',
                          borderRadius: 8,
                          boxShadow: '0 0 0 1px #1e40af',
                        },
                      }}
                      error={errors.otp && index === 0}
                    />
                  ))}
                </Group>
              </Center>
            </div>

            <Button
              type='submit'
              fullWidth
              loading={processing}
              mt='xl'
              disabled={data.otp.length !== 6}
            >
              Verifikasi
            </Button>
          </form>

          <Text
            ta='center'
            mt='md'
            size='sm'
            c='dimmed'
          >
            Didn`t recive the code?{' '}
            <Anchor
              size='sm'
              component='button'
              onClick={handleResendCode}
              type='button'
            >
              Resend
            </Anchor>
            {' – The code is vakid for 24 hours'}
          </Text>
        </ContainerBox>
      </Center>
    </div>
  );
}
