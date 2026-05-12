import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CarCard.css';

const CarCard = ({ car }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleViewDetails = () => {
    if (isAuthenticated) {
      navigate(`/cars/${car.id}`);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="car-card">
      <div className="car-image-container">
        <img 
          src={car.image_url}
          alt={`${car.make} ${car.model}`}
          className="car-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/800x500/2563eb/ffffff?text=${car.make}+${car.model}`;
          }}
        />
      </div>
      <div className="car-body">
        <span className="car-category-badge">{car.category}</span>
        <h3 className="car-title">{car.make} {car.model}</h3>
        <p className="car-year">{car.year}</p>
        <div className="car-divider"></div>
        <div className="car-meta">
          <span className="car-meta-item">
            <span className="icon">{'\u23F1'}</span> {car.year}
          </span>
          <span className="car-meta-item">
            <span className="icon">{'\uD83D\uDE97'}</span> {car.category}
          </span>
        </div>
        <div className="car-footer">
          <div className="car-price">${car.price_per_day} <span>/ day</span></div>
          <button onClick={handleViewDetails} className="view-details-btn">
            {isAuthenticated ? 'Rent Now' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
