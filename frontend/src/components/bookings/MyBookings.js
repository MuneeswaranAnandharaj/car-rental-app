import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './MyBookings.css';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getUserBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await fetch(`http://localhost:8000/api/bookings/${bookingId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
    }
  };

  if (loading) return <div className="loading-text">Loading your bookings...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-bookings-wrapper">
      <div className="my-bookings-container">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Manage your car rental bookings</p>
        
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">&#128203;</div>
            <h3>No Bookings Yet</h3>
            <p>You haven't made any bookings yet.</p>
            <button 
              onClick={() => navigate('/')} 
              className="browse-btn"
            >
              Browse Available Cars
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">Booking #{booking.id}</div>
                  <div className="booking-date">
                    {new Date(booking.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div className="booking-car-info">
                  <h3 className="car-name">
                    {booking.car_details?.make} {booking.car_details?.model}
                  </h3>
                  <p className="car-category">{booking.car_details?.category}</p>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="detail-label">Start Date</span>
                    <span className="detail-value">{new Date(booking.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">End Date</span>
                    <span className="detail-value">{new Date(booking.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Price</span>
                    <span className="detail-value price">${booking.total_price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment</span>
                    <span className="detail-value">{booking.payment_method?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`detail-value status-${booking.payment_status?.toLowerCase()}`}>{booking.payment_status}</span>
                  </div>
                  {booking.payment_details?.card_number && (
                    <div className="detail-item">
                      <span className="detail-label">Card</span>
                      <span className="detail-value">{booking.payment_details.card_number} ({booking.payment_details.card_expiry})</span>
                    </div>
                  )}
                  {booking.payment_details?.bank_name && (
                    <div className="detail-item">
                      <span className="detail-label">Bank</span>
                      <span className="detail-value">{booking.payment_details.bank_name} - {booking.payment_details.account_number}</span>
                    </div>
                  )}
                  {booking.payment_details?.stripe && (
                    <div className="detail-item">
                      <span className="detail-label">Stripe</span>
                      <span className="detail-value">Paid via Stripe</span>
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="cancel-btn"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
