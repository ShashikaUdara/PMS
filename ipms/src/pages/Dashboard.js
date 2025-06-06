import { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Badge, ProgressBar } from 'react-bootstrap';

const ProjectCard = ({ title, value, icon, color, index }) => {
  const getCardContent = () => {
    switch(title) {
      case "Active Projects":
        return (
          <>
            <small className="text-muted d-block mb-2">Projects in execution</small>
            <div className="mt-2">
              <div className="d-flex justify-content-between mb-1">
                <small>On Schedule</small>
                <small className="text-success">8</small>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <small>Delayed</small>
                <small className="text-danger">4</small>
              </div>
            </div>
          </>
        );
      case "In Progress":
        return (
          <>
            <small className="text-muted d-block mb-2">Construction phase</small>
            <div className="mt-2">
              <div className="d-flex justify-content-between mb-1">
                <small>Foundation</small>
                <small className="text-success">3</small>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <small>Structure</small>
                <small className="text-primary">5</small>
              </div>
            </div>
          </>
        );
      case "Budget":
        return (
          <>
            <small className="text-muted d-block mb-2">Budget overview</small>
            <div className="mt-2">
              <div className="d-flex justify-content-between mb-1">
                <small>Used</small>
                <small className="text-warning">$1.8M</small>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <small>Left</small>
                <small className="text-success">$0.6M</small>
              </div>
            </div>
          </>
        );
      case "Delays":
        return (
          <>
            <small className="text-muted d-block mb-2">Delay analysis</small>
            <div className="mt-2">
              <div className="d-flex justify-content-between mb-1">
                <small>Material</small>
                <small className="text-danger">2</small>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <small>Weather</small>
                <small className="text-warning">1</small>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card 
      className={`h-100 shadow-hover fade-slide-in`} 
      style={{ 
        minHeight: '120px', 
        background: `linear-gradient(45deg, ${color}15 30%, ${color}05 90%)`,
        animationDelay: `${index * 0.1}s`
      }}
    >
      <Card.Body className="p-3">
        <div className="d-flex align-items-center mb-2 justify-content-between">
          <div className="d-flex align-items-center">
            <div className="rounded p-2 me-2" style={{ backgroundColor: `${color}20` }}>
              {icon}
            </div>
            <h6 className="mb-0 fw-semibold">{title}</h6>
          </div>
          <h5 className="mb-0 fw-bold" style={{ color: color }}>{value}</h5>
        </div>
        {getCardContent()}
      </Card.Body>
    </Card>
  );
};

const ProjectProgress = ({ title, progress, status, index }) => (
  <div className={`mb-4 slide-in`} style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="d-flex justify-content-between mb-2">
      <h6 className="mb-0 fw-semibold">{title}</h6>
      <span className="bg-light px-3 py-1 rounded text-muted">{status}</span>
    </div>
    <ProgressBar now={progress} className="custom-progress" />
  </div>
);

const ProjectList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const mockProjects = [
    {
      id: 1,
      name: 'City Center Complex',
      manager: 'John Smith',
      progress: 75,
      status: 'In Progress',
      budget: 2500000,
    },
    {
      id: 2,
      name: 'Harbor Bridge',
      manager: 'Sarah Wilson',
      progress: 45,
      status: 'Delayed',
      budget: 1800000,
    },
    {
      id: 3,
      name: 'Metro Station',
      manager: 'Mike Johnson',
      progress: 90,
      status: 'Completed',
      budget: 3200000,
    },
    {
      id: 4,
      name: 'Shopping Mall',
      manager: 'Emily Brown',
      progress: 30,
      status: 'On Hold',
      budget: 2100000,
    },
    {
      id: 5,
      name: 'Office Complex',
      manager: 'David Lee',
      progress: 60,
      status: 'In Progress',
      budget: 2800000,
    }
  ];

  const filteredProjects = useMemo(() => {
    return mockProjects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.manager.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getStatusBadge = (status) => {
    const variant = {
      'Completed': 'success',
      'In Progress': 'primary',
      'Delayed': 'danger',
      'On Hold': 'warning',
    }[status] || 'secondary';

    return <Badge bg={variant}>{status}</Badge>;
  };

  return (
    <Card className="shadow-sm scale-in">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Project List</h5>
          <div className="d-flex gap-2">
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="fade-in"
              />
            </InputGroup>
            <Button variant="outline-secondary" className="slide-in" style={{ animationDelay: '0.1s' }}>
              <i className="bi bi-funnel"></i>
            </Button>
            <Button variant="outline-secondary" className="slide-in" style={{ animationDelay: '0.2s' }}>
              <i className="bi bi-download"></i>
            </Button>
          </div>
        </div>

        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>Project Name</th>
                <th>Manager</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((project) => (
                  <tr key={project.id} className="border-bottom">
                    <td>{project.name}</td>
                    <td>{project.manager}</td>
                    <td style={{ width: '20%' }}>
                      <ProgressBar 
                        now={project.progress} 
                        label={`${project.progress}%`}
                        className="custom-progress"
                      />
                    </td>
                    <td>{getStatusBadge(project.status)}</td>
                    <td>${project.budget.toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredProjects.length)} of {filteredProjects.length} entries
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={(page + 1) * rowsPerPage >= filteredProjects.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4 className="slide-up">Dashboard Overview</h4>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        {[
          {
            title: "Active Projects",
            value: "12",
            icon: <i className="bi bi-graph-up text-primary"></i>,
            color: "#1a237e"
          },
          {
            title: "In Progress",
            value: "8",
            icon: <i className="bi bi-building-gear text-info"></i>,
            color: "#0288d1"
          },
          {
            title: "Budget",
            value: "$2.4M",
            icon: <i className="bi bi-currency-dollar text-success"></i>,
            color: "#2e7d32"
          },
          {
            title: "Delays",
            value: "3",
            icon: <i className="bi bi-exclamation-triangle text-warning"></i>,
            color: "#ed6c02"
          }
        ].map((card, index) => (
          <Col xs={12} md={6} lg={3} key={card.title}>
            <ProjectCard {...card} index={index} />
          </Col>
        ))}
      </Row>

      <Row className="mb-4">
        <Col xs={12} lg={8}>
          <ProjectList />
        </Col>
        <Col xs={12} lg={4}>
          <Card className="shadow-sm slide-in">
            <Card.Body>
              <h5 className="mb-4">Project Progress</h5>
              {[
                { title: "City Center Complex", progress: 75, status: "On Schedule" },
                { title: "Harbor Bridge", progress: 45, status: "Delayed" },
                { title: "Metro Station", progress: 90, status: "Near Completion" },
                { title: "Airport Terminal", progress: 30, status: "On Hold" }
              ].map((progress, index) => (
                <ProjectProgress key={progress.title} {...progress} index={index} />
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 