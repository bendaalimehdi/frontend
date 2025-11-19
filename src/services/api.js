// L'URL de base de votre backend Flask
// Assurez-vous qu'elle correspond à l'endroit où votre serveur 'run.py' est exécuté.
const API_URL = 'http://localhost:5000';

/**
 * Service pour gérer l'authentification (login, logout, token).
 */
export const authService = {
  /**
   * Tente de connecter l'utilisateur.
   * En cas de succès, stocke les tokens dans le localStorage.
   * @param {string} username - Le nom d'utilisateur.
   * @param {string} password - Le mot de passe.
   * @returns {Promise<object>} Les données de réponse (tokens).
   * @throws {Error} Si la connexion échoue.
   */
  login: async (username, password) => {
    // Appelle la route /auth/login de votre API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Échec de la connexion");
    }

    const data = await response.json();
    // Stocke les tokens pour les sessions futures
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  },

  /**
   * Déconnecte l'utilisateur en supprimant les tokens.
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Récupère le token d'accès actuel.
   * @returns {string|null} Le token d'accès.
   */
  getToken: () => {
    return localStorage.getItem('access_token');
  }
};

/**
 * Un client API "intelligent" qui ajoute automatiquement
 * le token d'authentification à chaque requête.
 */
const apiClient = {
  /**
   * Exécute une requête GET authentifiée.
   * @param {string} endpoint - Le chemin de l'API (ex: '/api/data/status/nodes').
   * @returns {Promise<object>} Les données JSON de la réponse.
   * @throws {Error} Si la requête échoue.
   */
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}` // Ajoute le token JWT
      }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Erreur réseau (GET)");
    }
    return response.json();
  },

  /**
   * Exécute une requête POST authentifiée.
   * @param {string} endpoint - Le chemin de l'API.
   * @param {object} body - L'objet JavaScript à envoyer en JSON.
   * @returns {Promise<object>} Les données JSON de la réponse.
   * @throws {Error} Si la requête échoue.
   */
  post: async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Erreur réseau (POST)");
    }
    return response.json();
  },
  
  /**
   * Exécute une requête DELETE authentifiée.
   * @param {string} endpoint - Le chemin de l'API.
   * @returns {Promise<object>} Les données JSON de la réponse.
   * @throws {Error} Si la requête échoue.
   */
  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Erreur réseau (DELETE)");
    }
    return response.json();
  }
  // Vous pouvez ajouter put, patch, etc. de la même manière
};

/**
 * Service pour récupérer les données "live" et de télémétrie.
 */
export const dataService = {
 
  getHumidityHistory: (nodeIdStr) => {
  return apiClient.get(`/api/data/stats/humidity_history/${nodeIdStr}`);
},
  getNodesStatus: () => {
    return apiClient.get('/api/data/status/nodes');
  },

  /**
   * Récupère le statut de toutes les vannes.
   *
   */
  getValvesStatus: () => {
    return apiClient.get('/api/data/status/valves');
  },

  /**
   * Récupère les dernières lectures de capteurs pour un nœud spécifique.
   *
   * @param {string} nodeIdStr - L'ID string du nœud (ex: "NODE_HUMIDITE_01").
   */
  getLatestNodeData: (nodeIdStr) => {
    return apiClient.get(`/api/data/latest/${nodeIdStr}`);
  }
};

/**
 * Service pour gérer la *configuration* des nœuds (Modules).
 */
export const nodeService = {
  /**
   * Récupère la liste de toutes les configurations de nœuds.
   *
   */
  getNodesConfig: () => {
    return apiClient.get('/api/nodes/');
  },

  /**
   * Récupère la configuration JSON complète pour un nœud spécifique.
   *
   * @param {string} nodeIdStr - L'ID string du nœud.
   */
  getNodeConfig: (nodeIdStr) => {
    return apiClient.get(`/api/nodes/${nodeIdStr}/config_json`);
  },

  /**
   * Crée une nouvelle configuration de nœud.
   *
   * @param {object} configData - L'objet de configuration complet (identity, pins, etc.).
   */
  createNode: (configData) => {
    return apiClient.post('/api/nodes/', configData);
  },

  /**
   * Supprime une configuration de nœud.
   *
   * @param {string} nodeIdStr - L'ID string du nœud à supprimer.
   */
  deleteNode: (nodeIdStr) => {
    return apiClient.delete(`/api/nodes/${nodeIdStr}`);
  }

  
};