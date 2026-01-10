import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Center,
  Badge,
  ThemeIcon,
  Divider,
  Anchor,
  useComputedColorScheme,
} from '@mantine/core';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import {
  IconClock,
  IconPhone,
  IconMail,
  IconMapPin,
  IconTrophy,
  IconUsers,
  IconBuilding,
  IconStar,
  IconChartBar,
  IconShieldCheck,
  IconCertificate,
  IconTools,
  IconBulb,
  IconTargetArrow,
  IconArrowRight,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandWhatsapp,
} from '@tabler/icons-react';
import { useRef, useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import FloatingNavbar from './Dist/FloatingNavbar';
import ContactDialog from '../Auth/ContactDialog';
import { usePage } from '@inertiajs/react';
import LangToggle from './Dist/LangToggle';

function AnimatedCounter({ value, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    const animate = currentTime => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// Floating Animation Component
function FloatingElement({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// Reveal Animation Component
function RevealOnScroll({ children, direction = 'up' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const variants = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: -50 },
    right: { x: 50 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...variants[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function Index() {
  const { item } = usePage().props;
  const { scrollYProgress } = useScroll();
  const opacityProgress = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const curtainClip = useTransform(heroProgress, [0, 1], ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']);
  const scheme = useComputedColorScheme('light');
  const palette = scheme === 'dark'
    ? {
        bg: '#0a0a0a',
        text: '#f8fafc',
        muted: 'rgba(255,255,255,0.7)',
        card: 'rgba(255, 255, 255, 0.03)',
        cardBorder: 'rgba(255, 255, 255, 0.1)',
        badgeBg: 'rgba(255, 255, 255, 0.2)',
      }
    : {
        bg: '#f7f9fc',
        text: '#0f172a',
        muted: '#475569',
        card: '#ffffff',
        cardBorder: 'rgba(15, 23, 42, 0.12)',
        badgeBg: 'rgba(15, 23, 42, 0.08)',
      };
  const gradientText = '#f8fafc';
  const heroText = scheme === 'dark' ? palette.text : '#ffffff';
  const heroMuted = scheme === 'dark' ? palette.muted : 'rgba(255,255,255,0.85)';
  const heroBorder = scheme === 'dark' ? palette.text : 'rgba(255,255,255,0.7)';
  const heroDim = scheme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.1)';
  const curtainGradient =
    scheme === 'dark'
      ? 'linear-gradient(180deg, rgba(10,10,10,0.7), rgba(10,10,10,0.95))'
      : '#f7f9fc';
  const footerBg =
    scheme === 'dark'
      ? 'linear-gradient(135deg, #0f172a 0%, #0b1224 100%)'
      : 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)';
  const footerText = '#ffffff';
  const footerMuted = 'rgba(255,255,255,0.85)';
  const words = ['Masa Depan', 'Impian', 'Visi', 'Kesuksesan', 'Inovasi'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [opened, setOpened] = useState(false);
  const resetAndClose = () => setOpened(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.substring(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentWord.substring(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex(prev => (prev + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  const stats = [
    { icon: IconBuilding, value: 150, suffix: '+', label: 'Proyek Selesai', color: '#4c6ef5' },
    { icon: IconUsers, value: 200, suffix: '+', label: 'Klien Puas', color: '#12b886' },
    { icon: IconTrophy, value: 25, suffix: '+', label: 'Penghargaan', color: '#fab005' },
    { icon: IconCertificate, value: 8, suffix: '+', label: 'Tahun Pengalaman', color: '#ff6b6b' },
  ];

  const services = [
    {
      icon: IconBuilding,
      title: 'Konstruksi Bangunan',
      desc: 'Pembangunan gedung komersial, perumahan, dan fasilitas publik dengan standar kualitas tinggi',
      color: '#667eea',
    },
    {
      icon: IconTools,
      title: 'Renovasi & Remodeling',
      desc: 'Transformasi ruang lama menjadi baru dengan desain modern dan fungsional',
      color: '#764ba2',
    },
    {
      icon: IconBulb,
      title: 'Konsultasi Teknik',
      desc: 'Solusi teknik sipil dan arsitektur dari tim ahli berpengalaman',
      color: '#f093fb',
    },
    {
      icon: IconChartBar,
      title: 'Manajemen Proyek',
      desc: 'Pengelolaan proyek end-to-end dengan metode EVM untuk kontrol optimal',
      color: '#4facfe',
    },
    {
      icon: IconShieldCheck,
      title: 'Quality Assurance',
      desc: 'Jaminan kualitas dengan inspeksi ketat di setiap tahap konstruksi',
      color: '#43e97b',
    },
    {
      icon: IconTargetArrow,
      title: 'Design & Build',
      desc: 'Layanan terintegrasi dari konsep desain hingga penyelesaian konstruksi',
      color: '#fa709a',
    },
  ];

  const projects = [
    { title: 'Majalengka City Center', category: 'Komersial', year: '2024', image: '🏢' },
    { title: 'Green Valley Residence', category: 'Perumahan', year: '2023', image: '🏘️' },
    { title: 'Majalengka Convention Hall', category: 'Publik', year: '2024', image: '🏛️' },
    { title: 'Modern Office Complex', category: 'Komersial', year: '2023', image: '🏢' },
  ];

  const testimonials = [
    {
      name: 'Budi Santoso',
      role: 'CEO PT Maju Bersama',
      text: 'Kualitas pekerjaan luar biasa! Proyek selesai tepat waktu dengan hasil melebihi ekspektasi.',
      rating: 5,
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Property Developer',
      text: 'Tim yang profesional dan komunikatif. Sangat puas dengan layanan dan hasilnya.',
      rating: 5,
    },
    {
      name: 'Ahmad Dahlan',
      role: 'Pemilik Usaha',
      text: 'Harga kompetitif dengan kualitas premium. Highly recommended untuk proyek konstruksi!',
      rating: 5,
    },
  ];

  return (
    <>
    <div
      className='landing-page'
      style={{ backgroundColor: palette.bg, color: palette.text, minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}
    >
      {/* Floating Navigation */}
      <FloatingNavbar
        item={item}
        consultationButton={true}
        menuPosition='flex-end'
      />

      {/* Hero Section with Parallax */}
      <motion.div
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Video background scoped to hero */}
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          className='landingHeroVideo'
        >
          <source
            src='/storage/assets/background.mp4'
            type='video/mp4'
          />
        </motion.video>

        {/* Dim overlay for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: heroDim,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Curtain overlay that slides up as you scroll past hero */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            height: '100%',
            clipPath: curtainClip,
            background: curtainGradient,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        <FloatingElement delay={0}>
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              filter: 'blur(60px)',
            }}
          />
        </FloatingElement>

        <FloatingElement delay={1}>
          <div
            style={{
              position: 'absolute',
              bottom: '20%',
              right: '10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              filter: 'blur(80px)',
            }}
          />
        </FloatingElement>

        <Container
          size='xl'
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Grid align='center'>
            <Grid.Col span={7}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Badge
                  size='lg'
                  variant='light'
                  style={{
                    backgroundColor: palette.badgeBg,
                    color: heroText,
                    marginBottom: '20px',
                  }}
                >
                  Terpercaya Sejak 2016
                </Badge>

                <Title
                  order={1}
                  style={{
                    fontSize: '64px',
                    fontWeight: 800,
                    color: heroText,
                    lineHeight: 1.2,
                    marginBottom: '20px',
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  Membangun
                  <br />
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(90deg, #fff 0%, #f0f0f0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      minWidth: '450px',
                      textAlign: 'left',
                    }}
                  >
                    {displayText}
                    <span
                      style={{
                        opacity: showCursor ? 1 : 0,
                        transition: 'opacity 0.1s',
                        marginLeft: '2px',
                      }}
                    >
                      |
                    </span>
                  </span>
                  <br />
                  Anda Bersama Kami
                </Title>

                <Text
                  size='xl'
                  style={{
                    color: heroMuted,
                    marginBottom: '40px',
                    lineHeight: 1.6,
                    maxWidth: '600px',
                  }}
                >
                  Solusi konstruksi premium dengan teknologi modern dan tim profesional. Dari
                  perencanaan hingga penyelesaian, kami wujudkan visi Anda.
                </Text>

                <Group spacing='lg'>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size='xl'
                      component={Link}
                      href='/login'
                      style={{
                        background: '#1d4ed8',
                        color: '#fff',
                        borderRadius: '16px',
                        padding: '16px 40px',
                        fontSize: '18px',
                        fontWeight: 600,
                        border: 'none',
                      }}
                      rightSection={
                        <IconArrowRight
                          size={30}
                          stroke={2}
                          color='#fff'
                        />
                      }
                      styles={{
                        label: {
                          color: '#fff',
                        },
                      }}
                    >
                      Mulai Proyek
                    </Button>
                  </motion.div>

                  <motion.div
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                    size='xl'
                    variant='outline'
                    style={{
                      borderColor: heroBorder,
                      color: heroText,
                      borderRadius: '16px',
                      padding: '16px 40px',
                      fontSize: '18px',
                      fontWeight: 600,
                    }}
                    >
                      Lihat Portfolio
                    </Button>
                  </motion.div>
                </Group>

                <Group
                  spacing='xl'
                  mt={50}
                >
                  <Group spacing='xs'>
                    <IconPhone
                      size={20}
                      color={heroText}
                    />
                    <Text style={{ color: heroText }}>+62 812-3456-7890</Text>
                  </Group>
                  <Group spacing='xs'>
                    <IconMapPin
                      size={20}
                      color={heroText}
                    />
                    <Text style={{ color: heroText }}>Majalengka, Indonesia</Text>
                  </Group>
                </Group>
              </motion.div>
            </Grid.Col>

            <Grid.Col span={5}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <FloatingElement>
                  <div
                    style={{
                      background: 'transparent',
                      padding: '40px',
                    }}
                  >
                    <div style={{ fontSize: '120px', textAlign: 'center', marginBottom: '20px' }}>
                      🏗️
                    </div>
                    <Text
                      align='center'
                      size='lg'
                      weight={600}
                      style={{ color: heroText, marginBottom: '10px' }}
                    >
                      Real-Time Project Monitoring
                    </Text>
                    <Text
                      align='center'
                      style={{ color: heroMuted }}
                    >
                      Teknologi EVM untuk kontrol proyek optimal
                    </Text>
                  </div>
                </FloatingElement>
              </motion.div>
            </Grid.Col>
          </Grid>
        </Container>

        {/* Scroll Indicator */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '96%',
            transform: 'translateX(-50%)',
            opacity: opacityProgress,
          }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            style={{
              width: '30px',
              height: '50px',
              border: '2px solid white',
              borderRadius: '20px',
              display: 'flex',
              justifyContent: 'center',
              padding: '8px',
            }}
          >
            <motion.div
              style={{
                width: '6px',
                height: '10px',
                background: 'white',
                borderRadius: '3px',
              }}
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>

      <div
        className='landing-content'
        style={{ position: 'relative', zIndex: 2, backgroundColor: palette.bg }}
      >
        {/* Stats Section */}
        <Container
          size='xl'
          py={80}
        >
          <Center mb={40}>
            <div style={{ textAlign: 'center', maxWidth: 700 }}>
              <Title
                order={2}
                style={{ color: palette.text, marginBottom: 12, fontSize: '40px' }}
              >
                Our Impact
              </Title>
              <Text
                size='lg'
                style={{ color: palette.muted }}
              >
                Numbers that show our commitment to building excellence
              </Text>
            </div>
          </Center>

          <SimpleGrid
            cols={4}
            spacing='xl'
          >
            {stats.map((stat, i) => (
              <RevealOnScroll
                key={i}
                direction='up'
              >
                <motion.div transition={{ type: 'spring', stiffness: 300 }}>
                  <Card
                    p='xl'
                    style={{
                      background: palette.card,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${palette.cardBorder}`,
                      borderRadius: '24px',
                      textAlign: 'center',
                    }}
                  >
                    <ThemeIcon
                      size={70}
                      radius='xl'
                      style={{
                        background: stat.color,
                        margin: '0 auto 20px',
                      }}
                    >
                      <stat.icon size={35} />
                    </ThemeIcon>
                    <Title
                      order={1}
                      style={{ color: palette.text, fontSize: '48px', fontWeight: 800 }}
                    >
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </Title>
                    <Text
                      size='lg'
                      style={{ color: palette.muted, marginTop: '10px' }}
                    >
                      {stat.label}
                    </Text>
                  </Card>
                </motion.div>
              </RevealOnScroll>
            ))}
          </SimpleGrid>
        </Container>

      {/* Services Section */}
      <div
        style={{
          background:
            'linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          padding: '100px 0',
        }}
      >
        <Container size='xl'>
          <RevealOnScroll>
            <Center mb={60}>
              <div style={{ textAlign: 'center', maxWidth: '700px' }}>
                <Badge
                  size='lg'
                  variant='light'
                  style={{ marginBottom: '20px' }}
                >
                  LAYANAN KAMI
                </Badge>
                <Title
                  order={2}
                  style={{ color: palette.text, fontSize: '48px', marginBottom: '20px' }}
                >
                  Solusi Konstruksi Terpadu
                </Title>
                <Text
                  size='lg'
                  style={{ color: palette.muted }}
                >
                  Kami menyediakan berbagai layanan konstruksi dengan standar internasional
                </Text>
              </div>
            </Center>
          </RevealOnScroll>

          <SimpleGrid
            cols={3}
            spacing='xl'
          >
            {services.map((service, i) => (
              <RevealOnScroll
                key={i}
                direction={i % 2 === 0 ? 'left' : 'right'}
              >
                <motion.div
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card
                    p='xl'
                    style={{
                      background: palette.card,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${palette.cardBorder}`,
                      borderRadius: '24px',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${service.color} 0%, transparent 100%)`,
                      }}
                    />

                    <ThemeIcon
                      size={60}
                      radius='xl'
                      style={{
                        background: service.color,
                        marginBottom: '20px',
                      }}
                    >
                      <service.icon size={30} />
                    </ThemeIcon>

                    <Title
                      order={3}
                      style={{ color: palette.text, marginBottom: '15px' }}
                    >
                      {service.title}
                    </Title>

                    <Text style={{ color: palette.muted, lineHeight: 1.6 }}>{service.desc}</Text>

                    <motion.div
                      style={{ marginTop: '20px' }}
                    >
                      <Anchor
                        style={{
                          color: service.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        Pelajari lebih lanjut <IconArrowRight size={16} />
                      </Anchor>
                    </motion.div>
                  </Card>
                </motion.div>
              </RevealOnScroll>
            ))}
          </SimpleGrid>
        </Container>
      </div>
      {/* Projects Section */}
      <Container
        size='xl'
        py={100}
      >
        <RevealOnScroll>
          <Center mb={60}>
            <div style={{ textAlign: 'center', maxWidth: '700px' }}>
              <Badge
                size='lg'
                variant='light'
                style={{ marginBottom: '20px' }}
              >
                PORTFOLIO
              </Badge>
              <Title
                order={2}
                style={{ color: palette.text, fontSize: '48px', marginBottom: '20px' }}
              >
                Proyek Terbaru Kami
              </Title>
              <Text
                size='lg'
                style={{ color: palette.muted }}
              >
                Hasil karya terbaik yang telah kami selesaikan dengan kepuasan klien
              </Text>
            </div>
          </Center>
        </RevealOnScroll>

        <Grid gutter='xl'>
          {projects.map((project, i) => (
            <Grid.Col
              span={6}
              key={i}
            >
              <RevealOnScroll direction={i % 2 === 0 ? 'left' : 'right'}>
                <motion.div
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card
                    p={0}
                    style={{
                      background: palette.card,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${palette.cardBorder}`,
                      borderRadius: '24px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        height: '300px',
                        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '100px',
                      }}
                    >
                      {project.image}
                    </div>
                    <div style={{ padding: '30px' }}>
                      <Group
                        position='apart'
                        mb='xs'
                      >
                        <Badge variant='light'>{project.category}</Badge>
                        <Text
                          size='sm'
                          style={{ color: palette.muted }}
                        >
                          {project.year}
                        </Text>
                      </Group>
                      <Title
                        order={3}
                        style={{ color: palette.text, marginBottom: '10px' }}
                      >
                        {project.title}
                      </Title>
                      <motion.div>
                        <Anchor
                          style={{
                            color: '#667eea',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          Lihat Detail <IconArrowRight size={16} />
                        </Anchor>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              </RevealOnScroll>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
      {/* Testimonials */}
      <div
        style={{
          background:
            'linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          padding: '100px 0',
        }}
      >
        <Container size='xl'>
          <RevealOnScroll>
            <Center mb={60}>
              <div style={{ textAlign: 'center', maxWidth: '700px' }}>
                <Badge
                  size='lg'
                  variant='light'
                  style={{ marginBottom: '20px' }}
                >
                  TESTIMONI
                </Badge>
              <Title
                order={2}
                style={{ color: palette.text, fontSize: '48px', marginBottom: '20px' }}
              >
                Apa Kata Klien Kami
              </Title>
              </div>
            </Center>
          </RevealOnScroll>

          <SimpleGrid
            cols={3}
            spacing='xl'
          >
            {testimonials.map((test, i) => (
              <RevealOnScroll
                key={i}
                direction='up'
              >
                <motion.div
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card
                    p='xl'
                    style={{
                      background: palette.card,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${palette.cardBorder}`,
                      borderRadius: '24px',
                      height: '100%',
                    }}
                  >
                    <Group mb='md'>
                      {[...Array(test.rating)].map((_, i) => (
                        <IconStar
                          key={i}
                          size={20}
                          fill='#ffd700'
                          color='#ffd700'
                        />
                      ))}
                    </Group>
                    <Text
                      style={{
                        color: palette.muted,
                        marginBottom: '20px',
                        fontSize: '16px',
                        lineHeight: 1.6,
                      }}
                    >
                      `{test.text}`
                    </Text>
                    <Divider
                      my='md'
                      style={{ borderColor: palette.cardBorder }}
                    />
                    <Group>
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '20px',
                          fontWeight: 'bold',
                        }}
                      >
                        {test.name.charAt(0)}
                      </div>
                      <div>
                        <Text
                          weight={600}
                          style={{ color: palette.text }}
                        >
                          {test.name}
                        </Text>
                        <Text
                          size='sm'
                          style={{ color: palette.muted }}
                        >
                          {test.role}
                        </Text>
                      </div>
                    </Group>
                  </Card>
                </motion.div>
              </RevealOnScroll>
            ))}
          </SimpleGrid>
        </Container>
      </div>
      {/* CTA Section */}
      <Container
        size='xl'
        py={100}
      >
        <RevealOnScroll>
          <motion.div
            transition={{ type: 'spring', stiffness: 300 }}
          >
          <Card
            p={80}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '30px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
              <FloatingElement>
                <div
                  style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    filter: 'blur(40px)',
                  }}
                />
              </FloatingElement>
              <FloatingElement delay={0.5}>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-50px',
                    left: '-50px',
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    filter: 'blur(50px)',
                  }}
                />
              </FloatingElement>

              <Stack
                align='center'
                style={{ position: 'relative', zIndex: 1 }}
              >
                <Title
                  order={2}
                  style={{
                    color: gradientText,
                    fontSize: '48px',
                    marginBottom: '20px',
                    textAlign: 'center',
                  }}
                >
                  Siap Memulai Proyek Anda?
                </Title>
                <Text
                  size='xl'
                  style={{
                    color: gradientText,
                    marginBottom: '40px',
                    textAlign: 'center',
                    maxWidth: '800px',
                  }}
                >
                  Hubungi kami hari ini untuk konsultasi gratis dan wujudkan impian konstruksi Anda.
                  Tim ahli kami siap membantu dari konsep hingga realisasi.
                </Text>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size='xl'
                    onClick={() => setOpened(true)}
                    style={{
                      background: 'white',
                      color: '#667eea',
                      borderRadius: '16px',
                      padding: '16px 40px',
                      fontSize: '18px',
                      fontWeight: 600,
                      border: 'none',
                    }}
                    leftSection={<IconPhone size={20} />}
                  >
                    Hubungi Kami
                  </Button>
                  <ContactDialog
                    opened={opened}
                    resetAndClose={resetAndClose}
                  />
                </motion.div>
              </Stack>
            </Card>
          </motion.div>
        </RevealOnScroll>
      </Container>
      </div>
      {/* Footer */}
      <div
        style={{
          background: footerBg,
          padding: '60px 0',
        }}
      >
        <Container size='xl'>
          <Grid>
            <Grid.Col span={4}>
              <Group
                spacing='xs'
                mb='md'
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  🏗️
                </div>
                <div>
                  <Text
                    size='lg'
                    weight={700}
                    style={{ color: footerText }}
                  >
                    CV AJAT
                  </Text>
                  <Text
                    size='xs'
                    style={{ color: footerMuted }}
                  >
                    Construction
                  </Text>
                </div>
              </Group>
              <Text style={{ color: footerMuted, marginBottom: '20px' }}>
                Dedikasi kami untuk keunggulan dalam setiap proyek konstruksi. Membangun masa depan
                yang lebih baik, satu bangunan pada satu waktu.
              </Text>
              <Group spacing='md'>
                <motion.a
                  href='#'
                >
                  <IconBrandFacebook
                    size={24}
                    color='#667eea'
                  />
                </motion.a>
                <motion.a
                  href='#'
                >
                  <IconBrandInstagram
                    size={24}
                    color='#764ba2'
                  />
                </motion.a>
                <motion.a
                  href='#'
                >
                  <IconBrandLinkedin
                    size={24}
                    color='#f093fb'
                  />
                </motion.a>
                <motion.a
                  href='#'
                >
                  <IconBrandWhatsapp
                    size={24}
                    color='#43e97b'
                  />
                </motion.a>
              <LangToggle/>
              </Group>
            </Grid.Col>
            <Grid.Col span={2}>
              <Title
                order={4}
                style={{ color: footerText, marginBottom: '20px' }}
              >
                Navigasi
              </Title>
              <Stack>
                {['Home', 'Services', 'Projects', 'About', 'Contact'].map((item, i) => (
                  <Anchor
                    key={i}
                    href={`#${item.toLowerCase()}`}
                    style={{ color: footerText, textDecoration: 'none' }}
                  >
                    {item}
                  </Anchor>
                ))}
              </Stack>
            </Grid.Col>
            <Grid.Col span={3}>
              <Title
                order={4}
                style={{ color: footerText, marginBottom: '20px' }}
              >
                Layanan Utama
              </Title>
              <Stack>
                {services.slice(0, 3).map((service, i) => (
                  <Anchor
                    key={i}
                    href='#'
                    style={{ color: footerText, textDecoration: 'none' }}
                  >
                    {service.title}
                  </Anchor>
                ))}
              </Stack>
            </Grid.Col>
            <Grid.Col span={3}>
              <Title
                order={4}
                style={{ color: footerText, marginBottom: '20px' }}
              >
                Kontak Kami
              </Title>
              <Stack spacing='sm'>
                <Group spacing='xs'>
                  <IconMapPin
                    size={18}
                    color={footerText}
                  />
                  <Text style={{ color: footerMuted }}>Jl. Raya Majalengka No. 123, Majalengka</Text>
                </Group>
                <Group spacing='xs'>
                  <IconPhone
                    size={18}
                    color={footerText}
                  />
                  <Text style={{ color: footerMuted }}>+62 812-3456-7890</Text>
                </Group>
                <Group spacing='xs'>
                  <IconMail
                    size={18}
                    color={footerText}
                  />
                  <Text style={{ color: footerMuted }}>info@cvajat.com</Text>
                </Group>
                <Group spacing='xs'>
                  <IconClock
                    size={18}
                    color={footerText}
                  />
                  <Text style={{ color: footerMuted }}>Sen-Jum: 08:00 - 17:00</Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
          <Divider
            my='xl'
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          />
          <Text
            align='center'
            size='sm'
            style={{ color: footerMuted }}
          >
            © {new Date().getFullYear()} CV AJAT Construction. All rights reserved.
          </Text>
        </Container>
      </div>
    </div>
    </>
  );
}
