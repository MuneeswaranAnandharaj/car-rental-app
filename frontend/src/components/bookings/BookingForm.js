import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carService, bookingService } from '../../services/api';
import MapPicker from '../../components/common/MapPicker';
import PaymentModal from '../../components/common/PaymentModal';
import './BookingForm.css';

const PaymentFields = ({ method, formData, handleChange, errors }) => {
  switch (method) {
    case 'CREDIT_CARD':
    case 'DEBIT_CARD':
      return (
        <>
          <div className="form-group">
            <label className="form-label">Card Number</label>
              <input type="text" name="card_number" value={formData.card_number || ''} onChange={handleChange} placeholder="1234 5678 9012 3456" maxLength="19" autoComplete="cc-number" inputMode="numeric" className={`form-input ${errors.card_number ? 'error' : ''}`} />
            {errors.card_number && <p className="error-text">{errors.card_number}</p>}
          </div>
          <div className="date-row">
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input type="text" name="card_expiry" value={formData.card_expiry || ''} onChange={handleChange} placeholder="MM/YY" maxLength="5" autoComplete="cc-exp" inputMode="numeric" className={`form-input ${errors.card_expiry ? 'error' : ''}`} />
              {errors.card_expiry && <p className="error-text">{errors.card_expiry}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">CVV</label>
              <input type="password" name="card_cvv" value={formData.card_cvv || ''} onChange={handleChange} placeholder="123" maxLength="3" autoComplete="cc-csc" inputMode="numeric" className={`form-input ${errors.card_cvv ? 'error' : ''}`} />
              {errors.card_cvv && <p className="error-text">{errors.card_cvv}</p>}
            </div>
          </div>
        </>
      );
    case 'BANK_TRANSFER':
      return (
        <>
          <div className="form-group">
            <label className="form-label">Bank Name</label>
            <input type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleChange} placeholder="e.g. Chase Bank" className={`form-input ${errors.bank_name ? 'error' : ''}`} />
            {errors.bank_name && <p className="error-text">{errors.bank_name}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Account Number</label>
            <input type="text" name="account_number" value={formData.account_number || ''} onChange={handleChange} placeholder="Enter account number" className={`form-input ${errors.account_number ? 'error' : ''}`} />
            {errors.account_number && <p className="error-text">{errors.account_number}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Routing Number</label>
            <input type="text" name="routing_number" value={formData.routing_number || ''} onChange={handleChange} placeholder="Enter routing number" className={`form-input ${errors.routing_number ? 'error' : ''}`} />
            {errors.routing_number && <p className="error-text">{errors.routing_number}</p>}
          </div>
        </>
      );
    case 'STRIPE':
      return (
        <div className="cash-notice">
          <span className="cash-icon">&#128179;</span>
          <p>Pay securely with Stripe. You will be redirected to complete payment.</p>
        </div>
      );
    case 'CASH':
      return (
        <div className="cash-notice">
          <span className="cash-icon">&#128176;</span>
          <p>Pay with cash when you pick up the vehicle. No additional fees.</p>
        </div>
      );
    default:
      return null;
  }
};

const getPaymentDetails = (method, formData) => {
  switch (method) {
    case 'CREDIT_CARD':
    case 'DEBIT_CARD':
      return {
        card_number: formData.card_number ? `****${formData.card_number.slice(-4)}` : '',
        card_expiry: formData.card_expiry || '',
      };
    case 'STRIPE':
      return { stripe: 'pay_with_stripe' };
    case 'BANK_TRANSFER':
      return {
        bank_name: formData.bank_name || '',
        account_number: formData.account_number ? `****${formData.account_number.slice(-4)}` : '',
        routing_number: formData.routing_number || '',
      };
    default:
      return {};
  }
};

const BookingForm = () => {
  const { carId } = useParams();
  const navigate = useNavigate();  
  
  const [car, setCar] = useState(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    pickup_address: '',
    payment_method: 'CREDIT_CARD',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
  });
  const [position, setPosition] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [days, setDays] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  useEffect(() => { if (carId) fetchCarDetails(); }, [carId]);
  useEffect(() => { calculateTotalPrice(); }, [formData.start_date, formData.end_date, car]);

  const fetchCarDetails = async () => {
    try { const r = await carService.getCarById(carId); setCar(r.data); }
    catch { setSubmitError('Failed to load car details.'); }
  };

  const calculateTotalPrice = () => {
    if (formData.start_date && formData.end_date && car) {
      const d = Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24));
      if (d > 0) { setDays(d); setTotalPrice(d * parseFloat(car.price_per_day)); }
      else { setDays(0); setTotalPrice(0); }
    }
  };

  const validateForm = () => {
    const errs = {};
    const today = new Date().toISOString().split('T')[0];
    if (!formData.start_date) errs.start_date = 'Required';
    else if (formData.start_date < today) errs.start_date = 'Cannot be in the past';
    if (!formData.end_date) errs.end_date = 'Required';
    else if (formData.end_date <= formData.start_date) errs.end_date = 'Must be after start';
    if (!formData.pickup_address) errs.pickup_address = 'Please select a location';

    const pm = formData.payment_method;
    if (pm === 'CREDIT_CARD' || pm === 'DEBIT_CARD') {
      if (!formData.card_number) errs.card_number = 'Required';
      if (!formData.card_expiry) errs.card_expiry = 'Required';
      if (!formData.card_cvv) errs.card_cvv = 'Required';
    }
    if (pm === 'BANK_TRANSFER') {
      if (!formData.bank_name) errs.bank_name = 'Required';
      if (!formData.account_number) errs.account_number = 'Required';
      if (!formData.routing_number) errs.routing_number = 'Required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'card_number') {
      formatted = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'card_expiry') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
      if (formatted.length > 2) formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (name === 'card_cvv') {
      formatted = value.replace(/\D/g, '').slice(0, 3);
    }
    setFormData(prev => ({ ...prev, [name]: formatted }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLocationSelect = (latlng, addr) => {
    setPosition(latlng);
    const lat = Math.round(latlng[0] * 1000) / 1000;
    const lng = Math.round(latlng[1] * 1000) / 1000;
    setFormData(prev => ({ ...prev, pickup_address: addr || `${lat}, ${lng}` }));
    if (errors.pickup_address) setErrors(prev => ({ ...prev, pickup_address: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(''); setSuccess(false);
    if (!validateForm()) return;

    const lat = position ? Math.round(position[0] * 1000) / 1000 : null;
    const lng = position ? Math.round(position[1] * 1000) / 1000 : null;
    setPendingPayload({
      car: carId,
      start_date: formData.start_date,
      end_date: formData.end_date,
      pickup_address: formData.pickup_address,
      pickup_latitude: lat,
      pickup_longitude: lng,
      payment_method: formData.payment_method,
      payment_details: getPaymentDetails(formData.payment_method, formData),
    });
    setShowPayment(true);
  };

  const handlePaymentComplete = async (txnId) => {
    setShowPayment(false);
    setLoading(true);
    try {
      await bookingService.createBooking({
        ...pendingPayload,
        payment_status: 'COMPLETED',
        transaction_id: txnId,
      });
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      const d = err.response?.data;
      let msg = 'Failed to create booking. ';
      if (typeof d === 'string') msg += d;
      else if (d?.detail) msg += d.detail;
      else msg += Object.entries(d || {}).map(([k, v]) => `${k}: ${[].concat(v)[0]}`).join(', ');
      setSubmitError(msg);
    } finally { setLoading(false); }
  };

  if (!car) return <div className="loading-text">Loading car details...</div>;

  return (
    <div className="booking-wrapper">
      <div className="booking-container">
        <div className="booking-header">
          <div className="booking-header-icon">&#128664;</div>
          <div className="booking-header-text">
            <h1>Book Your Rental</h1>
            <p>Complete the form below to reserve your vehicle</p>
          </div>
        </div>
        {success && <div className="alert alert-success">Booking created! Redirecting...</div>}
        {submitError && <div className="alert alert-error">{submitError}</div>}
        <div className="booking-image">
          <img src={car.image_url || `https://via.placeholder.com/720x200/2563eb/ffffff?text=${car.make}+${car.model}`} alt={`${car.make} ${car.model}`} />
        </div>
        <div className="car-details-card">
          <div className="car-info">
            <h3>{car.make} {car.model} ({car.year})</h3>
            <p>{car.category}</p>
          </div>
          <div className="car-price-display">${car.price_per_day} <span>/ day</span></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Pickup Location</label>
            <p className="form-hint">Click on the map or drag the marker to select pickup location</p>
            <MapPicker onLocationSelect={handleLocationSelect} initialPosition={[40.7128, -74.0060]} />
            {errors.pickup_address && <p className="error-text">{errors.pickup_address}</p>}
            <input type="text" name="pickup_address" value={formData.pickup_address} onChange={handleChange} className={`form-input form-readonly ${errors.pickup_address ? 'error' : ''}`} placeholder="Selected address will appear here" readOnly style={{marginTop: '0.8rem'}} />
          </div>
          <div className="date-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className={`form-input ${errors.start_date ? 'error' : ''}`} />
              {errors.start_date && <p className="error-text">{errors.start_date}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} min={formData.start_date || new Date().toISOString().split('T')[0]} className={`form-input ${errors.end_date ? 'error' : ''}`} />
              {errors.end_date && <p className="error-text">{errors.end_date}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="form-select">
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="STRIPE">Stripe</option>
              <option value="CASH">Cash on Pickup</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <PaymentFields method={formData.payment_method} formData={formData} handleChange={handleChange} errors={errors} />
          {totalPrice > 0 && (
            <div className="price-card">
              <h3>${totalPrice.toFixed(2)}</h3>
              <p className="price-breakdown">{days} day{days > 1 ? 's' : ''} &times; ${car.price_per_day}/day</p>
            </div>
          )}
          <button type="submit" disabled={loading || totalPrice === 0} className="submit-btn">
            {loading ? 'Processing Booking...' : `Confirm Booking - $${totalPrice.toFixed(2)}`}
          </button>
        </form>

        {showPayment && (
          <PaymentModal
            amount={totalPrice}
            method={formData.payment_method}
            paymentDetails={getPaymentDetails(formData.payment_method, formData)}
            onComplete={handlePaymentComplete}
            onClose={() => setShowPayment(false)}
          />
        )}
      </div>
    </div>
  );
};

export default BookingForm;
