import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ClientToastContainer from "@/components/ClientToastContainer"

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit'
})

export const metadata = {
  title: 'Pablo - Green Hydrogen Project Optimization',
  description: 'Get instant insights into the best-fit project size, complete with detailed financial models and scenarios.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <ClientToastContainer />
      </body>
    </html>
  )
}
