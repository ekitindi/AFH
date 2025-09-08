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
