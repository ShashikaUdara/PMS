import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import UserMenu from '../components/UserMenu';

// Add styles for consistent sizing
const styles = {
  sidebar: {
    minHeight: '100vh',
    transition: 'width 0.3s ease',
    fontSize: '85%'
  },
  sidebarExpanded: {
    width: '240px'
  },
  sidebarCollapsed: {
    width: '72px'
  },
  navLink: {
    fontSize: '90%',
    padding: '0.6rem 1rem',
    color: '#ffffff80',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#fff',
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  navLinkActive: {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  navIcon: {
    fontSize: '1rem',
    width: '24px'
  },
  toggleButton: {
    fontSize: '90%',
    padding: '0.6rem 1rem',
    color: '#ffffff80',
    '&:hover': {
      color: '#fff'
    }
  },
  brandText: {
    fontSize: '1.1rem',
    fontWeight: '600'
  }
};

const menuItems = [
  { text: 'Dashboard', icon: 'bi-speedometer2', path: '/dashboard' },
  { text: 'Projects', icon: 'bi-folder', path: '/projects' },
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
        className="bg-dark text-white"
        style={{
          ...styles.sidebar,
          ...(expanded ? styles.sidebarExpanded : styles.sidebarCollapsed)
        }}
      >
        <div className="d-flex flex-column h-100">
          <Button 
            variant="link" 
            className="text-white text-decoration-none border-0"
            style={styles.toggleButton}
            onClick={() => setExpanded(!expanded)}
          >
            <i className={`bi ${expanded ? 'bi-chevron-left' : 'bi-list'}`}></i>
          </Button>

          <Nav className="flex-column mt-2">
            {menuItems.map((item) => (
              <Nav.Link
                key={item.text}
                style={{
                  ...styles.navLink,
                  ...(location.pathname === item.path ? styles.navLinkActive : {})
                }}
                onClick={() => navigate(item.path)}
              >
                <div className="d-flex align-items-center">
                  <i className={`bi ${item.icon}`} style={styles.navIcon}></i>
                  {expanded && <span className="ms-2">{item.text}</span>}
                </div>
              </Nav.Link>
            ))}
          </Nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow-1">
        <Navbar bg="white" className="border-bottom px-4">
          <Navbar.Brand style={styles.brandText}>BEEPMS</Navbar.Brand>
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