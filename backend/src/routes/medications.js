const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all medications for a resident
router.get('/resident/:residentId', 
  authenticateToken, 
  requireRole(['provider', 'admin', 'caregiver']), 
  async (req, res) => {
    try {
      const { residentId } = req.params;

      // Verify access to this resident
      const resident = await db('residents')
        .join('homes', 'residents.home_id', 'homes.id')
        .where('residents.id', residentId)
        .andWhere('residents.is_active', true)
        .select('residents.*', 'homes.provider_id')
        .first();

      if (!resident) {
        return res.status(404).json({ error: 'Resident not found' });
      }

      // Check access permissions
      if (req.user.role === 'provider' && resident.provider_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get medications
      const medications = await db('medications')
        .where({ resident_id: residentId, is_active: true })
        .orderBy('created_at', 'desc');

      res.json({ medications });
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ error: 'Failed to fetch medications' });
    }
  }
);

// Create new medication
router.post('/', 
  authenticateToken, 
  requireRole(['provider', 'admin']),
  [
    body('residentId').isInt().withMessage('Valid resident ID is required'),
    body('medicationName').notEmpty().withMessage('Medication name is required'),
    body('dosage').notEmpty().withMessage('Dosage is required'),
    body('frequency').notEmpty().withMessage('Frequency is required'),
    body('route').notEmpty().withMessage('Route is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        residentId,
        medicationName,
        dosage,
        frequency,
        route,
        instructions,
        prescriberName,
        prescriberPhone,
        startDate,
        endDate,
        isPrn,
        isInsulin,
        storageRequirements,
        administrationTimes, // Add this
        customTimes        // Add this
      } = req.body;

      // Verify resident exists and user has access
      const resident = await db('residents')
        .join('homes', 'residents.home_id', 'homes.id')
        .where('residents.id', residentId)
        .andWhere('residents.is_active', true)
        .select('residents.*', 'homes.provider_id')
        .first();

      if (!resident) {
        return res.status(404).json({ error: 'Resident not found' });
      }

      if (req.user.role === 'provider' && resident.provider_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Create medication
      const [medicationId] = await db('medications').insert({
        resident_id: residentId,
        medication_name: medicationName,
        dosage,
        frequency,
        route,
        instructions,
        prescriber_name: prescriberName,
        prescriber_phone: prescriberPhone,
        start_date: startDate,
        end_date: endDate,
        is_prn: isPrn || false,
        is_insulin: isInsulin || false,
        storage_requirements: storageRequirements,
        administration_times: JSON.stringify(administrationTimes || []), // Add this
        custom_times: JSON.stringify(customTimes || []), // Add this
        is_active: true
      });

      const medication = await db('medications').where({ id: medicationId }).first();

      res.status(201).json({
        message: 'Medication created successfully',
        medication
      });
    } catch (error) {
      console.error('Error creating medication:', error);
      res.status(500).json({ error: 'Failed to create medication' });
    }
  }
);

// Record medication administration
router.post('/administration', 
  authenticateToken, 
  requireRole(['caregiver', 'admin', 'provider']),
  [
    body('medicationId').isInt().withMessage('Valid medication ID is required'),
    body('residentId').isInt().withMessage('Valid resident ID is required'),
    body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required'),
    body('status').isIn(['given', 'refused', 'missed', 'held']).withMessage('Valid status is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        medicationId,
        residentId,
        scheduledTime,
        actualTime,
        status,
        notes,
        bloodSugarLevel,
        insulinUnits,
        injectionSite,
        caregiverInitials
      } = req.body;

      // Verify medication and resident exist
      const medication = await db('medications')
        .join('residents', 'medications.resident_id', 'residents.id')
        .join('homes', 'residents.home_id', 'homes.id')
        .where('medications.id', medicationId)
        .andWhere('residents.id', residentId)
        .select('medications.*', 'homes.provider_id')
        .first();

      if (!medication) {
        return res.status(404).json({ error: 'Medication or resident not found' });
      }

      // Create administration record
      const [recordId] = await db('medication_records').insert({
        medication_id: medicationId,
        resident_id: residentId,
        administered_by: req.user.id,
        scheduled_time: scheduledTime,
        actual_time: actualTime || new Date(),
        status,
        notes,
        blood_sugar_level: bloodSugarLevel,
        insulin_units: insulinUnits,
        injection_site: injectionSite,
        caregiver_initials: caregiverInitials || `${req.user.first_name[0]}${req.user.last_name[0]}`
      });

      const record = await db('medication_records').where({ id: recordId }).first();

      res.status(201).json({
        message: 'Medication administration recorded successfully',
        record
      });
    } catch (error) {
      console.error('Error recording medication administration:', error);
      res.status(500).json({ error: 'Failed to record medication administration' });
    }
  }
);

// Get medication administration records
router.get('/records/resident/:residentId', 
  authenticateToken, 
  requireRole(['provider', 'admin', 'caregiver']), 
  async (req, res) => {
    try {
      const { residentId } = req.params;
      const { startDate, endDate } = req.query;

      let query = db('medication_records')
        .join('medications', 'medication_records.medication_id', 'medications.id')
        .join('users', 'medication_records.administered_by', 'users.id')
        .where('medication_records.resident_id', residentId)
        .select(
          'medication_records.*',
          'medications.medication_name',
          'medications.dosage',
          'medications.route',
          'users.first_name as caregiver_first_name',
          'users.last_name as caregiver_last_name'
        )
        .orderBy('medication_records.scheduled_time', 'desc');

      if (startDate) {
        query = query.where('medication_records.scheduled_time', '>=', startDate);
      }
      if (endDate) {
        query = query.where('medication_records.scheduled_time', '<=', endDate);
      }

      const records = await query;

      res.json({ records });
    } catch (error) {
      console.error('Error fetching medication records:', error);
      res.status(500).json({ error: 'Failed to fetch medication records' });
    }
  }
);

module.exports = router;
