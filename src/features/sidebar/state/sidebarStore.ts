import { create } from 'zustand'

type SidebarState = {
  collapsed: boolean
  toggle: () => void
}

export const useSidebarState = create<SidebarState>((set) => ({
  collapsed: true,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
}))
