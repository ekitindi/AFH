import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const HomesPage = () => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { token } = useAuth();

  // Form state for adding new home
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    maxResidents: 6
  });

  // Load homes when component mounts
  useEffect(() => {
    loadHomes();
  }, []);

  const loadHomes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/homes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setHomes(data.homes);
      } else {
        setError(data.error || 'Failed to load homes');
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
      const response = await fetch('http://localhost:5000/api/homes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setHomes([...homes, data.home]);
        setShowAddForm(false);
        setFormData({
          name: '',
          licenseNumber: '',
          address: '',
          city: '',
          zipCode: '',
          phone: '',
          maxResidents: 6
        });
      } else {
        setError(data.error || 'Failed to create home');
      }
    } catch (err) {
      setError('Failed to create home');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#0ea5e9' }}>Loading your AFH homes...</h2>
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#f0f9ff',
      minHeight: '100vh',
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
            🏠 AFH Homes Management
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Manage your Adult Family Homes
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
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
          ➕ Add New Home
        </button>
      </div>

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

      {/* Add Home Form */}
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              color: '#0ea5e9', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Add New AFH Home
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Home Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Sunset Manor AFH"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., AFH-WA-2024-001"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Street address"
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="City"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="98101"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="(206) 555-0123"
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Maximum Residents *
                </label>
                <select
                  value={formData.maxResidents}
                  onChange={(e) => handleInputChange('maxResidents', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} residents</option>
                  ))}
                </select>
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
                  Create Home
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Homes Grid */}
      {homes.length === 0 ? (
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
            Get started by adding your first Adult Family Home
          </p>
          <button
            onClick={() => setShowAddForm(true)}
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
            ➕ Add Your First Home
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {homes.map((home) => (
            <div
              key={home.id}
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
                  {home.name}
                </h3>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  ✏️ Edit
                </button>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0', color: '#374151' }}>
                  📍 {home.address}
                </p>
                <p style={{ margin: '5px 0', color: '#374151' }}>
                  📍 {home.city}, {home.state} {home.zip_code}
                </p>
                {home.phone && (
                  <p style={{ margin: '5px 0', color: '#374151' }}>
                    📞 {home.phone}
                  </p>
                )}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Occupancy</p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#374151' }}>
                    {home.current_residents || 0} / {home.max_residents}
                  </p>
                </div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: home.current_residents >= home.max_residents ? '#dc2626' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {Math.round((home.current_residents || 0) / home.max_residents * 100)}%
                </div>
              </div>

              {home.license_number && (
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  License: {home.license_number}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomesPage;
