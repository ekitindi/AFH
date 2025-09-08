const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all homes for a provider
router.get('/', 
  authenticateToken, 
  requireRole(['provider', 'admin']), 
  async (req, res) => {
    try {
      let query = db('homes').select('*');

      if (req.user.role === 'provider') {
        query = query.where({ provider_id: req.user.id });
      }

      const homes = await query.where({ is_active: true }).orderBy('created_at', 'desc');

      res.json({ homes });
    } catch (error) {
      console.error('Error fetching homes:', error);
      res.status(500).json({ error: 'Failed to fetch homes' });
    }
  }
);

// Create new home
router.post('/', 
  authenticateToken, 
  requireRole(['provider']),
  [
    body('name').notEmpty().withMessage('Home name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('zipCode').notEmpty().withMessage('ZIP code is required'),
    body('maxResidents').isInt({ min: 1, max: 10 }).withMessage('Max residents must be between 1 and 10')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        licenseNumber,
        address,
        city,
        zipCode,
        phone,
        maxResidents
      } = req.body;

      // Check if license number is unique (if provided)
      if (licenseNumber) {
        const existingHome = await db('homes').where({ license_number: licenseNumber }).first();
        if (existingHome) {
          return res.status(400).json({ error: 'License number already exists' });
        }
      }

      // Create home
      const [homeId] = await db('homes').insert({
        name,
        license_number: licenseNumber,
        address,
        city,
        state: 'WA',
        zip_code: zipCode,
        phone,
        max_residents: maxResidents,
        current_residents: 0,
        provider_id: req.user.id,
        is_active: true
      });

      // Fetch created home
      const home = await db('homes').where({ id: homeId }).first();

      res.status(201).json({
        message: 'Home created successfully',
        home
      });
    } catch (error) {
      console.error('Error creating home:', error);
      res.status(500).json({ error: 'Failed to create home' });
    }
  }
);

module.exports = router;