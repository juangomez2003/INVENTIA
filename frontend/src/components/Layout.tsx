import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        minHeight: '100vh',
        padding: '36px 40px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
