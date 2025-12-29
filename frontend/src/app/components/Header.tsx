"use client";

import Link from "next/link";
import { Navbar, Nav, Container, Dropdown, Image } from "react-bootstrap";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../storesNode/useAuthStoreNode";

export function Header() {
  const { logout, clearTokens } = useAuthStore();
  const router = useRouter();
  const { user } = useAuthStore();

  //if (user?.role !== "teacher") return null;

  const handleLogout = () => {
    clearTokens();
    logout();
    router.push("/"); // navigate to home
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
      <Container>
        <Navbar.Brand>
          <Link href={`/${user?.role}page`} className="text-decoration-none text-primary fw-bold">
            LMS Dashboard
          </Link>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user?.role == "student" &&
              <Link href="/studentpage/courses" className="nav-link">
                My Courses
              </Link>
            }
            {user?.role == "teacher" &&
              <Link href="/teacherpage/courses" className="nav-link">
                My Courses
              </Link>
            }
          </Nav>

          <div className="d-flex align-items-center">
            {/* User Icon Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-user"
                className="d-flex align-items-center border-0"
              >
                <span className="bi bi-person-circle" style={{ fontSize: '24px' }}>
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} href="/profile">
                  Your Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar >
  );
}
