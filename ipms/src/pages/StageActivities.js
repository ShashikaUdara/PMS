import { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Dropdown, Modal, Form, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

const mockActivities = [
  {
    id: 1,
    name: 'Site Preparation',
    description: 'Clear the site and prepare for foundation work',
    progress: 85,
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    assignedTo: 'John Smith',
    budget: 25000,
    status: 'In Progress',
    priority: 'High',
  },
  {
    id: 2,
    name: 'Excavation',
    description: 'Excavate the foundation area according to plans',
    progress: 60,
    startDate: '2024-01-16',
    endDate: '2024-01-31',
    assignedTo: 'Mike Johnson',
    budget: 35000,
    status: 'In Progress',
    priority: 'Medium',
  },
  {
    id: 3,
    name: 'Foundation Pouring',
    description: 'Pour concrete foundation according to specifications',
    progress: 0,
    startDate: '2024-02-01',
    endDate: '2024-02-15',
    assignedTo: 'Sarah Wilson',
    budget: 45000,
    status: 'Not Started',
    priority: 'High',
  },
];

const getPriorityVariant = (priority) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'secondary';
  }
};

const getStatusVariant = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in progress':
      return 'primary';
    case 'not started':
      return 'secondary';
    case 'delayed':
      return 'danger';
    default:
      return 'secondary';
  }
};

const StageActivities = () => {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleEditClick = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const handleActivityClick = (activityId) => {
    navigate(`/sub-activities/${activityId}`);
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="mb-2">Stage Activities</h4>
          <p className="text-muted mb-0">Foundation Work Stage</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Activity
        </Button>
      </div>

      <Row className="g-3">
        {mockActivities.map((activity) => (
          <Col xs={12} md={6} lg={4} key={activity.id}>
            <Card className="h-100 shadow-hover">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="mb-0">{activity.name}</h5>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="btn-no-arrow p-0">
                      <i className="bi bi-three-dots-vertical"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleEditClick(activity)}>
                        <i className="bi bi-pencil me-2"></i>
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item className="text-danger">
                        <i className="bi bi-trash me-2"></i>
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <p className="text-muted mb-3" style={{ minHeight: '3rem' }}>
                  {activity.description}
                </p>

                <div className="d-flex gap-2 mb-3">
                  <Badge bg={getPriorityVariant(activity.priority)}>
                    {activity.priority}
                  </Badge>
                  <Badge bg={getStatusVariant(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Progress</span>
                    <span>{activity.progress}%</span>
                  </div>
                  <ProgressBar 
                    now={activity.progress} 
                    className="custom-progress"
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center text-muted mb-2">
                    <i className="bi bi-calendar3 me-2"></i>
                    <small>{activity.startDate} - {activity.endDate}</small>
                  </div>
                  <div className="d-flex align-items-center text-muted mb-2">
                    <i className="bi bi-person me-2"></i>
                    <small>{activity.assignedTo}</small>
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    <i className="bi bi-currency-dollar me-2"></i>
                    <small>Budget: ${activity.budget.toLocaleString()}</small>
                  </div>
                </div>

                <Button
                  variant="outline-primary"
                  size="sm"
                  className="w-100"
                  onClick={() => handleActivityClick(activity.id)}
                >
                  <i className="bi bi-building-gear me-2"></i>
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedActivity ? 'Edit Activity' : 'Add New Activity'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Activity Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter activity name"
                defaultValue={selectedActivity?.name}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter activity description"
                defaultValue={selectedActivity?.description}
              />
            </Form.Group>
            <Row>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    defaultValue={selectedActivity?.startDate}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    defaultValue={selectedActivity?.endDate}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select defaultValue={selectedActivity?.priority}>
                    <option>Select priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select defaultValue={selectedActivity?.status}>
                    <option>Select status</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Assigned To</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter assignee name"
                defaultValue={selectedActivity?.assignedTo}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Budget</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter budget amount"
                defaultValue={selectedActivity?.budget}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            {selectedActivity ? 'Save Changes' : 'Add Activity'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StageActivities; 