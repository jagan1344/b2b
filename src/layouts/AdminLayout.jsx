import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Desktop sidebar - always visible */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar - toggled */}
      {sidebarOpen && (
        <>
          <div className="block md:hidden fixed inset-0 z-30">
            <Sidebar />
          </div>
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}

      <main className="main-content" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="p-4 md:p-8 flex-1 flex flex-col max-w-7xl mx-auto w-full">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <div className="animate-fade-in flex-1">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
