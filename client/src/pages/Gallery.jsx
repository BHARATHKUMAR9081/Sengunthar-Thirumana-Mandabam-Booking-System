import React, { useState } from 'react';
import entrance from '../assets/entrance.jpg';
import stage from '../assets/stage.jpg';
import parking from '../assets/parking.jpg';
import reception from '../assets/reception.jpg';
import manamahal from '../assets/manamahal.jpg';
import manamahan from '../assets/manamahan.jpg';
import inside_manamahal from '../assets/inside_manamahal.jpg';
import kitchen from '../assets/kitchen.jpg';
import dining_area from '../assets/dining_area.jpg';
import handwash_area from '../assets/handwash_area.jpg';
import restroom from '../assets/restroom.jpg';
import space from '../assets/space.jpg';
import stageview from '../assets/stageview.jpg';
import Puberty_ceremony from '../assets/Puberty_ceremony.jpg'
import wedding_event from '../assets/wedding_event.jpg'


const Gallery = () => {
  const [filter, setFilter] = useState('all');
  const [previewImg, setPreviewImg] = useState(null);

  const galleryData = [
    { id: 1, title: "Wedding Celebration", description: "Beautiful wedding event at Mandapam", imageUrl: wedding_event, category: "events" },
    { id: 2, title: "Puberty Ceremony", description: "Grand Puberty celebration", imageUrl: Puberty_ceremony, category: "events" },
    { id: 3, title: "Grand Entrance", description: "Beautifully designed entrance welcoming guests.", imageUrl: entrance, category: "infrastructure" },
    { id: 4, title: "Reception Area", description: "Spacious reception area to welcome guests.", imageUrl: reception, category: "infrastructure" },
    { id: 5, title: "Stage Setup", description: "Fully equipped stage for ceremonies.", imageUrl: stage, category: "infrastructure" },
    { id: 6, title: "Stage View", description: "Full stage view for functions.", imageUrl: stageview, category: "infrastructure" },
    { id: 7, title: "Groom’s Room – Entrance", description: "Private staircase leading to groom’s room.", imageUrl: manamahan, category: "infrastructure" },
    { id: 8, title: "Bride’s Room", description: "Comfortable room for the groom.", imageUrl: manamahal, category: "infrastructure" },
    { id: 9, title: "Inside Groom’s Room", description: "Clean and well-lit groom’s room interior.", imageUrl: inside_manamahal, category: "infrastructure" },
    { id: 10, title: "Kitchen Area", description: "Hygienic and spacious kitchen.", imageUrl: kitchen, category: "infrastructure" },
    { id: 11, title: "Dining Hall", description: "Large dining space for guests.", imageUrl: dining_area, category: "infrastructure" },
    { id: 12, title: "Handwash Area", description: "Handwash area near dining hall.", imageUrl: handwash_area, category: "infrastructure" },
    { id: 13, title: "Parking Area", description: "Spacious parking for guests.", imageUrl: parking, category: "amenities" },
    { id: 14, title: "Restrooms", description: "Clean and well-maintained restrooms.", imageUrl: restroom, category: "amenities" },
    { id: 15, title: "Utility Area", description: "Additional utility and service space.", imageUrl: space, category: "amenities" },
  ];

  const filteredGallery = filter === 'all' ? galleryData : galleryData.filter(item => item.category === filter);

  return (
    <div style={{ marginTop: '100px', padding: '20px' }}>
      <div className="container">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Our Gallery</h2>

        {/* FILTER BUTTONS */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {["all", "events", "infrastructure", "amenities"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`btn ${filter === cat ? '' : 'btn-secondary'}`}
              style={{ margin: "0 10px", textTransform: "capitalize" }}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* GALLERY GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className="gallery-item"
              style={{
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.3s",
              }}
              onClick={() => setPreviewImg(item.imageUrl)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "contain",
                  backgroundColor: "#f2f2f2",
                  borderBottom: "1px solid #eee",
                }}
              />
              <div style={{ padding: "15px" }}>
                <h4>{item.title}</h4>
                <p style={{ color: "#666" }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* LIGHTBOX PREVIEW */}
        {previewImg && (
          <div
            onClick={() => setPreviewImg(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              cursor: "zoom-out"
            }}
          >
            <img
              src={previewImg}
              alt="Preview"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: "10px",
                boxShadow: "0 0 20px rgba(255,255,255,0.3)"
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default Gallery;
