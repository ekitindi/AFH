import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MedicationsPage = () => {
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState('');
  const [medications, setMedications] = useState([]);
  const [administrationRecords, setAdministrationRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMedForm, setShowAddMedForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const { token, user } = useAuth();

  // Form state for adding medication
  const [medFormData, setMedFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    instructions: '',
    prescriberName: '',
    prescriberPhone: '',
    startDate: '',
    endDate: '',
    isPrn: false,
    isInsulin: false,
    storageRequirements: '',
    administrationTimes: [], // Add this
    customTimes: [] // Add this
  });

  // Form state for administration
  const [adminFormData, setAdminFormData] = useState({
    scheduledTime: '',
    actualTime: '',
    status: 'given',
    notes: '',
    bloodSugarLevel: '',
    insulinUnits: '',
    injectionSite: '',
    caregiverInitials: ''
  });

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    if (selectedResident) {
      loadMedications();
      loadAdministrationRecords();
    }
  }, [selectedResident]);

  const loadResidents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/homes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Get all residents from all homes
        const allResidents = [];
        for (const home of data.homes) {
          const resResponse = await fetch(`http://localhost:5000/api/residents/home/${home.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const resData = await resResponse.json();
          if (resResponse.ok) {
            resData.residents.forEach(resident => {
              allResidents.push({
                ...resident,
                home_name: home.name
              });
            });
          }
        }
        setResidents(allResidents);
        if (allResidents.length > 0 && !selectedResident) {
          setSelectedResident(allResidents[0].id.toString());
        }
      }
    } catch (err) {
      setError('Failed to load residents');
    } finally {
      setLoading(false);
    }
  };

  const loadMedications = async () => {
    if (!selectedResident) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/medications/resident/${selectedResident}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMedications(data.medications);
      }
    } catch (err) {
      console.error('Error loading medications:', err);
    }
  };

  const loadAdministrationRecords = async () => {
    if (!selectedResident) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/medications/records/resident/${selectedResident}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAdministrationRecords(data.records);
      }
    } catch (err) {
      console.error('Error loading administration records:', err);
    }
  };

  const handleMedSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...medFormData,
          residentId: parseInt(selectedResident)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMedications([...medications, data.medication]);
        setShowAddMedForm(false);
        resetMedForm();
      } else {
        setError(data.error || 'Failed to add medication');
      }
    } catch (err) {
      setError('Failed to add medication');
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/medications/administration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...adminFormData,
          medicationId: selectedMedication.id,
          residentId: parseInt(selectedResident),
          caregiverInitials: adminFormData.caregiverInitials || `${user.firstName[0]}${user.lastName[0]}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAdministrationRecords([data.record, ...administrationRecords]);
        setShowAdminForm(false);
        resetAdminForm();
        setSelectedMedication(null);
      } else {
        setError(data.error || 'Failed to record administration');
      }
    } catch (err) {
      setError('Failed to record administration');
    }
  };

  const resetMedForm = () => {
    setMedFormData({
      medicationName: '',
      dosage: '',
      frequency: '',
      route: 'oral',
      instructions: '',
      prescriberName: '',
      prescriberPhone: '',
      startDate: '',
      endDate: '',
      isPrn: false,
      isInsulin: false,
      storageRequirements: '',
      administrationTimes: [], // Add this
      customTimes: [] // Add this
    });
  };

  const resetAdminForm = () => {
    setAdminFormData({
      scheduledTime: '',
      actualTime: '',
      status: 'given',
      notes: '',
      bloodSugarLevel: '',
      insulinUnits: '',
      injectionSite: '',
      caregiverInitials: ''
    });
  };

  const selectedResidentData = residents.find(r => r.id.toString() === selectedResident);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#0ea5e9' }}>Loading medications...</h2>
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#f0f9ff',
      minHeight: 'calc(100vh - 70px)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ 
            color: '#0ea5e9', 
            fontSize: '2.5rem',
            margin: '0 0 10px 0'
          }}>
            💊 Medication Management (eMARs)
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Electronic Medication Administration Records
          </p>
        </div>
        {user.role === 'provider' || user.role === 'admin' ? (
          <button
            onClick={() => {
              if (residents.length === 0) {
                alert('Please add residents first before adding medications.');
                return;
              }
              setShowAddMedForm(true);
            }}
            style={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ➕ Add Medication
          </button>
        ) : null}
      </div>

      {/* Resident Selection */}
      {residents.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '500',
            color: '#374151'
          }}>
            Select Resident:
          </label>
          <select
            value={selectedResident}
            onChange={(e) => setSelectedResident(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              minWidth: '400px'
            }}
          >
            {residents.map(resident => (
              <option key={resident.id} value={resident.id}>
                {resident.first_name} {resident.last_name} - {resident.home_name}
              </option>
            ))}
          </select>
          {selectedResidentData && selectedResidentData.is_diabetic && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#92400e'
            }}>
              ⚠️ Diabetic Patient - Monitor blood sugar levels
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      {residents.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Medications List */}
          <div>
            <h2 style={{ color: '#374151', marginBottom: '20px' }}>
              Current Medications
            </h2>
            
            {medications.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>
                  No medications found for this resident
                </p>
                {(user.role === 'provider' || user.role === 'admin') && (
                  <button
                    onClick={() => setShowAddMedForm(true)}
                    style={{
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Add First Medication
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {medications.map((medication) => (
                  <div
                    key={medication.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '15px'
                    }}>
                      <h3 style={{
                        color: '#0ea5e9',
                        fontSize: '1.2rem',
                        margin: 0,
                        fontWeight: '600'
                      }}>
                        {medication.medication_name}
                      </h3>
                      {medication.is_insulin && (
                        <span style={{
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          Insulin
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ margin: '3px 0', color: '#374151', fontSize: '14px' }}>
                        💊 <strong>Dosage:</strong> {medication.dosage}
                      </p>
                      <p style={{ margin: '3px 0', color: '#374151', fontSize: '14px' }}>
                        ⏰ <strong>Frequency:</strong> {medication.frequency}
                      </p>
                      <p style={{ margin: '3px 0', color: '#374151', fontSize: '14px' }}>
                        🎯 <strong>Route:</strong> {medication.route}
                      </p>
                      {medication.instructions && (
                        <p style={{ margin: '3px 0', color: '#374151', fontSize: '14px' }}>
                          📝 <strong>Instructions:</strong> {medication.instructions}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMedication(medication);
                        setAdminFormData(prev => ({
                          ...prev,
                          scheduledTime: new Date().toISOString().slice(0, 16)
                        }));
                        setShowAdminForm(true);
                      }}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      📋 Record Administration
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Administration Records */}
          <div>
            <h2 style={{ color: '#374151', marginBottom: '20px' }}>
              Recent Administration Records
            </h2>
            
            {administrationRecords.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{ color: '#64748b' }}>
                  No administration records found
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {administrationRecords.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      borderLeft: `4px solid ${
                        record.status === 'given' ? '#10b981' :
                        record.status === 'refused' ? '#ef4444' :
                        record.status === 'missed' ? '#f59e0b' : '#6b7280'
                      }`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        {record.medication_name}
                      </h4>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: record.status === 'given' ? '#10b981' : 
                              record.status === 'refused' ? '#ef4444' : 
                              record.status === 'missed' ? '#f59e0b' : '#6b7280'
                      }}>
                        {record.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#64748b' }}>
                      ⏰ {new Date(record.scheduled_time).toLocaleString()}
                    </p>
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#64748b' }}>
                      👤 {record.caregiver_first_name} {record.caregiver_last_name} ({record.caregiver_initials})
                    </p>
                    {record.blood_sugar_level && (
                      <p style={{ margin: '3px 0', fontSize: '13px', color: '#64748b' }}>
                        🩸 Blood Sugar: {record.blood_sugar_level} mg/dL
                      </p>
                    )}
                    {record.notes && (
                      <p style={{ margin: '3px 0', fontSize: '13px', color: '#64748b' }}>
                        📝 {record.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#64748b', marginBottom: '15px' }}>
            No Residents Found
          </h3>
          <p style={{ color: '#64748b', marginBottom: '25px' }}>
            You need to add residents before managing medications
          </p>
        </div>
      )}

      {/* Medication Form and Administration Form modals go here - they're quite long so I'll add them in the next response */}
      {/* Add Medication Form Modal */}
      {showAddMedForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              color: '#0ea5e9', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Add New Medication
            </h2>

            <form onSubmit={handleMedSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={medFormData.medicationName}
                  onChange={(e) => setMedFormData({...medFormData, medicationName: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Metformin"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={medFormData.dosage}
                    onChange={(e) => setMedFormData({...medFormData, dosage: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="500mg"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Route *
                  </label>
                  <select
                    value={medFormData.route}
                    onChange={(e) => setMedFormData({...medFormData, route: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="oral">Oral</option>
                    <option value="injection">Injection</option>
                    <option value="topical">Topical</option>
                    <option value="inhaled">Inhaled</option>
                    <option value="sublingual">Sublingual</option>
                  </select>
                </div>
              </div>

               <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                  Administration Schedule *
                </label>
                
                {/* Common Time Slots */}
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '15px', 
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151' }}>
                    Select Administration Times:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {[
                      { time: '08:00', label: '8:00 AM (Morning)' },
                      { time: '12:00', label: '12:00 PM (Noon)' },
                      { time: '17:00', label: '5:00 PM (Evening)' },
                      { time: '20:00', label: '8:00 PM (Night)' }
                    ].map((slot) => (
                      <label key={slot.time} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontSize: '14px'
                      }}>
                        <input
                          type="checkbox"
                          checked={medFormData.administrationTimes?.includes(slot.time) || false}
                          onChange={(e) => {
                            const times = medFormData.administrationTimes || [];
                            if (e.target.checked) {
                              setMedFormData({
                                ...medFormData, 
                                administrationTimes: [...times, slot.time]
                              });
                            } else {
                              setMedFormData({
                                ...medFormData,
                                administrationTimes: times.filter(t => t !== slot.time)
                              });
                            }
                          }}
                        />
                        <span>{slot.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Times */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Custom Times (if needed):
                  </label>
                  {(medFormData.customTimes || []).map((customTime, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => {
                          const newCustomTimes = [...(medFormData.customTimes || [])];
                          newCustomTimes[index] = e.target.value;
                          setMedFormData({...medFormData, customTimes: newCustomTimes});
                        }}
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newCustomTimes = (medFormData.customTimes || []).filter((_, i) => i !== index);
                          setMedFormData({...medFormData, customTimes: newCustomTimes});
                        }}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMedFormData({
                        ...medFormData,
                        customTimes: [...(medFormData.customTimes || []), '']
                      });
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px dashed #0ea5e9',
                      color: '#0ea5e9',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Custom Time
                  </button>
                </div>

                {/* Frequency Description */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                    Frequency Description:
                  </label>
                  <input
                    type="text"
                    value={medFormData.frequency}
                    onChange={(e) => setMedFormData({...medFormData, frequency: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., Once daily, Twice daily, As needed"
                  />
                </div>

                {/* Schedule Preview */}
                {(medFormData.administrationTimes?.length > 0 || medFormData.customTimes?.some(t => t)) && (
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '14px'
                  }}>
                    <strong style={{ color: '#065f46' }}>Scheduled Times:</strong>
                    <div style={{ marginTop: '5px', color: '#047857' }}>
                      {[
                        ...(medFormData.administrationTimes || []),
                        ...(medFormData.customTimes || []).filter(t => t)
                      ].sort().map((time, index, arr) => (
                        <span key={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {index < arr.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Instructions
                </label>
                <textarea
                  value={medFormData.instructions}
                  onChange={(e) => setMedFormData({...medFormData, instructions: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    minHeight: '60px'
                  }}
                  placeholder="Take with food, etc."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={medFormData.startDate}
                    onChange={(e) => setMedFormData({...medFormData, startDate: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={medFormData.endDate}
                    onChange={(e) => setMedFormData({...medFormData, endDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={medFormData.isInsulin}
                    onChange={(e) => setMedFormData({...medFormData, isInsulin: e.target.checked})}
                  />
                  <span style={{ fontWeight: '500' }}>This is insulin</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={medFormData.isPrn}
                    onChange={(e) => setMedFormData({...medFormData, isPrn: e.target.checked})}
                  />
                  <span style={{ fontWeight: '500' }}>PRN (as needed)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMedForm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: 'white'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#0ea5e9',
                    color: 'white',
                    fontWeight: '500'
                  }}
                >
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Administration Form Modal */}
      {showAdminForm && selectedMedication && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              color: '#0ea5e9', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Record Administration
            </h2>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>
                {selectedMedication.medication_name}
              </h3>
              <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
                {selectedMedication.dosage} - {selectedMedication.route}
              </p>
            </div>

            <form onSubmit={handleAdminSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Scheduled Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={adminFormData.scheduledTime}
                    onChange={(e) => setAdminFormData({...adminFormData, scheduledTime: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Status *
                  </label>
                  <select
                    value={adminFormData.status}
                    onChange={(e) => setAdminFormData({...adminFormData, status: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="given">Given</option>
                    <option value="refused">Refused</option>
                    <option value="missed">Missed</option>
                    <option value="held">Held</option>
                  </select>
                </div>
              </div>

              {/* Insulin-specific fields */}
              {selectedMedication.is_insulin && (
                <div>
                  <h4 style={{ color: '#374151', marginBottom: '15px' }}>Insulin Administration</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Blood Sugar (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={adminFormData.bloodSugarLevel}
                        onChange={(e) => setAdminFormData({...adminFormData, bloodSugarLevel: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Insulin Units
                      </label>
                      <input
                        type="text"
                        value={adminFormData.insulinUnits}
                        onChange={(e) => setAdminFormData({...adminFormData, insulinUnits: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                        placeholder="10 units"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Injection Site
                      </label>
                      <select
                        value={adminFormData.injectionSite}
                        onChange={(e) => setAdminFormData({...adminFormData, injectionSite: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select site</option>
                        <option value="left_arm">Left Arm</option>
                        <option value="right_arm">Right Arm</option>
                        <option value="left_thigh">Left Thigh</option>
                        <option value="right_thigh">Right Thigh</option>
                        <option value="abdomen">Abdomen</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Caregiver Initials
                </label>
                <input
                  type="text"
                  value={adminFormData.caregiverInitials}
                  onChange={(e) => setAdminFormData({...adminFormData, caregiverInitials: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder={`${user.firstName[0]}${user.lastName[0]}`}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  value={adminFormData.notes}
                  onChange={(e) => setAdminFormData({...adminFormData, notes: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    minHeight: '60px'
                  }}
                  placeholder="Any additional notes or observations..."
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminForm(false);
                    setSelectedMedication(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: 'white'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontWeight: '500'
                  }}
                >
                  Record Administration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;
