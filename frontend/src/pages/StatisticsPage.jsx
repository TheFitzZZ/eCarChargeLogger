import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { metersApi, readingsApi } from '../api';

function StatisticsPage() {
  const [meters, setMeters] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [trend, setTrend] = useState([]);
  const [groupBy, setGroupBy] = useState('day');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMeters();
  }, []);

  useEffect(() => {
    if (selectedMeter) {
      loadStatistics();
      loadTrend();
    }
  }, [selectedMeter, groupBy]);

  const loadMeters = async () => {
    try {
      const response = await metersApi.getAll();
      setMeters(response.data);
      if (response.data.length > 0 && !selectedMeter) {
        setSelectedMeter(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load meters', error);
    }
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await readingsApi.getStatistics(selectedMeter);
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrend = async () => {
    try {
      const response = await readingsApi.getTrend(selectedMeter, groupBy, 30);
      setTrend(response.data.reverse());
    } catch (error) {
      console.error('Failed to load trend', error);
    }
  };

  const StatCard = ({ title, value, unit, subtitle }) => (
    <Card>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value} {unit}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Statistics
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
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
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {statistics && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Consumption"
                  value={statistics.total_consumption?.toFixed(2) || '0'}
                  unit="kWh"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Cost"
                  value={statistics.total_cost?.toFixed(2) || '0'}
                  unit="€"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Average Consumption"
                  value={statistics.avg_consumption?.toFixed(2) || '0'}
                  unit="kWh"
                  subtitle="per reading"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Average Cost"
                  value={statistics.avg_cost?.toFixed(2) || '0'}
                  unit="€"
                  subtitle="per reading"
                />
              </Grid>
            </Grid>
          )}

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Consumption Trend</Typography>
              <ToggleButtonGroup
                value={groupBy}
                exclusive
                onChange={(e, newValue) => newValue && setGroupBy(newValue)}
                size="small"
              >
                <ToggleButton value="day">Day</ToggleButton>
                <ToggleButton value="week">Week</ToggleButton>
                <ToggleButton value="month">Month</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {trend.length > 0 ? (
              <LineChart
                xAxis={[{ 
                  scaleType: 'point', 
                  data: trend.map(t => t.period),
                  label: 'Period'
                }]}
                series={[
                  {
                    data: trend.map(t => t.consumption),
                    label: 'Consumption (kWh)',
                    color: '#1976d2',
                  },
                  {
                    data: trend.map(t => t.cost),
                    label: 'Cost (€)',
                    color: '#dc004e',
                    yAxisKey: 'rightAxis',
                  },
                ]}
                yAxis={[
                  { id: 'leftAxis' },
                  { id: 'rightAxis' },
                ]}
                height={400}
                margin={{ top: 10, bottom: 60, left: 60, right: 60 }}
              />
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                No data available
              </Typography>
            )}
          </Paper>

          {statistics && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Price Overview
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Typography color="text.secondary" gutterBottom>
                    Minimum Price
                  </Typography>
                  <Typography variant="h5">
                    €{statistics.min_price?.toFixed(4) || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per kWh
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography color="text.secondary" gutterBottom>
                    Average Price
                  </Typography>
                  <Typography variant="h5">
                    €{statistics.avg_price?.toFixed(4) || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per kWh
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography color="text.secondary" gutterBottom>
                    Maximum Price
                  </Typography>
                  <Typography variant="h5">
                    €{statistics.max_price?.toFixed(4) || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per kWh
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

export default StatisticsPage;
