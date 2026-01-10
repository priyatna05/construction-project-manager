import { Group, Text, Tooltip, Avatar, Box } from "@mantine/core";
import { forwardRef } from "react";

const colors = ["blue", "green", "teal", "grape", "violet", "cyan", "orange"];

const CompanyItem = forwardRef(({ label, option, ...others }, ref) => {
  const users = option?.users || [];

  return (
    <Box ref={ref} {...others}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text fw={500}>{label}</Text>

        <Group gap="xs" wrap="nowrap">
          (

          {users.slice(0, 3).map((u) => {
            const color = colors[u.id % colors.length];
            return (
              <Tooltip
                key={u.id}
                label={u.full_name}
                withArrow
                transitionProps={{ transition: "fade", duration: 150 }}
              >
                <Avatar
                  size="xs"
                  radius="xl"
                  color={color}
                  variant="filled"
                  style={{ cursor: "pointer" }}
                  src={u.avatar}
                >
                  {u.initial}
                </Avatar>
              </Tooltip>
            );
          })}

          {users.length > 3 && (
            <Text size="xs" c="dimmed">
              +{users.length - 3}
            </Text>
          )}
        )
        </Group>
      </Group>
    </Box>
  );
});

CompanyItem.displayName = "CompanyItem";

export default CompanyItem;
