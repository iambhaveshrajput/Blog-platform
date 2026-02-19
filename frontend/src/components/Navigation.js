import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { FiEdit, FiBookmark, FiUser, FiLogOut, FiHome, FiSun, FiMoon, FiTrendingUp } from 'react-icons/fi';

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4 sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
          <span className="text-gradient" style={{ fontSize: '1.5rem' }}>✍️ BlogHub</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <FiHome className="me-1" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/trending">
              <FiTrendingUp className="me-1" /> Trending
            </Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/create-post">
                  <FiEdit className="me-1" /> Write
                </Nav.Link>
                <Nav.Link as={Link} to="/my-posts">
                  My Posts
                </Nav.Link>
                <Nav.Link as={Link} to="/bookmarks">
                  <FiBookmark className="me-1" /> Bookmarks
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-center">
            <button
              className="dark-mode-toggle me-3"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span>
                    <FiUser className="me-1" />
                    {user?.username}
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <FiUser className="me-2" /> Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/edit-profile">
                  <FiEdit className="me-2" /> Edit Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FiLogOut className="me-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button variant="outline-primary" size="sm" className="me-2">
                    Login
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
