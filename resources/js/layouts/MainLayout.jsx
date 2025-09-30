import FlashNotification from '@/components/FlashNotification';
import useNotificationsStore from '@/hooks/store/useNotificationsStore';
import useAuthorization from '@/hooks/useAuthorization';
import useWebSockets from '@/hooks/useWebSockets';
import NavBarNested from '@/layouts/NavBarNested';
import { Head, usePage } from '@inertiajs/react';
import { ActionIcon, Affix, AppShell, Button, Group, rem } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import { SearchInput } from '@/components/SearchInput';

export default function MainLayout({ children, title }) {
  window.can = useAuthorization().can;
  const [collapsed, setCollapsed] = useState(false);

  const { initUserWebSocket } = useWebSockets();
  const { notifications } = usePage().props.auth;
  const { setNotifications } = useNotificationsStore();

  useEffect(() => {
    initUserWebSocket();
    setNotifications(notifications);
  }, []);

  return (
    <AppShell
      navbar={{ width: collapsed ? 80 : 300, breakpoint: 'sm', collapsed: { mobile: true } }}
      padding='4rem'
    >
      <Head title={title} />

      <FlashNotification />
      <SearchInput
        renderTriger={({ onClick }) => (
          <Affix
            position={{ bottom: 10, left: 27 }}
            zIndex={1000}
          >
            <Button
              radius='xl'
              size='md'
              variant='filled'
              color='blue'
              px={0}
              onClick={onClick}
              style={{
                width: 35,
                height: 35,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSearch
                size={20}
                color='white'
              />
            </Button>
          </Affix>
        )}
      />
      <AppShell.Navbar
        className='navbar'
        pl='md'
        pt='md'
        pb='md'
      >
        <Group
          justify={collapsed ? 'center' : 'space-between'}
          p='xs'
          gap='xs'
        >
          {!collapsed && <Logo style={{ width: rem(120) }} />}
          <ActionIcon
            variant='subtle'
            onClick={() => setCollapsed(prev => !prev)}
          >
            {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
          </ActionIcon>
        </Group>
        <NavBarNested collapsed={collapsed} />
      </AppShell.Navbar>

      <AppShell.Main
        pt={`calc(${rem(60)} + var(--mantine-spacing-md))`}
        style={{ backgroundColor: 'var(--mantine-color-blue-9)' }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
