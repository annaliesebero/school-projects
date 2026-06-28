import { Nav, Navbar, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function NavBar() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <Navbar
      fixed="top"
      variant="dark"
      className="px-3"
      style={{
        height: "70px",
        backgroundColor: "var(--color-background-alt)",
      }}
    >
      <Container
        fluid
        className="d-flex justify-content-between align-items-center"
      >
        {/* Logo */}
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            fontFamily: "var(--font-logo)",
            fontSize: "1.8rem",
          }}
        >
          <span style={{ color: "var(--color-text)" }}>On</span>
          <span style={{ color: "var(--color-primary)" }}>Track</span>
        </Navbar.Brand>

        {/* Nav Links */}
        <Nav className="gap-5">
          <Nav.Link as={Link} to="/calendar">
            Weekly Calendar
          </Nav.Link>
          <Nav.Link as={Link} to="/study-session">
            Study Session
          </Nav.Link>
          <Nav.Link as={Link} to="/about-us">
            About Us 
          </Nav.Link>          
        </Nav>

        <div className="d-flex align-items-center gap-3">
          {auth.user ? (
            <>
              <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">Log In/Sign Up</Nav.Link>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
}