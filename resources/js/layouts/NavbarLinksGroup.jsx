import Notifications from "@/layouts/Notifications";
import UserButton from "@/layouts/UserButton";
import { Box, Collapse, Group, UnstyledButton, rem } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import useNavigationStore from "@/hooks/store/useNavigationStore";
import { redirectToUrl } from "@/utils/route";
import classes from "./css/NavbarLinksGroup.module.css";

export default function NavbarLinksGroup({ item, collapsed }) {
  const { toggle, active } = useNavigationStore();
  const hasLinks = Array.isArray(item.links);

  const itemClick = () => {
    if (hasLinks) {
      toggle(item.label);
    } else {
      active(item.label, false);
      redirectToUrl(item.link);
    }
  };

  const subItemClick = (subItem) => {
    active(subItem.label, true);
    redirectToUrl(subItem.link);
  };

  return (
    <div className={collapsed ? classes.controlCollapsed : ""}>
      <UnstyledButton
        onClick={itemClick}
        className={`${classes.control} ${item.active ? classes.active : ""}`}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <item.icon className={classes.linkIcon} stroke={1.5} />
            {!collapsed && <Box ml="md">{item.label}</Box>}

            {collapsed && (
              <span className={classes.tooltip}>
                {item.label}
              </span>
            )}
          </Box>

          {!collapsed && hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              style={{
                width: rem(16),
                height: rem(16),
                transform: item.opened ? "rotate(-90deg)" : "none",
              }}
            />
          )}
        </Group>
      </UnstyledButton>

      {/* Normal submenu collapse */}
      {!collapsed && hasLinks && (
        <Collapse in={item.opened}>
          {item.links.filter(link => link.visible).map(link => (
            <UnstyledButton
              key={link.label}
              className={`${classes.link} ${link.active ? classes.active : ""}`}
              onClick={() => subItemClick(link)}
            >
              {link.label}
            </UnstyledButton>
          ))}
        </Collapse>
      )}

      {/* Flyout submenu on hover (only for collapsed state) */}
      {collapsed && hasLinks && (
        <div className={classes.submenuTooltip}>
          <ul className={classes.submenuList}>
            {item.links.filter(link => link.visible).map(link => (
              <li
                key={link.label}
                className={classes.submenuItem}
                onClick={() => subItemClick(link)}
              >
                {link.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <UserButton />
      <Notifications />
    </div>
  );
}
