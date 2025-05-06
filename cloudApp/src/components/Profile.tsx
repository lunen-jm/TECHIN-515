import React from 'react';

const Profile = () => {
  return (
    <div className="content-container">
      <div className="profile-container">
        <div className="profile-header">
          <img 
            src="/avatar-placeholder.png" 
            alt="Profile" 
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1>John Doeeeee</h1>
            <p>Frontend Developer</p>
          </div>
        </div>
        <div className="profile-details">
          <h2>About Me</h2>
          <p>A passionate developer with experience in React and TypeScript.</p>
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p>Email: john.doe@example.com</p>
            <p>Location: New York, USA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;