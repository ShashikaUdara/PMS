import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Alert, Form, Spinner, Collapse, InputGroup, Badge, Modal, Row, Col } from 'react-bootstrap';
import { projectService } from '../services/api';
import { useNavigate } from 'react-router-dom';

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
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '40%',
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 1000,
    padding: '20px',
    overflowY: 'auto'
  },
  drawerOpen: {
    transform: 'translateX(0)'
  },
  drawerClosed: {
    transform: 'translateX(100%)'
  },
  mainContent: {
    transition: 'all 0.3s ease-in-out',
    width: '100%'
  },
  mainContentShifted: {
    width: '55%',
    marginRight: '40%'
  },
  taskDetails: {
    fontSize: '95%'
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: 1
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.3s ease-in-out',
    zIndex: 999
  },
  overlayVisible: {
    opacity: 1,
    visibility: 'visible'
  },
  taskDetailsPage: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1100,
    overflowY: 'auto',
    padding: '20px'
  },
  activityCard: {
    marginBottom: '1rem',
    borderLeft: '4px solid #007bff'
  },
  subActivityCard: {
    marginLeft: '2rem',
    marginBottom: '0.5rem',
    borderLeft: '4px solid #6c757d'
  },
  backButton: {
    position: 'sticky',
    top: '10px',
    zIndex: 1,
    backgroundColor: 'white',
    padding: '10px 0'
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
    priority: 1,
    status: 1,
    start_date: '',
    end_date: ''
  });

  // Add edit task related states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editTask, setEditTask] = useState({
    id: null,
    title: '',
    description: '',
    priority: 1,
    status: 1,
    start_date: '',
    end_date: ''
  });

  // Add delete task related states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Add task details related states
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailsLoading, setTaskDetailsLoading] = useState(false);
  const [taskDetailsError, setTaskDetailsError] = useState('');

  const navigate = useNavigate();

  // Add status utility functions
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
        priority: 1,
        status: 1,
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

  const handleEditClick = (task) => {
    setEditTask({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority || 1,
      status: task.status || 1,
      start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : '',
      end_date: task.end_date ? new Date(task.end_date).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      await projectService.updateTask(projectId, editTask.id, editTask);
      setShowEditModal(false);
      fetchTasks(); // Refresh task list
    } catch (err) {
      setEditError(err.message || 'Failed to update task');
    } finally {
      setEditLoading(false);
    }
  };

  // Add delete task handlers
  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await projectService.deleteTask(projectId, taskToDelete.id);
      setShowDeleteModal(false);
      setTaskToDelete(null);
      fetchTasks(); // Refresh task list
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete task');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Add task details handler
  const handleTaskClick = async (task) => {
    setTaskDetailsLoading(true);
    setTaskDetailsError('');
    setSelectedTask(task);
    setShowTaskDetails(true);

    try {
      const response = await projectService.getTaskDetails(projectId, task.id);
      setSelectedTask(response.data);
    } catch (err) {
      setTaskDetailsError(err.message || 'Failed to fetch task details');
    } finally {
      setTaskDetailsLoading(false);
    }
  };

  // Add close drawer handler
  const handleCloseDrawer = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
    setTaskDetailsError('');
  };

  // Add click-away handler
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseDrawer();
    }
  };

  return (
    <Card>
      <Card.Body>
        {/* Overlay for click-away */}
        <div 
          style={{
            ...styles.overlay,
            ...(showTaskDetails ? styles.overlayVisible : {})
          }}
          onClick={handleOverlayClick}
        />

        <div className={`d-flex justify-content-between align-items-center mb-3 ${showTaskDetails ? styles.mainContentShifted : ''}`}>
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
        <div className={`mb-3 ${showTaskDetails ? styles.mainContentShifted : ''}`}>
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
                  <tr 
                    key={task.id} 
                    style={styles.tableText}
                    onClick={() => handleTaskClick(task)}
                    className="cursor-pointer"
                  >
                    <td>{task.task_index}</td>
                    <td>{task.title}</td>
                    <td>
                      <Badge bg={getStatusVariant(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </td>
                    <td>{new Date(task.due_date).toLocaleDateString()}</td>
                    <td>{task.assigned_to}</td>
                    <td>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(task);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 text-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(task);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Task Details Drawer */}
        <div 
          style={{
            ...styles.drawer,
            ...(showTaskDetails ? styles.drawerOpen : styles.drawerClosed)
          }}
        >
          <Button
            variant="link"
            className="p-0"
            style={styles.closeButton}
            onClick={handleCloseDrawer}
          >
            <i className="bi bi-x-lg"></i>
          </Button>

          {taskDetailsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : taskDetailsError ? (
            <Alert variant="danger" style={styles.taskDetails}>
              {taskDetailsError}
            </Alert>
          ) : selectedTask ? (
            <div style={styles.taskDetails}>
              <h4 className="mb-4">{selectedTask.title}</h4>
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">Description</h6>
                <p>{selectedTask.description}</p>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2">Status</h6>
                  <Badge bg={getStatusVariant(selectedTask.status)}>
                    {getStatusLabel(selectedTask.status)}
                  </Badge>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Priority</h6>
                  <Badge bg={selectedTask.priority === 3 ? 'danger' : selectedTask.priority === 2 ? 'warning' : 'info'}>
                    {selectedTask.priority === 3 ? 'High' : selectedTask.priority === 2 ? 'Medium' : 'Low'}
                  </Badge>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2">Start Date</h6>
                  <p>{new Date(selectedTask.start_date).toLocaleDateString()}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Due Date</h6>
                  <p>{new Date(selectedTask.due_date).toLocaleDateString()}</p>
                </Col>
              </Row>

              <div className="mb-4">
                <h6 className="text-muted mb-2">Assigned To</h6>
                <p>{selectedTask.assigned_to || 'Unassigned'}</p>
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    handleCloseDrawer();
                    handleEditClick(selectedTask);
                  }}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit Task
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {
                    handleCloseDrawer();
                    handleDeleteClick(selectedTask);
                  }}
                >
                  <i className="bi bi-trash me-1"></i>
                  Delete Task
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/project/${projectId}/task/${selectedTask.id}`)}
                >
                  <i className="bi bi-eye me-1"></i>
                  View Details
                </Button>
              </div>
            </div>
          ) : null}
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
                      <option value="1">Low</option>
                      <option value="2">Medium</option>
                      <option value="3">High</option>
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
                      <option value="1">Active</option>
                      <option value="2">Completed</option>
                      <option value="3">On Hold</option>
                      <option value="4">Cancelled</option>
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

        {/* Edit Task Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title style={styles.controlText}>Edit Task</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEditSubmit}>
            <Modal.Body>
              {editError && (
                <Alert variant="danger" className="mb-3" style={styles.controlText}>
                  {editError}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label style={styles.controlText}>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={editTask.title}
                  onChange={handleEditInputChange}
                  required
                  style={styles.controlText}
                  size="sm"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={styles.controlText}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={editTask.description}
                  onChange={handleEditInputChange}
                  required
                  style={styles.controlText}
                  size="sm"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={styles.controlText}>Priority</Form.Label>
                    <Form.Select
                      name="priority"
                      value={editTask.priority}
                      onChange={handleEditInputChange}
                      style={styles.controlText}
                      size="sm"
                    >
                      <option value="1">Low</option>
                      <option value="2">Medium</option>
                      <option value="3">High</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={styles.controlText}>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={editTask.status}
                      onChange={handleEditInputChange}
                      style={styles.controlText}
                      size="sm"
                    >
                      <option value="1">Active</option>
                      <option value="2">Completed</option>
                      <option value="3">On Hold</option>
                      <option value="4">Cancelled</option>
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
                      value={editTask.start_date}
                      onChange={handleEditInputChange}
                      required
                      style={styles.controlText}
                      size="sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={styles.controlText}>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="end_date"
                      value={editTask.end_date}
                      onChange={handleEditInputChange}
                      required
                      style={styles.controlText}
                      size="sm"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                size="sm"
                style={styles.controlText}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={editLoading}
                size="sm"
                style={styles.controlText}
              >
                {editLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Task Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title style={styles.controlText}>Delete Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {deleteError && (
              <Alert variant="danger" className="mb-3" style={styles.controlText}>
                {deleteError}
              </Alert>
            )}
            <p style={styles.controlText}>
              Are you sure you want to delete the task "{taskToDelete?.title}"? This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              size="sm"
              style={styles.controlText}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              size="sm"
              style={styles.controlText}
            >
              {deleteLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Deleting...
                </>
              ) : (
                'Delete Task'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default ProjectTasks; 