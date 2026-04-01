import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/dashboard";
import Mapa from "./pages/Mapa";
import Monitoramento from "./pages/Monitoramento";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/mapa" element={
          <ProtectedRoute>
            <Mapa />
          </ProtectedRoute>
        } />
        <Route path="/monitoramento" element={
          <ProtectedRoute>
            <Monitoramento />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
