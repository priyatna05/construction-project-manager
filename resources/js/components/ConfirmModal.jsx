import { Text, PasswordInput } from '@mantine/core';
import { modals } from '@mantine/modals';
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
  deleteForm,
  confirmProps: customConfirmProps = {},
  closeOnConfirm: _ignoredCloseOnConfirm,
  formOptions = { preserveScroll: true },
  ...props
}) => {
  const typeColors = {
    info: 'blue',
    warning: 'orange',
    danger: 'red',
  };

  void _ignoredCloseOnConfirm;

  const confirmProps = {
    ...customConfirmProps,
    color: customConfirmProps.color || typeColors[type] || 'green',
    loading: false,
  };
  const { zIndex: providedZIndex, ...modalProps } = props || {};
  const resolvedZIndex = providedZIndex ?? 3000;

  let password = '';
  let modalId = '';
  let modalClosed = false;

  const resolveFormOptions = (payload) =>
    typeof formOptions === 'function' ? formOptions(payload) : formOptions || {};

  const submitFormWithPromise = (form, submitOptions = {}) =>
    new Promise((resolve, reject) => {
      form.submit({
        ...submitOptions,
        onSuccess: (...args) => {
          submitOptions?.onSuccess?.(...args);
          resolve(true);
        },
        onError: (errors) => {
          submitOptions?.onError?.(errors);
          reject(errors);
        },
        onCancel: (...args) => {
          submitOptions?.onCancel?.(...args);
          reject(new Error('Request cancelled'));
        },
      });
    });

  const runHandler = async (payload, submitOptions = {}) => {
    if (deleteForm && typeof deleteForm.submit === 'function') {
      const resolved = resolveFormOptions(payload);
      const merged = {
        ...resolved,
        ...submitOptions,
        data: {
          ...(resolved?.data || {}),
          ...(submitOptions?.data || {}),
        },
      };

      return submitFormWithPromise(deleteForm, merged);
    }

    if (onConfirm) {
      const result = onConfirm(payload);
      if (result === false) return false;
      if (result instanceof Promise) {
        const awaited = await result;
        if (awaited === false) return false;
      }
    }

    return true;
  };

  const setLoading = (loading) => {
    if (modalClosed || !modalId) return;

    modals.updateModal({
      modalId,
      confirmProps: { ...confirmProps, loading },
    });
  };

  const closeModal = () => {
    if (modalClosed || !modalId) return;

    modals.close(modalId);
    modalClosed = true;
  };

  modalId = modals.openConfirmModal({
    title: (
      <Text size='xl' fw={700}>
        {title}
      </Text>
    ),
    centered: true,
    overlayProps: { backgroundOpacity: 0.55, blur: 3 },
    zIndex: resolvedZIndex,
    closeOnConfirm: false,
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
            data-autofocus
          />
        )}
      </div>
    ),
    labels: { confirm: confirmLabel, cancel: cancelLabel },
    confirmProps,
    ...modalProps,
    onConfirm: async () => {
      setLoading(true);

      if (requirePassword) {
        try {
          const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
          if (!csrfToken) {
            showNotification({
              title: 'Error',
              message: 'CSRF token not found',
              color: 'red'
            });
            return;
          }

          if (!password?.trim()) {
            showNotification({
              title: 'Error',
              message: 'Please enter your password',
              color: 'red'
            });
            return;
          }

          const response = await axios.post(route('check.password'), { password }, {
            headers: {
              'X-CSRF-TOKEN': csrfToken,
              Accept: 'application/json',
            },
          });

          if (!response.data?.valid) {
            showNotification({
              title: 'Incorrect Password',
              message: 'The password you entered is incorrect. Please try again.',
              color: 'red'
            });
            return;
          }

          const result = await runHandler(password, { data: { password } });

          if (result === false) {
            return;
          }

          closeModal();
        } catch (error) {
          const errorMessage = error.response?.data?.message ||
            error.message ||
            'Failed to verify password. Please try again later.';

          showNotification({
            title: 'Error',
            message: errorMessage,
            color: 'red'
          });
        } finally {
          setLoading(false);
        }
      } else {
        try {
          const result = await runHandler();

          if (result === false) {
            return;
          }

          closeModal();
        } catch (error) {
          const errorMessage = error.response?.data?.message ||
            error.message ||
            'Something went wrong. Please try again.';

          showNotification({
            title: 'Error',
            message: errorMessage,
            color: 'red',
          });
        } finally {
          setLoading(false);
        }
      }
    }
  });
};
