import React from 'react';
import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 bg-white text-black overflow-auto">
        <main className="container mx-auto py-6 px-4">{children}</main>
      </div>
    </div>
  )
}

