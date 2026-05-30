import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ImpactAnalyzerPage } from './pages/ImpactAnalyzerPage';
import { ReleasesPage } from './pages/ReleasesPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/impact-analyzer" replace />} />
        <Route path="/impact-analyzer" element={<ImpactAnalyzerPage />} />
        <Route path="/releases" element={<ReleasesPage />} />
        <Route path="*" element={<Navigate to="/impact-analyzer" replace />} />
      </Route>
    </Routes>
  );
}
