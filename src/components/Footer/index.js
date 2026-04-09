import React from "react";
import { LiaShippingFastSolid, LiaGiftSolid } from "react-icons/lia";
import { PiKeyReturnLight } from "react-icons/pi";
import { BsWallet2 } from "react-icons/bs";
import { BiSupport } from "react-icons/bi";
import { Link } from "react-router-dom";
import { FaFacebookF, FaPinterestP, FaInstagram } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import "./style.css";

const Footer = () => {
  return (
    <>
      <footer className="footer-section">
        <div className="container">

          {/* Top icons row */}
          <div className="footer-icons-row">
            <div className="footer-icon-col">
              <LiaShippingFastSolid className="footer-icon" />
              <h3>Free Shipping</h3>
              <p>For all Orders Over $100</p>
            </div>
            <div className="footer-icon-col">
              <PiKeyReturnLight className="footer-icon" />
              <h3>30 Days Returns</h3>
              <p>For an Exchange Product</p>
            </div>
            <div className="footer-icon-col">
              <BsWallet2 className="footer-icon" />
              <h3>Secured Payment</h3>
              <p>Payment Cards Accepted</p>
            </div>
            <div className="footer-icon-col">
              <LiaGiftSolid className="footer-icon" />
              <h3>Special Gifts</h3>
              <p>Our First Product Order</p>
            </div>
            <div className="footer-icon-col">
              <BiSupport className="footer-icon" />
              <h3>Support 24/7</h3>
              <p>Contact us Anytime</p>
            </div>
          </div>

          <hr />

          {/* Main footer content */}
          <div className="footer-main">

            {/* Contact */}
            <div className="footer-part1">
              <h2>Contact Us</h2>
              <p>East Monipur, Mirpur<br />Dhaka-1216</p>
              <Link className="footer-link" to="mailto:techbytes666@gmail.com">
                techbytes666@gmail.com
              </Link>
              <span className="footer-phone">+8801791416682</span>
            </div>

            {/* Products + Company */}
            <div className="footer-part2">
              <div className="footer-links-col">
                <h2>Products</h2>
                <ul>
                  <li><Link to="/" className="footer-link">Prices Drop</Link></li>
                  <li><Link to="/" className="footer-link">New Products</Link></li>
                  <li><Link to="/" className="footer-link">Best Sales</Link></li>
                  <li><Link to="/" className="footer-link">Stores</Link></li>
                </ul>
              </div>
              <div className="footer-links-col">
                <h2>Our Company</h2>
                <ul>
                  <li><Link to="/" className="footer-link">About Us</Link></li>
                  <li><Link to="/" className="footer-link">Delivery</Link></li>
                  <li><Link to="/" className="footer-link">Legal Notice</Link></li>
                  <li><Link to="/" className="footer-link">Terms of Use</Link></li>
                </ul>
              </div>
              <div className="footer-links-col">
                <h2>Customer Service</h2>
                <ul>
                  <li><Link to="/help" className="footer-link">Help Center</Link></li>
                  <li><Link to="/order-tracking" className="footer-link">Order Tracking</Link></li>
                  <li><Link to="/feedback" className="footer-link">Report an Issue</Link></li>
                  <li><Link to="/" className="footer-link">Returns Policy</Link></li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Bottom strip */}
      <div className="bottom-strip">
        <div className="container bottom-strip-content">
          <ul className="footer-socials">
            <li><Link to="/" target="_blank" className="footer-social-link"><FaFacebookF /></Link></li>
            <li><Link to="/" target="_blank" className="footer-social-link"><AiOutlineYoutube /></Link></li>
            <li><Link to="/" target="_blank" className="footer-social-link"><FaPinterestP /></Link></li>
            <li><Link to="/" target="_blank" className="footer-social-link"><FaInstagram /></Link></li>
          </ul>
          <p className="footer-copy">© 2025 TechBytes. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Footer;