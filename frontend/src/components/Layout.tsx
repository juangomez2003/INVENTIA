import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="bg-orbs min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-h-screen p-6 overflow-auto">
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
