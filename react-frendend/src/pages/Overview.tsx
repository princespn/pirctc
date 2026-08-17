import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default function Overview() {
  const { user } = useOutletContext();

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h3 className="fw-bold text-dark">Welcome back, {user?.name || 'User'}!</h3>
          <p className="text-muted">Here is what is happening with your account today.</p>
        </Col>
      </Row>

      <Row>
        <Col md={6} lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pt-3">
              <h6 className="fw-semibold text-muted mb-0">Profile Summary</h6>
            </Card.Header>
            <Card.Body>
              <Card.Title className="fw-bold">{user?.name || 'N/A'}</Card.Title>
              <Card.Text className="text-muted mb-3">
                <strong>Email:</strong> {user?.email || 'N/A'}<br />
                <strong>Gender:</strong> {user?.gender || 'Not specified'}<br />
                <strong>Phone:</strong> {user?.phone || 'Not provided'}
              </Card.Text>
              <Button variant="primary" size="sm" className="fw-semibold">
                Edit Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}