import FlashNotification from '@/components/FlashNotification';
import { Head } from '@inertiajs/react';
import { Container } from '@mantine/core';

export default function GuestLayout({ title, children }) {
  return (
    <>
      <Head title={title} />

      <FlashNotification />

      <Container>{children}</Container>
    </>
  );
}
