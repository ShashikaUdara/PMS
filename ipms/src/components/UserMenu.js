import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { authService } from '../services/api';

const UserMenu = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const handleSignOut = () => {
    authService.signOut();
    navigate('/signin');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="link" 
        className="text-dark text-decoration-none d-flex align-items-center border-0"
      >
        <div 
          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
          style={{ width: '32px', height: '32px', fontSize: '14px' }}
        >
          {getInitials(user?.name)}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => navigate('/profile')}>
          <i className="bi bi-person me-2"></i>
          Profile
        </Dropdown.Item>
        <Dropdown.Item onClick={() => navigate('/settings')}>
          <i className="bi bi-gear me-2"></i>
          Settings
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={handleSignOut}>
          <i className="bi bi-box-arrow-right me-2"></i>
          Sign Out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserMenu; 