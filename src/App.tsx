import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import Sidebar from './components/Sidebar';
import OverviewPage from './pages/OverviewPage';
import RecordPage from './pages/RecordPage';
import JournalPage from './pages/JournalPage';
import ArchivePage from './pages/ArchivePage';
import SearchPage from './pages/SearchPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-white">
          <Sidebar />
          <main className="flex-1 overflow-hidden flex">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/record/:slug" element={<RecordPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
