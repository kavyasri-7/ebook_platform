import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Eye, ShieldCheck, Mail, DollarSign, BookOpen, Lock, LogOut } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('books') // 'books' | 'messages' | 'sales'
  
  // Data lists
  const [books, setBooks] = useState([])
  const [messages, setMessages] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)

  // Form states (Add/Edit Book)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null) // null for Add, book object for Edit
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    cover_image: '',
    price: '',
    book_file_url: ''
  })

  // Env password check
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin_secret_pass'

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_authenticated')
    if (sessionAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, activeTab])

  const handleLogin = (e) => {
    e.preventDefault()
    if (passwordInput === adminPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_authenticated', 'true')
      setAuthError('')
    } else {
      setAuthError('Incorrect admin password. Please try again.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_authenticated')
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'books') {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        setBooks(data || [])
      } else if (activeTab === 'messages') {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        setMessages(data || [])
      } else if (activeTab === 'sales') {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            id,
            email,
            amount,
            razorpay_payment_id,
            status,
            created_at,
            book_id,
            books(title)
          `)
          .order('created_at', { ascending: false })
        if (error) throw error
        setSales(data || [])
      }
    } catch (err) {
      console.error(`Error loading ${activeTab}:`, err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingBook(null)
    setBookForm({
      title: '',
      description: '',
      cover_image: '',
      price: '',
      book_file_url: ''
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (book) => {
    setEditingBook(book)
    setBookForm({
      title: book.title,
      description: book.description,
      cover_image: book.cover_image,
      price: book.price.toString(),
      book_file_url: book.book_file_url
    })
    setIsModalOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setBookForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveBook = async (e) => {
    e.preventDefault()
    if (!bookForm.title || !bookForm.cover_image || !bookForm.price || !bookForm.book_file_url) {
      alert('Please fill out all required fields.')
      return
    }

    try {
      const priceNum = parseFloat(bookForm.price)
      if (isNaN(priceNum)) {
        alert('Price must be a valid number.')
        return
      }

      const bookData = {
        title: bookForm.title,
        description: bookForm.description,
        cover_image: bookForm.cover_image,
        price: priceNum,
        book_file_url: bookForm.book_file_url
      }

      if (editingBook) {
        // Edit flow
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', editingBook.id)
        if (error) throw error
      } else {
        // Insert flow
        const { error } = await supabase
          .from('books')
          .insert([bookData])
        if (error) throw error
      }

      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      console.error('Error saving book:', err)
      alert('Failed to save book settings.')
    }
  }

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this e-book? This cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
      if (error) throw error
      fetchData()
    } catch (err) {
      console.error('Error deleting book:', err)
      alert('Failed to delete book.')
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
          <Lock size={40} color="var(--accent-purple)" style={{ marginBottom: '16px', filter: 'drop-shadow(0 0 8px rgba(143,67,255,0.4))' }} />
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Admin Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Please enter your administrator credential password to access the panel.
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <input 
                type="password" 
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center' }}
                required
              />
            </div>
            {authError && (
              <p style={{ color: 'var(--accent-pink)', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>{authError}</p>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      {/* Header bar */}
      <div className="admin-header">
        <div>
          <h2 className="gradient-text" style={{ fontSize: '32px' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage books, read user messages, and view transaction details.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="admin-nav-tabs">
        <button 
          onClick={() => setActiveTab('books')} 
          className={`admin-tab ${activeTab === 'books' ? 'active' : ''}`}
        >
          <BookOpen size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
          Manage Books
        </button>
        <button 
          onClick={() => setActiveTab('messages')} 
          className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
        >
          <Mail size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
          Messages
        </button>
        <button 
          onClick={() => setActiveTab('sales')} 
          className={`admin-tab ${activeTab === 'sales' ? 'active' : ''}`}
        >
          <DollarSign size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
          Sales Transactions
        </button>
      </div>

      {/* Main Body */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* BOOKS TAB */}
            {activeTab === 'books' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px' }}>Catalog List ({books.length})</h3>
                  <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>
                    <Plus size={16} />
                    <span>Add New Book</span>
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cover</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>File Download Url</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                            No books in catalog. Click 'Add New Book' to publish.
                          </td>
                        </tr>
                      ) : (
                        books.map(book => (
                          <tr key={book.id}>
                            <td>
                              <img 
                                src={book.cover_image} 
                                alt={book.title} 
                                style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                              />
                            </td>
                            <td style={{ fontWeight: '600' }}>{book.title}</td>
                            <td style={{ color: 'var(--accent-cyan)' }}>₹{book.price}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {book.book_file_url}
                            </td>
                            <td>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <button 
                                  onClick={() => handleOpenEditModal(book)} 
                                  style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}
                                  title="Edit Book"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteBook(book.id)} 
                                  style={{ background: 'none', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer' }}
                                  title="Delete Book"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div>
                <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>User Messages ({messages.length})</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                            No messages received yet.
                          </td>
                        </tr>
                      ) : (
                        messages.map(msg => (
                          <tr key={msg.id}>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {new Date(msg.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ fontWeight: '600' }}>{msg.name}</td>
                            <td><a href={`mailto:${msg.email}`} style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>{msg.email}</a></td>
                            <td>{msg.phone || '-'}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {msg.message}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SALES TAB */}
            {activeTab === 'sales' && (
              <div>
                <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Sales & Payments ({sales.length})</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Book Title</th>
                        <th>Customer Email</th>
                        <th>Amount Paid</th>
                        <th>Payment ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                            No transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        sales.map(sale => (
                          <tr key={sale.id}>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {new Date(sale.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ fontWeight: '600' }}>
                              {sale.books?.title || 'Unknown E-Book'}
                            </td>
                            <td>{sale.email}</td>
                            <td style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>₹{sale.amount}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--accent-purple)' }}>{sale.razorpay_payment_id || '-'}</td>
                            <td>
                              <span className={`badge ${sale.status === 'completed' ? 'badge-success' : 'badge-pending'}`}>
                                {sale.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ADD/EDIT MODAL OVERLAY */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              {editingBook ? 'Edit Book Details' : 'Add New E-Book'}
            </h3>

            <form onSubmit={handleSaveBook}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">E-Book Title *</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  value={bookForm.title}
                  onChange={handleFormChange}
                  placeholder="e.g. My Amazing Story"
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Short Description / Summary</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={bookForm.description}
                  onChange={handleFormChange}
                  placeholder="Summarize your book story..."
                  className="form-textarea" 
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cover_image">Cover Image URL *</label>
                <input 
                  type="url" 
                  id="cover_image" 
                  name="cover_image" 
                  value={bookForm.cover_image}
                  onChange={handleFormChange}
                  placeholder="https://images.unsplash.com/... or cloud image path"
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="price">Price (INR) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  id="price" 
                  name="price" 
                  value={bookForm.price}
                  onChange={handleFormChange}
                  placeholder="e.g. 199.00"
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="book_file_url">E-Book File Download URL (PDF/ePub) *</label>
                <input 
                  type="url" 
                  id="book_file_url" 
                  name="book_file_url" 
                  value={bookForm.book_file_url}
                  onChange={handleFormChange}
                  placeholder="Link to file on Supabase Storage, Google Drive, Dropbox, etc."
                  className="form-input" 
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '28px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
