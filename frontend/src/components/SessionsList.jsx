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
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

function SessionsList({ sessions, meters, loading, onEdit, onDelete, onRefresh }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [editFormData, setEditFormData] = useState({
    price: '',
    notes: '',
    meterValues: {},
  });

  const handleEditClick = (session) => {
    setSelectedSession(session);
    
    const meterValues = {};
    session.readings.forEach(reading => {
      meterValues[reading.meter_id] = reading.value.toString();
    });
    
    setEditFormData({
      price: session.price.toString(),
      notes: session.notes || '',
      meterValues,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (session) => {
    setSelectedSession(session);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (selectedSession) {
      const readings = Object.keys(editFormData.meterValues).map(meterId => ({
        meter_id: parseInt(meterId),
        value: parseFloat(editFormData.meterValues[meterId]),
      }));

      onEdit(selectedSession.id, {
        price: parseFloat(editFormData.price),
        readings,
        notes: editFormData.notes || null,
      });
      setEditDialogOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedSession) {
      onDelete(selectedSession.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleMeterValueChange = (meterId, value) => {
    setEditFormData({
      ...editFormData,
      meterValues: {
        ...editFormData.meterValues,
        [meterId]: value,
      },
    });
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

  const toggleExpanded = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
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
        ) : sessions.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
            No reading sessions yet. Add your first session above!
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="50px"></TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total Consumption</TableCell>
                  <TableCell align="right">Price (€/kWh)</TableCell>
                  <TableCell align="right">Total Cost (€)</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <React.Fragment key={session.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleExpanded(session.id)}
                        >
                          {expandedSession === session.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{formatDate(session.timestamp)}</TableCell>
                      <TableCell align="right">
                        {session.total_delta ? (
                          <strong>{session.total_delta.toFixed(2)} kWh</strong>
                        ) : (
                          <Chip label="First Session" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">{session.price.toFixed(4)}</TableCell>
                      <TableCell align="right">
                        {session.total_cost ? (
                          <strong>€{session.total_cost.toFixed(2)}</strong>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {session.notes && (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {session.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(session)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(session)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {expandedSession === session.id && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ bgcolor: 'action.hover' }}>
                          <Box sx={{ py: 2, px: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Individual Meter Readings:
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              {session.readings.map((reading) => (
                                <Grid item xs={12} sm={6} md={4} key={reading.id}>
                                  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {reading.meter_name}
                                    </Typography>
                                    <Typography variant="h6">
                                      {reading.value.toLocaleString()} kWh
                                    </Typography>
                                    {reading.delta !== null && (
                                      <Typography variant="body2" color="primary">
                                        Δ {reading.delta.toFixed(2)} kWh
                                        <br />
                                        €{(reading.delta * session.price).toFixed(2)}
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Reading Session</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Meter Readings
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Meter</TableCell>
                    <TableCell>Reading (kWh)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSession && selectedSession.readings.map((reading) => (
                    <TableRow key={reading.meter_id}>
                      <TableCell>{reading.meter_name}</TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          required
                          size="small"
                          type="number"
                          value={editFormData.meterValues[reading.meter_id] || ''}
                          onChange={(e) => handleMeterValueChange(reading.meter_id, e.target.value)}
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
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                inputProps={{ step: '0.0001', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
        <DialogTitle>Delete Reading Session</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this reading session? This will delete all meter readings from this session. This action cannot be undone.
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

export default SessionsList;
