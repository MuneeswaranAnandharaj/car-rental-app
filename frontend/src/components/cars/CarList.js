import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../../services/api';
import SearchBar from '../common/SearchBar';
import CarCard from '../common/CarCard';
import './CarList.css';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await carService.getAvailableCars();
      setCars(response.data);
      setFilteredCars(response.data);
    } catch (err) {
      setError('Failed to load cars. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = cars.filter(car =>
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.make.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCars(filtered);
  };

  if (loading) return <div className="loading">Loading amazing cars...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Premium Car Rental Service
          </div>
          <h1 className="hero-title">
            Drive Your <span>Dream Car</span> Today
          </h1>
          <p className="hero-subtitle">
            Choose from our premium selection of vehicles. From luxury sedans to rugged SUVs, 
            find the perfect ride for every journey.
          </p>
          <div className="hero-actions">
            <a href="#cars" className="hero-btn-primary">Browse Cars</a>
            <Link to="/auth" className="hero-btn-secondary">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">Happy Customers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">50+</div>
          <div className="stat-label">Car Models</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">98%</div>
          <div className="stat-label">Satisfaction Rate</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Customer Support</div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="main-content">
          <div className="section-header">
            <div className="section-tag">Why Choose Us</div>
            <h2 className="section-title">The Best Driving Experience</h2>
            <p className="section-desc">We provide top-quality vehicles and exceptional service to make every journey memorable.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">&#128664;</div>
              <h3 className="feature-title">Premium Fleet</h3>
              <p className="feature-desc">Well-maintained, latest model cars with full insurance coverage for peace of mind.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#128179;</div>
              <h3 className="feature-title">Best Prices</h3>
              <p className="feature-desc">Competitive rates with no hidden fees. Transparent pricing you can trust.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#128666;</div>
              <h3 className="feature-title">Free Pickup & Drop</h3>
              <p className="feature-desc">Convenient pickup and drop-off at any location within the city.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how">
        <div className="main-content">
          <div className="section-header">
            <div className="section-tag">Simple Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-desc">Renting a car has never been easier. Just three simple steps.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Choose a Car</h3>
              <p className="step-desc">Browse our selection and pick the perfect car for your needs.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Book & Pay</h3>
              <p className="step-desc">Select dates, pickup location, and choose your payment method.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Pick Up & Drive</h3>
              <p className="step-desc">Pick up your car and enjoy the road. It's that simple!</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Return & Relax</h3>
              <p className="step-desc">Drop off the car when you're done. No hassle, no stress.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cars-section" id="cars">
        <div className="main-content">
          <div className="section-header">
            <div className="section-tag">Our Fleet</div>
            <h2 className="section-title">Available Cars</h2>
            <p className="section-desc">Find your perfect ride from our premium collection</p>
          </div>
          <SearchBar onSearch={handleSearch} />
          <div className="car-grid">
            {filteredCars.length > 0 ? (
              filteredCars.map(car => <CarCard key={car.id} car={car} />)
            ) : (
              <p className="no-cars">No cars found. Try a different search term.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarList;
