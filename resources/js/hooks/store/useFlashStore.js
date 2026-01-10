import { create } from 'zustand';

export const useFlashStore = create(set => ({
  flash: null,
  setFlash: flash => set({ flash }),
  clearFlash: () => set({ flash: null }),
}));
