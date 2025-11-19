import React, { useEffect, useState } from 'react';
import { nodeService } from '../services/api';
import { ModuleCard } from '../components/ModuleCard';
import { AddModuleForm } from '../components/AddModuleForm';
import { Plus } from 'lucide-react';

export const ModulesPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModule, setShowAddModule] = useState(false);

  const loadModules = async () => {
    try {
      setLoading(true);
      const configs = await nodeService.getNodesConfig(); //
      setModules(configs);
    } catch (error) {
      console.error("Erreur chargement des modules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleModuleAdded = (newModule) => {
    setModules([...modules, newModule]);
    setShowAddModule(false);
  };
  
  const handleDeleteNode = async (nodeIdStr) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${nodeIdStr} ?`)) {
      try {
        await nodeService.deleteNode(nodeIdStr); //
        setModules(modules.filter(m => m.identity.nodeId !== nodeIdStr));
      } catch (error) {
         console.error("Erreur suppression module:", error);
      }
    }
  };

  if (loading) return <div>Chargement des modules...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Modules</h2>
        {!showAddModule && (
          <button
            onClick={() => setShowAddModule(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Module</span>
          </button>
        )}
      </div>

      {showAddModule && (
        <AddModuleForm 
          onModuleAdded={handleModuleAdded}
          onCancel={() => setShowAddModule(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <ModuleCard key={mod.identity.nodeId} moduleConfig={mod} onDelete={handleDeleteNode} />
        ))}
      </div>
    </div>
  );
};