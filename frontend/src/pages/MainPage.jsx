import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { metersApi, readingsApi } from '../api';
import ReadingsList from '../components/ReadingsList';

function MainPage() {
  const [meters, setMeters] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState('');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newMeterDialogOpen, setNewMeterDialogOpen] = useState(false);
  const [newMeterName, setNewMeterName] = useState('');
  
  const [formData, setFormData] = useState({
    value: '',
    price: '',
    notes: '',
  });

  const [lastPrice, setLastPrice] = useState(null);

  useEffect(() => {
    loadMeters();
  }, []);

  useEffect(() => {
    if (selectedMeter) {
      loadReadings();
      loadLastPrice();
    }
  }, [selectedMeter]);

  const loadMeters = async () => {
    try {
      const response = await metersApi.getAll();
      setMeters(response.data);
      if (response.data.length > 0 && !selectedMeter) {
        setSelectedMeter(response.data[0].id);
      }
    } catch (error) {
      showSnackbar('Failed to load meters', 'error');
    }
  };

  const loadReadings = async () => {
    try {
      setLoading(true);
      const response = await readingsApi.getAll(selectedMeter, 50);
      setReadings(response.data);
    } catch (error) {
      showSnackbar('Failed to load readings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLastPrice = async () => {
    try {
      const response = await readingsApi.getAll(selectedMeter, 1);
      if (response.data.length > 0) {
        setLastPrice(response.data[0].price);
        setFormData((prev) => ({ ...prev, price: response.data[0].price.toString() }));
      }
    } catch (error) {
      console.error('Failed to load last price', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMeter) {
      showSnackbar('Please select a meter', 'error');
      return;
    }

    try {
      await readingsApi.create({
        meter_id: selectedMeter,
        value: parseFloat(formData.value),
        price: parseFloat(formData.price),
        notes: formData.notes || null,
      });
      
      showSnackbar('Reading added successfully');
      setFormData({ value: '', price: formData.price, notes: '' });
      loadReadings();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to add reading', 'error');
    }
  };

  const handleAddMeter = async () => {
    if (!newMeterName.trim()) {
      showSnackbar('Please enter a meter name', 'error');
      return;
    }

    try {
      await metersApi.create(newMeterName);
      showSnackbar('Meter added successfully');
      setNewMeterDialogOpen(false);
      setNewMeterName('');
      loadMeters();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to add meter', 'error');
    }
  };

  const handleEditReading = async (id, data) => {
    try {
      await readingsApi.update(id, data);
      showSnackbar('Reading updated successfully');
      loadReadings();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to update reading', 'error');
    }
  };

  const handleDeleteReading = async (id) => {
    try {
      await readingsApi.delete(id);
      showSnackbar('Reading deleted successfully');
      loadReadings();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Failed to delete reading', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add New Reading
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel>Meter</InputLabel>
                      <Select
                        value={selectedMeter}
                        label="Meter"
                        onChange={(e) => setSelectedMeter(e.target.value)}
                      >
                        {meters.map((meter) => (
                          <MenuItem key={meter.id} value={meter.id}>
                            {meter.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={() => setNewMeterDialogOpen(true)}
                      sx={{ minWidth: '120px' }}
                    >
                      <AddIcon sx={{ mr: 0.5 }} /> Meter
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Meter Reading (kWh)"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    inputProps={{ step: '0.01', min: '0' }}
                  />
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

                <Grid item xs={12}>
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
                    Add Reading
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            {readings.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Latest Reading
                </Typography>
                <Typography variant="h4">
                  {readings[0].value.toLocaleString()} kWh
                </Typography>
                {readings[0].delta && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Last Consumption
                    </Typography>
                    <Typography variant="h5">
                      {readings[0].delta.toFixed(2)} kWh
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost: €{readings[0].cost?.toFixed(2)}
                    </Typography>
                  </>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Total Readings
                </Typography>
                <Typography variant="h5">
                  {readings.length}
                </Typography>
              </Box>
            )}
            {readings.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No readings yet. Add your first reading to get started!
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <ReadingsList
            readings={readings}
            loading={loading}
            onEdit={handleEditReading}
            onDelete={handleDeleteReading}
            onRefresh={loadReadings}
          />
        </Grid>
      </Grid>

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
