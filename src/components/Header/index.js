import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import Search from "../Search";
import { IoCartOutline, IoHeartOutline, IoPersonOutline } from "react-icons/io5";
import Navigation from "./Navigation";
import "./style.css";

const Header = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setIsLoggedIn(!!userInfo);
  }, [location]);

  return (
    <header className="header-container">

      {/* Promo strip — one job only */}
      <div className="top-strip">
        <p className="promo-text">
          Get up to 50% off new season styles, limited time only
        </p>
      </div>

      {/* Main header */}
      <div className="main-header-content">
        <Link to="/" className="header-logo">
          <img src={logo} alt="TechBytes Logo" className="logo" />
          <span className="brand-name">TechBytes</span>
        </Link>

        <div className="header-search">
          <Search />
        </div>

        <div className="header-icons">
          {isLoggedIn ? (
            <Link to="/profile" className="user-btn">
              <IoPersonOutline size={16} />
              <span>Account</span>
            </Link>
          ) : (
            <Link to="/login" className="signin-btn">
              <IoPersonOutline size={16} />
              <span>Sign in</span>
            </Link>
          )}

          <div className="header-divider" />

          <Link to="/wishlist" className="icon-btn" title="Wishlist">
            <IconWithBadge icon={<IoHeartOutline size={21} />} count={0} />
          </Link>

          <Link to="/cart" className="icon-btn" title="Cart">
            <IconWithBadge icon={<IoCartOutline size={21} />} count={0} />
          </Link>
        </div>
      </div>

      {/* Sub-header — nav left, utilities right */}
      <div className="sub-header">
        <div className="sub-header-inner">

          <div className="sub-header-nav">
            <Link
              to="/"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              Home
            </Link>
            <Navigation />
          </div>

          <div className="sub-header-utils">
            <Link
              to="/help"
              className={`util-link ${location.pathname === "/help" ? "active" : ""}`}
            >
              Help Center
            </Link>
            <Link
              to="/order-tracking"
              className={`util-link ${location.pathname === "/order-tracking" ? "active" : ""}`}
            >
              Order Tracking
            </Link>
            <Link
              to="/report"
              className={`util-link ${location.pathname === "/report" ? "active" : ""}`}
            >
              Report
            </Link>
          </div>

        </div>
      </div>

    </header>
  );
};

const IconWithBadge = ({ icon, count }) => (
  <div className="icon-badge">
    {icon}
    {count > 0 && <span className="badge">{count}</span>}
  </div>
);

export default Header;