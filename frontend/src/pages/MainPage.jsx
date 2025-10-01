import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  List,
  ListItem,
  ListItemText,
  DialogContentText,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { metersApi, sessionsApi } from '../api';
import SessionsList from '../components/SessionsList';

function MainPage() {
  const [meters, setMeters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newMeterDialogOpen, setNewMeterDialogOpen] = useState(false);
  const [manageMeterDialogOpen, setManageMeterDialogOpen] = useState(false);
  const [newMeterName, setNewMeterName] = useState('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, meterId: null, meterName: '' });
  
  const [formData, setFormData] = useState({
    price: '',
    notes: '',
    meterValues: {},
  });

  const [lastPrice, setLastPrice] = useState(null);

  useEffect(() => {
    loadMeters();
    loadSessions();
  }, []);

  const loadMeters = async () => {
    try {
      const response = await metersApi.getAll();
      setMeters(response.data);
      
      // Initialize meter values in form
      const meterValues = {};
      response.data.forEach(meter => {
        meterValues[meter.id] = '';
      });
      setFormData(prev => ({ ...prev, meterValues }));
    } catch (error) {
      showSnackbar('Failed to load meters', 'error');
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionsApi.getAll(50);
      setSessions(response.data);
      
      // Set last price from most recent session
      if (response.data.length > 0) {
        setLastPrice(response.data[0].price);
        setFormData((prev) => ({ ...prev, price: response.data[0].price.toString() }));
      }
    } catch (error) {
      showSnackbar('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMeterValueChange = (meterId, value) => {
    setFormData({
      ...formData,
      meterValues: {
        ...formData.meterValues,
        [meterId]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (meters.length === 0) {
      showSnackbar('Please add at least one meter first', 'error');
      return;
    }

    // Check if all meters have values
    const missingValues = meters.some(meter => !formData.meterValues[meter.id]);
    if (missingValues) {
      showSnackbar('Please enter readings for all meters', 'error');
      return;
    }

    try {
      // Prepare readings array
      const readings = meters.map(meter => ({
        meter_id: meter.id,
        value: parseFloat(formData.meterValues[meter.id]),
      }));

      await sessionsApi.create({
        price: parseFloat(formData.price),
        readings,
        notes: formData.notes || null,
      });
      
      showSnackbar('Reading session added successfully');
      
      // Reset meter values but keep price
      const resetValues = {};
      meters.forEach(meter => {
        resetValues[meter.id] = '';
      });
      setFormData({ 
        price: formData.price, 
        notes: '', 
        meterValues: resetValues 
      });
      
      loadSessions();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to add reading session', 'error');
    }
  };

  const handleAddMeter = async () => {
    if (!newMeterName.trim()) {
      showSnackbar('Please enter a meter name', 'error');
      return;
    }

    try {
      const response = await metersApi.create(newMeterName);
      showSnackbar('Meter added successfully');
      setNewMeterDialogOpen(false);
      setNewMeterName('');
      
      // Add new meter to form values
      setFormData(prev => ({
        ...prev,
        meterValues: {
          ...prev.meterValues,
          [response.data.id]: '',
        },
      }));
      
      loadMeters();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to add meter', 'error');
    }
  };

  const handleEditSession = async (id, data) => {
    try {
      await sessionsApi.update(id, data);
      showSnackbar('Reading session updated successfully');
      loadSessions();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to update session', 'error');
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await sessionsApi.delete(id);
      showSnackbar('Reading session deleted successfully');
      loadSessions();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to delete session', 'error');
    }
  };

  const handleDeleteMeterClick = (meter) => {
    setDeleteConfirmDialog({ open: true, meterId: meter.id, meterName: meter.name });
  };

  const handleDeleteMeterConfirm = async () => {
    try {
      await metersApi.delete(deleteConfirmDialog.meterId);
      showSnackbar('Meter deleted successfully');
      setDeleteConfirmDialog({ open: false, meterId: null, meterName: '' });
      loadMeters();
      loadSessions(); // Refresh sessions as they might be affected
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to delete meter', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setManageMeterDialogOpen(true)}
          >
            Manage Meters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewMeterDialogOpen(true)}
          >
            Add Meter
          </Button>
        </Box>
      </Box>

      {meters.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No meters configured. Click "Add Meter" to create your first meter.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add New Reading Session
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter current readings for all meters
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Meter Readings
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Meter</TableCell>
                          <TableCell>Current Reading (kWh)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {meters.map((meter) => (
                          <TableRow key={meter.id}>
                            <TableCell>{meter.name}</TableCell>
                            <TableCell>
                              <TextField
                                required
                                fullWidth
                                size="small"
                                type="number"
                                value={formData.meterValues[meter.id] || ''}
                                onChange={(e) => handleMeterValueChange(meter.id, e.target.value)}
                                inputProps={{ step: '0.01', min: '0' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Price per kWh (€)"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      inputProps={{ step: '0.0001', min: '0' }}
                      helperText={lastPrice ? `Last: €${lastPrice.toFixed(4)}` : ''}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Notes (optional)"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                    >
                      Add Reading Session
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              {sessions.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Latest Session
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {new Date(sessions[0].timestamp).toLocaleString('de-DE')}
                  </Typography>
                  {sessions[0].total_delta && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Last Total Consumption
                      </Typography>
                      <Typography variant="h4">
                        {sessions[0].total_delta.toFixed(2)} kWh
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cost: €{sessions[0].total_cost?.toFixed(2)}
                      </Typography>
                    </>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Total Sessions
                  </Typography>
                  <Typography variant="h5">
                    {sessions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {sessions[0].meter_count} meters tracked
                  </Typography>
                </Box>
              )}
              {sessions.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No reading sessions yet. Add your first reading to get started!
                </Alert>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <SessionsList
              sessions={sessions}
              meters={meters}
              loading={loading}
              onEdit={handleEditSession}
              onDelete={handleDeleteSession}
              onRefresh={loadSessions}
            />
          </Grid>
        </Grid>
      )}

      <Dialog open={newMeterDialogOpen} onClose={() => setNewMeterDialogOpen(false)}>
        <DialogTitle>Add New Meter</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Meter Name"
            fullWidth
            value={newMeterName}
            onChange={(e) => setNewMeterName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMeter();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewMeterDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMeter} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={manageMeterDialogOpen} onClose={() => setManageMeterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Meters</DialogTitle>
        <DialogContent>
          {meters.length === 0 ? (
            <Alert severity="info">No meters configured yet.</Alert>
          ) : (
            <List>
              {meters.map((meter) => (
                <ListItem
                  key={meter.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteMeterClick(meter)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={meter.name}
                    secondary={`Unit: ${meter.unit} • Created: ${new Date(meter.created_at).toLocaleDateString('de-DE')}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageMeterDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmDialog.open} onClose={() => setDeleteConfirmDialog({ open: false, meterId: null, meterName: '' })}>
        <DialogTitle>Delete Meter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete meter "<strong>{deleteConfirmDialog.meterName}</strong>"?
            <br /><br />
            This will also delete all readings associated with this meter and recalculate all affected sessions.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog({ open: false, meterId: null, meterName: '' })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteMeterConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MainPage;
