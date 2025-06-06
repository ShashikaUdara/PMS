import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { authService } from '../../services/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    position: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.signUp(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="max-width-500 mx-auto">
      <div className="text-center mb-4">
        <i className="bi bi-building-gear display-4 text-primary mb-3"></i>
        <h4 className="fw-bold mb-2">Create Account</h4>
        <p className="text-muted">Join BEEPMS to streamline your workflow</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col sm={6}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                />
              </div>
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-envelope"></i>
            </span>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-lock"></i>
            </span>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
            <Button 
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
            </Button>
          </div>
          <Form.Text className="text-muted">
            Use at least 8 characters with a mix of letters, numbers & symbols
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Company Name</Form.Label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-building"></i>
            </span>
            <Form.Control
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Enter company name"
            />
          </div>
        </Form.Group>

        <Row>
          <Col sm={6}>
            <Form.Group className="mb-3">
              <Form.Label>Position</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-briefcase"></i>
                </span>
                <Form.Control
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  placeholder="Enter your position"
                />
              </div>
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-telephone"></i>
                </span>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Button
          type="submit"
          variant="primary"
          className="w-100 py-2 mb-3"
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="text-center">
          <span className="text-muted">Already have an account? </span>
          <RouterLink to="/signin" className="text-decoration-none">
            Sign In
          </RouterLink>
        </div>
      </Form>
    </Container>
  );
};

export default SignUp;