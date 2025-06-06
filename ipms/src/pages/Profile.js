import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Image, Nav, Tab } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  company: yup.string().required('Company name is required'),
  position: yup.string().required('Position is required'),
  phone: yup.string().required('Phone number is required'),
});

const Profile = () => {
  const [key, setKey] = useState('personal');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    projectUpdates: true,
    taskAssignments: true,
    securityAlerts: true,
  });

  const formik = useFormik({
    initialValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Construction Corp',
      position: 'Project Manager',
      phone: '+1 234 567 890',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Profile updated:', values);
    },
  });

  const handleNotificationChange = (event) => {
    setNotifications({
      ...notifications,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Container fluid>
      <h4 className="mb-4">Profile Settings</h4>

      <Card>
        <Card.Header className="bg-white">
          <Nav variant="tabs" activeKey={key} onSelect={setKey}>
            <Nav.Item>
              <Nav.Link eventKey="personal">
                <i className="bi bi-person me-2"></i>
                Personal Info
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="security">
                <i className="bi bi-shield-lock me-2"></i>
                Security
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="notifications">
                <i className="bi bi-bell me-2"></i>
                Notifications
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body>
          <Tab.Content>
            <Tab.Pane eventKey="personal" active={key === 'personal'}>
              <div className="d-flex align-items-center mb-4">
                <Image
                  roundedCircle
                  width={100}
                  height={100}
                  className="me-3"
                  src="/path-to-avatar.jpg"
                />
                <div>
                  <h6 className="mb-2">Profile Picture</h6>
                  <Button variant="outline-primary" size="sm">
                    Change Avatar
                  </Button>
                </div>
              </div>

              <Form onSubmit={formik.handleSubmit}>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        isInvalid={formik.touched.firstName && formik.errors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.firstName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        isInvalid={formik.touched.lastName && formik.errors.lastName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.lastName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        isInvalid={formik.touched.email && formik.errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company</Form.Label>
                      <Form.Control
                        type="text"
                        name="company"
                        value={formik.values.company}
                        onChange={formik.handleChange}
                        isInvalid={formik.touched.company && formik.errors.company}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.company}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Position</Form.Label>
                      <Form.Control
                        type="text"
                        name="position"
                        value={formik.values.position}
                        onChange={formik.handleChange}
                        isInvalid={formik.touched.position && formik.errors.position}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.position}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        isInvalid={formik.touched.phone && formik.errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Tab.Pane>

            <Tab.Pane eventKey="security" active={key === 'security'}>
              <h6 className="mb-4">Change Password</h6>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control type="password" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control type="password" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control type="password" />
                </Form.Group>
                <Button variant="primary">
                  Update Password
                </Button>
              </Form>
            </Tab.Pane>

            <Tab.Pane eventKey="notifications" active={key === 'notifications'}>
              <h6 className="mb-4">Notification Preferences</h6>
              <Form>
                <Form.Check
                  type="switch"
                  id="email-notifications"
                  label="Email Notifications"
                  checked={notifications.email}
                  onChange={handleNotificationChange}
                  name="email"
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="push-notifications"
                  label="Push Notifications"
                  checked={notifications.push}
                  onChange={handleNotificationChange}
                  name="push"
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="project-updates"
                  label="Project Updates"
                  checked={notifications.projectUpdates}
                  onChange={handleNotificationChange}
                  name="projectUpdates"
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="task-assignments"
                  label="Task Assignments"
                  checked={notifications.taskAssignments}
                  onChange={handleNotificationChange}
                  name="taskAssignments"
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="security-alerts"
                  label="Security Alerts"
                  checked={notifications.securityAlerts}
                  onChange={handleNotificationChange}
                  name="securityAlerts"
                  className="mb-3"
                />
                <Button variant="primary">
                  Save Preferences
                </Button>
              </Form>
            </Tab.Pane>
          </Tab.Content>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile; 