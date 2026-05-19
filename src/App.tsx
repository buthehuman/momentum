import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import Sidebar from './components/Sidebar';
import OverviewPage from './pages/OverviewPage';
import RecordPage from './pages/RecordPage';
import JournalPage from './pages/JournalPage';
import ArchivePage from './pages/ArchivePage';
import SearchPage from './pages/SearchPage';
import AuthPage from './pages/AuthPage';

function MainApp() {
  const { user, authLoading } = useApp();
  const location = useLocation();
  const isRecordRoute = /^\/record\/[^/]+$/.test(location.pathname);

  // Show loading spinner while checking session
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-gray-300 text-sm">Loading…</div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Non-overview routes render normally without split layout
  if (!isRecordRoute && location.pathname !== '/') {
    return (
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex">
          <Routes>
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex">
        {/* Left panel: Overview — always mounted, smoothly shrinks when detail opens */}
        <div
          className={`h-full overflow-y-auto transition-all duration-300 ease-out ${
            isRecordRoute ? 'w-1/2 border-r border-gray-100' : 'w-full'
          }`}
        >
          <OverviewPage />
        </div>
        {/* Right panel: Detail — slides in from the right like a curtain */}
        <div
          className={`h-full overflow-hidden transition-all duration-300 ease-out ${
            isRecordRoute ? 'w-1/2' : 'w-0'
          }`}
        >
          {isRecordRoute && (
            <div className="h-full overflow-y-auto">
              <Routes>
                <Route path="/record/:categoryId" element={<RecordPage />} />
              </Routes>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AppProvider>
  );
}
