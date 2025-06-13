import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Spinner, Alert, Container } from 'react-bootstrap';
import { projectService } from '../services/api';

// Dummy activities for demonstration (can be replaced with real data)
const dummyActivities = [
  {
    id: 1,
    title: 'Initial Planning',
    status: 'completed',
    date: '2024-03-15',
    subActivities: [
      { id: 1, title: 'Define project scope', status: 'completed', date: '2024-03-15' },
      { id: 2, title: 'Create project timeline', status: 'completed', date: '2024-03-16' }
    ]
  },
  {
    id: 2,
    title: 'Development Phase',
    status: 'in_progress',
    date: '2024-03-17',
    subActivities: [
      { id: 3, title: 'Set up development environment', status: 'completed', date: '2024-03-17' },
      { id: 4, title: 'Implement core features', status: 'in_progress', date: '2024-03-18' }
    ]
  },
  {
    id: 3,
    title: 'Testing Phase',
    status: 'pending',
    date: '2024-03-20',
    subActivities: [
      { id: 5, title: 'Unit testing', status: 'pending', date: '2024-03-20' },
      { id: 6, title: 'Integration testing', status: 'pending', date: '2024-03-21' }
    ]
  }
];

const styles = {
  container: {
    fontSize: '75%',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: '1.5rem'
  },
  header: {
    marginBottom: '2rem',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  metaCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  metaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  taskInfo: {
    flex: '1',
    minWidth: '300px',
  },
  taskName: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  taskDescription: {
    fontSize: '0.9rem',
    color: '#6c757d',
    lineHeight: '1.5',
    marginBottom: '0',
  },
  metaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
  },
  metaLabel: {
    color: '#6c757d',
    fontSize: '0.8rem',
  },
  metaValue: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: '#f8f9fa',
    fontSize: '0.8rem',
  },
  priorityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: '#f8f9fa',
    fontSize: '0.8rem',
  },
  mainContent: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
  },
  section: {
    marginTop: '2rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: '#2c3e50',
  },
  activityList: {
    marginTop: '1rem',
  },
  activityItem: {
    padding: '1rem',
    marginBottom: '1rem',
    borderLeft: '4px solid #007bff',
    backgroundColor: '#f8f9fa',
    borderRadius: '0.25rem',
  },
  subActivityItem: {
    padding: '0.75rem',
    marginLeft: '1.5rem',
    marginTop: '0.5rem',
    borderLeft: '4px solid #6c757d',
    backgroundColor: 'white',
    borderRadius: '0.25rem',
  },
};

const getStatusLabel = (status) => {
  switch (status) {
    case 1: return 'Active';
    case 2: return 'Completed';
    case 3: return 'On Hold';
    case 4: return 'Cancelled';
    default: return 'Unknown';
  }
};

const getStatusVariant = (status) => {
  switch (status) {
    case 1: return 'primary';
    case 2: return 'success';
    case 3: return 'warning';
    case 4: return 'danger';
    default: return 'secondary';
  }
};

const ActivityStatusBadge = ({ status }) => {
  const getVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };
  const getLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };
  return (
    <Badge bg={getVariant(status)} className="ms-2">
      {getLabel(status)}
    </Badge>
  );
};

const ProjectTaskDetails = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await projectService.getTaskDetails(projectId, taskId);
        setTask(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch task details');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [projectId, taskId]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }
  if (error) {
    return <Alert variant="danger" className="my-4">{error}</Alert>;
  }
  if (!task) return null;

  return (
    <Container fluid style={styles.container}>
      <div style={styles.header}>
        <Button
          variant="outline-secondary"
          size="sm"
          style={styles.backButton}
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </Button>
      </div>

      <div style={styles.metaCard}>
        <div style={styles.metaHeader}>
          <div style={styles.taskInfo}>
            <h1 style={styles.taskName}>{task.title}</h1>
            <p style={styles.taskDescription}>{task.description}</p>
          </div>
          <div style={styles.metaInfo}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Status:</span>
              <div style={styles.statusBadge}>
                <Badge bg={getStatusVariant(task.status)}>
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Priority:</span>
              <div style={styles.priorityBadge}>
                <Badge bg={task.priority === 3 ? 'danger' : task.priority === 2 ? 'warning' : 'info'}>
                  {task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Start:</span>
              <span style={styles.metaValue}>
                <i className="bi bi-calendar3 me-1"></i>
                {new Date(task.start_date).toLocaleDateString()}
              </span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Due:</span>
              <span style={styles.metaValue}>
                <i className="bi bi-calendar-check me-1"></i>
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Assigned:</span>
              <span style={styles.metaValue}>
                <i className="bi bi-person me-1"></i>
                {task.assigned_to || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Activities</h3>
          <div style={styles.activityList}>
            {dummyActivities.map((activity) => (
              <div key={activity.id} style={styles.activityItem}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{activity.title}</h5>
                  <ActivityStatusBadge status={activity.status} />
                </div>
                <small className="text-muted d-block mb-2">
                  <i className="bi bi-calendar3 me-1"></i>
                  {new Date(activity.date).toLocaleDateString()}
                </small>
                {activity.subActivities.map((subActivity) => (
                  <div key={subActivity.id} style={styles.subActivityItem}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{subActivity.title}</span>
                      <ActivityStatusBadge status={subActivity.status} />
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(subActivity.date).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ProjectTaskDetails; 