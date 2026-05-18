import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

  // Show main app if logged in
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/record/:categoryId" element={<RecordPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
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
