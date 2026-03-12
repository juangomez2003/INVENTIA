import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="bg-orbs" style={{ minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        minHeight: '100vh',
        padding: '32px 36px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
