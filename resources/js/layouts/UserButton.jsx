import { redirectTo } from "@/utils/route";
import { getInitials } from "@/utils/user";
import { router, usePage } from "@inertiajs/react";
import {
  Avatar,
  Affix,
  Group,
  Menu,
  Text,
  rem,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import {
  IconLogout,
  IconMoon,
  IconSun,
  IconUser,
} from "@tabler/icons-react";

export default function UserButton() {
  const { user } = usePage().props.auth;
  const { setColorScheme } = useMantineColorScheme({ keepTransition: true });
  const computedColorScheme = useComputedColorScheme();

  const logout = () => {
    router.delete(route("logout"), {
      onSuccess: redirectTo("auth.login.form"),
    });
  };

  return (
    <Affix
      position={{ bottom: 10, left: 110 }}
      zIndex={1000}
    >
    <Menu
      position="right"
      offset={10}
      withArrow
      width={200}
      shadow="md"
      styles={{ dropdown: { translate: "0 -12px" } }}
    >
      <Menu.Target>
          <Group>
            <Avatar
              src={user.avatar}
              radius="xl"
              color={computedColorScheme === "light" ? "white" : "blue"}
              alt={user.name}
            >
              {getInitials(user.name)}
            </Avatar>
          </Group>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Your Account</Menu.Label>
              <Text
                size="sm"
                fw={500}
                sx={(theme) => ({
                  color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.dark[9],
                })}
                mb={10}
                ml={15}
                mt={5}
                mr={10}
                style={{
                  textTransform: "capitalize",
                }}
              >
                {user.name.charAt(0). toUpperCase() + user.name.slice(1)}
              </Text>
        <Menu.Item
          leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => redirectTo("account.profile.edit")}
          >
          My Profile
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={
            computedColorScheme === "light" ? (
              <IconSun style={{ width: rem(14), height: rem(14) }} />
            ) : (
              <IconMoon style={{ width: rem(14), height: rem(14) }} />
            )
          }
          onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
        >
          {upperFirst(computedColorScheme)} mode
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
          onClick={logout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
    </Affix>
  );
}
