import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Star, ShieldCheck, Sparkles } from 'lucide-react'
import writesCover from '../assets/writes_cover.png'

export default function Home() {
  return (
    <div className="hero-section">
      <div className="hero-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '6px 16px', borderRadius: '30px', fontSize: '14px', color: '#00f2fe', fontWeight: '600' }}>
          <Sparkles size={16} />
          <span>Discover the Magic of Stories</span>
        </div>
        
        <h1 className="hero-magic">M.A.G.I.C</h1>
        
        <p className="hero-tagline">
          They say that there is a Magic in My Stories.
          <br /><br />
          Feel free to see that Magic... If you like my stories, then don't forget to share this website with your friends.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <Link to="/books" className="btn btn-primary">
            Explore E-Books
            <ArrowRight size={18} />
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Get in touch
          </Link>
        </div>

        {/* Dynamic Micro-Trust Badge */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={16} color="#00f2fe" fill="#00f2fe" />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>4.9/5 Author Rating</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#00e676" />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Secure Razorpay Checkout</span>
          </div>
        </div>
      </div>

      <div className="hero-image-wrapper">
        <img 
          src={writesCover} 
          alt="Writes Cover" 
          className="hero-image" 
        />
      </div>
    </div>
  )
}
