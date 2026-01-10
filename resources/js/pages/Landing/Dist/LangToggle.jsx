import { Box, Tooltip, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export default function LangToggle() {
  const { i18n } = useTranslation();

  const initialLang =
    (typeof window !== 'undefined' && window.localStorage.getItem('app_lang')) ||
    i18n.language ||
    'en';

  const [lang, setLang] = useState(initialLang === 'id' ? 'id' : 'en');
  const isEn = lang === 'en';

  useEffect(() => {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app_lang', lang);
    }
  }, [lang, i18n]);

  return (
    <Tooltip
      label={lang === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
      withArrow
      withinPortal
      color='green'
      zIndex={1000}
    >
      <Box
        component={motion.div}
        whileHover={{ scale: 1.05, boxShadow: '0 0 0 1px rgba(59,130,246,0.4)' }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setLang(isEn ? 'id' : 'en')}
        style={{
          cursor: 'pointer',
          width: 88,
          height: 32,
          borderRadius: 999,
          border: '1px solid rgba(148, 163, 184, 0.7)',
          display: 'flex',
          alignItems: 'center',
          padding: 2,
          position: 'relative',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 40,
            height: 28,
            borderRadius: 999,
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
          }}
          animate={{ x: isEn ? 0 : 44 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        />

        <Box
          style={{
            position: 'relative',
            flex: 1,
            zIndex: 1,
            textAlign: 'center',
          }}
        >
          <Text
            size="xs"
            fw={700}
            style={{
              color: isEn ? 'white' : '#cbd5f5',
              opacity: isEn ? 1 : 0.7,
            }}
          >
            EN
          </Text>
        </Box>

        <Box
          style={{
            position: 'relative',
            flex: 1,
            zIndex: 1,
            textAlign: 'center',
          }}
        >
          <Text
            size="xs"
            fw={700}
            style={{
              color: !isEn ? 'white' : '#cbd5f5',
              opacity: !isEn ? 1 : 0.7,
            }}
          >
            ID
          </Text>
        </Box>
      </Box>
    </Tooltip>
  );
}
