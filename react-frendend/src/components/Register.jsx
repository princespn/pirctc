import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Register({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: ''
  });
  const [feedback, setFeedback] = useState({ message: '', variant: '' });
  const navigate = useNavigate();

  // Handle inputs dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFeedback({ message: '', variant: '' });

    try {
      const response = await axios.post('http://127.0.0.1:5000/user/register', formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      
      setFeedback({
        message: response.data.message || 'Registration successful!',
        variant: 'success'
      });


      if (onLoginSuccess) {
        onLoginSuccess(response.data.user);
      }

      navigate("/dashboard", { replace: true });
      
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        gender: ''
      });
    } catch (error) {
      setFeedback({
        message: error.response?.data?.error || 'Registration failed. Try again.',
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
                <h2 className="fw-bold text-primary">Create Account</h2>
                <p className="text-muted">Register to start saving with Discount Daddy</p>
              </div>

              {feedback.message && (
                <Alert variant={feedback.variant} className="py-2">
                  {feedback.message}
                </Alert>
              )}

              <Form onSubmit={handleRegister}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3" controlId="regName">
                      <Form.Label className="small fw-semibold">Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="regEmail">
                  <Form.Label className="small fw-semibold">Email address *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="regPassword">
                  <Form.Label className="small fw-semibold">Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="regPhone">
                      <Form.Label className="small fw-semibold">Phone Number</Form.Label>
                      <Form.Control
                        type="number"
                        name="phone"
                        placeholder="1234567890"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="regGender">
                      <Form.Label className="small fw-semibold">Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="primary" type="submit" className="w-100 py-2 fw-semibold">
                  Register
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}