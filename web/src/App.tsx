import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { type ReactNode } from 'react';
import { MainLayout } from './components/MainLayout';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateRequestPage from './pages/CreateRequestPage';
import IncomingRequestsPage from './pages/IncomingRequestsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import NotImplementedPage from './pages/NotImplementedPage';
import AccessControlPage from './pages/AccessControlPage';

function PrivateRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function InitialRedirect() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InitialRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="requests/create" element={<CreateRequestPage />} />
          <Route path="requests/mine" element={<MyRequestsPage />} />
          <Route path="requests/branch-approve" element={<IncomingRequestsPage />} />
          <Route path="requests/final-approve" element={<IncomingRequestsPage />} />

          <Route path="reports/branch" element={<NotImplementedPage />} />
          <Route path="branches" element={<NotImplementedPage />} />
          <Route path="report" element={<NotImplementedPage />} />
          <Route path="audit-logs" element={<NotImplementedPage />} />
          <Route path="access-control" element={<AccessControlPage />} />

          <Route path="*" element={<NotImplementedPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
