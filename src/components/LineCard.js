import React from 'react';
import { Droplet, Thermometer, Zap, Activity } from 'lucide-react';

// C'est un composant "bête" qui ne fait qu'afficher les props
export const LineCard = ({ data }) => {
  const { 
    name, 
    status, 
    humidity, 
    temperature, 
    ph, 
    flow, 
    valveOpen 
  } = data;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">Goutte à Goutte • STM32-{data.id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {status === 'ok' ? 'OK' : 'Attention'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Humidité</p>
            <p className="text-sm font-semibold">{humidity || 'N/A'}%</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500">Température</p>
            <p className="text-sm font-semibold">{temperature || 'N/A'}°C</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-purple-500" />
          <div>
            <p className="text-xs text-gray-500">pH</p>
            <p className="text-sm font-semibold">{ph || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Droplet className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-xs text-gray-500">Débit</p>
            <p className="text-sm font-semibold">{flow || 'N/A'}L/min</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${valveOpen ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-gray-600">
            Vanne {valveOpen ? 'Ouverte' : 'Fermée'}
          </span>
        </div>
        <button className="text-sm text-green-600 hover:text-green-700 font-medium">
          Contrôler
        </button>
      </div>
    </div>
  );
};