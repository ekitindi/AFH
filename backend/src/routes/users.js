const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all caregivers (for provider to hire)
router.get('/caregivers', 
  authenticateToken, 
  requireRole(['provider', 'admin']), 
  async (req, res) => {
    try {
      const caregivers = await db('users')
        .where({ role: 'caregiver', is_active: true })
        .select(
          'id', 'first_name', 'last_name', 'email', 'phone', 
          'certifications', 'experience_description', 'years_experience', 
          'hourly_rate', 'created_at'
        );

      res.json({ caregivers });
    } catch (error) {
      console.error('Error fetching caregivers:', error);
      res.status(500).json({ error: 'Failed to fetch caregivers' });
    }
  }
);

module.exports = router;