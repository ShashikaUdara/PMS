import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { authService } from '../../services/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
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

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Remove confirm_password before sending to API
      const { confirm_password, ...submitData } = formData;
      const response = await authService.signUp(submitData);
      if (response && response.code === 201) {
        console.log(response)
        navigate('/signin');
      } else {
        setError(response.message || 'Failed to sign up. Please try again.');
      }
      
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
                  name="first_name"
                  value={formData.first_name}
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
                  name="last_name"
                  value={formData.last_name}
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

        <Form.Group className="mb-4">
          <Form.Label>Confirm Password</Form.Label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-lock"></i>
            </span>
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
            <Button 
              variant="outline-secondary"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
            </Button>
          </div>
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="w-100 py-2 mb-3"
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            'Sign Up'
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