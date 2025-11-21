// ModuleCard.js

import React from 'react';
import { Settings, Download } from 'lucide-react';
import { nodeService } from '../services/api';

// Ajout de onEdit aux props
export const ModuleCard = ({ moduleConfig, onDelete, onEdit }) => { 
  const { identity, network, pins, logic, mac_address } = moduleConfig; 

  const handleDownload = async () => {
    try {
      await nodeService.downloadNodeConfig(identity.nodeId);
    } catch (error) {
      alert(`Erreur de téléchargement: ${error.message}`);
    }
  };

  const thresholdValue = logic.humidity_threshold 
    ? `${logic.humidity_threshold}%` 
    : `${logic.humidity_thresholdMin || 'N/A'}% / ${logic.humidity_thresholdMax || 'N/A'}%`;


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      {/* ... (Affichage des détails inchangé) ... */}
      <div className="flex items-center justify-between mb-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <Settings className="w-5 h-5 text-green-600" />
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {identity.isMaster ? 'Master' : 'Follower'}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{identity.nodeId}</h3>
      <p className="text-sm text-gray-500 mb-3">
          Ferme: {identity.farmId} | Zone: {identity.zoneId}
      </p>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">MAC Address</span>
          <span className="text-gray-900 font-medium">{mac_address || 'N/A'}</span>
        </div>
        {!identity.isMaster && network.master_mac && (
            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">MAC Master</span>
                <span className="text-blue-600 font-medium">{network.master_mac}</span>
            </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Pins configurés</span>
          <span className="text-gray-900 font-medium">
             {/* Affiche le nombre d'éléments dans le pins_config (JSON) */}
             {Object.keys(pins || {}).length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Réseau</span>
          <span className="text-gray-900 font-medium">{network.wifi_ssid}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Logique (Seuil)</span>
          <span className="text-green-600 font-medium">{thresholdValue}</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        {/* Bouton de Téléchargement */}
        <button 
          onClick={handleDownload}
          className="w-1/3 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-1"
        >
          <Download className="w-4 h-4" />
          <span>Config.</span>
        </button>
        {/* Bouton Configurer/Editer */}
        <button 
          onClick={() => onEdit(moduleConfig)} // APPEL DE LA FONCTION D'ÉDITION
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Configurer
        </button>
        <button 
          onClick={() => onDelete(identity.nodeId)}
          className="w-1/4 px-2 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
        >
          Suppr.
        </button>
      </div>
    </div>
  );
};