import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import HomesPage from './pages/HomesPage';
import ResidentsPage from './pages/ResidentsPage';
import MedicationsPage from './pages/MedicationsPage';

// Navigation Component
const Navigation = ({ currentPage, setCurrentPage, user, logout }) => {
  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'homes', label: '🏠 AFH Homes', icon: '🏠' },
    { id: 'residents', label: '👥 Residents', icon: '👥' },
    { id: 'medications', label: '💊 eMARs', icon: '💊' },
    { id: 'reports', label: '📋 Reports', icon: '📋' }
  ];

  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '15px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <h2 style={{ 
          color: '#0ea5e9', 
          margin: 0,
          fontSize: '1.5rem'
        }}>
          🏠 AFH Management
        </h2>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                backgroundColor: currentPage === item.id ? '#0ea5e9' : 'transparent',
                color: currentPage === item.id ? 'white' : '#64748b',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ color: '#64748b', fontSize: '14px' }}>
          {user?.firstName} {user?.lastName}
        </span>
        <button
          onClick={logout}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Enhanced Dashboard with Real-Time Stats
const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalHomes: 0,
    totalResidents: 0,
    totalCapacity: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/homes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        const homes = data.homes;
        const totalHomes = homes.length;
        const totalResidents = homes.reduce((sum, home) => sum + (home.current_residents || 0), 0);
        const totalCapacity = homes.reduce((sum, home) => sum + home.max_residents, 0);
        const occupancyRate = totalCapacity > 0 ? (totalResidents / totalCapacity) * 100 : 0;

        setStats({
          totalHomes,
          totalResidents,
          totalCapacity,
          occupancyRate
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#f0f9ff',
      minHeight: 'calc(100vh - 70px)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            color: '#0ea5e9', 
            fontSize: '2.5rem',
            margin: '0 0 10px 0'
          }}>
            📊 Dashboard Overview
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Welcome back, {user?.firstName}! Here's your AFH system overview.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#0ea5e9' }}>Loading dashboard statistics...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: '#dbeafe',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#1e40af', margin: '0 0 10px 0' }}>🏠 AFH Homes</h3>
              <p style={{ color: '#64748b', margin: '0 0 10px 0' }}>Total facilities</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>
                {stats.totalHomes}
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#dcfce7',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#166534', margin: '0 0 10px 0' }}>👥 Residents</h3>
              <p style={{ color: '#64748b', margin: '0 0 10px 0' }}>Total residents</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534', margin: 0 }}>
                {stats.totalResidents}
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#92400e', margin: '0 0 10px 0' }}>📊 Capacity</h3>
              <p style={{ color: '#64748b', margin: '0 0 10px 0' }}>Total capacity</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
                {stats.totalCapacity}
              </p>
            </div>

            <div style={{
              backgroundColor: stats.occupancyRate > 80 ? '#dcfce7' : '#fef3c7',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                color: stats.occupancyRate > 80 ? '#166534' : '#92400e', 
                margin: '0 0 10px 0' 
              }}>
                📈 Occupancy
              </h3>
              <p style={{ color: '#64748b', margin: '0 0 10px 0' }}>Occupancy rate</p>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: stats.occupancyRate > 80 ? '#166534' : '#92400e', 
                margin: 0 
              }}>
                {stats.occupancyRate.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#374151' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              🏠 Add New Home
            </button>
            <button style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              👥 Add Resident
            </button>
            <button style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              📋 View Reports
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#ecfdf5',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <p style={{ margin: 0, color: '#065f46', fontWeight: '500' }}>
            ✅ System Status: All services operational
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#065f46', fontSize: '14px' }}>
            User: {user?.email} | Role: {user?.role?.toUpperCase()} | Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App Content with Navigation
const AppContent = () => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(!isAuthenticated);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#0ea5e9' }}>Loading AFH Management System...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || showLogin) {
    return <LoginPage onLoginSuccess={() => setShowLogin(false)} />;
  }

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'homes':
        return <HomesPage />;
      case 'residents':
        return <ResidentsPage />;
      case 'dashboard':
      default:
        return <Dashboard />;
      case 'medications':
        return <MedicationsPage />;
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <Navigation 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        logout={logout}
      />
      {renderCurrentPage()}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
