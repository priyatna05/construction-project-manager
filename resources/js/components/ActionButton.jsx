import { Button } from '@mantine/core';

export default function ActionButton({ children, type, loading, ...props }) {
  return (
    <Button
      size='md'
      type={type}
      loading={loading}
      {...props}
    >
      {children}
    </Button>
  );
}
