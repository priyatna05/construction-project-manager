import {
  TextInput,
  UnstyledButton,
  Stack,
  Text,
  Modal,
  Box,
  Group,
  Collapse,
  Badge,
} from '@mantine/core';
import { IconSearch, IconCircleDashed, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import classes from './css/SearchInput.module.css';
import { getMenuItems } from '@/utils/ListMenu';
import { router } from '@inertiajs/react';

export function ModalSearch({ renderTriger }) {
  const [opened, setOpened] = useState(false);
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 250);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

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
  // load recent searches on mount
  useEffect(() => {
    try {
      const raw = window?.localStorage?.getItem('recentSearches');
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  // Listen to global "open-search" event (Ctrl+K from TopBar)
  useEffect(() => {
    const handleOpen = () => {
      setOpened(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    };

    window.addEventListener('open-search', handleOpen);
    return () => window.removeEventListener('open-search', handleOpen);
  }, []);

  // Fetch application data search results when user types
  useEffect(() => {
    let cancelled = false;
    const q = debounced?.trim() || '';

    // Jangan tembak API kalau masih terlalu pendek
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    window.axios
      .get('/search', { params: { query: q } })
      .then(resp => {
        if (cancelled) return;
        setResults(resp.data.results || []);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Search error', err);
        setError('Tidak bisa memuat hasil pencarian data. Coba lagi nanti.');
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const saveRecent = term => {
    if (!term) return;
    try {
      const raw = window?.localStorage?.getItem('recentSearches');
      let list = raw ? JSON.parse(raw) : [];
      list = [term, ...list.filter(t => t !== term)].slice(0, 8);
      window.localStorage.setItem('recentSearches', JSON.stringify(list));
      setRecentSearches(list);
    } catch (e) {
      // ignore
    }
  };

  const clearRecent = () => {
    try {
      window.localStorage.removeItem('recentSearches');
    } catch (e) {
      // ignore
    }
    setRecentSearches([]);
  };

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
        closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
        transitionProps={{ transition: 'fade', duration: 200 }}
        style={{ overflowX: 'hidden' }}
        size='lg'
      >
        <TextInput
          placeholder='Search in menu...'
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.currentTarget.value)}
          radius='md'
          leftSection={<IconSearch size={20} />}
          autoFocus
          classNames={{ input: classes.input }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        />
        <Stack
          spacing='xs'
          mt='md'
          className={classes.scrollAreaContent}
        >
          {/* A. Recent saat belum mengetik */}
          {!debounced && recentSearches.length > 0 && (
            <Box>
              <Group
                position='apart'
                mb='xs'
              >
                <Text
                  size='sm'
                  fw={600}
                >
                  Recent searches
                </Text>
                <UnstyledButton onClick={clearRecent}>
                  <Badge
                    variant='light'
                    size='xs'
                    color='dimmed'
                  >
                    Clear
                  </Badge>
                </UnstyledButton>
              </Group>
              <Stack spacing='xs'>
                {recentSearches.map((s, i) => (
                  <UnstyledButton
                    key={`recent-${i}`}
                    className={classes.resultItem}
                    onClick={() => setValue(s)}
                  >
                    <Group>
                      <IconCircleDashed size={16} />
                      <Text size='sm'>{s}</Text>
                    </Group>
                  </UnstyledButton>
                ))}
              </Stack>
            </Box>
          )}

          {/* B. Loading indicator */}
          {loading && (
            <Text
              size='xs'
              c='dimmed'
              ta='center'
            >
              Searching...
            </Text>
          )}

          {/* C. Error backend */}
          {error && (
            <Text
              size='xs'
              c='red'
              ta='center'
            >
              {error}
            </Text>
          )}

          {/* D. Results dari backend */}
          {results.length > 0 && (
            <Box mb='sm'>
              <Text
                size='xs'
                fw={600}
                mb={4}
              >
                Results
              </Text>
              {results.map((res, idx) => (
                <UnstyledButton
                  key={`res-${idx}`}
                  className={classes.resultItem}
                  onClick={() => {
                    saveRecent(res.title);
                    setOpened(false);
                    try {
                      router.visit(res.url);
                    } catch (_) {
                      window.location.href = res.url;
                    }
                  }}
                >
                  <Group position='apart'>
                    <Group>
                      <IconCircleDashed size={16} />
                      <div>
                        <Text fw={600}>{res.title}</Text>
                        <Text
                          size='xs'
                          c='dimmed'
                        >
                          {res.type} {res.project_name ? `- ${res.project_name}` : ''}
                        </Text>
                      </div>
                    </Group>
                    <Badge
                      variant='light'
                      size='xs'
                    >
                      {res.type}
                    </Badge>
                  </Group>
                </UnstyledButton>
              ))}
            </Box>
          )}

          {/* E. Navigation (filtered menu) */}
          {filteredMenu.length > 0 && (
            <Box>
              <Text
                size='xs'
                fw={600}
                mb={4}
              >
                Navigation
              </Text>
              {filteredMenu.map((item, idx) => (
                <Box key={idx}>
                  <UnstyledButton
                    className={classes.resultItem}
                    onClick={() => {
                      if (item.links.length) {
                        toggleSubmenu(item.label);
                      } else {
                        setOpened(false);
                        router.visit(item.link);
                      }
                    }}
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
                          onClick={() => {
                            setOpened(false);
                            router.visit(sub.link);
                          }}
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
              ))}
            </Box>
          )}

          {/* F. No results setelah mengetik */}
          {debounced && !loading && filteredMenu.length === 0 && results.length === 0 && (
            <Text
              size='sm'
              c='dimmed'
              ta='center'
            >
              No results found.
            </Text>
          )}
        </Stack>
      </Modal>
    </Box>
  );
}
