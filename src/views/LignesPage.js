import React, { useEffect, useState } from 'react';
import { dataService } from '../services/api';
import { LineCard } from '../components/LineCard';
import { Plus } from 'lucide-react';

export const LignesPage = () => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLinesData = async () => {
      try {
        setLoading(true);
        // 1. Récupérer les statuts (vannes et nœuds)
        const [valves, nodes] = await Promise.all([
          dataService.getValvesStatus(), //
          dataService.getNodesStatus()   //
        ]);

        // 2. Pour chaque nœud, récupérer ses dernières lectures
        const lineDataPromises = nodes.map(async (node) => {
          const latestReadings = await dataService.getLatestNodeData(node.node_id_str); //
          const valve = valves.find(v => v.name.includes(node.node_id_str)) || {}; // Logique de liaison simple

          // Formatte les données pour la LineCard
          return {
            id: node.node_id_str,
            name: node.node_id_str.replace('_', ' '),
            status: node.connection_state === 'Online' ? 'ok' : 'warning',
            humidity: latestReadings.find(r => r.sensor_type === 'soilHumidity')?.value.toFixed(1),
            temperature: latestReadings.find(r => r.sensor_type === 'temperature')?.value.toFixed(1),
            ph: latestReadings.find(r => r.sensor_type === 'ph')?.value.toFixed(1),
            flow: latestReadings.find(r => r.sensor_type === 'flow')?.value.toFixed(1),
            valveOpen: valve.state === 'open'
          };
        });

        const combinedData = await Promise.all(lineDataPromises);
        setLines(combinedData);

      } catch (error) {
        console.error("Erreur chargement des lignes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLinesData();
  }, []);

  if (loading) return <div>Chargement des lignes...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Lignes</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-4 h-4" />
          <span>Ajouter Ligne</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lines.map((line) => (
          <LineCard key={line.id} data={line} />
        ))}
      </div>
    </div>
  );
};