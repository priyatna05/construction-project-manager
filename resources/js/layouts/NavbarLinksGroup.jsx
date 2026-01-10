import { ActionIcon, Box, Collapse, Group, UnstyledButton, rem } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import useNavigationStore from '@/hooks/store/useNavigationStore';
import { redirectToUrl } from '@/utils/route';
import classes from './css/NavbarLinksGroup.module.css';

export default function NavbarLinksGroup({ item, collapsed, currentPath }) {
  const { toggle } = useNavigationStore();
  const hasLinks = Array.isArray(item.links);

  const normalizePath = path => {
    if (!path) return '';
    try {
      return new URL(path, window.location.origin).pathname;
    } catch (e) {
      return path;
    }
  };

  const isLinkActive = (link, exact = false) => {
    const linkPath = normalizePath(link);
    const current = normalizePath(currentPath);
    if (!linkPath) return false;
    if (exact) return current === linkPath;
    return current === linkPath || current.startsWith(`${linkPath}/`);
  };

  const isSubActive = link => isLinkActive(link?.link);
  const isAnySubActive =
    hasLinks && item.links.some(sub => sub.visible && isSubActive(sub));
  const isParentActive = item.link
    ? isLinkActive(item.link, hasLinks)
    : false;

  const itemClick = () => {
    if (hasLinks) {
      if (item.link) {
        redirectToUrl(item.link);
      }
      if (!item.opened) {
        toggle(item.label);
      }
      return;
    }

    if (item.link) {
      redirectToUrl(item.link);
    }
  };

  const handleToggle = event => {
    event.stopPropagation();
    toggle(item.label);
  };

  const subItemClick = subItem => {
    redirectToUrl(subItem.link);
  };

  return (
    <div className={collapsed ? classes.controlCollapsed : ''}>
      <UnstyledButton
        onClick={itemClick}
        className={`${classes.control} ${isParentActive && !isAnySubActive ? classes.active : ''}`}
      >
        <Group
          justify='space-between'
          gap={0}
        >
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <item.icon
              className={classes.linkIcon}
              stroke={1.5}
            />
            {!collapsed && <Box ml='md'>{item.label}</Box>}

            {collapsed && <span className={classes.tooltip}>{item.label}</span>}
          </Box>

          {!collapsed && hasLinks && (
            <ActionIcon
              component='span'
              variant='subtle'
              size='sm'
              role='button'
              tabIndex={0}
              onClick={handleToggle}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleToggle(event);
                }
              }}
              aria-label={`Toggle ${item.label}`}
            >
              <IconChevronRight
                className={classes.chevron}
                stroke={1.5}
                style={{
                  width: rem(16),
                  height: rem(16),
                  transform: item.opened ? 'rotate(-90deg)' : 'none',
                }}
              />
            </ActionIcon>
          )}
        </Group>
      </UnstyledButton>

      {/* Normal submenu collapse */}
      {!collapsed && hasLinks && (
        <Collapse in={item.opened}>
          {item.links
            .filter(link => link.visible)
            .map(link => (
              <UnstyledButton
                key={link.label}
                className={`${classes.link} ${isSubActive(link) ? classes.active : ''}`}
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
            {item.links
              .filter(link => link.visible)
              .map(link => (
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
    </div>
  );
}
