import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { projectService } from '../services/api';

const EditProjectModal = ({ show, onHide, project, onProjectUpdated }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 1,
    team_id: project?.team_id || -1,
    boq_id: project?.boq_id || -1,
  });
  const [tags, setTags] = useState(project?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    setCurrentTag(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault(); // Prevent form submission
      const trimmedTag = currentTag.trim();
      if (!tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const processedData = {
        ...formData,
        team_id: formData.team_id || -1,  // Ensure -1 if empty string or null
        boq_id: formData.boq_id || -1,    // Ensure -1 if empty string or null
        tags: tags
      };

      await projectService.updateProject(project.id, processedData);
      onProjectUpdated();
      onHide();
    } catch (err) {
      setError(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  // Styles for the tags container
  const tagsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    padding: '0.5rem',
    minHeight: '2.5rem',
    border: '1px solid #ced4da',
    borderRadius: '0.25rem',
    marginTop: '0.5rem'
  };

  const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem'
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Project</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value={1}>Active</option>
                  <option value={2}>Completed</option>
                  <option value={3}>On Hold</option>
                  <option value={4}>Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Team</Form.Label>
                <Form.Select
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleChange}
                  disabled
                >
                  <option value="">Select Team (Coming Soon)</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Team selection will be available soon
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>BOQ</Form.Label>
                <Form.Select
                  name="boq_id"
                  value={formData.boq_id}
                  onChange={handleChange}
                  disabled
                >
                  <option value="">Select BOQ (Coming Soon)</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  BOQ selection will be available soon
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              type="text"
              value={currentTag}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag and press Enter"
            />
            <div style={tagsContainerStyle}>
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  bg="primary" 
                  style={tagStyle}
                >
                  {tag}
                  <span 
                    onClick={() => removeTag(tag)} 
                    style={{ cursor: 'pointer', marginLeft: '4px' }}
                  >
                    ×
                  </span>
                </Badge>
              ))}
            </div>
            <Form.Text className="text-muted">
              Press Enter to add a tag
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Project'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditProjectModal; 