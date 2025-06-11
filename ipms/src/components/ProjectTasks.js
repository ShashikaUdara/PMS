import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Alert, Form, Spinner, Collapse, InputGroup, Badge, Modal, Row, Col } from 'react-bootstrap';
import { projectService } from '../services/api';

// Add custom styles
const styles = {
  smallText: {
    fontSize: '95%'
  },
  tableText: {
    fontSize: '100%'
  },
  statsIcon: {
    fontSize: '1rem',
    marginRight: '0.25rem'
  },
  statsValue: {
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  statsLabel: {
    fontSize: '0.75rem',
    color: '#6c757d'
  },
  controlText: {
    fontSize: '100%'
  },
  importIcon: {
    color: '#0056b3' // darker blue color
  }
};

const ProjectTasks = ({ projectId }) => {
  // Import related states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importStats, setImportStats] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  // Task list related states
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [totalItems, setTotalItems] = useState(0);

  // Create task related states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    start_date: '',
    end_date: ''
  });

  // Move fetchTasks into useCallback
  const fetchTasks = useCallback(async () => {
    setTaskLoading(true);
    setTaskError('');

    try {
      const response = await projectService.getProjectTasks(
        projectId,
        currentPage,
        pageSize,
        searchTerm,
        sortField,
        sortDirection
      );

      if (response && response.data) {
        setTasks(response.data.tasks || []);
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.current_page);
          setTotalPages(response.data.pagination.total_pages);
          setPageSize(response.data.pagination.items_per_page);
          setTotalItems(response.data.pagination.total_items);
        }
      }
    } catch (err) {
      setTaskError(err.message || 'Failed to fetch tasks');
    } finally {
      setTaskLoading(false);
    }
  }, [projectId, currentPage, pageSize, searchTerm, sortField, sortDirection]);

  // Single effect to handle all data fetching
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle search input with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, searchTerm]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError('');
      setImportStats(null);
      setShowErrors(false);
    } else {
      setError('Please select a valid CSV file');
      setSelectedFile(null);
      setImportStats(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setImportStats(null);
    setShowErrors(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await projectService.importTasks(projectId, formData);
      
      if (response.data) {
        const { total_rows, imported_rows, failed_rows, errors } = response.data;
        setImportStats({ total_rows, imported_rows, failed_rows, errors });
        
        if (imported_rows > 0) {
          setSuccess(`Successfully imported ${imported_rows} out of ${total_rows} tasks`);
          // Refresh task list after successful import
          fetchTasks();
        }
        
        if (failed_rows > 0) {
          setError(`Failed to import ${failed_rows} out of ${total_rows} tasks. Click "Show Details" to see the errors.`);
        }
      }
      
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.message || 'Failed to import tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      await projectService.createTask(projectId, newTask);
      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        start_date: '',
        end_date: ''
      });
      fetchTasks(); // Refresh task list
    } catch (err) {
      setCreateError(err.message || 'Failed to create task');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            <InputGroup size="sm" style={{ width: '250px' }}>
              <InputGroup.Text style={styles.controlText}>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search tasks..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={styles.controlText}
                size="sm"
              />
            </InputGroup>

            <Form.Select
              size="sm"
              style={{ width: 'auto', ...styles.controlText }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </Form.Select>

            <div className="d-flex align-items-center text-muted" style={styles.smallText}>
              Page {currentPage} of {totalPages} ({totalItems} items)
            </div>

            <div className="d-flex gap-1">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </Button>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Control
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ maxWidth: '250px', ...styles.controlText }}
              size="sm"
            />
            <Button
              variant="outline-primary"
              onClick={handleImport}
              disabled={loading || !selectedFile}
              size="sm"
              className="d-flex align-items-center justify-content-center"
              style={{ ...styles.controlText, minWidth: '38px', height: '31px', padding: '0 10px' }}
            >
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <i className="bi bi-upload" style={styles.importIcon}></i>
              )}
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              style={{ ...styles.controlText, minWidth: '38px', height: '31px', padding: '0 10px' }}
              className="d-flex align-items-center justify-content-center"
            >
              <i className="bi bi-plus-lg"></i>
            </Button>
          </div>
        </div>

        {success && <Alert variant="success" className="mb-3" style={styles.smallText}>{success}</Alert>}
        {error && <Alert variant="danger" className="mb-3" style={styles.smallText}>{error}</Alert>}
        
        {importStats && (
          <Card className="mb-3 border-info">
            <Card.Header className="bg-info bg-opacity-10" style={styles.smallText}>
              <div className="d-flex justify-content-between align-items-center">
                <strong>Import Results</strong>
                {importStats.failed_rows > 0 && (
                  <Button
                    variant="link"
                    onClick={() => setShowErrors(!showErrors)}
                    className="p-0 text-decoration-none"
                  >
                    {showErrors ? 'Hide Details' : 'Show Details'} 
                    <i className={`bi bi-chevron-${showErrors ? 'up' : 'down'} ms-1`}></i>
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body style={styles.smallText}>
              <div className="d-flex gap-4 mb-3">
                <div>
                  <small className="text-muted d-block">Total Rows</small>
                  <strong>{importStats.total_rows}</strong>
                </div>
                <div>
                  <small className="text-muted d-block">Imported</small>
                  <strong className="text-success">{importStats.imported_rows}</strong>
                </div>
                <div>
                  <small className="text-muted d-block">Failed</small>
                  <strong className="text-danger">{importStats.failed_rows}</strong>
                </div>
              </div>

              <Collapse in={showErrors}>
                <div>
                  {importStats.errors && importStats.errors.length > 0 && (
                    <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {importStats.errors.map((error, index) => (
                        <div key={index} className="text-danger small mb-1">
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Collapse>
            </Card.Body>
          </Card>
        )}

        {/* Task List Section */}
        <div className="mb-3">
          {taskError && <Alert variant="danger" className="mb-3" style={styles.smallText}>{taskError}</Alert>}

          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th onClick={() => handleSort('task_index')} style={{ cursor: 'pointer', ...styles.tableText }}>
                  #ID {renderSortIcon('task_index')}
                </th>
                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer', ...styles.tableText }}>
                  Task Name {renderSortIcon('title')}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', ...styles.tableText }}>
                  Status {renderSortIcon('status')}
                </th>
                <th onClick={() => handleSort('due_date')} style={{ cursor: 'pointer', ...styles.tableText }}>
                  Due Date {renderSortIcon('due_date')}
                </th>
                <th onClick={() => handleSort('assigned_to')} style={{ cursor: 'pointer', ...styles.tableText }}>
                  Assigned To {renderSortIcon('assigned_to')}
                </th>
                <th style={styles.tableText}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taskLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4" style={styles.tableText}>
                    No tasks found. Import tasks using CSV or create new tasks.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} style={styles.tableText}>
                    <td>{task.task_index}</td>
                    <td>{task.title}</td>
                    <td>
                      <Badge bg={task.status === 'active' ? 'success' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </td>
                    <td>{new Date(task.due_date).toLocaleDateString()}</td>
                    <td>{task.assigned_to}</td>
                    <td>
                      <Button variant="link" size="sm" className="p-0 me-2">
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="link" size="sm" className="p-0 text-danger">
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Create Task Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title style={styles.controlText}>Create New Task</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateTask}>
            <Modal.Body>
              {createError && (
                <Alert variant="danger" className="mb-3" style={styles.controlText}>
                  {createError}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label style={styles.controlText}>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={newTask.title}
                  onChange={handleInputChange}
                  required
                  style={styles.controlText}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={styles.controlText}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                  required
                  style={styles.controlText}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={styles.controlText}>Priority</Form.Label>
                    <Form.Select
                      name="priority"
                      value={newTask.priority}
                      onChange={handleInputChange}
                      style={styles.controlText}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={styles.controlText}>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={newTask.status}
                      onChange={handleInputChange}
                      style={styles.controlText}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={styles.controlText}>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="start_date"
                      value={newTask.start_date}
                      onChange={handleInputChange}
                      required
                      style={styles.controlText}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={styles.controlText}>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="end_date"
                      value={newTask.end_date}
                      onChange={handleInputChange}
                      required
                      style={styles.controlText}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                size="sm"
                style={styles.controlText}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={createLoading}
                size="sm"
                style={styles.controlText}
              >
                {createLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default ProjectTasks; 