import React, { useState } from 'react';
import { Navbar, Container, Nav, Button, Modal, Row, Col, Card } from 'react-bootstrap';
import Login from './../components/Login';
import Register from './../components/Register';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('login'); // 'login' or 'register'

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    // Close the modal cleanly after 1 second so they can see the success alert
    setTimeout(() => {
      handleCloseModal();
    }, 1200);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="bg-light min-vh-100">
      {/* 1. Responsive Navbar */}
      <Navbar bg="white" expand="lg" className="shadow-sm border-bottom">
        <Container>
          <Navbar.Brand href="#home" className="fw-bold text-primary fs-3">
            Discount Daddy 🏷️
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home" className="active fw-semibold">Home</Nav.Link>
              <Nav.Link href="#deals" className="fw-semibold">Deals</Nav.Link>
              <Nav.Link href="#categories" className="fw-semibold">Categories</Nav.Link>
            </Nav>
            <Nav className="gap-2">
              {currentUser ? (
                <>
                  <span className="navbar-text me-2 fw-semibold text-dark">
                    Hello, {currentUser.name}!
                  </span>
                  <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline-primary" onClick={() => handleOpenModal('login')}>
                    Log In
                  </Button>
                  <Button variant="primary" onClick={() => handleOpenModal('register')}>
                    Sign Up
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 2. Hero Section */}
      <Container className="py-5 text-center">
        <Row className="justify-content-center py-4">
          <Col md={8}>
            <h1 className="display-4 fw-extrabold text-dark mb-3">
              Your Ultimate Hub for Smart Saving
            </h1>
            <p className="lead text-muted mb-4">
              Explore handpicked discounts, local offers, and exclusive vouchers tailored just for you. Never pay retail prices again.
            </p>
            {!currentUser && (
              <div className="d-flex justify-content-center gap-3">
                <Button variant="primary" size="lg" onClick={() => handleOpenModal('register')}>
                  Start Saving Now
                </Button>
                <Button variant="outline-secondary" size="lg" onClick={() => handleOpenModal('login')}>
                  Browse Deals
                </Button>
              </div>
            )}
          </Col>
        </Row>

        {/* 3. Interactive Dashboard Cards */}
        <Row className="mt-5">
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center p-3">
              <Card.Body>
                <div className="fs-1 mb-2">🔥</div>
                <Card.Title className="fw-bold">Trending Offers</Card.Title>
                <Card.Text className="text-muted text-sm">
                  Catch the hottest price drops before they vanish from stock.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center p-3">
              <Card.Body>
                <div className="fs-1 mb-2">🛍️</div>
                <Card.Title className="fw-bold">Stores Near You</Card.Title>
                <Card.Text className="text-muted text-sm">
                  Locate physical stores running discount programs inside your area code.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center p-3">
              <Card.Body>
                <div className="fs-1 mb-2">🎁</div>
                <Card.Title className="fw-bold">Members Only</Card.Title>
                <Card.Text className="text-muted text-sm">
                  Register today and unlock codes that slash an extra 15% off standard cart rates.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 4. Auth Modal Container (Houses both Login & Register in one dynamic framework) */}
      <Modal show={showModal} onHide={handleCloseModal} centered size={modalType === 'register' ? 'lg' : 'md'}>
        <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
        <Modal.Body className="pt-0">
          {modalType === 'login' ? (
            <>
              <Login onLoginSuccess={handleLoginSuccess} />
              <div className="text-center mt-3 small">
                Don't have an account?{' '}
                <Button variant="link" size="sm" onClick={() => setModalType('register')} className="p-0 align-baseline">
                  Sign Up
                </Button>
              </div>
            </>
          ) : (
            <>
              <Register />
              <div className="text-center mt-3 small">
                Already have an account?{' '}
                <Button variant="link" size="sm" onClick={() => setModalType('login')} className="p-0 align-baseline">
                  Log In
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}