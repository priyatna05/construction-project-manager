import { router } from '@inertiajs/react';
import NProgress from 'nprogress';

NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
});

let timeout = null;

router.on('start', () => {
  timeout = setTimeout(() => NProgress.start(), 250);
});

router.on('progress', event => {
  if (NProgress.isStarted() && event.detail.progress.percentage) {
    NProgress.set((event.detail.progress.percentage / 100) * 0.9);
  }
});

router.on('finish', event => {
  clearTimeout(timeout);
  if (!NProgress.isStarted()) {
    return;
  } else if (event.detail.visit.completed) {
    NProgress.done();
  } else if (event.detail.visit.interrupted) {
    NProgress.set(0);
  } else if (event.detail.visit.cancelled) {
    NProgress.done();
    NProgress.remove();
  }
});

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
delete window.axios.defaults.headers.common['X-CSRF-TOKEN'];

// Ensure cookies are sent with requests (required when backend sets XSRF cookie)
window.axios.defaults.withCredentials = true;
// Explicit xsrf cookie/header names (Laravel default)
window.axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
window.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

window.axios.pendingRequests = 0;

window.axios.interceptors.request.use(
  function (config) {
    config.progress === true && NProgress.start();
    window.axios.pendingRequests++;
    return config;
  },
  function (error) {
    NProgress.done();
    window.axios.pendingRequests--;
    console.error(error);
    return Promise.reject(error);
  }
);

window.axios.interceptors.response.use(
  function (response) {
    NProgress.done();
    window.axios.pendingRequests--;
    return response;
  },
  function (error) {
    NProgress.done();
    window.axios.pendingRequests--;
    console.error(error);

    // Avoid redirect loops: skip if we are already trying to show the error page
    // or if the failing request targets the error route itself.
    const isErrorRequest = (error.config?.url ?? '').includes('/error/');
    if (window.axios.__redirectingToError || isErrorRequest) {
      return Promise.reject(error);
    }

    // If the server responded with a status (e.g. 500) or there is a network error,
    // redirect user to the Error page so our `Error` Inertia page can show a friendly UI.
    try {
      const status = error.response ? error.response.status : null;
      // Network error (no response) -> show 503 Service Unavailable
      if (!status) {
        window.axios.__redirectingToError = true;
        // If router and route() are available, navigate to /error/503
        if (typeof router !== 'undefined' && typeof route === 'function') {
          router.visit(route('error', 503));
        } else {
          window.location.href = '/error/503';
        }
      } else if (status >= 500) {
        window.axios.__redirectingToError = true;
        if (typeof router !== 'undefined' && typeof route === 'function') {
          router.visit(route('error', status));
        } else {
          window.location.href = `/error/${status}`;
        }
      }
    } catch (e) {
      console.error('Failed to redirect to error page', e);
    }

    return Promise.reject(error);
  }
);


/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

import Echo from 'laravel-echo';

import dayjs from 'dayjs';
import Pusher from 'pusher-js';
window.Pusher = Pusher;
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
  wsHost: import.meta.env.VITE_PUSHER_HOST
    ? import.meta.env.VITE_PUSHER_HOST
    : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
  wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
  wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
  forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
  withCredentials: true,
  auth: {
    headers: {
      'X-CSRF-TOKEN': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
    },
  },
});

// Add error handling for connection issues
window.Echo.connector.pusher.connection.bind('error', function (error) {
  console.error('WebSocket connection error:', error);
});
window.Echo.connector.pusher.connection.bind('disconnected', function () {
  console.warn('WebSocket disconnected');
});
window.Echo.connector.pusher.connection.bind('connected', function () {
  console.log('WebSocket connected');
});

// dayjs
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
