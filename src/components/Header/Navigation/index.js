import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./style.css";

const navLinks = [
  { to: "/desktops",    label: "Desktop" },
  { to: "/laptops",     label: "Laptop" },
  { to: "/electronics", label: "Electronics" },
  { to: "/arms",        label: "Prosthetic Arms" },
  { to: "/legs",        label: "Prosthetic Legs" },
];

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navigation-bar">
      <ul className="nav-links">
        {navLinks.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className={`nav-link ${location.pathname === to ? "active" : ""}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;