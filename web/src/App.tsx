import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreateRequestPage from './pages/CreateRequestPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/requests/create" element={<CreateRequestPage />} />
        {/* Redirect root to create request for now */}
        <Route path="/" element={<Navigate to="/requests/create" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


