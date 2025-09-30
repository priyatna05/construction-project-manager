import { Text, PasswordInput } from '@mantine/core';
import { openConfirmModal as openMantineConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';

export const openConfirmModal = ({
  type = 'info',
  title,
  content,
  confirmLabel,
  cancelLabel = 'Cancel',
  requirePassword = false,
  onConfirm,
  ...props
}) => {
  const typeColors = {
    info: 'blue',
    warning: 'orange',
    danger: 'red',
  };

  let password = '';

  openMantineConfirmModal({
    title: (
      <Text
        size='xl'
        fw={700}
      >
        {title}
      </Text>
    ),
    centered: true,
    overlayProps: { backgroundOpacity: 0.55, blur: 3 },
    children: (
      <div>
        {typeof content === 'string' ? <Text size='sm'>{content}</Text> : content}
        {requirePassword && (
          <PasswordInput
            label='Enter your password'
            placeholder='Your password'
            required
            mt='md'
            onChange={e => (password = e.currentTarget.value)}
          />
        )}
      </div>
    ),
    labels: { confirm: confirmLabel, cancel: cancelLabel },
    confirmProps: { color: typeColors[type] || 'blue' },
    ...props,
    onConfirm: async () => {
      if (requirePassword) {
        try {
          const response = await axios.post(route('check.password'), {
            password,
          });

          if (response.data.valid) {
            onConfirm?.(password);
          } else {
            showNotification({
              title: 'Incorrect password',
              message: 'The password you entered is incorrect.',
              color: 'red',
            });
          }
        } catch (error) {
          showNotification({
            title: 'Error',
            message: 'Failed to verify password.',
            color: 'red',
          });
        }
      } else {
        onConfirm?.();
      }
    },
  });
};
