import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

function ReadingsList({ readings, loading, onEdit, onDelete, onRefresh }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [editFormData, setEditFormData] = useState({
    value: '',
    price: '',
    notes: '',
  });

  const handleEditClick = (reading) => {
    setSelectedReading(reading);
    setEditFormData({
      value: reading.value.toString(),
      price: reading.price.toString(),
      notes: reading.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (reading) => {
    setSelectedReading(reading);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (selectedReading) {
      onEdit(selectedReading.id, {
        value: parseFloat(editFormData.value),
        price: parseFloat(editFormData.price),
        notes: editFormData.notes || null,
      });
      setEditDialogOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedReading) {
      onDelete(selectedReading.id);
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Reading History</Typography>
          <IconButton onClick={onRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Reading (kWh)</TableCell>
                  <TableCell align="right">Delta (kWh)</TableCell>
                  <TableCell align="right">Price (€/kWh)</TableCell>
                  <TableCell align="right">Cost (€)</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {readings.map((reading) => (
                  <TableRow key={reading.id} hover>
                    <TableCell>{formatDate(reading.timestamp)}</TableCell>
                    <TableCell align="right">{reading.value.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {reading.delta ? reading.delta.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell align="right">{reading.price.toFixed(4)}</TableCell>
                    <TableCell align="right">
                      {reading.cost ? reading.cost.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell>
                      {reading.notes && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {reading.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(reading)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(reading)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Reading</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Meter Reading (kWh)"
                value={editFormData.value}
                onChange={(e) => setEditFormData({ ...editFormData, value: e.target.value })}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Price per kWh (€)"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                inputProps={{ step: '0.0001', min: '0' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Reading</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this reading? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReadingsList;
