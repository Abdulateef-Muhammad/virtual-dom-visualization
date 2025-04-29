import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Paper, Stack } from '@mui/material';
import useVirtualDomStore from '../store/virtualDomStore';

const VirtualDomForm = () => {
  const addNode = useVirtualDomStore(state => state.addNode);
  const updateNode = useVirtualDomStore(state => state.updateNode);
  const removeNode = useVirtualDomStore(state => state.removeNode);
  const selectedNodeId = useVirtualDomStore(state => state.selectedNodeId);
  const selectedNode = useVirtualDomStore(state => state.getNodeById(selectedNodeId));
  
  const [formData, setFormData] = useState({
    nodeType: 'div'
  });

  // Update form data when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setFormData({
        nodeType: selectedNode.nodeType || 'div'
      });
    }
  }, [selectedNode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedNodeId && selectedNodeId !== 'root-node') {
      // Update existing node
      updateNode(selectedNodeId, formData);
    } else {
      // Add new node
      const parentId = selectedNodeId === 'root-node' ? 'root-node' : selectedNodeId;
      addNode(formData, parentId);
    }
    // Reset form after submission
    setFormData({
      nodeType: 'div'
    });
  };

  const handleDelete = () => {
    if (selectedNodeId && selectedNodeId !== 'root-node') {
      removeNode(selectedNodeId);
      setFormData({
        nodeType: 'div'
      });
    }
  };

  const handleAddChild = () => {
    if (selectedNodeId) {
      addNode(formData, selectedNodeId);
      // Reset form after submission
      setFormData({
        nodeType: 'div'
      });
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {selectedNodeId && selectedNodeId !== 'root-node' ? 'Edit Node' : 'Add Node'}
      </Typography>
      {selectedNodeId && selectedNodeId !== 'root-node' && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Editing: {selectedNode?.nodeType} (ID: {selectedNodeId})
        </Typography>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Node Type"
          id="nodeType"
          name="nodeType"
          value={formData.nodeType}
          onChange={handleChange}
          fullWidth
        />
        <Stack direction="row" spacing={2}>
          {selectedNodeId && selectedNodeId !== 'root-node' &&
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!formData.nodeType || !selectedNodeId}
            fullWidth
          >
            Update Node
          </Button>
          }
          {selectedNodeId && selectedNodeId !== 'root-node' && (
            <Button 
              variant="contained" 
              color="error"
              onClick={handleDelete}
              fullWidth
            >
              Delete Node
            </Button>
          )}
        </Stack>
        {selectedNodeId && (
          <Button 
            variant="outlined" 
            color="primary"
            onClick={handleAddChild}
            disabled={!formData.nodeType}
            fullWidth
          >
            Add as Child to Selected Node
          </Button>
        )}

        { !selectedNodeId && 'Click on a node to edit it'}
      </Box>
    </Paper>
  );
};

export default VirtualDomForm;
