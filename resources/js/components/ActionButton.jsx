import { Button } from '@mantine/core';

export default function ActionButton({ children, type, loading, ...props }) {
  return (
    <Button
      size='md'
      component="button"
      type={type}
      loading={loading}
      {...props}
    >
      {children}
    </Button>
  );
}
