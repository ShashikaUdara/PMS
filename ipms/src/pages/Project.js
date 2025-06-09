import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulating API call
    const mockProject = {
      id: projectId,
      name: 'Loading...',
      status: 'In Progress',
      progress: 0,
      description: 'Loading project details...',
      startDate: '',
      endDate: '',
      budget: 0,
      manager: '',
    };
    setProject(mockProject);
  }, [projectId]);

  if (!project) {
    return (
      <Container fluid>
        <div>Loading...</div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button 
            variant="link" 
            className="p-0 mb-2"
            onClick={() => navigate('/projects')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Projects
          </Button>
          <h4 className="mb-0">{project.name}</h4>
        </div>
      </div>

      <Card>
        <Card.Body>
          <p className="text-muted">Project details will be implemented here...</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Project; 