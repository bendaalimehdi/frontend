// ModulesPage.js

import React, { useEffect, useState } from 'react';
import { nodeService } from '../services/api';
import { ModuleCard } from '../components/ModuleCard';
import { AddModuleForm } from '../components/AddModuleForm';
import { Plus } from 'lucide-react';

export const ModulesPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModule, setShowAddModule] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState(null); // NOUVEAU ÉTAT

  const loadModules = async () => {
    try {
      setLoading(true);
      const configs = await nodeService.getNodesConfig();
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

  const handleModuleAdded = (newOrUpdatedModule) => {
    // Si nous étions en mode édition, remplace l'ancien module dans la liste
    if (moduleToEdit) {
        setModules(modules.map(m => 
            m.identity.nodeId === newOrUpdatedModule.identity.nodeId ? newOrUpdatedModule : m
        ));
        setModuleToEdit(null);
    } else {
        // Mode ajout
        setModules([...modules, newOrUpdatedModule]);
    }
    setShowAddModule(false);
  };
  
  const handleEditNode = (moduleConfig) => { // NOUVELLE FONCTION
      setModuleToEdit(moduleConfig);
      setShowAddModule(true);
  }

  const handleCancelForm = () => { // Adapter pour annuler l'édition ou l'ajout
      setShowAddModule(false);
      setModuleToEdit(null);
  }

  const handleDeleteNode = async (nodeIdStr) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${nodeIdStr} ?`)) {
      try {
        await nodeService.deleteNode(nodeIdStr); 
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
        {/* Afficher le bouton d'ajout uniquement si le formulaire n'est pas ouvert */}
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

      {(showAddModule || moduleToEdit) && (
        <AddModuleForm 
          onModuleAdded={handleModuleAdded}
          onCancel={handleCancelForm} // Passer la nouvelle fonction d'annulation
          moduleToEdit={moduleToEdit} // PASSER L'OBJET POUR L'ÉDITION
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <ModuleCard 
            key={mod.identity.nodeId} 
            moduleConfig={mod} 
            onDelete={handleDeleteNode}
            onEdit={handleEditNode} // PASSER LA NOUVELLE FONCTION D'ÉDITION
          />
        ))}
      </div>
    </div>
  );
};