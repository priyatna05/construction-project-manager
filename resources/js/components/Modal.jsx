import { Modal as MantineModal } from '@mantine/core';
export default function Modal({ opened, onClose, title, children, ...props }) {
  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      title={title}
      size='lg'
      {...props}
    >
      {children}
    </MantineModal>
  );
}
