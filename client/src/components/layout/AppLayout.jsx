import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import OfflineBanner from '../offline/OfflineBanner';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <OfflineBanner />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
