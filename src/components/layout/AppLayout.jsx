import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CustomCursor from './CustomCursor';
import CanvasBackground from './CanvasBackground';
import Preloader from './Preloader';
import SmoothScroll from './SmoothScroll';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SmoothScroll>
      <Preloader />
      <CustomCursor />
      <CanvasBackground />

      <div className="studio-layout">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="studio-main-content">
          <Topbar onMenuClick={() => setMobileOpen(true)} />

          <main
            style={{
              padding: '32px',
              maxWidth: '1600px',
              width: '100%',
              margin: '0 auto',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SmoothScroll>
  );
}
