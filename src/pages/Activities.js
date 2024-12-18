import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Event as MeetingIcon,
  Note as NoteIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const activityIcons = {
  call: <PhoneIcon />,
  email: <EmailIcon />,
  meeting: <MeetingIcon />,
  note: <NoteIcon />,
};

const ActivityItem = ({ activity, onEdit, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <>
      <ListItem
        secondaryAction={
          <Box>
            <IconButton edge="end" onClick={() => onEdit(activity)}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" onClick={() => onDelete(activity.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        }
      >
        <ListItemIcon>{activityIcons[activity.type]}</ListItemIcon>
        <ListItemText
          primary={activity.subject}
          secondary={
            <>
              <Typography component="span" variant="body2" color="text.primary">
                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
              </Typography>
              {' - '}
              {formatDate(activity.created_at)}
              {activity.contact_first_name && (
                <>
                  <br />
                  Contact: {activity.contact_first_name}{' '}
                  {activity.contact_last_name}
                </>
              )}
              {activity.deal_title && (
                <>
                  <br />
                  Deal: {activity.deal_title}
                </>
              )}
              {activity.description && (
                <>
                  <br />
                  {activity.description}
                </>
              )}
            </>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({
    type: 'call',
    subject: '',
    description: '',
    contact_id: '',
    deal_id: '',
    duration: '',
    scheduled_at: '',
  });

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await axios.get('/api/deals');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchContacts();
    fetchDeals();
  }, []);

  const handleOpenDialog = (activity = null) => {
    if (activity) {
      setSelectedActivity(activity);
      setFormData({
        type: activity.type,
        subject: activity.subject,
        description: activity.description || '',
        contact_id: activity.contact_id || '',
        deal_id: activity.deal_id || '',
        duration: activity.duration || '',
        scheduled_at: activity.scheduled_at
          ? new Date(activity.scheduled_at).toISOString().slice(0, 16)
          : '',
      });
    } else {
      setSelectedActivity(null);
      setFormData({
        type: 'call',
        subject: '',
        description: '',
        contact_id: '',
        deal_id: '',
        duration: '',
        scheduled_at: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedActivity(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedActivity) {
        await axios.put(`/api/activities/${selectedActivity.id}`, formData);
      } else {
        await axios.post('/api/activities', formData);
      }
      fetchActivities();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await axios.delete(`/api/activities/${id}`);
        fetchActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5">Activities</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Log Activity
          </Button>
        </Box>

        <Paper>
          <List>
            {activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
              />
            ))}
          </List>
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedActivity ? 'Edit Activity' : 'Log Activity'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="call">Call</MenuItem>
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="note">Note</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={4}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Contact</InputLabel>
                <Select
                  name="contact_id"
                  value={formData.contact_id}
                  onChange={handleInputChange}
                  label="Contact"
                >
                  <MenuItem value="">None</MenuItem>
                  {contacts.map((contact) => (
                    <MenuItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} -{' '}
                      {contact.company}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Deal</InputLabel>
                <Select
                  name="deal_id"
                  value={formData.deal_id}
                  onChange={handleInputChange}
                  label="Deal"
                >
                  <MenuItem value="">None</MenuItem>
                  {deals.map((deal) => (
                    <MenuItem key={deal.id} value={deal.id}>
                      {deal.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {(formData.type === 'call' || formData.type === 'meeting') && (
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  margin="normal"
                />
              )}
              <TextField
                fullWidth
                label="Scheduled At"
                name="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedActivity ? 'Update' : 'Log'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Activities;
