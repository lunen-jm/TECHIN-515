import React, { useState } from 'react';

interface Image {
  id: number;
  url: string;
  category: string;
  date: string;
}

const Gallery = () => {
  const [filters, setFilters] = useState({
    category: 'all',
    timeFrame: 'all'
  });

  const [images] = useState<Image[]>([
    { id: 1, url: '/image1.jpg', category: 'nature', date: '2025-04-23' },
    { id: 2, url: '/image2.jpg', category: 'urban', date: '2025-04-22' },
    // Add more images as needed
  ]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <div className="content-container">
      <div className="gallery-filters">
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="nature">Nature</option>
          <option value="urban">Urban</option>
          <option value="portrait">Portrait</option>
        </select>

        <select
          value={filters.timeFrame}
          onChange={(e) => handleFilterChange('timeFrame', e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="image-grid">
        {images.map(image => (
          <div key={image.id} className="image-card">
            <img src={image.url} alt={`Gallery item ${image.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;