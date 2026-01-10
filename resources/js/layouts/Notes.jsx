import RichTextEditor from '@/components/RichTextEditor';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconNotes, IconWindowMaximize, IconWindowMinimize, IconX } from '@tabler/icons-react';

const MINIMIZED_SIZE = { width: 340, height: 300 };
const MAXIMIZED_SIZE = { width: 820, height: 640 };

const readJSON = (key, fallback) => {
  const fallbackValue = typeof fallback === 'function' ? fallback() : fallback;
  if (typeof window === 'undefined') return fallbackValue;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallbackValue;
  } catch (_) {
    return fallbackValue;
  }
};

const writeJSON = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    // ignore write errors
  }
};

export default function Notes() {
  const computedColorScheme = useComputedColorScheme('light');
  const theme = useMantineTheme();
  const userId = usePage().props?.auth?.user?.id;
  const storageKey = useMemo(
    () => (userId ? `workspace_notes_${userId}` : 'workspace_notes_guest'),
    [userId]
  );

  const modeStorageKey = `${storageKey}_window_mode`;
  const maxPositionStorageKey = `${storageKey}_window_max_position`;
  const minPositionStorageKey = `${storageKey}_window_min_position`;
  const visibleStorageKey = `${storageKey}_window_visible`;

  const [content, setContent] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return window.localStorage.getItem(storageKey) || '';
    } catch (_) {
      return '';
    }
  });

  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'maximized';
    const stored = window.localStorage.getItem(modeStorageKey);
    return stored === 'minimized' ? 'minimized' : 'maximized';
  });

  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem(visibleStorageKey);
    return stored !== 'false';
  });

  const [position, setPosition] = useState(() => readJSON(maxPositionStorageKey, { x: 24, y: 96 }));
  const [miniPosition, setMiniPosition] = useState(() =>
    readJSON(minPositionStorageKey, () => {
      if (typeof window === 'undefined') return { x: 24, y: 24 };
      return { x: Math.max(16, window.innerWidth - MINIMIZED_SIZE.width - 24), y: 24 };
    })
  );

  const [debouncedContent] = useDebouncedValue(content, 300);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, debouncedContent || '');
    } catch (_) {
      // ignore write errors (e.g., storage disabled)
    }
  }, [debouncedContent, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(modeStorageKey, mode);
  }, [mode, modeStorageKey]);

  useEffect(() => {
    writeJSON(maxPositionStorageKey, position);
  }, [position, maxPositionStorageKey]);

  useEffect(() => {
    writeJSON(minPositionStorageKey, miniPosition);
  }, [miniPosition, minPositionStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(visibleStorageKey, visible ? 'true' : 'false');
  }, [visible, visibleStorageKey]);

  const isMinimized = mode === 'minimized';
  const currentPosition = isMinimized ? miniPosition : position;
  const width =
    isMinimized || typeof window === 'undefined'
      ? MINIMIZED_SIZE.width
      : Math.min(MAXIMIZED_SIZE.width, window.innerWidth - 32);
  const editorHeight = isMinimized ? 240 : 560;

  const handleStartDrag = useCallback(
    event => {
      event.preventDefault();
      const type = isMinimized ? 'minimized' : 'maximized';
      const origin = type === 'minimized' ? miniPosition : position;
      const dragWidth =
        type === 'minimized'
          ? MINIMIZED_SIZE.width
          : typeof window !== 'undefined'
            ? Math.min(MAXIMIZED_SIZE.width, window.innerWidth - 32)
            : MAXIMIZED_SIZE.width;
      const dragHeight = type === 'minimized' ? MINIMIZED_SIZE.height : MAXIMIZED_SIZE.height;
      const startX = event.clientX;
      const startY = event.clientY;

      const handleMove = moveEvent => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const next = { x: origin.x + dx, y: origin.y + dy };

        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : dragWidth;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : dragHeight;
        const maxX = Math.max(0, viewportWidth - dragWidth - 8);
        const maxY = Math.max(0, viewportHeight - dragHeight - 8);

        next.x = Math.min(Math.max(8, next.x), maxX);
        next.y = Math.min(Math.max(8, next.y), maxY);

        if (type === 'minimized') {
          setMiniPosition(next);
        } else {
          setPosition(next);
        }
      };

      const handleUp = () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('pointermove', handleMove);
          window.removeEventListener('pointerup', handleUp);
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
      }
    },
    [isMinimized, miniPosition, position]
  );

  const stopPropagation = event => event.stopPropagation();

  const handleToggleMode = () => {
    setMode(prev => (prev === 'minimized' ? 'maximized' : 'minimized'));
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Tooltip
        label='Open Notes'
        color='blue'
        withArrow
      >
        <Button
          radius='xl'
          size='md'
          variant='filled'
          px={0}
          style={{
            width: 37,
            height: 37,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: computedColorScheme === 'light' ? theme.white : theme.colors.dark[6],
            color: computedColorScheme === 'light' ? theme.colors.blue[4] : theme.colors.gray[2],
          }}
          onClick={() => setVisible(true)}
          aria-pressed={visible}
        >
          <Group gap='xs'>
            <IconNotes size={20} />
          </Group>
        </Button>
      </Tooltip>

      {visible && (
        <Box
          style={{
            position: 'fixed',
            top: currentPosition.y,
            left: currentPosition.x,
            width,
            zIndex: 3000,
          }}
        >
          <Paper
            radius='lg'
            withBorder
            shadow='lg'
          >
            <Box
              px='md'
              py='sm'
              style={{
                borderBottom: isMinimized ? 'none' : '1px solid var(--mantine-color-dark-4)',
                cursor: 'grab',
                userSelect: 'none',
              }}
              onPointerDown={handleStartDrag}
            >
              <Group
                justify='space-between'
                align='center'
              >
                <Title
                  order={4}
                >
                  Workspace Notes
                </Title>
                <Group gap='xs'>
                  <ActionIcon
                    variant='light'
                    color='dark'
                    onPointerDown={stopPropagation}
                    onClick={handleToggleMode}
                    aria-label={isMinimized ? 'Maximize notes' : 'Minimize notes'}
                  >
                    {isMinimized ? (
                      <IconWindowMaximize size={16} />
                    ) : (
                      <IconWindowMinimize size={16} />
                    )}
                  </ActionIcon>
                  <ActionIcon
                    variant='subtle'
                    color='red'
                    onPointerDown={stopPropagation}
                    onClick={handleClose}
                    aria-label='Close notes'
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Box>
            <Box p='md'>
              <RichTextEditor
                key={storageKey}
                mt='sm'
                height={editorHeight}
                content={content}
                onChange={setContent}
              />
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
}
