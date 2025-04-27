import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Divider } from '@mui/material';
import useVirtualDomStore from '../store/virtualDomStore';

const VirtualDomVisualization = () => {
  const nodes = useVirtualDomStore(state => state.nodes);
  const removeNode = useVirtualDomStore(state => state.removeNode);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Virtual DOM Visualization
      </Typography>
      
      {nodes.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No nodes added yet. Use the form above to add nodes.
        </Typography>
      ) : (
        <Paper elevation={2} sx={{ mt: 2 }}>
          <List>
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <ListItem
                  secondaryAction={
                    <Button variant="contained" color="error" onClick={() => removeNode(node.id)}>
                      Delete
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ fontWeight: 'bold' }}>
                        {node.nodeType}
                      </Box>
                    }
                    secondary={
                      <>
                        {node.className && <div>Class: {node.className}</div>}
                        {node.content && <div>Content: {node.content}</div>}
                        {Object.keys(node.attributes || {}).length > 0 && (
                          <div>Attributes: {JSON.stringify(node.attributes)}</div>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < nodes.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default VirtualDomVisualization; 