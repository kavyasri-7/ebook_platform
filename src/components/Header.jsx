import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Menu, X } from 'lucide-react'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
      <Link to="/" className="nav-logo">
        <BookOpen size={28} color="#00f2fe" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.6))' }} />
        <span>Writes</span>
      </Link>

      <nav className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
        <Link to="/books" className={`nav-link ${isActive('/books')}`}>E-Books</Link>
        <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>Contact Us</Link>
        <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin</Link>
      </nav>

      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  )
}
