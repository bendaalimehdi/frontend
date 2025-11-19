import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Vues
import { DashboardLayout } from './views/DashboardLayout';
import { LoginPage } from './views/LoginPage';
import { DashboardPage } from './views/DashboardPage';
import { LignesPage } from './views/LignesPage'; // NOUVEAU
import { StatistiquesPage } from './views/StatistiquesPage'; // NOUVEAU
import { ModulesPage } from './views/ModulesPage'; // NOUVEAU

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route 
        path="/*"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="lignes" element={<LignesPage />} /> {/* NOUVEAU */}
        <Route path="statistiques" element={<StatistiquesPage />} /> {/* NOUVEAU */}
        <Route path="modules" element={<ModulesPage />} /> {/* NOUVEAU */}
        
        {/* Redirection pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;