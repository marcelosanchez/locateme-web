import { useSidebarState } from '../state/sidebarStore'

export const SidebarToggleButton = () => {
  const { toggle } = useSidebarState()

  return (
    <div
      onClick={toggle}
      className="w-full bg-transparent rounded-full cursor-pointer flex items-center justify-center m-0 p-0"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-[28px] h-[28px] text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </div>
  )
}
