import { useSidebarState } from '../state/sidebarStore'
import familyIcon from '@/ui/demo/icons/family_icon.png'

export const SidebarToggleButton = () => {
  const { toggle } = useSidebarState()

  return (
    <div
      onClick={toggle}
      className="w-full bg-transparent rounded-full cursor-pointer flex items-center justify-center m-0 p-0"
    >
      <img
        src={familyIcon}
        alt="Group Icon"
        className="w-[35px] h-[35px] rounded-full ring-2 ring-white object-cover"
      />
    </div>
  )
}
