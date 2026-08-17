import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { Button, Navbar, Nav, NavDropdown } from 'react-bootstrap';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // Redirect if no active token exists
    if (!token || !storedUser) {
      navigate('/', { replace: true });
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      localStorage.clear();
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  if (!user) return null;

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* 1. Permanent Left Sidebar */}
      <div 
        className="bg-dark text-white p-3 d-flex flex-column shadow-sm" 
        style={{ width: '260px', minHeight: '100vh', flexShrink: 0 }}
      >
        {/* Logo */}
        <div className="d-flex align-items-center gap-2 px-2 pb-3 mb-3 border-bottom border-secondary">
          <div className="bg-primary text-white rounded p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            ⚡
          </div>
          <span className="fs-5 fw-bold text-white">Discount Daddy</span>
        </div>

        {/* Navigation Links */}
        <Nav className="flex-column nav-pills gap-1 flex-grow-1">
          <Nav.Link as={NavLink} to="/dashboard" end className="text-white px-3 py-2 rounded">
            📊 Overview
          </Nav.Link>
          <Nav.Link as={NavLink} to="/dashboard/products" className="text-white px-3 py-2 rounded">
            🏷️ Products
          </Nav.Link>
          <Nav.Link as={NavLink} to="/dashboard/categories" className="text-white px-3 py-2 rounded">
            📁 Categories
          </Nav.Link>
          <Nav.Link as={NavLink} to="/dashboard/settings" className="text-white px-3 py-2 rounded">
            ⚙️ Settings
          </Nav.Link>
        </Nav>

        {/* Sidebar Footer */}
        <div className="pt-3 border-top border-secondary">
          <Button variant="outline-danger" size="sm" className="w-100 fw-semibold" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100">
        
        {/* Permanent Top Navbar */}
        <Navbar bg="white" className="shadow-sm border-bottom px-4 py-2 justify-content-between sticky-top">
          <span className="fw-bold text-secondary">Dashboard</span>

          <Nav className="align-items-center">
            <NavDropdown
              title={
                <span className="fw-semibold text-dark me-2">
                  👤 {user.name || 'User Account'}
                </span>
              }
              id="user-nav-dropdown"
              align="end"
            >
              <NavDropdown.Header className="text-muted small">Signed in as</NavDropdown.Header>
              <NavDropdown.ItemText className="fw-bold text-dark pt-0">
                {user.email || 'user@example.com'}
              </NavDropdown.ItemText>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => navigate('/dashboard/settings')}>
                Account Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger fw-semibold">
                Sign Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar>

        {/* 3. Dynamic Page Content (Renders child routes here) */}
        <div className="flex-grow-1">
          <Outlet context={{ user }} />
        </div>
      </div>
    </div>
  );
}