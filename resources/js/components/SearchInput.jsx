import {
  TextInput,
  UnstyledButton,
  ScrollArea,
  Stack,
  Text,
  Box,
  Modal,
  Group,
} from "@mantine/core";
import { IconSearch, IconCircleDashed } from "@tabler/icons-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useDebouncedValue, useClickOutside } from "@mantine/hooks";
import classes from './css/SearchInput.module.css';
import { getMenuItems } from "@/utils/ListMenu";

export function SearchInput({ renderTriger }) {
  const [opened, setOpened] = useState(false);
  const [value, setValue] = useState("");
  const [debounced] = useDebouncedValue(value, 250);
  const [results, setResults] = useState([]);
  const ref = useClickOutside(() => setOpened(false));

  const handleKeydown = useCallback((e) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const isOpenShortcut = (isMac && e.metaKey && e.key === "k") || (!isMac && e.ctrlKey && e.key === "k");

    if (isOpenShortcut) {
      e.preventDefault();
      setOpened((o) => !o);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  const localMenuItems = useMemo(() => {
    return getMenuItems().reduce((acc, item) => {
      if (item.visible) {
        acc.push({
          title: item.label,
          type: item.type,
          url: item.link,
          icon: item.icon,
        });
      }
      if (item.links) {
        item.links.forEach((subItem) => {
          if (subItem.visible) {
            acc.push({
              title: `${item.label} > ${subItem.label}`,
              type: subItem.type,
              url: subItem.link,
              icon: item.icon,
            });
          }
        });
      }
      return acc;
    }, []);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!debounced) {
        setResults(localMenuItems);
        return;
      }

      try {
        const res = await fetch(route("search") + "?query=" + encodeURIComponent(debounced), {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
          },
          credentials: "same-origin",
        });

        const data = await res.json();
        if (Array.isArray(data.results)) {
          setResults(data.results);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search error", error);
        setResults([]);
      }
    };

    search();
  }, [debounced, localMenuItems]);

  return (
    <Box ref={ref}>
      {renderTriger({ onClick: () => setOpened(true) })}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        shadow="md"
        withCloseButton={false}
        classNames={classes.modal}
        size="lg"
      >
        <TextInput
          placeholder="Search in Applications..."
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          radius="md"
          leftSection={<IconSearch size={20} />}
          autoFocus
          classNames={{ input: classes.input }}
        />

        <ScrollArea h={250} mt="xs">
          <Stack spacing="xs">
            {results.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center">
                No results found.
              </Text>
            ) : (
              results.map((item, idx) => (
                <UnstyledButton
                  key={idx}
                  className={classes.resultItem}
                  data-label={item.title}
                  onClick={() => {
                    setOpened(false);
                    setTimeout(() => {
                      window.location.href = item.url;
                    }, 100);
                  }}
                >
                  <Group justify="space-between">
                    <Group gap="xs">
                      {item.icon ? (
                        <item.icon size={16} />
                      ) : (
                        <IconCircleDashed size={16} />
                      )}
                      <Text fw={500} truncate>
                        {item.title}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {item.type}
                    </Text>
                  </Group>
                </UnstyledButton>
              ))
            )}
          </Stack>
        </ScrollArea>
      </Modal>
    </Box>
  );
}
