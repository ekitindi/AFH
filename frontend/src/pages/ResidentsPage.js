import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [homes, setHomes] = useState([]);
  const [selectedHome, setSelectedHome] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { token } = useAuth();

  // Form state for adding new resident
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    homeId: '',
    paymentType: 'medicaid',
    monthlyRate: '',
    primaryPhysician: '',
    physicianPhone: '',
    physicianEmail: '',
    emergencyContacts: [{ name: '', relationship: '', phone: '' }],
    medicalConditions: [''],
    allergies: [''],
    isDiabetic: false,
    vitalsFrequency: 'weekly',
    carePlanNotes: ''
  });

  useEffect(() => {
    loadHomes();
    if (selectedHome) {
      loadResidents();
    }
  }, [selectedHome]);

  const loadHomes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/homes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setHomes(data.homes);
        if (data.homes.length > 0 && !selectedHome) {
          setSelectedHome(data.homes[0].id.toString());
        }
      }
    } catch (err) {
      setError('Failed to load homes');
    }
  };

  const loadResidents = async () => {
    if (!selectedHome) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/residents/home/${selectedHome}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setResidents(data.residents);
      } else {
        setError(data.error || 'Failed to load residents');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Clean up form data
      const cleanedData = {
        ...formData,
        homeId: parseInt(formData.homeId),
        monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
        emergencyContacts: formData.emergencyContacts.filter(contact => 
          contact.name && contact.relationship
        ),
        medicalConditions: formData.medicalConditions.filter(condition => condition.trim()),
        allergies: formData.allergies.filter(allergy => allergy.trim())
      };

      const response = await fetch('http://localhost:5000/api/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData)
      });

      const data = await response.json();

      if (response.ok) {
        setResidents([...residents, data.resident]);
        setShowAddForm(false);
        resetForm();
        // Reload homes to update occupancy count
        loadHomes();
      } else {
        setError(data.error || 'Failed to create resident');
      }
    } catch (err) {
      setError('Failed to create resident');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      homeId: '',
      paymentType: 'medicaid',
      monthlyRate: '',
      primaryPhysician: '',
      physicianPhone: '',
      physicianEmail: '',
      emergencyContacts: [{ name: '', relationship: '', phone: '' }],
      medicalConditions: [''],
      allergies: [''],
      isDiabetic: false,
      vitalsFrequency: 'weekly',
      carePlanNotes: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', relationship: '', phone: '' }]
    }));
  };

  const updateEmergencyContact = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addMedicalCondition = () => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: [...prev.medicalConditions, '']
    }));
  };

  const updateMedicalCondition = (index, value) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.map((condition, i) =>
        i === index ? value : condition
      )
    }));
  };

  const selectedHomeName = homes.find(h => h.id.toString() === selectedHome)?.name || '';

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
            👥 Resident Management
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Manage residents in your AFH homes
          </p>
        </div>
        <button
          onClick={() => {
            if (homes.length === 0) {
              alert('Please add an AFH home first before adding residents.');
              return;
            }
            setFormData(prev => ({ ...prev, homeId: selectedHome }));
            setShowAddForm(true);
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
          ➕ Add New Resident
        </button>
      </div>

      {/* Home Selection */}
      {homes.length > 0 && (
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
            Select AFH Home:
          </label>
          <select
            value={selectedHome}
            onChange={(e) => setSelectedHome(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              minWidth: '300px'
            }}
          >
            {homes.map(home => (
              <option key={home.id} value={home.id}>
                {home.name} ({home.current_residents || 0}/{home.max_residents} residents)
              </option>
            ))}
          </select>
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

      {/* No Homes Message */}
      {homes.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#64748b', marginBottom: '15px' }}>
            No AFH Homes Found
          </h3>
          <p style={{ color: '#64748b', marginBottom: '25px' }}>
            You need to add an AFH home before you can add residents
          </p>
          <button
            onClick={() => window.location.reload()} // Simple way to refresh and go to homes
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
            🏠 Go to AFH Homes
          </button>
        </div>
      )}

      {/* Residents List */}
      {homes.length > 0 && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ color: '#0ea5e9' }}>Loading residents...</h3>
            </div>
          ) : residents.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              padding: '60px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#64748b', marginBottom: '15px' }}>
                No Residents in {selectedHomeName}
              </h3>
              <p style={{ color: '#64748b', marginBottom: '25px' }}>
                Add the first resident to this AFH home
              </p>
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, homeId: selectedHome }));
                  setShowAddForm(true);
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
                ➕ Add First Resident
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {residents.map((resident) => (
                <div
                  key={resident.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
                      fontSize: '1.3rem',
                      margin: 0,
                      fontWeight: '600'
                    }}>
                      {resident.first_name} {resident.last_name}
                    </h3>
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Active
                    </span>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '5px 0', color: '#374151', fontSize: '14px' }}>
                      🎂 DOB: {new Date(resident.date_of_birth).toLocaleDateString()}
                    </p>
                    {resident.phone && (
                      <p style={{ margin: '5px 0', color: '#374151', fontSize: '14px' }}>
                        📞 {resident.phone}
                      </p>
                    )}
                    <p style={{ margin: '5px 0', color: '#374151', fontSize: '14px' }}>
                      💳 {resident.payment_type?.replace('_', ' ').toUpperCase()}
                    </p>
                    {resident.monthly_rate && (
                      <p style={{ margin: '5px 0', color: '#374151', fontSize: '14px' }}>
                        💰 ${resident.monthly_rate}/month
                      </p>
                    )}
                  </div>

                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                      MEDICAL INFO
                    </p>
                    {resident.primary_physician && (
                      <p style={{ margin: '2px 0', fontSize: '13px', color: '#374151' }}>
                        👨‍⚕️ Dr. {resident.primary_physician}
                      </p>
                    )}
                    {resident.physician_email && (
                      <p style={{ margin: '2px 0', fontSize: '13px', color: '#374151' }}>
                        📧 {resident.physician_email}
                      </p>
                    )}
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#374151' }}>
                      🩺 Vitals: {resident.vitals_frequency}
                    </p>
                    {resident.is_diabetic && (
                      <p style={{ margin: '2px 0', fontSize: '13px', color: '#dc2626' }}>
                        ⚠️ Diabetic
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: '1px solid #0ea5e9',
                        color: '#0ea5e9',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      👁️ View Details
                    </button>
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #d1d5db',
                        color: '#64748b',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Resident Form Modal */}
      {showAddForm && (
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
            padding: '40px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              color: '#0ea5e9', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Add New Resident
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '1.1rem' }}>
                  Basic Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
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
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
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
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '1.1rem' }}>
                  Payment Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Payment Type *
                    </label>
                    <select
                      value={formData.paymentType}
                      onChange={(e) => handleInputChange('paymentType', e.target.value)}
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
                      <option value="medicaid">Medicaid</option>
                      <option value="private_pay">Private Pay</option>
                      <option value="insurance">Insurance</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Monthly Rate ($)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyRate}
                      onChange={(e) => handleInputChange('monthlyRate', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="3500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '1.1rem' }}>
                  Emergency Contact
                </h3>
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                        placeholder="Contact Name"
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <input
                        type="text"
                        value={contact.relationship}
                        onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                        placeholder="Relationship"
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                        placeholder="Phone"
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEmergencyContact}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px dashed #0ea5e9',
                    color: '#0ea5e9',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  + Add Emergency Contact
                </button>
              </div>

              {/* Medical Information */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '1.1rem' }}>
                  Medical Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Primary Physician
                    </label>
                    <input
                      type="text"
                      value={formData.primaryPhysician}
                      onChange={(e) => handleInputChange('primaryPhysician', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Physician Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.physicianPhone}
                      onChange={(e) => handleInputChange('physicianPhone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="(206) 555-9999"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Physician Email 📧
                  </label>
                  <input
                    type="email"
                    value={formData.physicianEmail}
                    onChange={(e) => handleInputChange('physicianEmail', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="doctor.smith@medicalpractice.com"
                  />
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#64748b', 
                    margin: '5px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    📤 Used for automated eMARs and vitals reports (bi-weekly/monthly)
                  </p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isDiabetic}
                      onChange={(e) => handleInputChange('isDiabetic', e.target.checked)}
                    />
                    <span style={{ fontWeight: '500' }}>Patient is diabetic</span>
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Vitals Frequency
                  </label>
                  <select
                    value={formData.vitalsFrequency}
                    onChange={(e) => handleInputChange('vitalsFrequency', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
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
                  Add Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentsPage;