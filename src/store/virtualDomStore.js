import { create } from 'zustand';

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

const useVirtualDomStore = create((set) => ({
  // State
  nodes: [],
  
  // Actions
  addNode: (nodeData) => set((state) => ({
    nodes: [...state.nodes, { id: generateId(), ...nodeData }]
  })),
  
  updateNode: (id, updatedData) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, ...updatedData } : node
    )
  })),
  
  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter(node => node.id !== id)
  })),
  
  clearNodes: () => set({ nodes: [] }),
  
  // Getter for a specific node
  getNodeById: (id) => {
    const state = useVirtualDomStore.getState();
    return state.nodes.find(node => node.id === id);
  }
}));

export default useVirtualDomStore; 