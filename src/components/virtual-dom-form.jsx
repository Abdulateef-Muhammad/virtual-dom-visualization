import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import useVirtualDomStore from '../store/virtualDomStore';

const VirtualDomForm = () => {
  const addNode = useVirtualDomStore(state => state.addNode);
  
  const [formData, setFormData] = useState({
    nodeType: 'div',
    className: '',
    content: '',
    attributes: {}
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addNode(formData);
    // Reset form after submission
    setFormData({
      nodeType: 'div',
      className: '',
      content: '',
      attributes: {}
    });
  };

  return (
    <Box className="virtual-dom-form" sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Virtual DOM Form
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Node Type"
          id="nodeType"
          name="nodeType"
          value={formData.nodeType}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Class Name"
          id="className"
          name="className"
          value={formData.className}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Content"
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          fullWidth
          multiline
          rows={2}
        />
        <Button type="submit" variant="contained" color="primary">
          Add Node
        </Button>
      </Box>
    </Box>
  );
};

export default VirtualDomForm;
