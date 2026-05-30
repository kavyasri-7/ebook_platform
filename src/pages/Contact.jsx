import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'
import writesCover from '../assets/writes_cover.png'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            message: formData.message
          }
        ])

      if (error) throw error

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      })
    } catch (err) {
      console.error('Error saving message:', err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-container">
      <div className="contact-info-panel">
        <div>
          <h2 className="gradient-text" style={{ fontSize: '36px', marginBottom: '16px' }}>Contact Us</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            For any questions, support requests, or partnership inquiries, feel free to fill out the form or reach out directly at the details below.
          </p>
        </div>

        <div className="contact-details">
          <div className="contact-item">
            <div className="contact-item-icon">
              <Mail size={20} />
            </div>
            <div>
              <div className="contact-item-title">Email</div>
              <div className="contact-item-value">
                <a href="mailto:contact@writes.in">contact@writes.in</a>
              </div>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-item-icon">
              <Phone size={20} />
            </div>
            <div>
              <div className="contact-item-title">Support Hours</div>
              <div className="contact-item-value">Mon - Sat (9:00 AM - 6:00 PM)</div>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-item-icon">
              <MapPin size={20} />
            </div>
            <div>
              <div className="contact-item-title">Location</div>
              <div className="contact-item-value">Vijayawada, Andhra Pradesh, India</div>
            </div>
          </div>
        </div>

        <form className="glass-card" onSubmit={handleSubmit} style={{ marginTop: '12px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Send a Message</h3>

          {submitStatus === 'success' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.2)', padding: '12px 16px', borderRadius: '8px', color: 'var(--accent-success)', marginBottom: '20px', fontSize: '14px' }}>
              <CheckCircle2 size={18} />
              <span>Thank you! Your message has been sent successfully.</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(243, 85, 218, 0.1)', border: '1px solid rgba(243, 85, 218, 0.2)', padding: '12px 16px', borderRadius: '8px', color: 'var(--accent-pink)', marginBottom: '20px', fontSize: '14px' }}>
              <AlertCircle size={18} />
              <span>Failed to send. Please check your inputs and try again.</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="name">Enter Your Name *</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="form-input" 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Enter Your Mail *</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="form-input" 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Enter Your Mobile Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-12 digits with country code"
              className="form-input" 
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="message">Enter Your Message *</label>
            <textarea 
              id="message" 
              name="message" 
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              className="form-textarea" 
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Sending...</span>
            ) : (
              <>
                <span>Send Message</span>
                <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="hero-image-wrapper" style={{ alignSelf: 'start', position: 'sticky', top: '120px' }}>
        <img 
          src={writesCover} 
          alt="thek_writes Cover" 
          className="hero-image" 
        />
      </div>
    </div>
  )
}
