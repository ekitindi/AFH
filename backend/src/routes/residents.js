const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all residents for a home
router.get('/home/:homeId', 
  authenticateToken, 
  requireRole(['provider', 'admin', 'caregiver']), 
  async (req, res) => {
    try {
      const { homeId } = req.params;

      // Verify access to this home
      let homeQuery = db('homes').where({ id: homeId, is_active: true });
      
      if (req.user.role === 'provider') {
        homeQuery = homeQuery.andWhere({ provider_id: req.user.id });
      }

      const home = await homeQuery.first();
      if (!home) {
        return res.status(404).json({ error: 'Home not found or access denied' });
      }

      // Get residents
      const residents = await db('residents')
        .where({ home_id: homeId, is_active: true })
        .select('*')
        .orderBy('created_at', 'desc');

      res.json({ residents });
    } catch (error) {
      console.error('Error fetching residents:', error);
      res.status(500).json({ error: 'Failed to fetch residents' });
    }
  }
);

// Get single resident
router.get('/:id', 
  authenticateToken, 
  requireRole(['provider', 'admin', 'caregiver']), 
  async (req, res) => {
    try {
      const { id } = req.params;

      const resident = await db('residents')
        .join('homes', 'residents.home_id', 'homes.id')
        .where('residents.id', id)
        .andWhere('residents.is_active', true)
        .select('residents.*', 'homes.name as home_name')
        .first();

      if (!resident) {
        return res.status(404).json({ error: 'Resident not found' });
      }

      // Check access permissions
      if (req.user.role === 'provider') {
        const home = await db('homes').where({ id: resident.home_id, provider_id: req.user.id }).first();
        if (!home) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // Parse JSON fields
      if (resident.emergency_contacts) {
        resident.emergency_contacts = JSON.parse(resident.emergency_contacts);
      }
      if (resident.medical_conditions) {
        resident.medical_conditions = JSON.parse(resident.medical_conditions);
      }
      if (resident.allergies) {
        resident.allergies = JSON.parse(resident.allergies);
      }

      res.json({ resident });
    } catch (error) {
      console.error('Error fetching resident:', error);
      res.status(500).json({ error: 'Failed to fetch resident' });
    }
  }
);

// Create new resident
router.post('/', 
  authenticateToken, 
  requireRole(['provider', 'admin']),
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('homeId').isInt().withMessage('Valid home ID is required'),
    body('paymentType').isIn(['medicaid', 'private_pay', 'insurance']).withMessage('Valid payment type is required'),
    body('physicianEmail').optional().isEmail().withMessage('Valid physician email is required')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        socialSecurity,
        phone,
        previousAddress,
        emergencyContacts,
        primaryPhysician,
        physicianPhone,
        physicianEmail,
        medicalConditions,
        allergies,
        isDiabetic,
        vitalsFrequency,
        carePlanNotes,
        dietaryRestrictions,
        paymentType,
        monthlyRate,
        homeId,
        admissionDate
      } = req.body;

      // Verify home exists and user has access
      let homeQuery = db('homes').where({ id: homeId, is_active: true });
      
      if (req.user.role === 'provider') {
        homeQuery = homeQuery.andWhere({ provider_id: req.user.id });
      }

      const home = await homeQuery.first();
      if (!home) {
        return res.status(404).json({ error: 'Home not found or access denied' });
      }

      // Check capacity
      if (home.current_residents >= home.max_residents) {
        return res.status(400).json({ 
          error: 'Home is at maximum capacity',
          current: home.current_residents,
          maximum: home.max_residents
        });
      }

      // Create resident
      const [residentId] = await db('residents').insert({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        gender,
        social_security: socialSecurity, // TODO: Encrypt this in production
        phone,
        previous_address: previousAddress,
        emergency_contacts: JSON.stringify(emergencyContacts || []),
        primary_physician: primaryPhysician,
        physician_phone: physicianPhone,
        physician_email: physicianEmail,
        medical_conditions: JSON.stringify(medicalConditions || []),
        allergies: JSON.stringify(allergies || []),
        is_diabetic: isDiabetic || false,
        vitals_frequency: vitalsFrequency || 'weekly',
        care_plan_notes: carePlanNotes,
        dietary_restrictions: dietaryRestrictions,
        payment_type: paymentType,
        monthly_rate: monthlyRate,
        home_id: homeId,
        admission_date: admissionDate || new Date(),
        is_active: true
      });

      // Update home resident count
      await db('homes')
        .where({ id: homeId })
        .increment('current_residents', 1);

      // Fetch created resident
      const resident = await db('residents').where({ id: residentId }).first();

      res.status(201).json({
        message: 'Resident created successfully',
        resident
      });
    } catch (error) {
      console.error('Error creating resident:', error);
      res.status(500).json({ error: 'Failed to create resident' });
    }
  }
);

// Update resident
router.put('/:id', 
  authenticateToken, 
  requireRole(['provider', 'admin']),
  [
    body('physicianEmail').optional().isEmail().withMessage('Valid physician email is required')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Find resident and verify access
      const resident = await db('residents')
        .join('homes', 'residents.home_id', 'homes.id')
        .where('residents.id', id)
        .andWhere('residents.is_active', true)
        .select('residents.*', 'homes.provider_id')
        .first();

      if (!resident) {
        return res.status(404).json({ error: 'Resident not found' });
      }

      if (req.user.role === 'provider' && resident.provider_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Remove fields that shouldn't be updated directly
      delete updates.id;
      delete updates.home_id;

      // Convert arrays to JSON strings if needed
      if (updates.emergencyContacts) {
        updates.emergency_contacts = JSON.stringify(updates.emergencyContacts);
        delete updates.emergencyContacts;
      }
      if (updates.medicalConditions) {
        updates.medical_conditions = JSON.stringify(updates.medicalConditions);
        delete updates.medicalConditions;
      }
      if (updates.allergies) {
        updates.allergies = JSON.stringify(updates.allergies);
      }

      // Update resident
      await db('residents').where({ id }).update({
        ...updates,
        updated_at: new Date()
      });

      // Fetch updated resident
      const updatedResident = await db('residents').where({ id }).first();

      res.json({
        message: 'Resident updated successfully',
        resident: updatedResident
      });
    } catch (error) {
      console.error('Error updating resident:', error);
      res.status(500).json({ error: 'Failed to update resident' });
    }
  }
);

// Discharge resident (soft delete)
router.post('/:id/discharge', 
  authenticateToken, 
  requireRole(['provider', 'admin']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { dischargeDate, notes } = req.body;

      // Find resident and verify access
      const resident = await db('residents')
        .join('homes', 'residents.home_id', 'homes.id')
        .where('residents.id', id)
        .andWhere('residents.is_active', true)
        .select('residents.*', 'homes.provider_id')
        .first();

      if (!resident) {
        return res.status(404).json({ error: 'Resident not found' });
      }

      if (req.user.role === 'provider' && resident.provider_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Discharge resident
      await db('residents').where({ id }).update({
        discharge_date: dischargeDate || new Date(),
        is_active: false,
        care_plan_notes: notes ? `${resident.care_plan_notes}\n\nDischarge Notes: ${notes}` : resident.care_plan_notes,
        updated_at: new Date()
      });

      // Decrease home resident count
      await db('homes')
        .where({ id: resident.home_id })
        .decrement('current_residents', 1);

      res.json({ message: 'Resident discharged successfully' });
    } catch (error) {
      console.error('Error discharging resident:', error);
      res.status(500).json({ error: 'Failed to discharge resident' });
    }
  }
);

module.exports = router;
