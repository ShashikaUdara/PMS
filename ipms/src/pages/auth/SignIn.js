import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { authService } from '../../services/api';

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      await authService.signIn(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="max-width-400 mx-auto">
      <div className="text-center mb-4">
        <i className="bi bi-building-gear display-4 text-primary mb-3"></i>
        <h4 className="fw-bold mb-2">Welcome Back</h4>
        <p className="text-muted">Sign in to continue to BEEPMS</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
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

        <Form.Group className="mb-4">
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
            'Sign In'
          )}
        </Button>

        <div className="text-center">
          <span className="text-muted">Don't have an account? </span>
          <RouterLink to="/signup" className="text-decoration-none">
            Sign Up
          </RouterLink>
        </div>
      </Form>
    </Container>
  );
};

export default SignIn; 