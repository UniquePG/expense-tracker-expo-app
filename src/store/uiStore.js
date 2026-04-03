import { create } from 'zustand';

export const useUIStore = create((set) => ({
  theme: 'light',
  isSidebarOpen: false,
  modalStates: {},

  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setModalState: (modalId, isOpen) =>
    set((state) => ({
      modalStates: { ...state.modalStates, [modalId]: isOpen },
    })),
}));

export default useUIStore;
