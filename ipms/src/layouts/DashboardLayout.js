import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import UserMenu from '../components/UserMenu';

const menuItems = [
  { text: 'Dashboard', icon: 'bi-speedometer2', path: '/dashboard' },
  { text: 'Project Stages', icon: 'bi-building-gear', path: '/project-stages' },
  { text: 'Activities', icon: 'bi-graph-up', path: '/stage-activities' },
];

const DashboardLayout = () => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div 
        className={`bg-dark text-white ${expanded ? 'width-240' : 'width-72'}`}
        style={{
          minHeight: '100vh',
          transition: 'width 0.3s ease',
        }}
      >
        <div className="d-flex flex-column h-100">
          <Button 
            variant="link" 
            className="text-white text-decoration-none p-3 border-0"
            onClick={() => setExpanded(!expanded)}
          >
            <i className={`bi ${expanded ? 'bi-chevron-left' : 'bi-list'}`}></i>
          </Button>

          <Nav className="flex-column mt-2">
            {menuItems.map((item) => (
              <Nav.Link
                key={item.text}
                className={`px-3 py-2 d-flex align-items-center ${
                  location.pathname === item.path ? 'bg-primary' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {expanded && <span>{item.text}</span>}
              </Nav.Link>
            ))}
          </Nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow-1">
        <Navbar bg="white" className="border-bottom px-4">
          <Navbar.Brand className="fw-bold">BEEPMS</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <UserMenu />
          </Navbar.Collapse>
        </Navbar>
        
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default DashboardLayout; 