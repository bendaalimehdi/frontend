import React, { useState } from 'react';
import { nodeService } from '../services/api';

// Ceci est un formulaire simplifié basé sur votre prototype
// L'API attend un objet JSON beaucoup plus complexe
export const AddModuleForm = ({ onModuleAdded, onCancel }) => {
  const [nodeId, setNodeId] = useState('NOEUD_TEST_01');
  const [zone, setZone] = useState('ZONE001');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // TODO: Construire l'objet config *complet* ici
    // L'API attend { identity: {...}, pins: {...}, ... }
    // C'est un exemple simplifié :
    const newModuleConfig = {
      identity: { farmId: "FARM001", zoneId: zone, nodeId: nodeId, isMaster: false },
      pins: { led: 48, soil_sensor: 14 }, // Exemple minimal
      calibration: { soil_dry: 3100, soil_wet: 1200 }, // Exemple
      network: { wifi_ssid: "MonWifi", wifi_password: "MonMotDePasse" }, // Exemple
      logic: { humidity_threshold: 50.0 } // Exemple
    };

    try {
      const addedModule = await nodeService.createNode(newModuleConfig);
      onModuleAdded(addedModule.node); // Fait remonter le nouveau module
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border-2 border-green-500">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveau Module</h3>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID du Nœud (ex: NODE_01)</label>
          <input
            type="text"
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zone d'Affectation</label>
           <input
            type="text"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
      </div>
      <div className="flex space-x-3 mt-4">
        <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
};