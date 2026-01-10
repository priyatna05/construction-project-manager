import { useEffect, useState } from 'react';
import { Affix, ActionIcon, Tooltip, Transition, rem } from '@mantine/core';
import { IconWifiOff, IconSignal2g } from '@tabler/icons-react';
import classes from '../components/css/NetworkStatusDetector.module.css';

export default function NetworkStatusDetector() {
  const [status, setStatus] = useState('online');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setStatus('online');
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    const handleConnectionChange = () => {
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }

      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (connection?.effectiveType) {
        const effectiveType = connection.effectiveType;

        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setStatus('slow');
        } else if (effectiveType === '3g') {
          setStatus('moderate'); // kalau mau bisa diperlakukan sebagai online juga
        } else {
          setStatus('online');
        }
      } else {
        setStatus('online');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // init pertama kali
    if (!navigator.onLine) {
      handleOffline();
    } else {
      handleConnectionChange();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  const isOffline = status === 'offline';
  const isSlow = status === 'slow';

  // hanya tampil kalau ada masalah
  const visible = isOffline || isSlow;

  const tooltipLabel = isOffline
    ? 'No internet connection'
    : 'Your connection is very slow';

  return (
    <Affix position={{ bottom: 16, right: 16 }}>
      <Transition
        mounted={visible}
        transition="pop"
        duration={200}
        timingFunction="ease-out"
      >
        {(styles) => (
          <Tooltip
            label={tooltipLabel}
            position="left"
            withArrow
            color="red"
          >
            <ActionIcon
              variant="filled"
              color="red"
              radius="xl"
              size={rem(42)}
              style={styles}
              className={classes.signalIcon}
            >
              {isOffline ? (
                <IconWifiOff size={22} />
              ) : (
                <IconSignal2g size={22} />
              )}
            </ActionIcon>
          </Tooltip>
        )}
      </Transition>
    </Affix>
  );
}
