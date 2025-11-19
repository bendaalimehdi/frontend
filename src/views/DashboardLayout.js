import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // Outlet affichera la page active
import { useAuth } from '../context/AuthContext';
import { Droplet, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom'; // Pour la navigation

const NavLink = ({ to, children, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`w-full lg:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </Link>
);

export const DashboardLayout = () => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Note : 'activeTab' sera maintenant géré par le routeur, 
  // mais nous pouvons l'extraire de l'URL pour le style.
  // Pour l'instant, gardons simple.
  const [activeTab, setActiveTab] = useState('dashboard'); // Vous améliorerez ceci avec 'useLocation' de React Router

  const tabs = [
    { id: 'dashboard', name: 'Tableau de Bord', path: '/' },
    { id: 'lignes', name: 'Lignes', path: '/lignes' },
    { id: 'statistiques', name: 'Statistiques', path: '/statistiques' },
    { id: 'modules', name: 'Modules', path: '/modules' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Ferme Walid Ziri</h1>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
            
            <div className="hidden lg:flex items-center space-x-2">
              <span className="text-sm text-gray-600">Walid Ziri</span>
              <button 
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:flex space-y-2 lg:space-y-0 lg:space-x-1 py-2`}>
            {tabs.map((tab) => (
              <NavLink
                key={tab.id}
                to={tab.path}
                active={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
              >
                {tab.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenu de la Page (c'est ici que le routeur travaille) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 • Créé par Ben Daali Mehdi
          </p>
        </div>
      </footer>
    </div>
  );
};