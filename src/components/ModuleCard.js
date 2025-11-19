import React from 'react';
import { Settings } from 'lucide-react';

export const ModuleCard = ({ moduleConfig, onDelete }) => {
  const { identity, network, pins, logic } = moduleConfig;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <Settings className="w-5 h-5 text-green-600" />
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {identity.isMaster ? 'Master' : 'Nœud'}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{identity.nodeId}</h3>
      <p className="text-sm text-gray-500 mb-3">Zone: {identity.zoneId}</p>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Pins configurés</span>
          <span className="text-gray-900 font-medium">{Object.keys(pins).length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Réseau</span>
          <span className="text-gray-900 font-medium">{network.wifi_ssid}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Logique (Seuil)</span>
          <span className="text-green-600 font-medium">{logic.humidity_threshold}%</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <button className="flex-1 mt-4 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Configurer
        </button>
        <button 
          onClick={() => onDelete(identity.nodeId)}
          className="mt-4 px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
        >
          Suppr.
        </button>
      </div>
    </div>
  );
};