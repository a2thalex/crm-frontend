import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import Layout from '../components/Layout';

const DashboardCard = ({ title, value, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress size={20} />
        </Box>
      ) : (
        <Typography variant="h4">{value}</Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalDeals: 0,
    totalTasks: 0,
    dealValue: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would have an endpoint that returns all this data
        // For now, we'll make separate requests
        const [contacts, deals, tasks, activities] = await Promise.all([
          axios.get('/api/contacts'),
          axios.get('/api/deals'),
          axios.get('/api/tasks'),
          axios.get('/api/activities')
        ]);

        const totalDealValue = deals.data.reduce(
          (sum, deal) => sum + (deal.value || 0),
          0
        );

        setStats({
          totalContacts: contacts.data.length,
          totalDeals: deals.data.length,
          totalTasks: tasks.data.length,
          dealValue: totalDealValue,
        });

        // Get most recent 5 activities
        const sortedActivities = activities.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setRecentActivities(sortedActivities);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Total Contacts"
              value={stats.totalContacts}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Active Deals"
              value={stats.totalDeals}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Open Tasks"
              value={stats.totalTasks}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Total Deal Value"
              value={`$${stats.dealValue.toLocaleString()}`}
              loading={loading}
            />
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemText
                          primary={activity.subject}
                          secondary={`${activity.type} - ${new Date(
                            activity.created_at
                          ).toLocaleDateString()}`}
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {recentActivities.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No recent activities" />
                    </ListItem>
                  )}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;
