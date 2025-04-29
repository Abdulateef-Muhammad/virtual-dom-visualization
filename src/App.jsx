import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import VirtualDomDiagram from './components/virtual-dom-diagram';
import VirtualDomForm from './components/virtual-dom-form';
import { Grid, Container, Box } from '@mui/material';

function App() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        
        <Grid container spacing={3}>
          <Grid item size={8} padding={2} sx={{ borderRight: '1px solid #ccc', height: 'calc(100vh -  30px)' }} >
            <VirtualDomDiagram />
          </Grid>
          <Grid item size={4}>
            <VirtualDomForm />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App;
