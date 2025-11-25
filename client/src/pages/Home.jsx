import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import home from '../assets/home.jpg'

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Add your image paths here
  const backgroundImages = [
    home,
    
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div style={{ marginTop: '80px' }}>
      {/* Hero Section with Slideshow */}
      <section 
        className="hero" 
        style={{
          position: 'relative',
          minHeight: '90vh', // Changed to 100vh for full viewport height
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Background Slideshow */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1
          }}
        >
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 1s ease-in-out'
              }}
            />
          ))}
        </div>

        {/* Your existing hero content */}
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Welcome to Mandabam</h1>
          <p style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Your perfect venue for memorable events and celebrations</p>
          <Link to="/booking" className="btn" style={{ 
            fontSize: '1.2rem', 
            padding: '15px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block'
          }}>
            Book Your Event Now
          </Link>
        </div>
      </section>
      
      {/* Rest of your existing sections - completely unchanged */}
      <section className="section" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h3>Owner Access</h3>
            <p>Mandabam owner can access the admin panel to manage bookings and payments</p>
            <a href="/admin/login" className="btn">Admin Login</a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <div className="container">
          <h2>About Mandabam</h2>
          <div className="grid">
            <div className="card">
              <h3>Prime Location</h3>
              <p>Centrally located with easy access and ample parking space</p>
            </div>
            <div className="card">
              <h3>Spacious Hall</h3>
              <p>Accommodates up to 500 guests with comfortable seating</p>
            </div>
            <div className="card">
              <h3>Modern Amenities</h3>
              <p>Fully equipped with sound system, lighting, and AC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <h2>Pricing & Packages</h2>
          <div className="grid">
            <div className="card">
              <h3>Night to Evening Package</h3>
              <p style={{ fontSize: '2rem', color: '#007bff', margin: '20px 0' }}>₹20,000</p>
              <p>Available from today night to tomorrow evening</p>
              <ul style={{ textAlign: 'left', margin: '20px 0' }}>
                <li>Advance: ₹5,000 (EB bills & cleaning)</li>
                <li>Additional cleaning charges based on usage</li>
                <li>Flexible payment options</li>
              </ul>
              <Link to="/booking" className="btn">Book Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section className="section">
        <div className="container">
          <h2>Our Infrastructure</h2>
          <div className="grid">
            <div className="card">
              <h3>Main Hall</h3>
              <p>Spacious 3000 sq.ft area with modern decor</p>
            </div>
            <div className="card">
              <h3>Parking</h3>
              <p>Secure parking for 100+ vehicles</p>
            </div>
            <div className="card">
              <h3>Stage & Sound</h3>
              <p>Professional stage setup with premium sound system</p>
            </div>
            <div className="card">
              <h3>Kitchen Facilities</h3>
              <p>Fully equipped kitchen for caterers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;