import { usePage } from '@inertiajs/react';
import { Notification, Box, Transition, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import { IconAlertCircle, IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-react';
import { useFlashStore } from '@/hooks/store/useFlashStore';
import classes from './css/FlashNotification.module.css';

const iconProps = { style: { width: rem(50), height: rem(50) }, stroke: 2 };

const types = {
  info: { color: 'blue', timeout: 8000, icon: <IconInfoCircle {...iconProps} /> },
  success: { color: 'green', timeout: 150000, icon: <IconCircleCheck {...iconProps} /> },
  warning: { color: 'yellow', timeout: 10000, icon: <IconAlertCircle {...iconProps} /> },
  error: { color: 'red', timeout: 10000, icon: <IconCircleX {...iconProps} /> },
};

export default function FlashNotification() {
  const [opened, { open, close }] = useDisclosure(false);
  const { flash: inertiaFlash } = usePage().props;
  const { flash: localFlash, clearFlash } = useFlashStore();

  // 🔹 Prioritaskan flash dari store, kalau tidak ada ambil dari inertia
  const flash = localFlash || inertiaFlash;
  const flashType = types[flash?.type] ? flash.type : 'info';

  useEffect(() => {
    if (!flash?.message) return;

    open();
    const timeoutId = setTimeout(() => {
      close();
      clearFlash();
    }, types[flashType].timeout);

    return () => clearTimeout(timeoutId);
  }, [flash]);

  if (!flash?.message) return null;

  return (
    <Transition
      mounted={opened}
      transition={{
        in: { opacity: 1, transform: 'translateY(0)' },
        out: { opacity: 0, transform: 'translateY(-20px)' },
        common: { transformOrigin: 'top right' },
        transitionProperty: 'opacity, transform',
      }}
      duration={300}
      exitDuration={400}
      timingFunction='ease-out'
    >
      {styles => (
        <Box
          mb='lg'
          style={{ ...styles, zIndex: 5000 }}
          className={classes.container}
        >
          <Notification
            color={types[flashType].color}
            title={flash.title || flashType.toUpperCase()}
            icon={types[flashType].icon}
            classNames={{
              icon: classes.icon,
              title: classes.title,
              label: classes.label,
              message: classes.message,
            }}
            radius='md'
            withCloseButton
            onClose={() => {
              close();
              clearFlash();
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: flash.message }} />
          </Notification>
        </Box>
      )}
    </Transition>
  );
}
