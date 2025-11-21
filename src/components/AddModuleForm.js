// AddModuleForm.js

import React, { useState, useEffect, useMemo } from 'react';
import { nodeService, managementService } from '../services/api'; 
import { Settings, Building, MapPin, Edit, X } from 'lucide-react'; 

// Configurations par défaut - Mises à jour pour refléter la structure complète
const DEFAULT_PINS = { "led": 48, "led_brightness": 30, "lora_m0": 10, "lora_m1": 9, "lora_aux": 11, "lora_rx": 17, "lora_tx": 18, "valve": 0, "pump": 0 };
const DEFAULT_CALIBRATION = { "soil_dry": 3100, "soil_wet": 1200 };

const DEFAULT_NETWORK_COMMON = { 
  "master_mac": "", "enableESPNow": false, "enableLora": true, "lora_freq_mhz": 868, "lora_node_addr": 2, "lora_peer_addr": 1, "lora_channel": 24,
  "enableMqtt": true, "mqtt_broker": "192.168.1.71", "mqtt_port": 1883, "mqtt_user": "", "mqtt_pass": "",
  "topic_telemetry_up": "farm/telemetry", "topic_commands_down": "farm/commands/master/set"
};

const DEFAULT_LOGIC = { 
    "humidity_thresholdMin": 20.0, "humidity_thresholdMax": 80.0, "defaultIrrigationDurationMs": 45000,
    "send_times": [{ "hour": 8, "minute": 0 }, { "hour": 8, "minute": 5 }] // Exemple simplifié
};

const DEFAULT_SENSOR_CONFIG = {
    "temperature_sensor": { "enabled": false, "pin": 12 },
    "soil_humidity_sensors": [
        { "enabled": true, "sensorPin": 4, "powerPin": 5, "dryValue": 3100, "wetValue": 1200 }
    ]
};

// --- Composant utilitaire pour l'édition de JSON brut ---
const JsonEditor = ({ label, value, onChange, error }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{label} (JSON)</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows="6"
            className={`w-full p-2 border rounded-lg font-mono text-xs ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);
// ----------------------------------------------------

// Accepte moduleToEdit pour le mode édition
export const AddModuleForm = ({ onModuleAdded, onCancel, moduleToEdit }) => {
    
    // Détermine si nous sommes en mode édition
    const isEditMode = useMemo(() => !!moduleToEdit, [moduleToEdit]);
    
    const [step, setStep] = useState(isEditMode ? 3 : 1); // Démarre à l'étape 3 en mode édition
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [farms, setFarms] = useState([]);
    const [zones, setZones] = useState([]); 
    
    // Initialisation des champs
    const initialFarmId = moduleToEdit?.identity?.farmId || '';
    const initialZoneId = moduleToEdit?.identity?.zoneId || '';
    
    const [farmId, setFarmId] = useState(initialFarmId);
    const [newFarmId, setNewFarmId] = useState('');
    const [zoneId, setZoneId] = useState(initialZoneId);
    const [newZoneId, setNewZoneId] = useState('');
    
    const [nodeId, setNodeId] = useState(moduleToEdit?.identity?.nodeId || '');
    const [isMaster, setIsMaster] = useState(moduleToEdit?.identity?.isMaster || false);
    const [macAddress, setMacAddress] = useState(moduleToEdit?.mac_address || '');
    const [masterMacAddress, setMasterMacAddress] = useState(moduleToEdit?.master_mac_address || '');
    
    // Récupérer les données Network existantes et les champs simples séparés (pour les afficher dans le form)
    const existingNetwork = moduleToEdit?.network || DEFAULT_NETWORK_COMMON;
    const [wifiSsid, setWifiSsid] = useState(existingNetwork.wifi_ssid || "BboxM");
    const [wifiPassword, setWifiPassword] = useState(existingNetwork.wifi_password || "Midi2210@bbox");

    // ÉTATS JSON pour l'édition détaillée
    const [pinsConfig, setPinsConfig] = useState(JSON.stringify(moduleToEdit?.pins || DEFAULT_PINS, null, 2));
    const [sensorsConfig, setSensorsConfig] = useState(JSON.stringify(moduleToEdit?.sensors_config || DEFAULT_SENSOR_CONFIG, null, 2));
    // networkConfig doit être initialisé SANS wifi_ssid/password (on les gère séparément)
    const [networkConfig, setNetworkConfig] = useState(JSON.stringify(
        { ...existingNetwork, wifi_ssid: undefined, wifi_password: undefined }, null, 2));
    const [logicConfig, setLogicConfig] = useState(JSON.stringify(moduleToEdit?.logic || DEFAULT_LOGIC, null, 2));
    
    const [jsonErrors, setJsonErrors] = useState({}); // État pour stocker les erreurs de parsing JSON

    // Chargement de la hiérarchie au montage
    useEffect(() => {
        const loadHierarchy = async () => {
            try {
                const fetchedFarms = await managementService.getFarms();
                setFarms(fetchedFarms);
                
                if (!isEditMode && fetchedFarms.length > 0 && !farmId) {
                    setFarmId(fetchedFarms[0].farmId);
                }

                if (initialFarmId) {
                    const fetchedZones = await managementService.getZonesByFarm(initialFarmId);
                    setZones(fetchedZones);
                }
                
            } catch (err) {
                console.error("Erreur chargement de la hiérarchie:", err);
                setError("Impossible de charger les données de Ferme/Zone.");
            }
        };
        loadHierarchy();
        
        if (isEditMode) {
             const loadZonesForEdit = async () => {
                try {
                    const fetchedZones = await managementService.getZonesByFarm(initialFarmId);
                    setZones(fetchedZones);
                } catch (err) {
                    console.error("Erreur chargement des zones:", err);
                }
            };
            loadZonesForEdit();
        }
    }, [isEditMode, initialFarmId]);

    // Rechargement des zones lorsque la ferme sélectionnée change
    useEffect(() => {
        if (farmId && !isEditMode) {
            const loadZones = async () => {
                try {
                    const fetchedZones = await managementService.getZonesByFarm(farmId);
                    setZones(fetchedZones);
                    if (fetchedZones.length > 0) {
                        setZoneId(fetchedZones[0].zoneId);
                    } else {
                        setZoneId('');
                    }
                } catch (err) {
                    console.error("Erreur chargement des zones:", err);
                }
            };
            loadZones();
        }
    }, [farmId, isEditMode]);


    const handleNext = () => {
        setError('');
        setMessage('');
        setStep(s => s + 1);
    }
    const handlePrev = () => setStep(s => s - 1);
    
    // Logique pour l'étape 1: Ajouter/Choisir Ferme
    const handleAddFarm = async () => { 
        if (newFarmId.trim() === '') {
            setError("Veuillez entrer un ID pour la nouvelle ferme.");
            return;
        }
        setError('');
        setLoading(true);
        try {
            const newFId = newFarmId.trim().toUpperCase();
            const result = await managementService.createFarm({ farmId: newFId, name: newFId }); 
            setFarms(currentFarms => [...currentFarms, result.farm]);
            setFarmId(newFId);
            setNewFarmId('');
            setMessage(`Ferme ${newFId} créée avec succès!`);
        } catch (err) {
            setError(err.message); 
        } finally {
            setLoading(false);
        }
    };

    // Logique pour l'étape 2: Ajouter/Choisir Zone
    const handleAddZone = async () => {
        if (newZoneId.trim() === '') {
            setError("Veuillez entrer un ID pour la nouvelle zone.");
            return;
        }

        setError('');
        setLoading(true);
        if (zones.some(z => z.zoneId === newZoneId.trim().toUpperCase())) {
            setError(`La zone ${newZoneId} existe déjà dans cette ferme.`);
            setLoading(false);
            return;
        }

        try {
            const newZId = newZoneId.trim().toUpperCase();
            const result = await managementService.createZone({ farmId, zoneId: newZId, name: newZId });
            setZones(currentZones => [...currentZones, result.zone]);
            setZoneId(newZId);
            setNewZoneId('');
            setMessage(`Zone ${newZId} créée avec succès dans ${farmId}!`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Logique pour l'étape 3: Création / Édition du Module
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        // 1. Validation et Parsing des champs JSON
        let parsedPins, parsedSensors, parsedNetwork, parsedLogic;
        let tempJsonErrors = {};
        
        try { parsedPins = JSON.parse(pinsConfig); } catch (e) { tempJsonErrors.pins = 'JSON Pins Invalide.'; }
        try { parsedSensors = JSON.parse(sensorsConfig); } catch (e) { tempJsonErrors.sensors = 'JSON Sensors Invalide.'; }
        try { parsedNetwork = JSON.parse(networkConfig); } catch (e) { tempJsonErrors.network = 'JSON Network Invalide.'; }
        try { parsedLogic = JSON.parse(logicConfig); } catch (e) { tempJsonErrors.logic = 'JSON Logic Invalide.'; }
        
        setJsonErrors(tempJsonErrors);
        if (Object.keys(tempJsonErrors).length > 0) {
            setLoading(false);
            setError("Veuillez corriger les erreurs de syntaxe JSON.");
            return;
        }
        
        // 2. Définir la méthode d'API à appeler
        const apiCall = isEditMode 
            ? nodeService.updateNode.bind(null, moduleToEdit.identity.nodeId) 
            : nodeService.createNode; 

        // 3. Re-fusionner le Network JSON avec les champs simples (SSID/Password)
        const finalNetwork = {
            ...parsedNetwork, 
            wifi_ssid: wifiSsid,
            wifi_password: wifiPassword,
            master_mac: isMaster ? (macAddress.trim().toUpperCase() || undefined) : masterMacAddress.trim().toUpperCase(),
        };

        const finalConfig = {
            // IDENTITE
            identity: { 
                farmId: farmId, 
                zoneId: zoneId, 
                nodeId: nodeId.trim().toUpperCase(), 
                isMaster: isMaster 
            },
            // CONFIGS
            pins: parsedPins, 
            sensors_config: parsedSensors,
            calibration: DEFAULT_CALIBRATION, // On garde la calibration simple, pas d'interface dédiée pour l'instant
            network: finalNetwork, 
            logic: parsedLogic,
            // CHAMPS DE NŒUD
            mac_address: macAddress.trim().toUpperCase(),
            master_mac_address: !isMaster ? masterMacAddress.trim().toUpperCase() : undefined,
        };
        
        // Validation finale
        if (macAddress.trim() === '') { setError("L'Adresse MAC du Module (ESP32) est requise."); setLoading(false); return; }
        if (!isMaster && masterMacAddress.trim() === '') { setError("Le MAC Master est requis pour un Follower."); setLoading(false); return; }

        try {
            const result = await apiCall(finalConfig);
            onModuleAdded(result.node); 
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Rendu des étapes ---
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 mb-4 flex items-center"><Building className="w-5 h-5 mr-2 text-green-600"/> 1. Sélectionner ou Créer une Ferme</h4>
                        
                        {message && <p className="text-sm text-blue-600 p-2 bg-blue-100 rounded">{message}</p>}

                        <label className="block text-sm font-medium text-gray-700 mb-1">Ferme existante</label>
                        <select
                            value={farmId}
                            onChange={(e) => setFarmId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            disabled={isEditMode}
                        >
                            {farms.length === 0 ? <option value="">Aucune ferme trouvée</option> :
                            farms.map(f => <option key={f.farmId} value={f.farmId}>{f.name} ({f.farmId})</option>)}
                        </select>
                        
                        <div className="pt-4 border-t border-gray-200">
                             <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ajouter une nouvelle Ferme (ID/Nom)</label>
                                <input type="text" value={newFarmId} onChange={(e) => setNewFarmId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: FARM003" />
                                <button 
                                    type="button" 
                                    onClick={handleAddFarm} 
                                    disabled={loading || isEditMode || newFarmId.trim() === ''} 
                                    className={`w-full px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 ${loading || isEditMode ? 'opacity-50' : ''}`}
                                >
                                    Ajouter Ferme
                                </button>
                             </div>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <button 
                                type="button" 
                                onClick={handleNext} 
                                className={`px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 ${!farmId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!farmId}
                            >
                                Suivant : Choisir Zone
                            </button>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-green-600"/> 2. Sélectionner ou Créer une Zone</h4>
                        <p className="text-sm text-gray-500 mb-4">Ferme sélectionnée: **{farmId}**</p>
                        
                        {message && <p className="text-sm text-blue-600 p-2 bg-blue-100 rounded">{message}</p>}

                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone existante</label>
                        <select
                            value={zoneId}
                            onChange={(e) => setZoneId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            {zones.length === 0 ? <option value="">Aucune zone trouvée dans cette ferme</option> :
                            zones.map(z => <option key={z.zoneId} value={z.zoneId}>{z.name} ({z.zoneId})</option>)}
                        </select>
                        
                        <div className="pt-4 border-t border-gray-200">
                             <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ajouter une nouvelle Zone (ID/Nom)</label>
                                <input type="text" value={newZoneId} onChange={(e) => setNewZoneId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: ZONEXXX" />
                                <button 
                                    type="button" 
                                    onClick={handleAddZone} 
                                    disabled={loading || newZoneId.trim() === ''} 
                                    className={`w-full px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 ${loading ? 'opacity-50' : ''}`}
                                >
                                    {loading ? 'Ajout en cours...' : `Ajouter Zone à ${farmId}`}
                                </button>
                             </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button type="button" onClick={handlePrev} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Précédent
                            </button>
                            <button 
                                type="button" 
                                onClick={handleNext} 
                                className={`px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 ${!zoneId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!zoneId}
                            >
                                Suivant : Configurer Module
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    // --- STEP 3: Configurer le Module (Édition/Ajout) ---
                    <div className="space-y-6">
                        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                            {isEditMode ? 
                                <> <Edit className="w-5 h-5 mr-2 text-blue-600"/> Édition du Module : {moduleToEdit.identity.nodeId} </> : 
                                <> <Settings className="w-5 h-5 mr-2 text-green-600"/> 3. Configuration du Module </>
                            }
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">Cible: **{farmId} / {zoneId}**</p>
                        
                        {/* Section I: Identification et Réseau */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                            {/* MAC Address du Module (Self) */}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">MAC Module (ESP32)</label>
                                <input type="text" value={macAddress} onChange={(e) => setMacAddress(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: 80:B5:4E:C3:23:D4" required />
                            </div>
                            
                            {/* Type de module */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select value={isMaster ? 'master' : 'follower'} onChange={(e) => setIsMaster(e.target.value === 'master')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" >
                                    <option value="follower">Follower (Capteur)</option>
                                    <option value="master">Master (Contrôleur)</option>
                                </select>
                            </div>
                            {/* MAC Address du Master (uniquement pour Follower) */}
                            {!isMaster && (
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-1">MAC Master (Requis)</label>
                                    <input type="text" value={masterMacAddress} onChange={(e) => setMasterMacAddress(e.target.value)}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-lg" required />
                                </div>
                            )}
                            
                            {/* WiFi Credentials (Champs simples) */}
                            <div className="md:col-span-3 grid grid-cols-2 gap-4">
                                <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="SSID WiFi" required />
                                <input type="password" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Mot de passe WiFi" required />
                            </div>
                        </div>

                        {/* Section II: Configuration Détaillée (JSON) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <JsonEditor 
                                label="Pins Config" 
                                value={pinsConfig} 
                                onChange={setPinsConfig}
                                error={jsonErrors.pins}
                            />
                            <JsonEditor 
                                label="Network Config (Avancé - sans WiFi/MAC)" 
                                value={networkConfig} 
                                onChange={setNetworkConfig}
                                error={jsonErrors.network}
                            />
                            <JsonEditor 
                                label="Sensors Config" 
                                value={sensorsConfig} 
                                onChange={setSensorsConfig}
                                error={jsonErrors.sensors}
                            />
                            <JsonEditor 
                                label="Logic Config (Seuils, send_times)" 
                                value={logicConfig} 
                                onChange={setLogicConfig}
                                error={jsonErrors.logic}
                            />
                        </div>

                        <div className="flex justify-between mt-6 pt-4 border-t">
                            <button type="button" onClick={handlePrev} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" disabled={isEditMode}>
                                Précédent : Choisir Zone
                            </button>
                            
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                            >
                                Annuler
                            </button>

                            <button 
                                type="submit" 
                                className={`px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'En cours...' : 
                                  (isEditMode ? 'Enregistrer les Modifications (PUT)' : 'Créer le Module (POST)')}
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div>Erreur d'étape.</div>;
        }
    };

    // --- Rendu final du composant ---
    return (
        <form 
            onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} 
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-500 space-y-6"
        >
            {/* Barre de Progression adaptée pour l'édition */}
            <div className="flex justify-between items-center text-sm font-medium text-gray-500 border-b pb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    {isEditMode ? <><Edit className="w-6 h-6 mr-3 text-blue-600"/> Modifier le Module </> : <><Settings className="w-6 h-6 mr-3 text-green-600"/> Ajouter un Nouveau Module</>}
                </h3>
            </div>
            
            {error && <p className="text-red-500 text-sm p-2 bg-red-100 rounded">{error}</p>}

            {renderStep()}

            <button
                type="button"
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
                <X className="w-6 h-6" />
            </button>
        </form>
    );
};