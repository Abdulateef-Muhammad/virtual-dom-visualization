import { create } from 'zustand';

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initial nodes setup
const initialNodes = [
  {
    id: 'root-node',
    nodeType: 'root',
    parentId: null,
    children: ['child-1', 'child-2']
  },
  {
    id: 'child-1',
    nodeType: 'div',
    parentId: 'root-node',
    children: []
  },
  {
    id: 'child-2',
    nodeType: 'div',
    parentId: 'root-node',
    children: []
  }
];

const useVirtualDomStore = create((set) => ({
  // State
  nodes: initialNodes,
  selectedNodeId: null,
  
  // Actions
  addNode: (nodeData, parentId = null) => set((state) => {
    console.log('Adding node with data:', nodeData, 'and parentId:', parentId);
    console.log('Current nodes:', state.nodes);
    
    // Create the new node
    const newNode = { 
      id: generateId(),
      ...nodeData,
      parentId: parentId,
      children: []
    };
    
    console.log('Created new node:', newNode);

    // If no parentId is provided, add as a root-level node
    if (!parentId) {
      console.log('Adding as root-level node');
      return { nodes: [...state.nodes, newNode] };
    }

    // Find the parent node
    const parentNode = state.nodes.find(node => node.id === parentId);
    if (!parentNode) {
      console.warn(`Parent node with id ${parentId} not found`);
      return state;
    }
    
    console.log('Found parent node:', parentNode);

    // Create a new array with the updated parent and the new node
    const updatedNodes = state.nodes.map(node => {
      if (node.id === parentId) {
        console.log('Updating parent node children:', [...node.children, newNode.id]);
        // Update the parent's children array
        return {
          ...node,
          children: [...node.children, newNode.id]
        };
      }
      return node;
    });

    console.log('Updated nodes:', updatedNodes);
    console.log('Adding new node:', newNode);

    // Add the new node to the array
    return {
      nodes: [...updatedNodes, newNode]
    };
  }),
  
  updateNode: (id, updatedData) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, ...updatedData } : node
    )
  })),
  
  removeNode: (id) => set((state) => {
    // First, recursively get all descendant IDs
    const getDescendantIds = (nodeId) => {
      const node = state.nodes.find(n => n.id === nodeId);
      if (!node) return [];
      return [nodeId, ...node.children.flatMap(childId => {
        const childNode = state.nodes.find(n => n.id === childId);
        return childNode ? getDescendantIds(childNode.id) : [];
      })];
    };
    
    const idsToRemove = getDescendantIds(id);
    
    // Remove the node and all its descendants
    return {
      nodes: state.nodes.filter(node => !idsToRemove.includes(node.id)),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
    };
  }),
  
  clearNodes: () => set({ nodes: initialNodes, selectedNodeId: null }),
  
  setSelectedNode: (id) => set((state) => {
    console.log('Setting selected node:', id);
    return { selectedNodeId: id };
  }),
  
  // Getter for a specific node
  getNodeById: (id) => {
    const state = useVirtualDomStore.getState();
    return state.nodes.find(node => node.id === id);
  }
}));

export default useVirtualDomStore; 