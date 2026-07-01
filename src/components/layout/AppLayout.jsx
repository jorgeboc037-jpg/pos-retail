import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppLayout({ toastContainer }) {
  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      {toastContainer}
      <main className="flex-1 pt-safe pb-[80px]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
