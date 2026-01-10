import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Group,
  Text,
  Button,
  Anchor,
  Popover,
  Avatar,
  rem,
  Input,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
  Tooltip,
} from '@mantine/core';
import { motion } from 'motion/react';
import { IconSearch, IconSun, IconMoon } from '@tabler/icons-react';
import ContactDialog from '@/pages/Auth/ContactDialog';
import { Link } from '@inertiajs/react';
import classes from './css/index.module.css';
import { IconDeviceAnalytics } from '@tabler/icons-react';

export default function FloatingNavbar({
  item,
  consultationButton = true,
  menuItems = [
    {
      label: 'Search',
      icon: IconSearch,
      submenu: <Input.Wrapper></Input.Wrapper>,
    },
    {
      label: 'Services',
      submenu: ['Design', 'Construction', 'Consulting'],
    },
    {
      label: 'Projects',
      submenu: ['Completed', 'Ongoing', 'Upcoming'],
    },
  ],
  menuPosition = '',
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [opened, setOpened] = useState(false);
  const [openedPoper, setPopover] = useState(null);
  const { setColorScheme } = useMantineColorScheme({ keepTransition: true });
  const computedColorScheme = useComputedColorScheme('light');
  const scheme = computedColorScheme || 'light';

  const toggleColorScheme = () => {
    const next = computedColorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(next);
    // force update attribute for custom styling outside Mantine components
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-mantine-color-scheme', next);
    }
  };

  const resetAndClose = () => setOpened(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        backgroundColor: isScrolled
          ? scheme === 'dark'
            ? 'rgba(10, 10, 10, 0.8)'
            : 'rgba(37, 99, 235, 0.9)'
          : 'transparent',
        borderBottom: isScrolled
          ? scheme === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(255,255,255,0.2)'
          : 'none',
        transition: 'all 0.3s ease',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Container
        size='xl'
        py='md'
      >
        <Grid align='center'>
          {/* Brand */}
          <Grid.Col span={3}>
            <Link
              href='/'
              style={{ textDecoration: 'none' }}
            >
              <Group spacing='xs'>
                {item.logo ? (
                  <Avatar
                    src={item.logo}
                    alt='Company Logo'
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  />
                ) : (
                  <IconDeviceAnalytics
                    style={{ stroke: '#fff', width: rem(25), height: rem(25), flexShrink: 0 }}
                  />
                )}
                <div>
                  <Text
                    size='lg'
                    weight={700}
                    color='white'
                  >
                    CV AJAT Construction
                  </Text>
                  <Text
                    size='xs'
                    color='white'
                  >
                    Majalengka
                  </Text>
                </div>
              </Group>
            </Link>
          </Grid.Col>

          {/* Menu */}
          <Grid.Col
            span={9}
            style={{
              display: 'flex',
              justifyContent: consultationButton ? 'flex-end' : 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            {/* Menu + Tombol di satu Group */}
            <Group
              spacing='xl'
              position={menuPosition}
              style={{ marginLeft: consultationButton ? '0' : 'auto' }}
            >
              {menuItems.map((item, index) => (
                <Popover
                  width={item.label === 'Search' ? 420 : 200}
                  position='bottom'
                  shadow='md'
                  withArrow
                  withinPortal
                  zIndex={1000}
                  key={item.label}
                >
                  <Popover.Target>
                    <Anchor
                      style={{
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 500,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      className={classes.link}
                      onMouseEnter={() => setPopover(index)}
                      onMouseLeave={() => setPopover(null)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {item.icon ? (
                          // icon is a component reference
                          <item.icon style={{ stroke: '#fff', width: rem(18), height: rem(18) }} />
                        ) : (
                          <IconDeviceAnalytics style={{ stroke: '#fff', width: rem(18), height: rem(18) }} />
                        )}

                        {/* show label always for Services and Projects, otherwise only on hover */}
                        {(item.label === 'Services' || item.label === 'Projects' || openedPoper === index) && (
                          <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                        )}
                      </div>
                    </Anchor>
                  </Popover.Target>

                  <Popover.Dropdown
                    style={{
                      background: item.label === 'Search' ? 'rgba(255,255,255,0.06)' : '#ffffff',
                      borderRadius: '10px',
                      boxShadow: item.label === 'Search' ? 'none' : '0 6px 28px rgba(0,0,0,0.15)',
                      padding: item.label === 'Search' ? '8px 10px' : '6px 0',
                      minWidth: item.label === 'Search' ? '360px' : '220px',
                      backdropFilter: item.label === 'Search' ? 'blur(20px)' : 'none',
                      border: item.label === 'Search' ? '1px solid rgba(255,255,255,0.12)' : 'none',
                      size: 'max-content',
                    }}
                    onMouseEnter={() => setPopover(index)}
                    onMouseLeave={() => setPopover(null)}
                  >
                        {
                          // If submenu is a custom element or this is the Search menu, show a search input
                          item.label === 'Search' ? (
                        <div style={{ padding: '12px 20px' }}>
                          <Input
                            placeholder='Cari...'
                            radius='lg'
                            spellCheck={false}
                            style={{ width: '100%' }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const q = e.currentTarget.value?.trim();
                                try {
                                  window.dispatchEvent(new CustomEvent('open-search', { detail: { q } }));
                                } catch (err) {
                                  // fallback: navigate to /search?q=...
                                  const url = q ? `/search?query=${encodeURIComponent(q)}` : '/search';
                                  window.location.href = url;
                                }
                              }
                            }}
                          />
                        </div>
                      ) : (
                            Array.isArray(item.submenu) ? (
                              item.submenu.map((sub, idx) => (
                                <div key={sub}>
                                  <Anchor
                                    href='#'
                                    style={{
                                      padding: '12px 18px',
                                      color: '#333',
                                      display: 'block',
                                      fontSize: '15px',
                                      fontWeight: 500,
                                      textDecoration: 'none',
                                      transition: 'background 0.2s, padding-left 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.background = '#eef2ff';
                                      e.currentTarget.style.paddingLeft = '22px';
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.paddingLeft = '18px';
                                    }}
                                  >
                                    {sub}
                                  </Anchor>

                                  {idx < item.submenu.length - 1 && (
                                    <div
                                      style={{
                                        height: '1px',
                                        background: 'rgba(0,0,0,0.06)',
                                        margin: '4px 0',
                                      }}
                                    ></div>
                                  )}
                                </div>
                              ))
                            ) : (
                              // If submenu provided as a React node, render it directly
                              item.submenu
                            )
                          )
                        }
                  </Popover.Dropdown>
                </Popover>
              ))}
              {/**switching mode */}
              <Tooltip
                    label={`Switch to ${computedColorScheme === 'light' ? 'dark' : 'light'} mode`}
                    withArrow
                    withinPortal
                    zIndex={1000}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <ActionIcon
                        variant='subtle'
                        radius='xl'
                        size='lg'
                        onClick={toggleColorScheme}
                        aria-label='Toggle color scheme'
                        style={{
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                        }}
                      >
                        {computedColorScheme === 'light' ? <IconSun size={18} /> : <IconMoon size={18} />}
                      </ActionIcon>
                    </motion.div>
                  </Tooltip>
              {/* Tombol Konsultasi hanya muncul kalau props true */}
              {consultationButton && (
                <>


                  <Button
                    size='md'
                    onClick={() => setOpened(true)}
                    variant='subtle'
                    radius='xl'
                    onMouseEnter={e => {
                      e.currentTarget.classList.add(classes.btnHoverEffect);
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.classList.remove(classes.btnHoverEffect);
                    }}
                  >
                    <span
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'white',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>💬</span>
                      Konsultasi Gratis!
                    </span>

                    {/* Shimmer effect */}
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '50%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8), transparent)',
                        animation: 'shimmer 2.5s infinite',
                        filter: 'blur(1px)',
                      }}
                    />

                    <style>
                      {`
      @keyframes glow {
        0%, 100% {
          filter: brightness(1);
        }
        50% {
          filter: brightness(1.15);
        }
      }

      @keyframes shimmer {
        0% {
          left: -100%;
        }
        100% {
          left: 200%;
        }
      }
    `}
                    </style>
                  </Button>
                </>
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </Container>
      <ContactDialog
        opened={opened}
        resetAndClose={resetAndClose}
      />
    </motion.div>
  );
}
