import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Dropdown, Modal, Form, ProgressBar } from 'react-bootstrap';

const mockStages = [
  {
    id: 1,
    name: 'Foundation Work',
    description: 'Excavation and foundation laying for the main structure',
    progress: 75,
    startDate: '2024-01-01',
    endDate: '2024-02-15',
    budget: 150000,
    status: 'In Progress',
  },
  {
    id: 2,
    name: 'Structural Framework',
    description: 'Steel framework and concrete pouring for main building',
    progress: 45,
    startDate: '2024-02-16',
    endDate: '2024-04-30',
    budget: 300000,
    status: 'Planned',
  },
  {
    id: 3,
    name: 'Electrical Systems',
    description: 'Installation of electrical wiring and systems',
    progress: 0,
    startDate: '2024-05-01',
    endDate: '2024-06-15',
    budget: 120000,
    status: 'Not Started',
  },
];

const ProjectStages = () => {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleStageClick = (stageId) => {
    navigate(`/stage-activities/${stageId}`);
  };

  const handleEditClick = (stage) => {
    setSelectedStage(stage);
    setShowModal(true);
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Project Stages</h2>
        <Button 
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Stage
        </Button>
      </div>

      <Row>
        {mockStages.map((stage) => (
          <Col xs={12} md={6} lg={4} key={stage.id} className="mb-4">
            <Card className="h-100 shadow-hover">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <Card.Title>{stage.name}</Card.Title>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="btn-no-arrow p-0">
                      <i className="bi bi-three-dots-vertical"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleEditClick(stage)}>
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

                <Card.Text className="text-muted mb-3" style={{ minHeight: '3rem' }}>
                  {stage.description}
                </Card.Text>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Progress</span>
                    <span>{stage.progress}%</span>
                  </div>
                  <ProgressBar 
                    now={stage.progress} 
                    className="custom-progress"
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center text-muted mb-2">
                    <i className="bi bi-calendar3 me-2"></i>
                    <small>{stage.startDate} - {stage.endDate}</small>
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    <i className="bi bi-currency-dollar me-2"></i>
                    <small>Budget: ${stage.budget.toLocaleString()}</small>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-top-0">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleStageClick(stage.id)}
                  className="w-100"
                >
                  <i className="bi bi-building-gear me-2"></i>
                  View Activities
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add/Edit Stage Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedStage ? 'Edit Stage' : 'Add New Stage'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Stage Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter stage name"
                defaultValue={selectedStage?.name}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter stage description"
                defaultValue={selectedStage?.description}
              />
            </Form.Group>
            <Row>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    defaultValue={selectedStage?.startDate}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    defaultValue={selectedStage?.endDate}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Budget</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter budget amount"
                defaultValue={selectedStage?.budget}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            {selectedStage ? 'Save Changes' : 'Add Stage'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProjectStages; 