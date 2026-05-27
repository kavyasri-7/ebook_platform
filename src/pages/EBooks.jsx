import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, BookOpen, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function EBooks() {
  const [books, setBooks] = useState([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [emailError, setEmailError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(null) // holds bookId being purchased
  const emailInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchBooks()
    // Retrieve email from localStorage if available
    const savedEmail = localStorage.getItem('user_email')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (err) {
      console.error('Error fetching books:', err)
      setError('Could not load books. Please check your Supabase connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setEmailError('')
    localStorage.setItem('user_email', e.target.value)
  }

  const validateEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(emailStr)
  }

  const handleBuy = (book) => {
    if (!email) {
      setEmailError('Please enter your email address to purchase!')
      emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      emailInputRef.current?.focus()
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address!')
      emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      emailInputRef.current?.focus()
      return
    }

    initiatePayment(book)
  }

  const initiatePayment = (book) => {
    setCheckoutLoading(book.id)
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder'

    // Configure Razorpay Checkout options
    const options = {
      key: razorpayKeyId,
      amount: Math.round(book.price * 100), // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Writes',
      description: `E-Book: ${book.title}`,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=150', // quick circular preview
      prefill: {
        email: email,
      },
      theme: {
        color: '#8f43ff', // Writes main theme color
      },
      handler: async function (response) {
        try {
          // 1. Save payment details in Supabase
          const { data, error: dbError } = await supabase
            .from('purchases')
            .insert([
              {
                book_id: book.id,
                email: email,
                amount: book.price,
                razorpay_order_id: response.razorpay_order_id || 'direct_payment_' + Date.now(),
                razorpay_payment_id: response.razorpay_payment_id,
                status: 'completed'
              }
            ])
            .select()

          if (dbError) throw dbError

          // 2. Redirect to Success Page
          navigate('/success', { 
            state: { 
              bookTitle: book.title, 
              bookFileUrl: book.book_file_url,
              paymentId: response.razorpay_payment_id
            } 
          })
        } catch (dbErr) {
          console.error('Error saving transaction:', dbErr)
          alert('Payment succeeded, but we failed to record the purchase. Please contact support@writes.in with Payment ID: ' + response.razorpay_payment_id)
        }
      },
      modal: {
        ondismiss: function () {
          setCheckoutLoading(null)
        }
      }
    }

    try {
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        alert('Payment failed: ' + resp.error.description)
        setCheckoutLoading(null)
      })
      rzp.open()
    } catch (rzpErr) {
      console.error('Failed to initialize Razorpay SDK:', rzpErr)
      alert('Could not initialize Razorpay. Please verify VITE_RAZORPAY_KEY_ID or ensure checkout.js script loads.')
      setCheckoutLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading book catalog...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-container" style={{ textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--accent-pink)" />
        <p style={{ color: 'var(--accent-pink)' }}>{error}</p>
        <button className="btn btn-secondary" onClick={fetchBooks} style={{ marginTop: '16px' }}>Retry</button>
      </div>
    )
  }

  return (
    <div>
      {/* Email collector banner */}
      <div className="email-verification-banner glass-card">
        <Mail size={32} color="var(--accent-cyan)" style={{ marginBottom: '12px', filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.4))' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Enter your Email ID to buy!!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          We will use this email address to verify your purchase and grant access to your e-books.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
          <input 
            type="email" 
            ref={emailInputRef}
            placeholder="Enter your email address" 
            value={email}
            onChange={handleEmailChange}
            className="form-input"
            style={{ textAlign: 'center', borderColor: emailError ? 'var(--accent-pink)' : 'var(--border-color)' }}
          />
          {emailError && (
            <p style={{ color: 'var(--accent-pink)', fontSize: '13px', fontWeight: '500' }}>{emailError}</p>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 className="gradient-text" style={{ fontSize: '36px', marginBottom: '12px' }}>Our E-Books Catalog</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Browse our collections. Select a book, click Buy Now, and download your copy instantly upon payment completion.
        </p>
      </div>

      <div className="books-grid">
        {books.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No books are currently available in the catalog.</p>
          </div>
        ) : (
          books.map(book => (
            <div key={book.id} className="glass-card book-card">
              <div className="book-cover-container">
                <img 
                  src={book.cover_image} 
                  alt={book.title} 
                  className="book-cover" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600';
                  }}
                />
                <span className="book-badge">E-Book</span>
              </div>
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-desc">{book.description}</p>
                <div className="book-footer">
                  <div className="book-price">₹{book.price}</div>
                  <button 
                    onClick={() => handleBuy(book)}
                    className="btn btn-primary"
                    disabled={checkoutLoading === book.id}
                  >
                    <ShoppingBag size={18} />
                    <span>{checkoutLoading === book.id ? 'Processing...' : 'Buy Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
