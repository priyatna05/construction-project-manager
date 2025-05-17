import { Modal as MantineModal } from '@mantine/core';
export default function Modal({
  opened,
  onClose,
  title,
  children,
  size="auto",
  ...props
}) {
  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      withCloseButton={false}
      {...props}
      >
      {children}
    </MantineModal>
  );
}
