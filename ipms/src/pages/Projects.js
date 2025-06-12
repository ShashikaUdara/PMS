import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Form, 
  InputGroup, 
  Badge, 
  Modal, 
  Dropdown,
  Alert,
  Spinner,
  Pagination
} from 'react-bootstrap';
import { projectService } from '../services/api';

// Add custom styles to match Project component
const styles = {
  container: {
    fontSize: '75%',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: '1.5rem'
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0'
  },
  card: {
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e9ecef'
  },
  tableText: {
    fontSize: '100%'
  },
  controlText: {
    fontSize: '100%'
  },
  smallText: {
    fontSize: '95%'
  },
  badge: {
    fontSize: '75%',
    padding: '0.5em 0.8em'
  },
  actionButton: {
    fontSize: '0.875rem',
    padding: '0.375rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2c3e50'
  }
};

const Projects = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting states
  const [sortField, setSortField] = useState('project_index');
  const [sortDirection, setSortDirection] = useState('desc');

  // Move fetchProjects into useCallback to prevent infinite loops
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await projectService.getProjects(
        currentPage,
        pageSize,
        searchTerm,
        statusFilter,
        sortField,
        sortDirection
      );
      if (response && response.data) {
        setProjects(response.data.projects || []);
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.current_page);
          setTotalPages(response.data.pagination.total_pages);
          setPageSize(response.data.pagination.items_per_page);
          setTotalItems(response.data.pagination.total_items);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, sortField, sortDirection]);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchProjects]);

  // Fetch when filters, sorting, or pagination changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Generate pagination items
  const paginationItems = () => {
    const items = [];
    const maxVisiblePages = 5; // Show maximum 5 page numbers at a time
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Add ellipsis if needed
    if (startPage > 1) {
      items.unshift(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      items.unshift(
        <Pagination.Item key={1} onClick={() => setCurrentPage(1)}>
          1
        </Pagination.Item>
      );
    }
    if (endPage < totalPages) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await projectService.createProject(formData);
      if (response && response.code === 201) {
        setShowModal(false);
        setFormData({
          name: '',
          description: '',
        });
        // Refresh the projects list after creating a new project
        fetchProjects();
      } else {
        setError(response.message || 'Failed to create project. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <Container fluid style={styles.container}>
      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError('')} dismissible style={styles.smallText}>
          {error}
        </Alert>
      )}
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0" style={styles.pageTitle}>Projects</h4>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
          style={styles.actionButton}
        >
          <i className="bi bi-plus-lg"></i>
          Create Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4" style={styles.card}>
        <Card.Body>
          <Row className="g-3">
            <Col md={6} lg={4}>
              <InputGroup size="sm">
                <InputGroup.Text style={styles.controlText}>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={styles.controlText}
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={4}>
              <Form.Select
                value={statusFilter}
                onChange={handleStatusChange}
                style={styles.controlText}
                size="sm"
              >
                <option value="all">All Status</option>
                <option value="1">Active</option>
                <option value="2">Completed</option>
                <option value="3">On Hold</option>
                <option value="4">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={6} lg={4}>
              <Form.Select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={styles.controlText}
                size="sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Projects Table */}
      <Card style={styles.card}>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr style={styles.tableText}>
                    <th onClick={() => handleSort('project_index')} style={{ cursor: 'pointer', ...styles.tableText }}>
                      Project ID {sortField === 'project_index' && <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                    </th>
                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', ...styles.tableText }}>
                      Name {sortField === 'name' && <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                    </th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', ...styles.tableText }}>
                      Status {sortField === 'status' && <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                    </th>
                    <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer', ...styles.tableText }}>
                      Created At {sortField === 'created_at' && <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                    </th>
                    <th onClick={() => handleSort('updated_at')} style={{ cursor: 'pointer', ...styles.tableText }}>
                      Last Updated {sortField === 'updated_at' && <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                    </th>
                    <th style={styles.tableText}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4" style={styles.tableText}>
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr 
                        key={project.id} 
                        onClick={() => handleProjectClick(project.id)}
                        style={{ cursor: 'pointer', ...styles.tableText }}
                      >
                        <td>{project.project_index}</td>
                        <td>{project.name}</td>
                        <td>
                          <Badge 
                            bg={getStatusVariant(project.status)} 
                            style={styles.badge}
                          >
                            {getStatusLabel(project.status)}
                          </Badge>
                        </td>
                        <td>{formatDate(project.created_at)}</td>
                        <td>{formatDate(project.updated_at)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="btn-no-arrow p-0">
                              <i className="bi bi-three-dots-vertical"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={styles.controlText}>
                              <Dropdown.Item style={styles.controlText}>
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item className="text-danger" style={styles.controlText}>
                                <i className="bi bi-trash me-2"></i>
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              
              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-4" style={styles.smallText}>
                <div>
                  Showing {totalItems ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : 0} to{' '}
                  {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                </div>
                <Pagination size="sm">
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  />
                  {paginationItems()}
                  <Pagination.Next
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Create Project Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={styles.modalTitle}>Create New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-4" style={styles.smallText}>
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={styles.controlText}>Project Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={styles.controlText}
                    size="sm"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={styles.controlText}>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter project description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    style={styles.controlText}
                    size="sm"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            size="sm"
            style={styles.controlText}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
            size="sm"
            style={styles.controlText}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Projects; 