import { TextInput, UnstyledButton, Stack, Text, Modal, Box, Group, Collapse } from '@mantine/core';
import { IconSearch, IconCircleDashed, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import classes from './css/SearchInput.module.css';
import { getMenuItems } from '@/utils/ListMenu';

export function SearchInput({ renderTriger }) {
  const [opened, setOpened] = useState(false);
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 250);
  const [expandedMenus, setExpandedMenus] = useState({});

  const structuredMenu = useMemo(() => {
    return getMenuItems()
      .filter(item => item.visible)
      .map(item => ({
        ...item,
        links: item.links?.filter(sub => sub.visible) || [],
      }));
  }, []);

  const filteredMenu = useMemo(() => {
    if (!debounced) return structuredMenu;
    return structuredMenu
      .filter(item => {
        const inMain = item.label.toLowerCase().includes(debounced.toLowerCase());
        const inSub = item.links.some(link =>
          link.label.toLowerCase().includes(debounced.toLowerCase())
        );
        return inMain || inSub;
      })
      .map(item => ({
        ...item,
        links: item.links.filter(link =>
          link.label.toLowerCase().includes(debounced.toLowerCase())
        ),
      }));
  }, [debounced, structuredMenu]);

  const toggleSubmenu = label => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <Box>
      {renderTriger({ onClick: () => setOpened(o => !o) })}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        shadow='md'
        withCloseButton={false}
        scrollAreaComponent={Box}
        classNames={classes.modal}
        style={{ overflowX: 'hidden' }}
        size='lg'
      >
        <TextInput
          placeholder='Search in menu...'
          value={value}
          onChange={e => setValue(e.currentTarget.value)}
          radius='md'
          leftSection={<IconSearch size={20} />}
          autoFocus
          classNames={{ input: classes.input }}
        />
        <Stack
          spacing='xs'
          mt='md'
          className={classes.scrollAreaContent}
        >
          {filteredMenu.length === 0 ? (
            <Text
              size='sm'
              c='dimmed'
              ta='center'
            >
              No results found.
            </Text>
          ) : (
            filteredMenu.map((item, idx) => (
              <Box key={idx}>
                <UnstyledButton
                  className={classes.resultItem}
                  onClick={() =>
                    item.links.length
                      ? toggleSubmenu(item.label)
                      : (window.location.href = item.link)
                  }
                >
                  <Group justify='space-between'>
                    <Group>
                      {item.icon ? <item.icon size={16} /> : <IconCircleDashed size={16} />}
                      <Text fw={500}>{item.label}</Text>
                    </Group>
                    {item.links.length > 0 &&
                      (expandedMenus[item.label] ? (
                        <IconChevronUp size={16} />
                      ) : (
                        <IconChevronDown size={16} />
                      ))}
                  </Group>
                </UnstyledButton>

                <Collapse in={expandedMenus[item.label]}>
                  <Stack
                    pl='lg'
                    pt={4}
                  >
                    {item.links.map((sub, subIdx) => (
                      <UnstyledButton
                        key={subIdx}
                        className={classes.resultItem}
                        onClick={() => (window.location.href = sub.link)}
                      >
                        <Group>
                          <Text
                            size='sm'
                            fw={400}
                          >
                            {sub.label}
                          </Text>
                        </Group>
                      </UnstyledButton>
                    ))}
                  </Stack>
                </Collapse>
              </Box>
            ))
          )}
        </Stack>
      </Modal>
    </Box>
  );
}
