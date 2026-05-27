import React, { useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { CheckCircle2, Download, Home, ShoppingBag, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function Success() {
  const location = useLocation()
  const { bookTitle, bookFileUrl, paymentId } = location.state || {}

  useEffect(() => {
    if (location.state) {
      // Trigger canvas-confetti explosion
      const duration = 2.5 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 }

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }))
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }))
      }, 250)

      return () => clearInterval(interval)
    }
  }, [location])

  // Handlers for mock download
  const handleDownload = () => {
    // If it's a real PDF link, trigger normal download. 
    // For placeholders, open in a new tab or trigger file save.
    if (bookFileUrl) {
      window.open(bookFileUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (!location.state) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--accent-pink)' }}>Session Expired</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          No purchase details found. If you bought a book, please check your email for the download links.
        </p>
        <Link to="/books" className="btn btn-primary">
          Go to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card success-card" style={{ width: '100%', maxWidth: '650px', padding: '48px 32px' }}>
        <div className="success-icon">
          <CheckCircle2 size={44} />
        </div>

        <div>
          <h2 className="gradient-text" style={{ fontSize: '32px', marginBottom: '8px' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Thank you for your purchase. Your payment has been processed securely.
          </p>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '12px 0' }}></div>

        {/* E-book retrieval details */}
        <div style={{ textAlign: 'left', width: '100%', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--accent-cyan)' }}>Purchase Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Book Title:</span>
            <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px', textAlign: 'right' }}>{bookTitle}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Payment ID:</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--accent-purple)', fontSize: '14px' }}>{paymentId}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Access Mode:</span>
            <span style={{ color: 'var(--accent-success)', fontSize: '14px', fontWeight: '600' }}>Instant Download</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '12px' }}>
          <button onClick={handleDownload} className="btn btn-glow" style={{ width: '100%', padding: '16px' }}>
            <Download size={20} />
            <span>Download E-Book Now</span>
          </button>

          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <Link to="/books" className="btn btn-secondary" style={{ flex: 1 }}>
              <ShoppingBag size={16} />
              <span>More Books</span>
            </Link>
            <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
              <Home size={16} />
              <span>Go Home</span>
            </Link>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
          A confirmation mail with file links has also been sent to your email. For assistance, reach out to <a href="mailto:contact@writes.in" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>contact@writes.in</a>.
        </p>
      </div>
    </div>
  )
}
