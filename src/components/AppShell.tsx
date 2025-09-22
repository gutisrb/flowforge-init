import { Outlet } from 'react-router-dom';
import { AppNavigation } from './AppNavigation';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}