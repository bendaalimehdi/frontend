import React, { useEffect, useState } from 'react';
import { dataService } from '../services/api'; // <--- Importer le service
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Nous gardons les données simulées pour les graphiques
// que nous n'avons pas encore migrés
const waterConsumptionData = Array.from({ length: 10 }, (_, i) => ({
  name: `L${i + 1}`, eau: Math.floor(Math.random() * 200 + 300)
}));
const efficiencyData = [
  { name: 'Économie', value: 72, color: '#10b981' },
  { name: 'Standard', value: 28, color: '#6b7280' }
];

export const StatistiquesPage = () => {
  // NOUVEAU: États pour les données d'humidité et le chargement
  const [humidityData, setHumidityData] = useState([]);
  const [loading, setLoading] = useState(true);

  // NOUVEAU: useEffect pour charger les données au démarrage
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // On cible un nœud spécifique pour l'exemple
        const nodeId = 'NODE_HUMIDITE_01'; // TODO: Rendre ceci dynamique si nécessaire
        const apiData = await dataService.getHumidityHistory(nodeId);

        // L'API retourne des données comme :
        // { hour: "2025-11-08 17:00", average_humidity: 55.2 }
        // Nous devons les formater pour le graphique
        const formattedData = apiData.map(item => ({
          day: new Date(item.hour).toLocaleString('fr-FR', {
            weekday: 'short',
            hour: '2-digit'
          }),
          humidity: item.average_humidity
        }));
        
        setHumidityData(formattedData);
      } catch (error) {
        console.error("Erreur chargement statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []); // Le tableau vide signifie "exécuter une seule fois au montage"

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistiques Détaillées</h2>

      {/* Graphique de consommation (toujours simulé) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 lg:col-span-2">
          {/* ... (code du BarChart) ... */}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          {/* ... (code du PieChart) ... */}
        </div>
      </div>

      {/* Graphique d'humidité (MAINTENANT DYNAMIQUE) */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique Humidité Moyenne (7j)</h3>
        {loading ? (
          <p>Chargement des statistiques...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={humidityData}> {/* <-- Données de l'état */}
              <CartesianGrid strokeDasharray="3 3" />
              {/* L'axe X affiche maintenant les jours/heures formatés */}
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="humidity" // <-- "humidity" correspond aux données formatées
                stroke="#10b981"
                strokeWidth={3}
                name="Humidité %"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};