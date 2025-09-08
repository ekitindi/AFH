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

      console.log('Sending data:', cleanedData);
      console.log('Token:', token);

      const response = await fetch('http://localhost:5000/api/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setResidents([...residents, data.resident]);
        setShowAddForm(false);
        resetForm();
        // Reload homes to update occupancy count
        loadHomes();
      } else {
        setError(data.error || `Failed to create resident (${response.status})`);
      }
    } catch (err) {
      console.error('Request error:', err);
      setError(`Failed to create resident: ${err.message}`);
    }
  };
