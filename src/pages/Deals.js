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
  Grid,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const stages = [
  { id: 'lead', label: 'Lead' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed_won', label: 'Closed Won' },
  { id: 'closed_lost', label: 'Closed Lost' },
];

const DealCard = ({ deal, onEdit, onDelete }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">{deal.title}</Typography>
        <Box>
          <IconButton size="small" onClick={() => onEdit(deal)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(deal.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      <Typography color="textSecondary" gutterBottom>
        Value: ${deal.value?.toLocaleString() || '0'}
      </Typography>
      <Typography variant="body2">
        Contact: {deal.first_name} {deal.last_name}
      </Typography>
      {deal.company && (
        <Typography variant="body2">Company: {deal.company}</Typography>
      )}
    </CardContent>
  </Card>
);

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    contact_id: '',
    stage: 'lead',
    expected_close_date: '',
    description: '',
  });

  const fetchDeals = async () => {
    try {
      const response = await axios.get('/api/deals');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
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

  useEffect(() => {
    fetchDeals();
    fetchContacts();
  }, []);

  const handleOpenDialog = (deal = null) => {
    if (deal) {
      setSelectedDeal(deal);
      setFormData({
        title: deal.title,
        value: deal.value || '',
        contact_id: deal.contact_id || '',
        stage: deal.stage,
        expected_close_date: deal.expected_close_date?.split('T')[0] || '',
        description: deal.description || '',
      });
    } else {
      setSelectedDeal(null);
      setFormData({
        title: '',
        value: '',
        contact_id: '',
        stage: 'lead',
        expected_close_date: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDeal(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed - ${name}:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting deal with data:', formData);
    
    // Validate required fields
    if (!formData.title || !formData.contact_id) {
      console.error('Missing required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value) || 0,
      };
      console.log('Sending payload:', payload);

      if (selectedDeal) {
        await axios.put(`/api/deals/${selectedDeal.id}`, payload);
      } else {
        await axios.post('/api/deals', payload);
      }
      fetchDeals();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving deal:', error.response?.data || error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await axios.delete(`/api/deals/${id}`);
        fetchDeals();
      } catch (error) {
        console.error('Error deleting deal:', error);
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
          <Typography variant="h5">Deals Pipeline</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Deal
          </Button>
        </Box>

        <Grid container spacing={2}>
          {stages.map((stage) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={stage.id}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  minHeight: '70vh',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 'bold' }}
                >
                  {stage.label}
                </Typography>
                {deals
                  .filter((deal) => deal.stage === stage.id)
                  .map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onEdit={handleOpenDialog}
                      onDelete={handleDelete}
                    />
                  ))}
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedDeal ? 'Edit Deal' : 'Add Deal'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Value"
                name="value"
                type="number"
                value={formData.value}
                onChange={handleInputChange}
                margin="normal"
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Contact</InputLabel>
                <Select
                  name="contact_id"
                  value={formData.contact_id}
                  onChange={handleInputChange}
                  label="Contact"
                >
                  <MenuItem value="">Select a contact</MenuItem>
                  {contacts.map((contact) => (
                    <MenuItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} - {contact.company}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Stage</InputLabel>
                <Select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  label="Stage"
                >
                  {stages.map((stage) => (
                    <MenuItem key={stage.id} value={stage.id}>
                      {stage.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Expected Close Date"
                name="expected_close_date"
                type="date"
                value={formData.expected_close_date}
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
              {selectedDeal ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Deals;
