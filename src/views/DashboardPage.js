import React, { useEffect, useState } from 'react';
import { dataService } from '../services/api';
// Importez vos composants de graphiques (Recharts) et icônes (Lucide)
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplet, Activity, Zap, TrendingUp } from 'lucide-react';

// TODO: Déplacez ceci dans components/KPICard.js
const KPICard = ({ title, value, change, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
      </div>
      <div className={`bg-${color}-100 p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export const DashboardPage = () => {
  // Remplacer les données simulées par de vrais états
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalWater: 0, avgHumidity: 0, activeValves: 0 });
  const [waterData, setWaterData] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Ex: Aller chercher le statut des vannes
        const valves = await dataService.getValvesStatus();
        const activeValves = valves.filter(v => v.state === 'open').length;
        
        // Ex: Calculer la consommation totale (nécessite d'adapter l'API ou de le faire ici)
        const totalWater = valves.reduce((sum, v) => sum + (v.duration || 0), 0) / 1000; // Juste un exemple

        setStats({ totalWater: `${totalWater}L`, avgHumidity: '55%', activeValves: `${activeValves}/10` });
        
        // Ex: Remplir les graphiques
        setWaterData(valves.map(v => ({ name: v.name, eau: (v.duration || 0) / 1000 })));

      } catch (error) {
        console.error("Impossible de charger les données du dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div>Chargement du tableau de bord...</div>
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Consommation Total" 
          value={stats.totalWater} 
          icon={<Droplet className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <KPICard 
          title="Humidité Moyenne" 
          value={stats.avgHumidity} 
          icon={<Activity className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <KPICard 
          title="Vannes Actives" 
          value={stats.activeValves} 
          icon={<Zap className="w-6 h-6 text-purple-600" />}
          color="purple"
        />
        <KPICard 
          title="Efficacité IA" 
          value="72%" 
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          color="orange"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consommation par Ligne</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={waterData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="eau" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Ajoutez l'autre graphique ici */}
      </div>
    </div>
  );
};