import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Tab,
  Nav
} from 'react-bootstrap';
import { projectService } from '../services/api';
import EditProjectModal from '../components/EditProjectModal';
import ProjectTasks from '../components/ProjectTasks';

// Custom styles for improved visibility
const styles = {
  container: {
    fontSize: '75%',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0'
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#2c3e50',
    borderBottom: '2px solid #e9ecef',
    paddingBottom: '0.5rem',
    marginBottom: '1rem'
  },
  subTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '0.75rem'
  },
  badge: {
    fontSize: '75%',
    padding: '0.5em 0.8em'
  },
  navLink: {
    color: '#6c757d',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: '#f8f9fa',
      color: '#2c3e50'
    }
  },
  navLinkActive: {
    backgroundColor: '#e9ecef',
    color: '#2c3e50',
    fontWeight: '600'
  },
  card: {
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e9ecef'
  },
  headerCard: {
    backgroundColor: '#ffffff',
    marginBottom: '1.5rem',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  headerNav: {
    borderBottom: 'none',
    margin: '0',
    height: '100%',
    alignItems: 'center'
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    padding: '0.5rem'
  },
  detailsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e9ecef'
  },
  detailsLabel: {
    fontWeight: '600',
    color: '#6c757d',
    marginRight: '1rem'
  },
  detailsValue: {
    color: '#2c3e50'
  },
  description: {
    backgroundColor: '#ffffff',
    padding: '1rem',
    borderRadius: '0.25rem',
    border: '1px solid #e9ecef',
    color: '#495057',
    lineHeight: '1.6'
  },
  actionButton: {
    fontSize: '0.875rem',
    padding: '0.375rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease-in-out',
    height: '32px'
  },
  contentCard: {
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    minHeight: '500px'
  },
  contentBody: {
    padding: '1.5rem'
  },
  tabContent: {
    marginTop: '1rem'
  }
};

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProjectDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectDetail(projectId);
      if (response && response.data) {
        setProject(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetail();
  }, [fetchProjectDetail]);

  const getStatusLabel = (status) => {
    switch (status) {
      case 1:
        return 'Active';
      case 2:
        return 'Completed';
      case 3:
        return 'On Hold';
      case 4:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 1:
        return 'primary';
      case 2:
        return 'success';
      case 3:
        return 'warning';
      case 4:
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProjectUpdated = useCallback(async () => {
    await fetchProjectDetail();
  }, [fetchProjectDetail]);

  if (loading) {
    return (
      <Container fluid className="py-5" style={styles.container}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-3" style={styles.container}>
        <Alert variant="danger">
          {error}
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-3"
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container fluid className="py-3" style={styles.container}>
        <Alert variant="warning">
          Project not found
          <Button
            variant="outline-warning"
            size="sm"
            className="ms-3"
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid style={styles.container} className="py-4">
      <EditProjectModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        project={project}
        onProjectUpdated={handleProjectUpdated}
      />
      
      {/* Header with Navigation */}
      <Card style={styles.headerCard}>
        <Card.Body>
          <div className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate('/projects')}
                    style={styles.actionButton}
                  >
                    <i className="bi bi-arrow-left"></i>
                    Back
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                    style={styles.actionButton}
                  >
                    <i className="bi bi-pencil"></i>
                    Edit
                  </Button>
                </div>
                <div className="vr"></div>
                <div>
                  <div className="d-flex align-items-center gap-3">
                    <h4 className="mb-0" style={styles.pageTitle}>{project.name}</h4>
                    <Badge bg={getStatusVariant(project.status)} style={styles.badge}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  <p className="text-muted mb-0 mt-2">Project ID: {project.project_index}</p>
                </div>
              </div>

              <Nav variant="tabs" style={styles.headerNav} activeKey={activeTab} onSelect={setActiveTab}>
                {[
                  { key: 'overview', icon: 'bi-info-circle', label: 'Overview' },
                  { key: 'tasks', icon: 'bi-list-task', label: 'Tasks' },
                  { key: 'team', icon: 'bi-people', label: 'Team' },
                  { key: 'documents', icon: 'bi-file-earmark-text', label: 'Documents' },
                  { key: 'settings', icon: 'bi-gear', label: 'Settings' }
                ].map((item) => (
                  <Nav.Item key={item.key}>
                    <Nav.Link 
                      eventKey={item.key} 
                      className="d-flex align-items-center gap-2"
                      style={{
                        ...styles.navLink,
                        ...(activeTab === item.key ? styles.navLinkActive : {})
                      }}
                    >
                      <i className={`bi ${item.icon}`}></i>
                      {item.label}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Project Content */}
      <Row>
        <Col xs={12}>
          <Card style={styles.contentCard}>
            <Card.Body style={styles.contentBody}>
              <Tab.Content style={styles.tabContent}>
                <Tab.Pane eventKey="overview" active={activeTab === 'overview'}>
                  <Row className="g-4">
                    <Col md={8}>
                      <h5 style={styles.sectionTitle}>Project Description</h5>
                      <div style={styles.description}>
                        {project.description || 'No description available.'}
                      </div>
                    </Col>
                    <Col md={4}>
                      <Card style={styles.detailsCard}>
                        <Card.Body>
                          <h6 style={styles.subTitle}>Project Details</h6>
                          <div style={styles.detailsRow}>
                            <span style={styles.detailsLabel}>Created At</span>
                            <span style={styles.detailsValue}>{formatDate(project.created_at)}</span>
                          </div>
                          <div style={styles.detailsRow}>
                            <span style={styles.detailsLabel}>Last Updated</span>
                            <span style={styles.detailsValue}>{formatDate(project.updated_at)}</span>
                          </div>
                          <div style={styles.detailsRow}>
                            <span style={styles.detailsLabel}>Created By</span>
                            <span style={styles.detailsValue}>ID: {project.created_by}</span>
                          </div>
                          <div style={styles.detailsRow} className="border-0">
                            <span style={styles.detailsLabel}>Updated By</span>
                            <span style={styles.detailsValue}>ID: {project.updated_by}</span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>
                <Tab.Pane eventKey="tasks" active={activeTab === 'tasks'}>
                  <ProjectTasks projectId={projectId} />
                </Tab.Pane>
                <Tab.Pane eventKey="team" active={activeTab === 'team'}>
                  <h5 style={styles.sectionTitle}>Project Team</h5>
                  <div style={styles.description}>
                    Team management features will be implemented here.
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="documents" active={activeTab === 'documents'}>
                  <h5 style={styles.sectionTitle}>Project Documents</h5>
                  <div style={styles.description}>
                    Document management features will be implemented here.
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="settings" active={activeTab === 'settings'}>
                  <h5 style={styles.sectionTitle}>Project Settings</h5>
                  <div style={styles.description}>
                    Project settings and configuration options will be available here.
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Project; 