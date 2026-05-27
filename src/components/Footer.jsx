import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/" className="footer-link">Home</Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
          <Link to="/books" className="footer-link">E-Books</Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
          <Link to="/contact" className="footer-link">Contact Us</Link>
        </div>
        <p className="footer-copy">
          © {currentYear} WRITES | <a href="#terms" className="footer-link">Terms</a> | <a href="#privacy" className="footer-link">Privacy</a> | <a href="#refund" className="footer-link">Refund Policy</a>
        </p>
      </div>
    </footer>
  )
}
