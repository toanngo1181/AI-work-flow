import { User, SavedDiagram, SystemSettings } from '../types';
import { callSheetAPI } from './googleSheetAPI';

const KEYS = {
  SESSION: 'pm_session',
  SETTINGS: 'pm_settings'
};

const DEFAULT_SETTINGS: SystemSettings = {
  appLogoUrl: '',
  enableKPIs: true,
  enableExport: true,
  enableAI: true,
};

export const initializeDB = () => {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
};

// --- SESSION HELPERS (Used by AuthContext) ---

export const getSession = (): User | null => {
  const session = localStorage.getItem(KEYS.SESSION);
  return session ? JSON.parse(session) : null;
};

// --- DIAGRAM MANAGEMENT (API) ---

export const saveDiagram = async (diagram: SavedDiagram): Promise<boolean> => {
  try {
    // Transform SavedDiagram object to the expected API payload: { userId, name, flowData }
    const payload = {
      userId: diagram.userId,
      name: diagram.title,
      // Stringify the complex objects into flowData for storage in Sheets
      flowData: JSON.stringify({
        nodes: diagram.nodes,
        edges: diagram.edges,
        aiAnalysis: diagram.aiAnalysis,
        updatedAt: diagram.updatedAt
      })
    };

    const result = await callSheetAPI('save_diagram', payload);
    return result.success === true;
  } catch (e) {
    console.error("Save diagram failed", e);
    return false;
  }
};

export const getUserDiagrams = async (userId: string): Promise<SavedDiagram[]> => {
  try {
    const result = await callSheetAPI('get_diagrams', { userId }, 'GET');
    
    if (result.success && Array.isArray(result.data)) {
      // Map API response back to SavedDiagram structure
      // Expected API data item: { id, name, flowData, updatedAt }
      return result.data.map((item: any) => {
        try {
          const parsedFlow = JSON.parse(item.flowData);
          return {
            id: item.id,
            userId: userId,
            title: item.name,
            updatedAt: item.updatedAt || parsedFlow.updatedAt || new Date().toISOString(),
            nodes: parsedFlow.nodes || [],
            edges: parsedFlow.edges || [],
            aiAnalysis: parsedFlow.aiAnalysis
          };
        } catch (err) {
          console.error("Error parsing diagram data", err);
          return null;
        }
      }).filter((d: any) => d !== null) as SavedDiagram[];
    }
    return [];
  } catch (e) {
    console.error("Get diagrams failed", e);
    return [];
  }
};

// --- USER MANAGEMENT (ADMIN) ---

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const result = await callSheetAPI('get_all_users', {}, 'GET');
    return result.success && result.data ? result.data : [];
  } catch (e) {
    console.error("Get users failed", e);
    return [];
  }
};

export const deleteUser = async (id: string) => {
  try {
    await callSheetAPI('delete_user', { id }, 'POST');
  } catch (e) {
    console.error("Delete user failed", e);
  }
};

export const getAllDiagramsCount = async (): Promise<number> => {
    try {
        const result = await callSheetAPI('get_all_diagrams_count', {}, 'GET');
        return result.success && result.data ? result.data.count : 0;
    } catch (e) {
        return 0;
    }
}

// --- SETTINGS (Local Storage) ---

export const getSystemSettings = (): SystemSettings => {
  const localSettings = localStorage.getItem(KEYS.SETTINGS);
  return localSettings ? JSON.parse(localSettings) : DEFAULT_SETTINGS;
};

export const updateSystemSettings = (settings: SystemSettings) => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};