import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState({ message: '', variant: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback({ message: '', variant: '' });

    try {
      const response = await axios.post('http://127.0.0.1:5000/user/login', {
        email: email,
        password: password
      });
      setFeedback({
        message: `Success! Welcome back, ${response.data.user.name}`,
        variant: 'success'
      });
      console.log(response.data);
    } catch (error) {
      setFeedback({
        message: error.response?.data?.error || 'Authentication failed',
        variant: 'danger'
      });
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col>
          <Card className="shadow-sm border-0 mt-4">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Discount Daddy</h2>
                <p className="text-muted">Sign in to manage your account</p>
              </div>

              {feedback.message && (
                <Alert variant={feedback.variant} className="py-2">
                  {feedback.message}
                </Alert>
              )}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small fw-semibold">Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="small fw-semibold">Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2 fw-semibold">
                  Log In
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}