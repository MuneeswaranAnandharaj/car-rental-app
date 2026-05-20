import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

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
      showToast(res.data.message || 'Password changed');
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
