import { Container, Card } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-4 bg-light">
      <Container className="max-width-sm">
        <Card className="p-4 shadow">
          <Outlet />
        </Card>
      </Container>
    </div>
  );
};

export default AuthLayout; 