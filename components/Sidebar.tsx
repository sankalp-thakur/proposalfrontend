"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { History, Settings, Activity, Network, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from 'lucide-react'
import { logout } from '@/app/form/authUtils'

interface NavItemProps {
  href: string
  icon: LucideIcon
  label: string
}

function NavItem({ href, icon: Icon, label }: NavItemProps) {
  const pathname = usePathname()
  
  return (
    <Button 
      variant="ghost" 
      className={cn(
        "w-full justify-start text-white hover:bg-[#2A4731] hover:text-[#CCFF00]",
        pathname === href && "bg-[#2A4731] text-[#CCFF00]"
      )} 
      asChild
    >
      <Link href={href} className="flex items-center">
        <Icon className="mr-2 h-5 w-5" />
        <span>{label}</span>
      </Link>
    </Button>
  )
}

const navigationItems = [
  {
    href: '/app/plant-sizing',
    icon: Activity,
    label: 'Quick Plant Simulator'
  },
  {
    href: '/app',
    icon: Settings,
    label: 'Sizing Optimizer'
  },
  {
    href: '/app/past-optimizations',
    icon: History,
    label: 'Past Optimisations'
  },
  {
    href: '/app/network-editor',
    icon: Network,
    label: 'Network Editor'
  }
]

export default function Sidebar() {
  const router = useRouter();

  const handleSignout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        router.push('/');
      } else {
        console.error('Logout failed:', result.error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <aside className="w-64 h-screen shrink-0 bg-[#1A3721] text-white border-r border-[#2A4731]">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-[#2A4731]">
          <span className="text-[#CCFF00] text-2xl font-bold">Pablo</span>
        </div>
        <div className="flex-grow">
          <nav className="mt-6 space-y-2 px-4">
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#2A4731] flex flex-col space-y-3">
          <span className="text-sm text-gray-400">v1.0.0</span>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-[#2A4731] hover:text-[#CCFF00] mt-2"
            onClick={handleSignout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}

