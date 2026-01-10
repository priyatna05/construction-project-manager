import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import 'shepherd.js/dist/css/shepherd.css';
import 'nprogress/nprogress.css';
import '../css/app.css';
import './bootstrap';
import './i18n';

import { createInertiaApp } from '@inertiajs/react';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import NetworkStatusDetector from './components/NetworkStatusDetector';


const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: { light: 6, dark: 8 },
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
});

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'ConstructionPM';

createInertiaApp({
  title: title => {if (title === '') {
      return appName;
    }
    return title;
  },
  resolve: name =>
    resolvePageComponent(`./pages/${name}.jsx`, import.meta.glob('./pages/**/*.jsx')),
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <MantineProvider
        theme={theme}
        defaultColorScheme='auto'
      >
        <Notifications />
        <NetworkStatusDetector />
        <ModalsProvider>
          <App {...props} />
        </ModalsProvider>
      </MantineProvider>
    );
  },
  progress: false,
});
