"use client"

import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="w-full h-full">{children}</main>
      </div>
    </div>
  )
}
