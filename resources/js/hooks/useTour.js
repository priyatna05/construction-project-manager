import { useCallback, useRef } from 'react';
import Shepherd from 'shepherd.js';
import { getTourSteps, TOUR_VERSION } from '@/tour/steps';

const STORAGE_KEY_PREFIX = 'tour:seen:';

const buildStorageKey = tourId => `${STORAGE_KEY_PREFIX}${tourId}:${TOUR_VERSION}`;

const markSeen = tourId => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(buildStorageKey(tourId), 'true');
};

const hasSeen = tourId => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(buildStorageKey(tourId)) === 'true';
};

export default function useTour() {
  const tourRef = useRef(null);

  const createTour = useCallback(tourId => {
    const rawSteps = getTourSteps(tourId);

    if (!rawSteps || rawSteps.length === 0) {
      console.warn(`No steps defined for tour ${tourId}`);
      return null;
    }

    const availableSteps = rawSteps.filter(step => {
      if (!step.attachTo?.element) return true;
      const targetExists = Boolean(document.querySelector(step.attachTo.element));
      if (!targetExists) {
        console.warn(`Tour target not found: ${step.attachTo.element}`);
      }
      return targetExists;
    });

    if (availableSteps.length === 0) {
      console.warn('No valid steps to start tour');
      return null;
    }

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: 'smooth', block: 'center' },
        canClickTarget: false,
        modalOverlayOpeningPadding: 8,
        classes: 'tour-theme',
      },
    });

    availableSteps.forEach((step, index) => {
      const isLast = index === availableSteps.length - 1;

      tour.addStep({
        ...step,
        buttons: [
          {
            text: 'Lewati',
            classes: 'shepherd-button-secondary',
            action: () => tour.cancel(),
          },
          ...(index > 0
            ? [
                {
                  text: 'Kembali',
                  classes: 'shepherd-button-secondary',
                  action: () => tour.back(),
                },
              ]
            : []),
          {
            text: isLast ? 'Selesai' : 'Lanjut',
            classes: 'shepherd-button-primary',
            action: () => (isLast ? tour.complete() : tour.next()),
          },
        ],
      });
    });

    tour.on('complete', () => markSeen(tourId));
    tour.on('cancel', () => markSeen(tourId));

    return tour;
  }, []);

  const start = useCallback(
    tourId => {
      const id = tourId || 'getting-started';

      if (tourRef.current) {
        tourRef.current.cancel();
      }

      const tour = createTour(id);

      if (!tour) return false;

      tourRef.current = tour;
      tour.start();
      return true;
    },
    [createTour]
  );

  const reset = useCallback(tourId => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(buildStorageKey(tourId || 'getting-started'));
  }, []);

  return {
    start,
    hasSeen,
    reset,
  };
}
