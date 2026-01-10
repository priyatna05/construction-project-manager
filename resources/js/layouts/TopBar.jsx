import {
  Affix,
  Box,
  Group,
  Paper,
  Text,
  Kbd,
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
  useComputedColorScheme,
  useMantineTheme,
  Menu,
} from '@mantine/core';
import { IconSearch, IconMoon, IconSun, IconMenu2 } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { ModalSearch } from '../components/ModalSearch';
// import LangToggle from '@/pages/Landing/Dist/LangToggle';
import Notifications from '@/layouts/Notifications';
import UserButton from '@/layouts/UserButton';
// import useTour from '@/hooks/useTour';
import Notes from '@/layouts/Notes';

export function TopBar() {
  const { setColorScheme } = useMantineColorScheme({ keepTransition: true });
  const computedColorScheme = useComputedColorScheme('light');
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [menuOpened, setMenuOpened] = useState(false);
  // const { start } = useTour();

  const toggleColorScheme = () => {
    const next = computedColorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-mantine-color-scheme', next);
    }
  };
  const openSearch = () => {
    try {
      window.dispatchEvent(new CustomEvent('open-search', { detail: {} }));
    } catch (e) {
      console.error(e);
    }
  };

  // Ctrl + K shortcut
  useEffect(() => {
    /** @param {KeyboardEvent} e */
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const renderSearchTrigger = () => {
    if (isMobile) {
      return (
        <Tooltip
          label='Search'
          withArrow
        >
          <ActionIcon
            radius='xl'
            size='lg'
            variant='default'
            onClick={handleMenuSearch}
            aria-label='Open search'
          >
            <IconSearch size={18} />
          </ActionIcon>
        </Tooltip>
      );
    }

    return (
      <Box
        component={motion.div}
        whileHover={{ scale: 1.02, boxShadow: '0 6px 18px rgba(15,23,42,0.08)' }}
        whileTap={{ scale: 0.97 }}
        style={{ cursor: 'pointer' }}
      >
        <Paper
          radius='md'
          withBorder
          px='sm'
          py={6}
          onClick={handleMenuSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor:
              computedColorScheme === 'light' ? theme.white : theme.colors.dark[6],
            minWidth: 190,
          }}
        >
          <IconSearch
            size={16}
            stroke={1.8}
            color={
              computedColorScheme === 'dark' ? theme.colors.gray[1] : theme.colors.gray[8]
            }
          />
          <Text
            size='sm'
            c='dimmed'
          >
            Search
          </Text>
          <Box
            ml='auto'
            px='xs'
            py={2}
          >
            <Kbd size='xs' style={{
              border: `1px solid ${
                computedColorScheme === 'light' ? theme.colors.dark[4] : theme.colors.gray[2]
              }`,
              borderRadius: theme.radius.sm,
            }}>Ctrl + K</Kbd>
          </Box>
        </Paper>
      </Box>
    );
  };

  const handleMenuSearch = () => {
    setMenuOpened(false);
    openSearch();
  };

  const handleMenuThemeToggle = () => {
    toggleColorScheme();
    setMenuOpened(false);
  };

  return (
    <Affix
      position={{ top: 20, right: 20 }}
      zIndex={2000}
    >
      <Group gap='xs'>
        <ModalSearch
          renderTriger={renderSearchTrigger}
        />
        {isMobile ? (
          <Menu
            shadow='md'
            width={260}
            position='bottom-end'
            offset={6}
            closeOnItemClick={false}
            opened={menuOpened}
            onClose={() => setMenuOpened(false)}
          >
            <Menu.Target>
              <ActionIcon
                radius='xl'
                size='lg'
                variant='filled'
                aria-label='Open quick menu'
                onClick={() => setMenuOpened(o => !o)}
              >
                <IconMenu2 size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Quick actions</Menu.Label>
              <Menu.Item
                leftSection={<IconSearch size={16} />}
                onClick={handleMenuSearch}
              >
                Search
              </Menu.Item>
              <Menu.Item
                leftSection={
                  computedColorScheme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />
                }
                onClick={handleMenuThemeToggle}
              >
                Switch to {computedColorScheme === 'light' ? 'dark' : 'light'} mode
              </Menu.Item>
              <Menu.Divider />
              <Box px='xs' pb='xs'>
                <Group gap='sm'>
                  <Notes />
                  <Notifications />
                  <UserButton />
                </Group>
              </Box>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <>
            <Tooltip
              label={`Switch to ${computedColorScheme === 'light' ? 'dark' : 'light'} mode`}
              withArrow
            >
              <Box
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ActionIcon
                  radius='xl'
                  size='lg'
                  variant='filled'
                  onClick={toggleColorScheme}
                  aria-label='Toggle color scheme'
                  style={{
                    width: 37,
                    height: 37,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor:
                        computedColorScheme === 'light' ? theme.white : theme.colors.dark[6],
                    color: computedColorScheme === 'light' ? theme.colors.dark[4] : theme.colors.gray[2],
                  }}
                >
                  {computedColorScheme === 'light' ? <IconSun size={18} /> : <IconMoon size={18} />}
                </ActionIcon>
              </Box>
            </Tooltip>
            <Notes />
            <Notifications />
            <UserButton />
          </>
        )}
      </Group>
    </Affix>
  );
}
