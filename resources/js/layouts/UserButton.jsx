import { redirectTo } from '@/utils/route';
import { getInitials } from '@/utils/user';
import { router, usePage } from '@inertiajs/react';
import {
  Avatar,
  Group,
  Menu,
  Text,
  useComputedColorScheme,
  Tooltip,
} from '@mantine/core';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { useState } from 'react';

export default function UserButton() {
  const { user } = usePage().props.auth;
  const computedColorScheme = useComputedColorScheme();

  const [menuOpened, setMenuOpened] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const goToProfile = () => {
    setMenuOpened(false);
    redirectTo('account.profile.edit');
  };

  const logout = () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    // gunakan Inertia agar redirect & state dibersihkan otomatis
    router.post(route('logout'), {}, {
      preserveState: false,
      onError: error => console.error('Logout failed', error),
      onFinish: () => {
        setIsLoggingOut(false);
        setMenuOpened(false);
      },
    });
  };

  return (
    <>
      <Menu
        opened={menuOpened}
        onChange={setMenuOpened}
        closeOnItemClick={false}
        position='top'
        offset={20}
        withArrow
        shadow='md'
        styles={{
          dropdown: { translate: '0 -12px' },
          cursor: 'pointer',
        }}
      >
        <Menu.Target>
          <Tooltip
            label={user.name + ' Profile'}
            color='blue'
            withArrow
          >
            <Group>
              <Avatar
                data-tour='user-menu'
                src={user.avatar}
                radius='xl'
                color={computedColorScheme === 'light' ? 'white' : 'blue'}
                alt={user.name}
                style={{ cursor: 'pointer',  border: "2px solid light-dark(var(--mantine-color-white), var(--mantine-color-dark-4))" }}
              >
                {getInitials(user.name)}
              </Avatar>
            </Group>
          </Tooltip>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Your Account</Menu.Label>
          <div
            style={{
              marginBottom: 10,
              marginLeft: 15,
              marginTop: 5,
              marginRight: 10,
            }}
          >
            <Text
              size='sm'
              fw={500}
              sx={theme => ({
                color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.dark[9],
              })}
              style={{
                textTransform: 'capitalize',
                lineHeight: 1.3,
              }}
            >
              {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
            </Text>

            <Text
              size='xs'
              c='dimmed'
              style={{
                textTransform: 'capitalize',
              }}
            >
              {user.roles && user.roles.length > 0 ? user.roles.join(', ') : user.job_title}
            </Text>
          </div>
          <Menu.Divider />
          <Menu.Item
            leftSection={<IconUser size={14} />}
            onClick={goToProfile}
          >
            My Profile
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color='red'
            leftSection={<IconLogout size={14} />}
            onClick={logout}
            disabled={isLoggingOut}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      </>
  );
}
