import FlashNotification from '@/components/FlashNotification';
import useNotificationsStore from '@/hooks/store/useNotificationsStore';
import useAuthorization from '@/hooks/useAuthorization';
import useWebSockets from '@/hooks/useWebSockets';
import NavBarNested from '@/layouts/NavBarNested';
import { Head, usePage } from '@inertiajs/react';
import { ActionIcon, AppShell, Group, rem, } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import { TopBar } from '@/layouts/TopBar';

export default function MainLayout({ children, title }) {
  const page = usePage();
  const { auth, item } = page.props;
  const currentPath = (page.url || '').split('?')[0];
  window.can = useAuthorization().can;
  window.auth = auth;
  const [collapsed, setCollapsed] = useState(false);

  const { initUserWebSocket } = useWebSockets();
  const { notifications } = auth;
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

      <TopBar />
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
          {!collapsed && <Logo item={item} style={{ width: rem(120) }} />}
          <ActionIcon
            variant='subtle'
            onClick={() => setCollapsed(prev => !prev)}
          >
            {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
          </ActionIcon>
        </Group>
        <NavBarNested
          collapsed={collapsed}
          currentPath={currentPath}
        />
      </AppShell.Navbar>

      <AppShell.Main
        pt={rem(60)}
        style={{
    backgroundColor: "light-dark(var(--mantine-color-blue-9), var(--mantine-color-dark-8))",
  }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
