import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const CATEGORIES = ['SEDAN', 'SUV', 'TRUCK', 'COUPE', 'HATCHBACK', 'VAN'];

const AdminDashboard = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [tab, setTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [carForm, setCarForm] = useState({ make: '', model: '', year: '', category: 'SEDAN', price_per_day: '', is_available: true });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [s, b] = await Promise.all([
        api.get('/admin/dashboard/'),
        api.get('/admin/bookings/'),
      ]);
      setStats(s.data);
      setBookings(b.data);
      if (user?.is_superuser) {
        const u = await api.get('/admin/users/');
        setUsers(u.data);
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await api.get('/cars/');
      setCars(res.data);
    } catch (err) {
      showToast('Failed to load cars');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/bookings/${id}/`, { payment_status: status });
      showToast('Booking status updated');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status');
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await api.delete(`/admin/bookings/${id}/delete/`);
      showToast('Booking deleted');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete booking');
    }
  };

  const toggleStaff = async (id, isStaff) => {
    try {
      await api.patch(`/admin/users/${id}/`, { is_staff: !isStaff });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) { showToast('Passwords do not match'); return; }
    if (pwForm.new.length < 6) { showToast('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      const res = await api.post('/change-password/', { old_password: pwForm.old, new_password: pwForm.new });
      const token = localStorage.getItem('token');
      if (res.data.token && res.data.token !== token) {
        localStorage.setItem('token', res.data.token);
      }
      showToast('Password changed successfully');
      setPwForm({ old: '', new: '', confirm: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}/delete/`);
      showToast('User deleted');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const openCarForm = (car = null) => {
    if (car) {
      setEditingCar(car);
      setCarForm({ make: car.make, model: car.model, year: car.year, category: car.category, price_per_day: car.price_per_day, is_available: car.is_available });
    } else {
      setEditingCar(null);
      setCarForm({ make: '', model: '', year: '', category: 'SEDAN', price_per_day: '', is_available: true });
    }
    setShowCarForm(true);
  };

  const handleCarSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...carForm, year: parseInt(carForm.year), price_per_day: parseFloat(carForm.price_per_day) };
    try {
      if (editingCar) {
        await api.patch(`/cars/${editingCar.id}/`, payload);
        showToast('Car updated');
      } else {
        await api.post('/cars/', payload);
        showToast('Car created');
      }
      setShowCarForm(false);
      fetchCars();
    } catch (err) {
      showToast(err.response?.data?.error || Object.values(err.response?.data || {}).flat().join(', ') || 'Failed to save car');
    }
  };

  const deleteCar = async (id) => {
    if (!window.confirm('Delete this car?')) return;
    try {
      await api.delete(`/cars/${id}/`);
      showToast('Car deleted');
      fetchCars();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete car');
    }
  };

  const toggleCarAvailability = async (car) => {
    try {
      await api.patch(`/cars/${car.id}/`, { is_available: !car.is_available });
      showToast(`Car ${car.is_available ? 'deactivated' : 'activated'}`);
      fetchCars();
    } catch (err) {
      showToast('Failed to toggle availability');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card blue"><span className="stat-num">{stats.total_cars}</span><span className="stat-lbl">Total Cars</span></div>
          <div className="stat-card green"><span className="stat-num">{stats.total_users}</span><span className="stat-lbl">Total Users</span></div>
          <div className="stat-card orange"><span className="stat-num">{stats.total_bookings}</span><span className="stat-lbl">Total Bookings</span></div>
          <div className="stat-card purple"><span className="stat-num">${stats.total_revenue}</span><span className="stat-lbl">Revenue</span></div>
          <div className="stat-card red"><span className="stat-num">{stats.pending_bookings}</span><span className="stat-lbl">Pending</span></div>
          <div className="stat-card teal"><span className="stat-num">{stats.active_cars}</span><span className="stat-lbl">Active Cars</span></div>
        </div>
      )}

      <div className="admin-tabs">
        <button className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>Bookings</button>
        <button className={`tab-btn ${tab === 'cars' ? 'active' : ''}`} onClick={() => { setTab('cars'); fetchCars(); }}>Cars</button>
        {user?.is_superuser && <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>}
        <button className={`tab-btn ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>Change Password</button>
      </div>

      {tab === 'bookings' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>User</th><th>Car</th><th>Dates</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>{b.username}</td>
                  <td>{b.car_details?.make} {b.car_details?.model}</td>
                  <td>{b.start_date} to {b.end_date}</td>
                  <td>${b.total_price}</td>
                  <td>{b.payment_method}</td>
                  <td><span className={`status-badge ${b.payment_status?.toLowerCase()}`}>{b.payment_status}</span></td>
                  <td className="actions-cell">
                    <select value={b.payment_status} onChange={e => updateStatus(b.id, e.target.value)} className="status-select">
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                    <button onClick={() => deleteBooking(b.id)} className="btn-danger-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'cars' && (
        <div>
          <div className="admin-toolbar">
            <button onClick={() => openCarForm()} className="add-btn">+ Add Car</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Image</th><th>Make</th><th>Model</th><th>Year</th><th>Category</th><th>Price/Day</th><th>Available</th><th>Actions</th></tr></thead>
              <tbody>
                {cars.map(c => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td>{c.image_url ? <img src={c.image_url} alt="" className="car-thumb" /> : '-'}</td>
                    <td>{c.make}</td>
                    <td>{c.model}</td>
                    <td>{c.year}</td>
                    <td>{c.category}</td>
                    <td>${c.price_per_day}</td>
                    <td><span className={`status-badge ${c.is_available ? 'completed' : 'failed'}`}>{c.is_available ? 'Yes' : 'No'}</span></td>
                    <td className="actions-cell">
                      <button onClick={() => openCarForm(c)} className="btn-primary-sm">Edit</button>
                      <button onClick={() => toggleCarAvailability(c)} className={`btn-sm ${c.is_available ? 'btn-outline' : 'btn-primary-sm'}`}>{c.is_available ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => deleteCar(c.id)} className="btn-danger-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showCarForm && (
            <div className="modal-overlay" onClick={() => setShowCarForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>{editingCar ? 'Edit Car' : 'Add Car'}</h3>
                <form onSubmit={handleCarSubmit} className="car-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Make</label>
                      <input type="text" className="form-input" value={carForm.make} onChange={e => setCarForm({...carForm, make: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Model</label>
                      <input type="text" className="form-input" value={carForm.model} onChange={e => setCarForm({...carForm, model: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Year</label>
                      <input type="number" className="form-input" value={carForm.year} onChange={e => setCarForm({...carForm, year: e.target.value})} required min="1900" max="2027" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-input" value={carForm.category} onChange={e => setCarForm({...carForm, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Price Per Day ($)</label>
                      <input type="number" step="0.01" className="form-input" value={carForm.price_per_day} onChange={e => setCarForm({...carForm, price_per_day: e.target.value})} required min="0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Image URL (optional)</label>
                      <input type="text" className="form-input" placeholder="Paste image URL" />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">{editingCar ? 'Update Car' : 'Add Car'}</button>
                    <button type="button" onClick={() => setShowCarForm(false)} className="cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Staff</th><th>Bookings</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.is_staff ? 'Yes' : 'No'}</td>
                  <td>{u.total_bookings}</td>
                  <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button onClick={() => toggleStaff(u.id, u.is_staff)} className={`btn-sm ${u.is_staff ? 'btn-outline' : 'btn-primary-sm'}`}>
                      {u.is_staff ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                    <button onClick={() => deleteUser(u.id)} className="btn-danger-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'password' && (
        <div className="pw-card">
          <h3>Change Password</h3>
          <form onSubmit={handleChangePw} className="pw-form">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={pwForm.old} onChange={e => setPwForm({...pwForm, old: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={pwForm.new} onChange={e => setPwForm({...pwForm, new: e.target.value})} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} required minLength={6} />
            </div>
            <button type="submit" className="submit-btn" disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
