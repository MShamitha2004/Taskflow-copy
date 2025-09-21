function AccountPage() {
  const navigate = useNavigate()
  const email = (() => { try { return localStorage.getItem('userEmail') || '' } catch { return '' } })()
  const name = (() => { try { const base = email.split('@')[0] || ''; return base.replace(/\d+/g, '') } catch { return '' } })()
  const letter = email ? email[0].toUpperCase() : '?'
  const [menuOpen, setMenuOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteProjectName, setInviteProjectName] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [projects, setProjects] = useState([])
  const [emailSuggestions, setEmailSuggestions] = useState([])
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('[data-menu]')) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // Load projects for selection
  useEffect(() => {
    ;(async () => {
      try {
        const res = await authFetch('/api/projects/')
        if (res && res.ok) {
          const data = await res.json()
          const projectsList = Array.isArray(data) ? data : []
          setProjects(projectsList)
          console.log('Loaded projects:', projectsList)
        }
      } catch (error) {
        console.error('Error loading projects:', error)
      }
    })()
  }, [])

  // Search for users by email
  const searchUsers = async (query) => {
    if (query.length < 2) {
      setEmailSuggestions([])
      setShowEmailSuggestions(false)
      return
    }

    try {
      const res = await authFetch(`/api/users/search/?q=${encodeURIComponent(query)}`)
      if (res && res.ok) {
        const data = await res.json()
        setEmailSuggestions(Array.isArray(data.results) ? data.results : [])
        setShowEmailSuggestions(true)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setEmailSuggestions([])
      setShowEmailSuggestions(false)
    }
  }

  // Handle email input change
  const handleEmailChange = (e) => {
    const value = e.target.value
    setInviteEmail(value)
    searchUsers(value)
  }

  // Select email from suggestions
  const selectEmail = (userEmail) => {
    setInviteEmail(userEmail)
    setShowEmailSuggestions(false)
    setEmailSuggestions([])
  }

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-email-suggestions]') && !e.target.closest('[data-email-input]')) {
        setShowEmailSuggestions(false)
      }
    }

    if (showEmailSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmailSuggestions])

  // Handle invitation submission
  const handleInvite = async (e) => {
    e.preventDefault()
    // Invite functionality has been disabled - button does nothing now
    alert('Invite functionality has been disabled')
        setInviteEmail('')
        setInviteProjectName('')
        setInviteModalOpen(false)
  }
  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto', position: 'relative' }}>
      <button
        type="button"
        aria-label="Menu"
        style={{
          position: 'fixed', top: 12, right: 12,
          background: 'transparent',
          border: '2px solid var(--title)',
          borderRadius: 8,
          width: 36, height: 36,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 0, cursor: 'pointer', zIndex: 1000,
          outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent'
        }}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
      </button>
      {menuOpen ? (
        <div style={{ position: 'fixed', top: 56, right: 12, background: '#0f1025', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', width: 260, padding: 8, zIndex: 1000 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/home') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #ff6b6b, #ff8e53, #ff6b6b)', display: 'grid', placeItems: 'center' }}>
                <Icon name="home" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Home</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/projects') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'grid', placeItems: 'center' }}>
                <Icon name="rocket" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Projects</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/dashboard') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'grid', placeItems: 'center' }}>
                <Icon name="board" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Dashboards</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/notifications') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: '#21375f', display: 'grid', placeItems: 'center' }}>
                <Icon name="bell" color="#fbbf24" />
              </div>
              <div style={{ fontSize: 14 }}>Notifications</div>
            </button>
          </div>
        </div>
      ) : null}
      <button type="button" onClick={() => navigate(-1)} className="btn ghost" style={{ position: 'fixed', top: 10, left: 12, borderColor: 'var(--title)', color: 'var(--title)', zIndex: 1001 }}>← Back</button>
      <div style={{ marginTop: 12, background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: '#21375f', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, textTransform: 'uppercase', border: '2px solid var(--title)' }}>{letter}</div>
        <div>
          <div style={{ color: '#e5e7eb', fontWeight: 700, fontSize: 18 }}>{name || 'User'}</div>
          <div style={{ color: '#9ca3af' }}>{email || 'unknown@example.com'}</div>
        </div>
      </div>
      <div style={{ marginTop: 16, background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', width: '100%', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
        <button 
          type="button" 
          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#e5e7eb', padding: '12px 14px', cursor: 'pointer' }}
        >
          Invite people to the site
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/notification-settings')}
          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#e5e7eb', padding: '12px 14px', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
        >
          Notification settings
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/settings')}
          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#e5e7eb', padding: '12px 14px', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
        >
          Settings
        </button>
      </div>

      {/* Invitation Modal */}
      {inviteModalOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: '100%', maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#21375f' }}>Invite People to Project</h3>
              <button type="button" onClick={() => setInviteModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#1f2937', fontWeight: 'bold' }}>×</button>
            </div>
            
            <form onSubmit={handleInvite} style={{ display: 'grid', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#21375f', fontWeight: 600 }}>Email Address</label>
                <input
                  data-email-input
                  type="email"
                  value={inviteEmail}
                  onChange={handleEmailChange}
                  onFocus={() => inviteEmail.length >= 2 && setShowEmailSuggestions(true)}
                  placeholder="Enter email address"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: '#fff',
                    color: '#21375f',
                    fontSize: 14
                  }}
                />
                
                {/* Email Suggestions Dropdown */}
                {showEmailSuggestions && emailSuggestions.length > 0 && (
                  <div 
                    data-email-suggestions
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 10000,
                      maxHeight: 200,
                      overflow: 'auto'
                    }}
                  >
                    {emailSuggestions.map((user, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          console.log('Clicked email:', user.email)
                          selectEmail(user.email)
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          border: 'none',
                          background: 'transparent',
                          borderBottom: index < emailSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          background: '#21375f',
                          color: '#a78bfa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 800
                        }}>
                          {(user.first_name || user.email || '?')[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ color: '#21375f', fontWeight: 600, fontSize: 14 }}>
                            {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>
                            {user.email}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#21375f', fontWeight: 600 }}>Project Name</label>
                <select
                  value={inviteProjectName}
                  onChange={(e) => {
                    console.log('Project selected:', e.target.value)
                    setInviteProjectName(e.target.value)
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: '#fff',
                    color: '#21375f',
                    fontSize: 14
                  }}
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.name}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail.trim() || !inviteProjectName.trim()}
                  style={{
                    padding: '10px 20px',
                    background: isInviting || !inviteEmail.trim() || !inviteProjectName.trim() ? '#9ca3af' : '#3b82f6',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    cursor: isInviting || !inviteEmail.trim() || !inviteProjectName.trim() ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useState, useEffect, useCallback } from 'react'
import './App.css'

function getToken() {
  return localStorage.getItem('accessToken')
}

function Portal({ children }) {
  const [el] = useState(() => typeof document !== 'undefined' ? document.createElement('div') : null)
  useEffect(() => {
    if (!el || typeof document === 'undefined') return
    document.body.appendChild(el)
    return () => { try { document.body.removeChild(el) } catch {} }
  }, [el])
  if (!el) return null
  return createPortal(children, el)
}
function AssigneeMultiSelect({ value, onChange, token, placeholder = "Enter email id's of  assignees", maxSelections = null }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const q = query.trim()
    if (!q) { setResults([]); return }
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(`/api/users/search/?q=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setResults(Array.isArray(data.results) ? data.results : [])
        }
      } catch {}
    })()
    return () => controller.abort()
  }, [query, token])

  const selected = Array.isArray(value) ? value : []
  const addUser = (u) => {
    if (selected.find(x => x.id === u.id)) return
    if (maxSelections && selected.length >= maxSelections) return
    onChange([...selected, u])
    setQuery(''); setResults([]); setOpen(false)
  }
  const removeUser = (id) => onChange(selected.filter(x => x.id !== id))

  const hasQuery = query.trim().length > 0
  const showDropdown = open

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, border: '1px solid var(--border)', borderRadius: 8, padding: 6 }} onClick={() => setOpen(true)}>
        {selected.map(u => (
          <span key={u.id} title={`${u.name || ''}${u.email ? ` (${u.email})` : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 28, height: 28, borderRadius: 14, background: '#21375f', color: '#a78bfa', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, border: '1px solid var(--border)' }}>
              {(u.first_name||u.email||'?')[0]?.toUpperCase?.()||'?'}
            </span>
            <button type="button" onClick={(e)=>{ e.stopPropagation(); removeUser(u.id) }} aria-label="Remove" style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>✕</button>
          </span>
        ))}
        <input
          value={query}
          onChange={e=>{ setQuery(e.target.value); setOpen(true) }}
          placeholder={placeholder}
          style={{ flex: 1, minWidth: 160, border: 'none', outline: 'none', background: 'transparent', color: 'var(--title)' }}
        />
      </div>
      {showDropdown ? (
        <div style={{ position: 'absolute', zIndex: 1000, background: '#0f1025', border: '1px solid var(--border)', borderRadius: 10, marginTop: 6, width: '100%', maxHeight: 220, overflow: 'auto' }}>
          {results.length === 0 && hasQuery ? (
            <div style={{ padding: 8, color: '#9ca3af' }}>No users found</div>
          ) : results.map(u => (
            <div key={u.id} role="button" tabIndex={0} onMouseDown={(e)=>{ e.preventDefault(); addUser(u) }} onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); addUser(u) } }} style={{ width: '100%', textAlign: 'left', background: 'transparent', padding: '8px 10px', cursor: 'pointer', color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: 14, background: '#21375f', color: '#a78bfa', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{(u.first_name||u.email||'?')[0]?.toUpperCase?.()||'?'}</span>
              <span style={{ display: 'grid' }}>
                <span>{u.name || (u.first_name||'') + ' ' + (u.last_name||'')}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{u.email}</span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function StatusMultiSelect({ value, onChange, statusColor, statusLabel }) {
  const [open, setOpen] = useState(false)
  const statusOptions = ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE']
  const selected = Array.isArray(value) ? value : []
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('[data-status-dropdown]')) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])
  
  const toggleStatus = (status) => {
    if (selected.includes(status)) {
      onChange(selected.filter(s => s !== status))
    } else {
      onChange([...selected, status])
    }
  }
  
  const selectAll = () => {
    onChange(statusOptions)
  }
  
  const selectNone = () => {
    onChange([])
  }

  return (
    <div style={{ position: 'relative' }} data-status-dropdown>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          border: '1px solid var(--border)', 
          borderRadius: 8, 
          padding: '8px 12px', 
          cursor: 'pointer',
          background: '#0f1025',
          minWidth: 200
        }} 
        onClick={() => setOpen(!open)}
      >
        <span style={{ color: '#e5e7eb', fontSize: 14 }}>
          {selected.length === 0 ? 'Select Status' : 
           selected.length === statusOptions.length ? 'All Statuses' :
           `${selected.length} Status${selected.length > 1 ? 'es' : ''}`}
        </span>
        <span style={{ color: '#9ca3af', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>
      
      {open && (
        <div style={{ 
          position: 'absolute', 
          zIndex: 1000, 
          background: '#0f1025', 
          border: '1px solid var(--border)', 
          borderRadius: 10, 
          marginTop: 6, 
          width: '100%', 
          minWidth: 200,
          maxWidth: 200,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '8px 12px', 
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap'
          }}>
            <button 
              type="button"
              onClick={selectAll}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#e5e7eb', 
                cursor: 'pointer', 
                fontSize: 11,
                padding: '4px 6px',
                borderRadius: 4,
                whiteSpace: 'nowrap'
              }}
            >
              Select All
            </button>
            <button 
              type="button"
              onClick={selectNone}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#e5e7eb', 
                cursor: 'pointer', 
                fontSize: 11,
                padding: '4px 6px',
                borderRadius: 4,
                whiteSpace: 'nowrap'
              }}
            >
              Clear All
            </button>
          </div>
          {statusOptions.map(status => (
            <div 
              key={status}
              role="button" 
              tabIndex={0} 
              onClick={() => toggleStatus(status)}
              onKeyDown={(e) => { if (e.key === 'Enter') toggleStatus(status) }}
              style={{ 
                width: '100%', 
                textAlign: 'left', 
                background: selected.includes(status) ? '#1e3a8a' : 'transparent', 
                padding: '8px 12px', 
                cursor: 'pointer', 
                color: '#e5e7eb', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                borderBottom: status === statusOptions[statusOptions.length - 1] ? 'none' : '1px solid var(--border)',
                minHeight: 36,
                boxSizing: 'border-box'
              }}
            >
              <span 
                style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: 4, 
                  background: statusColor[status],
                  flexShrink: 0
                }} 
              />
              <span style={{ 
                flex: 1, 
                fontSize: 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {statusLabel[status]}
              </span>
              {selected.includes(status) && (
                <span style={{ 
                  color: '#10b981', 
                  fontSize: 12,
                  flexShrink: 0
                }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function getRefreshToken() {
  return localStorage.getItem('refreshToken')
}

async function authFetch(url, init = {}) {
  const access = getToken()
  const baseHeaders = init.headers || {}
  const headers = access ? { ...baseHeaders, Authorization: `Bearer ${access}` } : baseHeaders
  let res = await fetch(url, { ...init, headers })
  if (res.status === 401) {
    const refresh = getRefreshToken()
    if (!refresh) {
      try { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken') } catch {}
      window.location.replace('/login')
      return res
    }
    try {
      const rr = await fetch('/api/auth/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      })
      if (rr.ok) {
        const data = await rr.json()
        localStorage.setItem('accessToken', data.access)
        const retryHeaders = { ...baseHeaders, Authorization: `Bearer ${data.access}` }
        res = await fetch(url, { ...init, headers: retryHeaders })
      } else {
        try { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken') } catch {}
        window.location.replace('/login')
      }
    } catch (_) {
      try { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken') } catch {}
      window.location.replace('/login')
    }
  }
  return res
}

function ProtectedRoute({ children }) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function Logout() {
  useEffect(() => {
    try { localStorage.removeItem('accessToken') } catch {}
    window.location.replace('/login')
  }, [])
  return null
}

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showOTPLogin, setShowOTPLogin] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStatus, setOtpStatus] = useState('')
  const [otpError, setOtpError] = useState('')
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false)
  const [otpStep, setOtpStep] = useState('email') // 'email' or 'code'
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    if (!clientId) return

    let attempts = 0
    let intervalId

    const tryInit = () => {
      const hasGoogle = typeof window !== 'undefined' && window.google && window.google.accounts && window.google.accounts.id
      if (!hasGoogle) return false
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              // Store email for greeting if available from Google ID token
              try {
                const cred = response.credential || ''
                const payload = JSON.parse(atob((cred.split('.')[1] || '')) || '{}')
                if (payload && payload.email) {
                  localStorage.setItem('userEmail', String(payload.email))
                }
              } catch {}
              const res = await fetch('/api/auth/google/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_token: response.credential })
              })
              if (res.ok) {
                const data = await res.json()
                localStorage.setItem('accessToken', data.access)
                navigate('/home', { replace: true })
              } else {
                const t = await res.text()
                setError(t || 'Google login failed')
              }
            } catch (e) {
              setError('Network error during Google login')
            }
          }
        })
        const el = document.getElementById('gsi-btn')
        if (el) {
          try { el.innerHTML = '' } catch {}
          window.google.accounts.id.renderButton(el, { 
            theme: 'outline', 
            size: 'large', 
            type: 'standard', 
            shape: 'rectangular', 
            width: '100%',
            text: 'signin_with'
          })
        }
        try { window.google.accounts.id.prompt() } catch {}
        return true
      } catch {
        return false
      }
    }

    if (!tryInit()) {
      intervalId = setInterval(() => {
        attempts += 1
        if (tryInit() || attempts > 40) {
          clearInterval(intervalId)
        }
      }, 150)
    }

    return () => { if (intervalId) clearInterval(intervalId) }
  }, [navigate])

  async function handleLogin(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '').trim()
    try {
      setIsSubmitting(true)
      const res = await fetch('/api/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('accessToken', data.access)
        try { localStorage.setItem('userEmail', email) } catch {}
        if (data.refresh) try { localStorage.setItem('refreshToken', data.refresh) } catch {}
        setError('')
        navigate('/workspaces', { replace: true })
      } else {
        let message = 'Login failed'
        try {
          const errJson = await res.json()
          message = JSON.stringify(errJson)
        } catch (_) {
          try { message = await res.text() } catch {}
        }
        setError(message)
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // OTP Login Functions
  const handleOTPRequest = async (e) => {
    e.preventDefault()
    setOtpError('')
    setOtpStatus('')
    setIsOtpSubmitting(true)
    
    try {
      const res = await fetch('/api/auth/otp/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail })
      })
      
      if (res.ok) {
        const data = await res.json()
        setOtpStatus('OTP has been sent to your email.')
        // In development, show the OTP if provided
        if (data.otp) {
          setOtpStatus(`OTP has been sent to your email. Development OTP: ${data.otp}`)
        }
        setOtpStep('code')
        setResendCooldown(30) // 30 seconds cooldown
        // Start countdown
        const countdown = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(countdown)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setOtpError('Please try again later.')
      }
    } catch (err) {
      setOtpError('Network error. Please try again.')
    } finally {
      setIsOtpSubmitting(false)
    }
  }

  const handleOTPVerify = async (e) => {
    e.preventDefault()
    setOtpError('')
    setIsOtpSubmitting(true)
    
    try {
      const res = await fetch('/api/auth/otp/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, code: otpCode })
      })
      
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('accessToken', data.access)
        try { localStorage.setItem('userEmail', otpEmail) } catch {}
        if (data.refresh) try { localStorage.setItem('refreshToken', data.refresh) } catch {}
        navigate('/workspaces', { replace: true })
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Invalid OTP' }))
        setOtpError(errorData.detail || 'Invalid OTP')
      }
    } catch (err) {
      setOtpError('Network error. Please try again.')
    } finally {
      setIsOtpSubmitting(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    
    setOtpError('')
    setIsOtpSubmitting(true)
    
    try {
      const res = await fetch('/api/auth/otp/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail })
      })
      
      if (res.ok) {
        const data = await res.json()
        setOtpStatus('OTP has been resent to your email.')
        // In development, show the OTP if provided
        if (data.otp) {
          setOtpStatus(`OTP has been resent to your email. Development OTP: ${data.otp}`)
        }
        setResendCooldown(30)
        // Start countdown
        const countdown = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(countdown)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setOtpError('Failed to resend OTP. Please try again.')
      }
    } catch (err) {
      setOtpError('Network error. Please try again.')
    } finally {
      setIsOtpSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '28px',
        width: '100%',
        maxWidth: '380px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '6px',
            letterSpacing: '-0.02em'
          }}>
            TaskFlow Management
          </div>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0,
            fontWeight: '400'
          }}>
            Welcome back! Please sign in to your account
          </p>
          </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#dc2626',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <div style={{ marginBottom: '20px' }}>
          <div id="gsi-btn" style={{ width: '100%' }} />
          </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0',
          color: '#9ca3af'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ padding: '0 16px', fontSize: '14px', fontWeight: '500' }}>
            OR
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Email / Username
          </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#9ca3af'
              }}>
                📧
              </span>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Password
          </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#9ca3af'
              }}>
                🔒
              </span>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#667eea'
                }}
              />
              Remember me
            </label>
            <button 
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{ 
                background: 'none',
                border: 'none', 
                color: '#667eea',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer', 
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              background: isSubmitting 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isSubmitting 
                ? 'none' 
                : '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* OTP Login Button */}
        <div style={{ marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => setShowOTPLogin(!showOTPLogin)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea'
              e.target.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#667eea'
            }}
          >
            {showOTPLogin ? 'Hide OTP Login' : 'Login with OTP'}
          </button>
        </div>

        {/* OTP Login Form */}
        {showOTPLogin && (
          <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            {otpStep === 'email' ? (
              <form onSubmit={handleOTPRequest}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                  Login with OTP
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
                  Enter your email to receive a 6-digit OTP for quick login.
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#fff',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {otpStatus && (
                  <div style={{
                    padding: '8px 12px',
                    marginBottom: '16px',
                    background: '#d1fae5',
                    color: '#065f46',
                    fontSize: '14px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    {otpStatus}
                  </div>
                )}

                {otpError && (
                  <div style={{
                    padding: '8px 12px',
                    marginBottom: '16px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    fontSize: '14px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    {otpError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isOtpSubmitting || !otpEmail.trim()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: isOtpSubmitting || !otpEmail.trim() 
                      ? '#9ca3af' 
                      : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isOtpSubmitting || !otpEmail.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isOtpSubmitting ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPVerify}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                  Enter OTP
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
                  Enter the 6-digit code sent to {otpEmail}
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      textAlign: 'center',
                      letterSpacing: '2px'
                    }}
                  />
                </div>

                {otpStatus && (
                  <div style={{
                    padding: '8px 12px',
                    marginBottom: '16px',
                    background: '#d1fae5',
                    color: '#065f46',
                    fontSize: '14px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    {otpStatus}
                  </div>
                )}

                {otpError && (
                  <div style={{
                    padding: '8px 12px',
                    marginBottom: '16px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    fontSize: '14px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    {otpError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={isOtpSubmitting || otpCode.length !== 6}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: isOtpSubmitting || otpCode.length !== 6 
                        ? '#9ca3af' 
                        : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isOtpSubmitting || otpCode.length !== 6 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isOtpSubmitting ? 'Verifying...' : 'Login'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || isOtpSubmitting}
                    style={{
                      padding: '12px 16px',
                      background: resendCooldown > 0 || isOtpSubmitting ? '#9ca3af' : '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: resendCooldown > 0 || isOtpSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {resendCooldown > 0 ? `${resendCooldown}s` : 'Resend'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('email')
                    setOtpCode('')
                    setOtpError('')
                    setOtpStatus('')
                  }}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '8px',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  ← Back to email
                </button>
              </form>
            )}
          </div>
        )}

        {/* Sign Up Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            Don't have an account?{' '}
          </span>
          <a
            href="/signup"
            style={{
              color: '#667eea',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Sign up
          </a>
          </div>
        </div>
    </div>
  )
}

function AllProjects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [starred, setStarred] = useState(() => {
    try { return JSON.parse(localStorage.getItem('starredProjectIds') || '[]') } catch { return [] }
  })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await authFetch('/api/projects/')
        if (res.ok) {
          const data = await res.json()
          console.log('Projects loaded for user in ProjectsPage:', data)
          setProjects(Array.isArray(data) ? data : [])
        }
      } catch {}
    })()
  }, [])

  const recentIds = (() => {
    try { return JSON.parse(localStorage.getItem('recentProjectIds') || '[]') } catch { return [] }
  })()
  const idToIndex = recentIds.reduce((acc, id, idx) => { acc[id] = idx; return acc }, {})
  const isRealProject = (p) => !!(
    (p.description && String(p.description).trim()) || p.team || p.start_date || p.due_date || p.reporter_name || p.attachment
  )
  const projectsOnly = projects.filter(isRealProject)
  const recentProjects = projectsOnly.filter(p => recentIds.includes(p.id)).sort((a,b)=>idToIndex[a.id]-idToIndex[b.id])
  const starredProjects = projectsOnly.filter(p => starred.includes(p.id))

  function toggleStar(e, id) {
    e.stopPropagation(); e.preventDefault()
    setStarred(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]
      try { localStorage.setItem('starredProjectIds', JSON.stringify(next)) } catch {}
      return next
    })
  }

  function ProjectCard({ p }) {
    const fromName = (p.name ? p.name.replace(/[^a-zA-Z]/g, '').slice(0,3).toLowerCase() : '') || 'prj'
    const short = (p.key && String(p.key).toLowerCase()) || fromName
    const isStarred = starred.includes(p.id)
    return (
      <button type="button" onClick={() => navigate(`/projects/${p.id}/board`)}
        style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, textAlign: 'left', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', position: 'relative', height: 60, width: '100%' }}>
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <button type="button" aria-label="Star project" aria-pressed={isStarred} onClick={(e) => toggleStar(e, p.id)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ display: 'block' }}>
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
                fill={isStarred ? '#fbbf24' : 'none'} stroke="#000000" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: '#eef2ff', display: 'grid', placeItems: 'center' }}>
            <Icon name="board" color="#7c3aed" />
          </div>
          <div style={{ display: 'grid' }}>
            <div style={{ color: '#1f2937', fontWeight: 700, fontSize: 14 }}>{p.name}</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>{short}</div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div style={{ padding: 16, paddingTop: 72, maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      <ProfileButton />
      <button
        type="button"
        aria-label="Menu"
        style={{
          position: 'fixed', top: 12, right: 12,
          background: 'transparent',
          border: '2px solid var(--title)',
          borderRadius: 8,
          width: 36, height: 36,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 0, cursor: 'pointer', zIndex: 1000,
          outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent'
        }}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
      </button>
      {menuOpen ? (
        <div style={{ position: 'fixed', top: 56, right: 12, background: '#0f1025', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', width: 260, padding: 8, zIndex: 1000 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/home') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #ff6b6b, #ff8e53, #ff6b6b)', display: 'grid', placeItems: 'center' }}>
                <Icon name="home" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Home</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/projects') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'grid', placeItems: 'center' }}>
                <Icon name="rocket" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Projects</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/dashboard') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'grid', placeItems: 'center' }}>
                <Icon name="board" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Dashboards</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/notifications') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: '#21375f', display: 'grid', placeItems: 'center' }}>
                <Icon name="bell" color="#fbbf24" />
              </div>
              <div style={{ fontSize: 14 }}>Notifications</div>
            </button>
          </div>
        </div>
      ) : null}
      <h2 style={{ color: '#6d28d9', margin: '8px 0 16px' }}>Projects</h2>
      {recentProjects.length > 0 ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Recently viewed</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            {recentProjects.map(p => (<ProjectCard key={p.id} p={p} />))}
          </div>
        </div>
      ) : null}
      <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>All projects</div>
      {projectsOnly.length > 0 ? (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {projectsOnly.map(p => (<ProjectCard key={p.id} p={p} />))}
      </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Icon name="board" color="#9ca3af" />
          </div>
          <h3 style={{
            color: '#374151',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 8px 0'
          }}>
            No projects yet
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0 0 16px 0',
            maxWidth: '300px'
          }}>
            Get started by creating your first project to organize your tasks and collaborate with your team.
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            Create Project
          </button>
        </div>
      )}
      {starredProjects.length > 0 ? (
        <div style={{ marginTop: 20 }}>
          <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Starred Projects</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            {starredProjects.map(p => (<ProjectCard key={p.id} p={p} />))}
          </div>
        </div>
      ) : null}
      </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<><ProfileButton /><NotificationBell /><HomePage /></>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/projects" element={<ProtectedRoute><><ProfileButton /><NotificationBell /><AllProjects /></></ProtectedRoute>} />
        <Route path="/projects/:id/board" element={<ProtectedRoute><><ProfileButton /><NotificationBell /><Board /></></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><><ProfileButton /><NotificationBell /><Dashboard /></></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><><ProfileButton /><NotificationBell /><NotificationsPage /></></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettingsPage /></ProtectedRoute>} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/dev-login" element={<DevLogin />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function WorkspaceWelcome() {
  const navigate = useNavigate()
  const { id } = useParams()
  const projectId = Number(id)
  const [project, setProject] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [pName, setPName] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pTeam, setPTeam] = useState('')
  const [pStart, setPStart] = useState('')
  const [pDue, setPDue] = useState('')
  const [pReporter, setPReporter] = useState([])
  const [pFile, setPFile] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await authFetch(`/api/projects/${projectId}/`)
        if (res.ok) {
          const data = await res.json()
          setProject(data)
        } else {
          navigate(`/projects/${projectId}/board`, { replace: true })
        }
      } catch {
        navigate(`/projects/${projectId}/board`, { replace: true })
      }
    })()
  }, [projectId, navigate])

  async function createProjectFromWelcome(e) {
    e.preventDefault()
    setSubmitError('')
    if (!pName.trim()) { setSubmitError('Project name is required'); return }
    setIsSubmitting(true)
    try {
      // Debug: Check if we have a token
      const token = getToken()
      if (!token) {
        setSubmitError('No authentication token found. Please log in again.')
        setIsSubmitting(false)
        return
      }
      
      const form = new FormData()
      form.append('name', pName.trim())
      form.append('description', pDesc.trim())
      if (pTeam) form.append('team', pTeam)
      if (pStart) form.append('start_date', pStart)
      if (pDue) form.append('due_date', pDue)
      if (pReporter && pReporter.length > 0) form.append('reporter_id', pReporter[0].id)
      if (pFile) form.append('attachment', pFile)
      if (pAssigneesSel && pAssigneesSel.length > 0) {
        // Save assignees to team field as comma-separated emails
        const assigneeEmails = pAssigneesSel.map(user => user.email).join(',')
        form.append('team', assigneeEmails)
        form.append('team_members', pAssigneesSel.map(user => user.id).join(','))
      }
      console.log('Making API call to create project...')
      const res = await authFetch('/api/projects/', { method: 'POST', body: form })
      console.log('API response status:', res.status)
      if (res.ok) {
        const p = await res.json()
        console.log('Project created successfully:', p)
        setCreateOpen(false)
        setPName(''); setPDesc(''); setPTeam(''); setPStart(''); setPDue(''); setPReporter(''); setPFile(null); setPAssigneesSel([])
        
        // Send invitations to assigned team members using proper backend invitation system
        if (pAssigneesSel.length > 0) {
          try {
            for (const member of pAssigneesSel) {
              // Use the proper backend invitation endpoint
              const inviteRes = await authFetch(`/api/projects/${p.id}/invite_member/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: member.email })
              })
              
              if (inviteRes.ok) {
                console.log(`Invitation sent to ${member.email} for project ${pName}`)
              } else {
                console.error(`Failed to send invitation to ${member.email}:`, await inviteRes.text())
              }
            }
            alert(`Project created successfully! Invitations sent to ${pAssigneesSel.length} team member(s).`)
          } catch (error) {
            console.error('Error sending invitations:', error)
            alert('Project created successfully, but failed to send some invitations.')
          }
        } else {
          alert('Project created successfully!')
        }
        
        try { localStorage.setItem('lastProjectId', String(p.id)) } catch {}
        navigate(`/projects/${p.id}/board`, { replace: true })
      } else {
        try { 
          const t = await res.text(); 
          console.error('API error response:', t)
          setSubmitError(t || 'Create failed') 
        } catch { 
          console.error('Failed to read error response')
          setSubmitError('Create failed') 
        }
      }
    } catch (error) {
      console.error('Network error details:', error)
      setSubmitError('Network error: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 16, display: 'grid', justifyItems: 'center', width: '100%', alignSelf: 'flex-start', maxWidth: 900, margin: '0 auto' }}>
      <button
        type="button"
        aria-label="Menu"
        style={{
          position: 'fixed', top: 12, left: 12,
          background: 'transparent',
          border: '2px solid var(--title)',
          borderRadius: 8,
          width: 36, height: 36,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 0, cursor: 'pointer', zIndex: 1000,
          outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent'
        }}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
      </button>
      {menuOpen ? (
        <div style={{ position: 'fixed', top: 56, left: 12, background: '#0f1025', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', width: 260, padding: 8, zIndex: 1000 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <button type="button" onClick={() => { setMenuOpen(false) }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #ff6b6b, #ff8e53, #ff6b6b)', display: 'grid', placeItems: 'center' }}>
                <Icon name="home" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Home</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/projects') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'grid', placeItems: 'center' }}>
                <Icon name="rocket" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Projects</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/dashboard') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'grid', placeItems: 'center' }}>
                <Icon name="board" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Dashboards</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/notifications') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: '#21375f', display: 'grid', placeItems: 'center' }}>
                <Icon name="bell" color="#fbbf24" />
              </div>
              <div style={{ fontSize: 14 }}>Notifications</div>
            </button>
          </div>
        </div>
      ) : null}
      <h2 style={{ marginTop: 24, marginBottom: 0, color: 'var(--title)', textAlign: 'center' }}>Welcome to your workspace!</h2>
      <div style={{ fontSize: 18, marginTop: 8, textAlign: 'center' }}><strong>{project ? project.name : '...'}</strong></div>
      <div style={{ marginTop: 12, color: '#6b7280', textAlign: 'center', maxWidth: 720 }}>
        You can start creating tasks, invite teammates, and manage your board.
      </div>
      <div style={{ maxWidth: 960, width: '100%', margin: '20px auto 0' }}>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Search..." style={{ flex: 1 }} />
          <button className="btn">Search</button>
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--muted)' }}>Recent items</span>
          <button type="button" aria-label="Open recent items" style={{ background: 'transparent', border: 'none', color: 'var(--title)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--muted)' }}>Create project</span>
          <button type="button" aria-label="Create project" onClick={() => setCreateOpen(true)}
            style={{ background: 'transparent', border: 'none', color: 'var(--title)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', marginRight: 20 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {createOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 2000 }}>
          <div style={{ background: '#fff', width: 'min(720px, 96vw)', maxHeight: '90vh', overflow: 'auto', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 16px 40px rgba(0,0,0,0.25)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--title)' }}>Create Project</h3>
              <button type="button" onClick={() => setCreateOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            {submitError ? <div style={{ color: 'red', marginTop: 8 }}>{submitError}</div> : null}
            <form onSubmit={createProjectFromWelcome} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: 'var(--title)', fontWeight: 600 }}>Name of the project</span>
                <input className="input" value={pName} onChange={e=>setPName(e.target.value)} placeholder="Project name" required style={{ maxWidth: 320 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: 'var(--title)', fontWeight: 600 }}>Team</span>
                <input className="input" value={pTeam} onChange={e=>setPTeam(e.target.value)} placeholder="Team" style={{ maxWidth: 320 }} />
              </label>
              <label style={{ gridColumn: '1 / span 2', display: 'grid', gap: 6 }}>
                <span style={{ color: 'var(--title)', fontWeight: 600 }}>Description</span>
                <textarea className="input" rows={4} value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Describe the project" style={{ maxWidth: 700 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: 'var(--title)', fontWeight: 600 }}>Start date</span>
                <input className="input" type="date" value={pStart} onChange={e=>setPStart(e.target.value)} style={{ maxWidth: 280 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: 'var(--title)', fontWeight: 600 }}>Due date</span>
                <input className="input" type="date" value={pDue} onChange={e=>setPDue(e.target.value)} style={{ maxWidth: 280 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: 'var(--title)', fontWeight: 600 }}>Reporter</span>
                <AssigneeMultiSelect 
                  token={token} 
                  value={pReporter}
                  onChange={(reporter) => setPReporter(reporter)}
                  placeholder="Enter reporter's mail id..."
                  maxSelections={1}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: 'var(--title)', fontWeight: 600 }}>Add an attachment</span>
                <input className="input" type="file" onChange={e=>setPFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} style={{ maxWidth: 320, color: 'var(--title)' }} />
              </label>
              <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn ghost" onClick={() => setCreateOpen(false)} style={{ color: 'var(--title)', borderColor: 'var(--title)' }}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create'}</button>
              </div>
              <div style={{ gridColumn: '1 / span 2', color: '#6b7280', fontSize: 12 }}>
                Note: Only name and description are saved now. Other fields are UI-only for this step.
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Icon({ name, color = '#6b7280' }) {
  const common = { width: 22, height: 22, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'home') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M3 10.5l9-7 9 7"/>
        <path d="M5 9.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.5"/>
        <path d="M9 22V14h6v8"/>
      </svg>
    )
  }
  if (name === 'rocket') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M14 3c3.5 0 7 3.5 7 7 0 1.5-1 3.5-2 4.5l-6.5 6.5-2.5-2.5L5.5 21 7 16.5 4.5 14l6.5-6.5C12 4 13 3 14 3z"/>
        <circle cx="15.5" cy="8.5" r="1.5"/>
      </svg>
    )
  }
  if (name === 'board') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <path d="M9 4v16"/>
        <path d="M15 10v10"/>
      </svg>
    )
  }
  if (name === 'user') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  }
  if (name === 'bell') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    )
  }
  return null
}

function SettingsPage() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'system'
    } catch {
      return 'system'
    }
  })
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [resetPasswordData, setResetPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetPasswordError, setResetPasswordError] = useState('')
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState('')

  // Apply theme changes
  useEffect(() => {
    const applyTheme = (themeValue) => {
      const root = document.documentElement
      
      if (themeValue === 'light') {
        root.style.setProperty('--bg', '#ffffff')
        root.style.setProperty('--title', '#1f2937')
        root.style.setProperty('--text', '#374151')
        root.style.setProperty('--text-strong', '#111827')
        root.style.setProperty('--border', '#e5e7eb')
        root.style.setProperty('--primary', '#3b82f6')
      } else if (themeValue === 'dark') {
        root.style.setProperty('--bg', '#1a133a')
        root.style.setProperty('--title', '#f9fafb')
        root.style.setProperty('--text', '#d1d5db')
        root.style.setProperty('--text-strong', '#ffffff')
        root.style.setProperty('--border', '#374151')
        root.style.setProperty('--primary', '#6366f1')
      } else { // system - always use dark purple theme
        root.style.setProperty('--bg', '#1a133a')
        root.style.setProperty('--title', '#f9fafb')
        root.style.setProperty('--text', '#d1d5db')
        root.style.setProperty('--text-strong', '#ffffff')
        root.style.setProperty('--border', '#374151')
        root.style.setProperty('--primary', '#6366f1')
      }
    }

    applyTheme(theme)
  }, [theme])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    try {
      localStorage.setItem('theme', newTheme)
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion')
      return
    }

    setIsDeleting(true)
    try {
      const res = await authFetch('/api/auth/delete-account/', {
        method: 'DELETE'
      })
      
      if (res.ok) {
        // Clear local storage and redirect to login
        localStorage.clear()
        alert('Account deleted successfully')
        navigate('/login')
      } else {
        const error = await res.text()
        alert(`Failed to delete account: ${error}`)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirmModal(false)
      setDeleteConfirmText('')
    }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('lastProjectId')
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
    navigate('/login')
  }

  const handleResetPassword = async () => {
    setResetPasswordError('')
    setResetPasswordSuccess('')

    // Validation
    if (!resetPasswordData.currentPassword) {
      setResetPasswordError('Please enter your current password')
      return
    }
    if (!resetPasswordData.newPassword) {
      setResetPasswordError('Please enter a new password')
      return
    }
    if (resetPasswordData.newPassword.length < 6) {
      setResetPasswordError('New password must be at least 6 characters')
      return
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setResetPasswordError('New password and confirm password do not match')
      return
    }

    setIsResettingPassword(true)
    try {
      const res = await authFetch('/api/auth/password/change/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: resetPasswordData.currentPassword,
          new_password: resetPasswordData.newPassword
        })
      })

      if (res.ok) {
        setResetPasswordSuccess('Your password has been updated successfully.')
        setResetPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowResetPasswordModal(false)
          setResetPasswordSuccess('')
        }, 2000)
      } else {
        const errorData = await res.json()
        if (res.status === 400 && errorData.detail?.includes('current password')) {
          setResetPasswordError('The current password entered is incorrect.')
        } else {
          setResetPasswordError(errorData.detail || 'Failed to update password. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setResetPasswordError('Failed to update password. Please try again.')
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <div style={{ padding: 16, paddingTop: 72, maxWidth: 800, margin: '0 auto', position: 'relative', background: 'var(--bg)', minHeight: '100vh' }}>
      <button type="button" onClick={() => navigate(-1)} className="btn ghost" style={{ position: 'fixed', top: 10, left: 12, borderColor: 'var(--title)', color: 'var(--title)', zIndex: 1001 }}>← Back</button>
      
      {/* Main Settings Box */}
      <div style={{ background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', width: '100%', maxWidth: 520 }}>
        <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--title)', margin: 0, fontSize: '1.5rem' }}>Settings</h2>
        </div>
        <button 
          type="button" 
          onClick={() => setShowThemeModal(true)}
          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#e5e7eb', padding: '16px 14px', cursor: 'pointer' }}
        >
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Theme</div>
          <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.4 }}>Change between Light and Dark modes for a personalized experience.</div>
        </button>
        <button 
          type="button" 
          onClick={() => setShowDeleteModal(true)}
          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#e5e7eb', padding: '16px 14px', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
        >
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Manage Account</div>
          <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.4 }}>Update your profile, email, or password settings securely.</div>
        </button>
        <button 
          type="button" 
          onClick={handleLogout}
          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#e5e7eb', padding: '16px 14px', borderTop: '1px solid var(--border)', cursor: 'pointer' }}
        >
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Logout</div>
          <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.4 }}>Sign out of your account safely and return to the login page.</div>
        </button>
      </div>

      {/* Theme Modal */}
      {showThemeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400 }}>
            <h3 style={{ color: 'var(--title)', margin: '0 0 16px 0' }}>Theme Options</h3>
            <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span style={{ color: 'var(--text)' }}>Light</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span style={{ color: 'var(--text)' }}>Dark</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={theme === 'system'}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span style={{ color: 'var(--text)' }}>System Default</span>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Account Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500 }}>
            <h3 style={{ color: 'var(--title)', margin: '0 0 20px 0' }}>Manage Account</h3>
            
            {/* Reset Password Option */}
            <div style={{ marginBottom: 24, padding: '16px', background: '#11132a', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: 'var(--title)' }}>Reset Password</div>
              <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12, lineHeight: 1.4 }}>Change your current password securely and update access to your account.</div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setShowResetPasswordModal(true)
                }}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                Reset Password
              </button>
            </div>

            {/* Delete Account Option */}
            <div style={{ padding: '16px', background: '#11132a', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: 'var(--title)' }}>Delete Account</div>
              <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12, lineHeight: 1.4 }}>Permanently delete your account and all associated data.</div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setShowDeleteConfirmModal(true)
                }}
                style={{
                  background: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: 6,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                Delete Account
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--text)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 16px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400 }}>
            <h3 style={{ color: 'var(--title)', margin: '0 0 20px 0' }}>Reset Password</h3>
            
            {resetPasswordSuccess && (
              <div style={{ background: '#10b981', color: 'white', padding: '12px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                {resetPasswordSuccess}
              </div>
            )}
            
            {resetPasswordError && (
              <div style={{ background: '#dc2626', color: 'white', padding: '12px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                {resetPasswordError}
              </div>
            )}

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: 'var(--title)', fontWeight: 500 }}>Current Password</label>
                <input
                  type="password"
                  value={resetPasswordData.currentPassword}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg)',
                    color: 'var(--title)',
                    fontSize: 14
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: 'var(--title)', fontWeight: 500 }}>New Password</label>
                <input
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg)',
                    color: 'var(--title)',
                    fontSize: 14
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: 'var(--title)', fontWeight: 500 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg)',
                    color: 'var(--title)',
                    fontSize: 14
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                onClick={() => {
                  setShowResetPasswordModal(false)
                  setResetPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  setResetPasswordError('')
                  setResetPasswordSuccess('')
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--text)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResettingPassword}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 16px',
                  cursor: isResettingPassword ? 'not-allowed' : 'pointer',
                  flex: 1,
                  opacity: isResettingPassword ? 0.6 : 1
                }}
              >
                {isResettingPassword ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500 }}>
            <h3 style={{ color: 'var(--title)', margin: '0 0 16px 0' }}>Delete Account</h3>
            <div style={{ color: 'var(--text)', marginBottom: 20 }}>
              <p style={{ margin: '0 0 16px 0', lineHeight: '1.5' }}>
                When you delete your account, all your projects will be deleted, all your tasks and comments will be removed, your account data will be permanently deleted, and this action cannot be undone.
              </p>
              <p style={{ margin: '0 0 16px 0', fontWeight: 600, color: 'var(--text-strong)' }}>
                Type "DELETE" to confirm:
              </p>
            </div>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg)',
                color: 'var(--title)',
                marginBottom: 20
              }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false)
                  setDeleteConfirmText('')
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--text)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                style={{
                  background: 'transparent',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 16px',
                  cursor: isDeleting || deleteConfirmText !== 'DELETE' ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    notifications_created: true,
    notifications_assigned: true,
    notifications_reported: true,
    notifications_watching: true,
    notifications_mentions: true,
    do_not_disturb_enabled: false,
    do_not_disturb_until: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDndModal, setShowDndModal] = useState(false)
  const [dndDuration, setDndDuration] = useState(60) // Default to 1 hour

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await authFetch('/api/notification-settings/')
        if (res && res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error loading notification settings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  // Update a specific setting
  const updateSetting = async (key, value) => {
    setSaving(true)
    try {
      const res = await authFetch('/api/notification-settings/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      })
      if (res && res.ok) {
        const data = await res.json()
        setSettings(data)
      } else {
        console.error('Failed to update setting')
      }
    } catch (error) {
      console.error('Error updating setting:', error)
    } finally {
      setSaving(false)
    }
  }

  // Enable Do Not Disturb
  const enableDoNotDisturb = async () => {
    setSaving(true)
    try {
      const res = await authFetch('/api/do-not-disturb/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_minutes: dndDuration })
      })
      if (res && res.ok) {
        const data = await res.json()
        setSettings(data.profile)
        setShowDndModal(false)
      } else {
        console.error('Failed to enable Do Not Disturb')
      }
    } catch (error) {
      console.error('Error enabling Do Not Disturb:', error)
    } finally {
      setSaving(false)
    }
  }

  // Disable Do Not Disturb
  const disableDoNotDisturb = async () => {
    setSaving(true)
    try {
      const res = await authFetch('/api/do-not-disturb/', {
        method: 'DELETE'
      })
      if (res && res.ok) {
        const data = await res.json()
        setSettings(data.profile)
      } else {
        console.error('Failed to disable Do Not Disturb')
      }
    } catch (error) {
      console.error('Error disabling Do Not Disturb:', error)
    } finally {
      setSaving(false)
    }
  }

  const dndOptions = [
    { value: 20, label: '20 minutes' },
    { value: 60, label: '1 hour' },
    { value: 240, label: '4 hours' },
    { value: 1440, label: '24 hours' },
    { value: 2880, label: '2 days' },
    { value: 10080, label: '1 week' }
  ]

  const notificationCategories = [
    {
      key: 'notifications_created',
      label: 'Created',
      description: 'When a project or task is created'
    },
    {
      key: 'notifications_assigned',
      label: 'Assigned',
      description: 'When a task or project is assigned to you'
    },
    {
      key: 'notifications_reported',
      label: 'Reported',
      description: 'When you are set as a reporter'
    },
    {
      key: 'notifications_watching',
      label: 'Watching',
      description: 'When you are watching a project or task'
    },
    {
      key: 'notifications_mentions',
      label: 'All Mentions',
      description: 'When someone mentions you (@your-email)'
    }
  ]

  if (loading) {
    return (
      <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
        <button type="button" onClick={() => navigate(-1)} className="btn ghost" style={{ position: 'fixed', top: 10, left: 12, borderColor: 'var(--title)', color: 'var(--title)', zIndex: 1001 }}>← Back</button>
        <div style={{ marginTop: 60, textAlign: 'center', color: 'var(--text)' }}>
          Loading notification settings...
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto', position: 'relative' }}>
      <button type="button" onClick={() => navigate(-1)} className="btn ghost" style={{ position: 'fixed', top: 10, left: 12, borderColor: 'var(--title)', color: 'var(--title)', zIndex: 1001 }}>← Back</button>
      
      <div style={{ marginTop: 12, marginBottom: 24 }}>
        <h1 style={{ color: 'var(--title)', fontSize: 24, fontWeight: 700, margin: '0 0 8px 0' }}>Notification Settings</h1>
        <p style={{ color: 'var(--text)', margin: 0 }}>Manage your notification preferences</p>
      </div>

      {/* Notification Categories */}
      <div style={{ background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--title)', fontSize: 18, fontWeight: 600, margin: 0 }}>Notification Categories</h2>
          <p style={{ color: 'var(--text)', fontSize: 14, margin: '4px 0 0 0' }}>Choose which notifications you want to receive</p>
        </div>
        
        {notificationCategories.map((category, index) => (
          <div key={category.key} style={{ 
            padding: '16px 20px', 
            borderBottom: index < notificationCategories.length - 1 ? '1px solid var(--border)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--title)', fontWeight: 500, marginBottom: 4 }}>{category.label}</div>
              <div style={{ color: 'var(--text)', fontSize: 14 }}>{category.description}</div>
            </div>
            <div style={{ marginLeft: 16 }}>
              <button
                type="button"
                onClick={() => updateSetting(category.key, !settings[category.key])}
                disabled={saving}
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  border: 'none',
                  background: settings[category.key] ? '#3b82f6' : '#6b7280',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                  opacity: saving ? 0.6 : 1
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  background: '#ffffff',
                  position: 'absolute',
                  top: 2,
                  left: settings[category.key] ? 22 : 2,
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Do Not Disturb */}
      <div style={{ background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--title)', fontSize: 18, fontWeight: 600, margin: 0 }}>Do Not Disturb</h2>
          <p style={{ color: 'var(--text)', fontSize: 14, margin: '4px 0 0 0' }}>Temporarily pause all notifications</p>
        </div>
        
        <div style={{ padding: '16px 20px' }}>
          {settings.do_not_disturb_enabled && settings.do_not_disturb_until ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ color: '#fbbf24', fontWeight: 500, marginBottom: 4 }}>Do Not Disturb Active</div>
                <div style={{ color: 'var(--text)', fontSize: 14 }}>
                  Until {new Date(settings.do_not_disturb_until).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={disableDoNotDisturb}
                disabled={saving}
                className="btn ghost"
                style={{ opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Disabling...' : 'Turn Off'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDndModal(true)}
              className="btn primary"
              style={{ width: '100%' }}
            >
              Enable Do Not Disturb
            </button>
          )}
        </div>
      </div>

      {/* Do Not Disturb Modal */}
      {showDndModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400 }}>
            <h3 style={{ color: 'var(--title)', margin: '0 0 16px 0' }}>Do Not Disturb</h3>
            <p style={{ color: 'var(--text)', margin: '0 0 20px 0' }}>Select how long you want to pause notifications:</p>
            
            <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
              {dndOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDndDuration(option.value)}
                  style={{
                    padding: '12px 16px',
                    background: dndDuration === option.value ? '#3b82f6' : 'transparent',
                    border: '1px solid',
                    borderColor: dndDuration === option.value ? '#3b82f6' : 'var(--border)',
                    borderRadius: 8,
                    color: dndDuration === option.value ? '#ffffff' : 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 14
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowDndModal(false)}
                className="btn ghost"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={enableDoNotDisturb}
                disabled={saving}
                className="btn primary"
                style={{ flex: 1, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Enabling...' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileButton() {
  const navigate = useNavigate()
  const letter = (() => { try { const em = String(localStorage.getItem('userEmail') || '').trim(); return em ? em[0].toUpperCase() : '?' } catch { return '?' } })()
  return (
    <button
      type="button"
      aria-label="Account"
      onClick={() => navigate('/account')}
      style={{
        position: 'fixed', top: 12, left: 12,
        width: 32, height: 32, borderRadius: 16,
        background: '#21375f', color: '#a78bfa',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid var(--title)',
        cursor: 'pointer', zIndex: 1000,
        outline: 'none', boxShadow: 'none', padding: 0
      }}
    >
      <span style={{ fontWeight: 800, fontSize: 14, lineHeight: 1, textTransform: 'uppercase' }}>{letter}</span>
    </button>
  )
}

function NotificationBell() {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [popupOpen, setPopupOpen] = useState(false)

  // Load notifications
  const loadNotifications = async () => {
    try {
      const res = await authFetch('/api/notifications/')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read_at).length)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  useEffect(() => {
    loadNotifications()
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffMs = now - notificationTime
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return notificationTime.toLocaleDateString()
  }

  const markAsRead = async (notificationId) => {
    try {
      await authFetch(`/api/notifications/${notificationId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_at: new Date().toISOString() })
      })
      loadNotifications() // Refresh
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setPopupOpen(!popupOpen)}
        style={{
          position: 'fixed', top: 12, right: 60,
          width: 40, height: 40, borderRadius: 20,
          background: '#21375f', color: '#fbbf24',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--title)',
          cursor: 'pointer', zIndex: 1000,
          outline: 'none', boxShadow: 'none', padding: 0
        }}
      >
        <Icon name="bell" color="#fbbf24" />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {popupOpen && (
        <div style={{
          position: 'fixed',
          top: 60,
          right: 60,
          width: 350,
          maxHeight: 400,
          background: '#0f1025',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          zIndex: 1001,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: 16,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, color: 'var(--title)', fontSize: 16 }}>Notifications</h3>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: 12,
                textDecoration: 'underline'
              }}
            >
              View All
            </button>
          </div>
          
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id)
                    setPopupOpen(false)
                  }}
                  style={{
                    padding: 12,
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: notification.read_at ? 'transparent' : '#1a1b3a',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#1a1b3a'}
                  onMouseLeave={(e) => e.target.style.background = notification.read_at ? 'transparent' : '#1a1b3a'}
                >
                  <div style={{ 
                    fontSize: 14, 
                    color: '#e5e7eb', 
                    fontWeight: notification.read_at ? 400 : 600,
                    marginBottom: 4
                  }}>
                    {notification.message || notification.type}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    {formatTimestamp(notification.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function HomePage() {
  const name = (() => { try { const em = localStorage.getItem('userEmail') || ''; const base = em.split('@')[0] || ''; return base.replace(/\d+/g, '') } catch { return '' } })()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [recentOpen, setRecentOpen] = useState(false)
  const [allProjects, setAllProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [pName, setPName] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pTeam, setPTeam] = useState('')
  const [pStart, setPStart] = useState('')
  const [pDue, setPDue] = useState('')
  const [pReporter, setPReporter] = useState([])
  const [pFile, setPFile] = useState(null)
  const [pStatus, setPStatus] = useState('ACTIVE')
  const [pPriority, setPPriority] = useState('MEDIUM')
  const [pTags, setPTags] = useState('')
  const [pAssigneesSel, setPAssigneesSel] = useState([])
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await authFetch('/api/projects/')
        if (res && res.ok) {
          const data = await res.json()
          setAllProjects(Array.isArray(data) ? data : [])
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault(); setCreateOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await authFetch('/api/projects/')
        if (res && res.ok) {
          const data = await res.json()
          setAllProjects(Array.isArray(data) ? data : [])
        }
      } catch {}
    })()
  }, [])
  async function createProjectFromHome(e) {
    e.preventDefault()
    setSubmitError('')
    if (!pName.trim()) { setSubmitError('Project name is required'); return }
    setIsSubmitting(true)
    try {
      // Debug: Check if we have a token
      const token = getToken()
      if (!token) {
        setSubmitError('No authentication token found. Please log in again.')
        setIsSubmitting(false)
        return
      }
      
      const form = new FormData()
      form.append('name', pName.trim())
      form.append('description', pDesc.trim())
      if (pTeam) form.append('team', pTeam)
      if (pStart) form.append('start_date', pStart)
      if (pDue) form.append('due_date', pDue)
      if (pReporter && pReporter.length > 0) form.append('reporter_id', pReporter[0].id)
      if (pFile) form.append('attachment', pFile)
      if (pAssigneesSel && pAssigneesSel.length > 0) {
        // Save assignees to team field as comma-separated emails
        const assigneeEmails = pAssigneesSel.map(user => user.email).join(',')
        form.append('team', assigneeEmails)
        form.append('team_members', pAssigneesSel.map(user => user.id).join(','))
      }
      console.log('Making API call to create project...')
      const res = await authFetch('/api/projects/', {
        method: 'POST',
        body: form
      })
      console.log('API response status:', res.status)
      if (res.ok) {
        const p = await res.json()
        console.log('Project created successfully:', p)
        setCreateOpen(false)
        setPName(''); setPDesc(''); setPTeam(''); setPStart(''); setPDue(''); setPReporter(''); setPFile(null); setPAssigneesSel([])
        
        // Send invitations to assigned team members using proper backend invitation system
        if (pAssigneesSel.length > 0) {
          try {
            for (const member of pAssigneesSel) {
              // Use the proper backend invitation endpoint
              const inviteRes = await authFetch(`/api/projects/${p.id}/invite_member/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: member.email })
              })
              
              if (inviteRes.ok) {
                console.log(`Invitation sent to ${member.email} for project ${pName}`)
              } else {
                console.error(`Failed to send invitation to ${member.email}:`, await inviteRes.text())
              }
            }
            alert(`Project created successfully! Invitations sent to ${pAssigneesSel.length} team member(s).`)
          } catch (error) {
            console.error('Error sending invitations:', error)
            alert('Project created successfully, but failed to send some invitations.')
          }
        } else {
          alert('Project created successfully!')
        }
        
        try { localStorage.setItem('lastProjectId', String(p.id)) } catch {}
        navigate(`/projects/${p.id}/board`, { replace: true })
      } else {
        try { 
          const t = await res.text(); 
          console.error('API error response:', t)
          setSubmitError(t || 'Create failed') 
        } catch { 
          console.error('Failed to read error response')
          setSubmitError('Create failed') 
        }
      }
    } catch (error) {
      console.error('Network error details:', error)
      setSubmitError('Network error: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  function goToProjectsBoard() {
    try {
      const last = localStorage.getItem('lastProjectId')
      if (last) { navigate(`/projects/${last}/board`); return }
    } catch {}
    ;(async () => {
      try {
        const res = await authFetch('/api/projects/')
        if (res && res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            navigate(`/projects/${data[0].id}/board`)
            return
          }
        }
      } catch {}
      navigate('/projects')
    })()
  }
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'auto', padding: 16 }}>
      <ProfileButton />
      <button
        type="button"
        aria-label="Menu"
        style={{
          position: 'fixed', top: 12, right: 12,
          background: 'transparent',
          border: '2px solid var(--title)',
          borderRadius: 8,
          width: 36, height: 36,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 0, cursor: 'pointer', zIndex: 1000,
          outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent'
        }}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
      </button>
      {menuOpen ? (
        <div style={{ position: 'fixed', top: 56, right: 12, background: '#0f1025', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', width: 260, padding: 8, zIndex: 1000 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/home') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #ff6b6b, #ff8e53, #ff6b6b)', display: 'grid', placeItems: 'center' }}>
                <Icon name="home" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Home</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/projects') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'grid', placeItems: 'center' }}>
                <Icon name="rocket" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Projects</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/dashboard') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'grid', placeItems: 'center' }}>
                <Icon name="board" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Dashboards</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/notifications') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: '#21375f', display: 'grid', placeItems: 'center' }}>
                <Icon name="bell" color="#fbbf24" />
              </div>
              <div style={{ fontSize: 14 }}>Notifications</div>
            </button>
          </div>
        </div>
      ) : null}
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        
        <h2 style={{ color: '#ffffff', marginTop: 12, textAlign: 'center' }}>Hello, {name || 'there'} Welcome to your Dashboard!</h2>
        <div style={{ marginTop: 8, color: '#6b7280', textAlign: 'center' }}>You can start creating tasks, invite teammates, and manage your board.</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Search projects..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ flex: 1 }} />
          <button className="btn" onClick={() => {
            const q = (searchQuery || '').trim().toLowerCase()
            if (!q) return
            const isRealProject = (p) => !!((p.description && String(p.description).trim()) || p.team || p.start_date || p.due_date || p.reporter_name || p.attachment)
            const projectsOnly = allProjects.filter(isRealProject)
            const matches = projectsOnly.filter(p => (p.name || '').toLowerCase().startsWith(q))
            if (matches.length > 0) navigate(`/projects/${matches[0].id}/board`)
          }}>Search</button>
        </div>
        {(() => {
          const q = (searchQuery || '').trim().toLowerCase()
          if (!q) return null
          const isRealProject = (p) => !!((p.description && String(p.description).trim()) || p.team || p.start_date || p.due_date || p.reporter_name || p.attachment)
          const projectsOnly = allProjects.filter(isRealProject)
          const matches = projectsOnly.filter(p => (p.name || '').toLowerCase().startsWith(q))
          if (matches.length === 0) return null
          return (
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {matches.map(p => (
                <button key={p.id} type="button" onClick={() => navigate(`/projects/${p.id}/board`)}
                  style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, textAlign: 'left', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: '#eef2ff', display: 'grid', placeItems: 'center' }}>
                      <Icon name="board" color="#7c3aed" />
                    </div>
                    <div style={{ display: 'grid' }}>
                      <div style={{ color: 'var(--title)', fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ color: '#6b7280', fontSize: 11 }}>{((p.name ? p.name.replace(/[^a-zA-Z]/g, '').slice(0,3).toLowerCase() : '') || 'prj')}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        })()}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--muted)' }}>Recent items</span>
          <button type="button" aria-label="Open recent items" onClick={() => setRecentOpen(v=>!v)} style={{ background: 'transparent', border: 'none', color: 'var(--title)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
        {(() => {
          if (!recentOpen) return null
          const recentIds = (() => { try { return JSON.parse(localStorage.getItem('recentProjectIds') || '[]') } catch { return [] } })()
          const idToIndex = recentIds.reduce((acc, id, idx) => { acc[id] = idx; return acc }, {})
          const isRealProject = (p) => !!((p.description && String(p.description).trim()) || p.team || p.start_date || p.due_date || p.reporter_name || p.attachment)
          const projectsOnly = allProjects.filter(isRealProject)
          const recentProjects = projectsOnly.filter(p => recentIds.includes(p.id)).sort((a,b)=>idToIndex[a.id]-idToIndex[b.id])
          if (recentProjects.length === 0) return <div style={{ marginTop: 8, color: '#6b7280' }}>No recent projects</div>
          const Card = ({ p }) => {
            const fromName = (p.name ? p.name.replace(/[^a-zA-Z]/g, '').slice(0,3).toLowerCase() : '') || 'prj'
            const short = (p.key && String(p.key).toLowerCase()) || fromName
            return (
              <button type="button" onClick={() => navigate(`/projects/${p.id}/board`)}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, textAlign: 'left', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#eef2ff', display: 'grid', placeItems: 'center' }}>
                    <Icon name="board" color="#7c3aed" />
                  </div>
                  <div style={{ display: 'grid' }}>
                    <div style={{ color: 'var(--title)', fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 11 }}>{short}</div>
                  </div>
                </div>
              </button>
            )
          }
          return (
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {recentProjects.map(p => (<Card key={p.id} p={p} />))}
            </div>
          )
        })()}

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--muted)' }}>Create project</span>
          <button
            type="button"
            aria-label="Create project"
            onClick={() => setCreateOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--title)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              cursor: 'pointer',
              marginRight: 20
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

        {createOpen ? (
          <Portal>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
            <div style={{ background: '#fff', width: 'min(720px, 96vw)', maxHeight: '90vh', overflow: 'auto', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 16px 40px rgba(0,0,0,0.25)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--title)' }}>Create Project</h3>
                <button type="button" onClick={() => setCreateOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>✕</button>
              </div>
              {submitError ? <div style={{ color: 'red', marginTop: 8 }}>{submitError}</div> : null}
              <form onSubmit={createProjectFromHome} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, width: '100%', margin: '12px 0 0' }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Project Name</span>
                  <input className="input" value={pName} onChange={e=>setPName(e.target.value)} placeholder="Enter project name" required style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Project Description</span>
                  <textarea className="input" rows={4} value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Describe the project" style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Project Manager</span>
                  <input className="input" value={(() => { try { return localStorage.getItem('userEmail') || '' } catch { return '' } })()} readOnly placeholder="Creator's email" style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Assignees</span>
                  <AssigneeMultiSelect token={getToken()} value={pAssigneesSel} onChange={setPAssigneesSel} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Start Date</span>
                  <input className="input" type="date" value={pStart} onChange={e=>setPStart(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Deadline / Due Date</span>
                  <input className="input" type="date" value={pDue} onChange={e=>setPDue(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Status</span>
                  <select className="input" value={pStatus} onChange={e=>setPStatus(e.target.value)} style={{ width: '100%' }}>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Priority</span>
                  <select className="input" value={pPriority} onChange={e=>setPPriority(e.target.value)} style={{ width: '100%' }}>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Tags / Categories</span>
                  <input className="input" value={pTags} onChange={e=>setPTags(e.target.value)} placeholder="e.g., Frontend, Marketing (UI only)" style={{ width: '100%' }} />
                </label>
                <div style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--title)', fontWeight: 600 }}>Progress</span>
                  <div style={{ background: '#e5e7eb', height: 10, borderRadius: 999, width: '100%' }}>
                    <div style={{ width: '0%', height: '100%', background: '#7c3aed', borderRadius: 999 }} />
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>0% complete</div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button type="button" className="btn ghost" onClick={() => setCreateOpen(false)} style={{ color: 'var(--title)', borderColor: 'var(--title)' }}>Cancel</button>
                  <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create'}</button>
                </div>
                <div style={{ color: '#6b7280', fontSize: 12 }}>
                  Note: Only name and description are saved now. Other fields are visual placeholders.
                </div>
              </form>
            </div>
          </div>
          </Portal>
        ) : null}
      </div>
    </div>
  )
}

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState('email') // 'email', 'otp', 'success'
  const [otpToken, setOtpToken] = useState('')
  const [otpCode, setOtpCode] = useState('')

  async function sendResetLink(e) {
    e.preventDefault()
    setStatus('')
    setError('')
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/auth/password/reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (res.ok) {
        try { 
          const data = await res.json()
          if (data.reset_url) console.log('Reset URL (dev):', data.reset_url) 
        } catch {}
        setStatus('Reset link has been sent to your email.')
        setStep('success')
      } else {
        setError('Please try again later.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function sendOTP(e) {
    e.preventDefault()
    setStatus('')
    setError('')
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/auth/password/otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (res.ok) {
        setStatus('OTP has been sent to your email.')
        setStep('otp')
      } else {
        setError('Please try again later.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function verifyOTP(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/auth/password/otp/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode })
      })
      
      if (res.ok) {
        const data = await res.json()
        setOtpToken(data.token)
        navigate('/reset-password-otp', { 
          state: { email, token: data.token },
          replace: true 
        })
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Invalid or expired OTP' }))
        setError(errorData.detail || 'Invalid or expired OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'success') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            TaskFlow Management
            </div>
          
          <div style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '12px'
          }}>
            Check Your Email
          </div>
          
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '0 0 24px 0',
            lineHeight: '1.5'
          }}>
            {status}
          </p>
          
            <button 
              onClick={() => navigate('/login', { replace: true })}
            style={{
              width: '100%',
              padding: '14px',
              background: '#6C63FF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 6px 16px rgba(108, 99, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 12px rgba(108, 99, 255, 0.3)'
            }}
            >
              Back to Login
            </button>
        </div>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
              letterSpacing: '-0.02em'
            }}>
              TaskFlow Management
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Enter OTP
            </div>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: 0,
              fontWeight: '400'
            }}>
              Enter the 6-digit code sent to {email}
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {status && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#0369a1',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {status}
            </div>
          )}

          <form onSubmit={verifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
            <input 
              type="text" 
              value={otpCode} 
              onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
              placeholder="Enter 6-digit OTP" 
              required 
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '18px',
                  background: '#fff',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  letterSpacing: '0.2em',
                  fontWeight: '600'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6C63FF'
                  e.target.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || otpCode.length !== 6}
              style={{
                width: '100%',
                padding: '14px',
                background: isSubmitting || otpCode.length !== 6
                  ? '#9ca3af' 
                  : '#6C63FF',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSubmitting || otpCode.length !== 6 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSubmitting || otpCode.length !== 6
                  ? 'none' 
                  : '0 4px 12px rgba(108, 99, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && otpCode.length === 6) {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(108, 99, 255, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && otpCode.length === 6) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(108, 99, 255, 0.3)'
                }
              }}
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
              <button 
                type="button" 
                onClick={() => setStep('email')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6C63FF',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={() => sendOTP({ preventDefault: () => {} })}
              style={{
                background: 'none',
                border: 'none',
                color: '#6C63FF',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Resend OTP
              </button>
            </div>
          </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            TaskFlow Management
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Forgot Password?
          </div>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0,
            fontWeight: '400'
          }}>
            Enter your email to reset your password
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#dc2626',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#0369a1',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {status}
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={sendResetLink} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#9ca3af'
              }}>
                📧
              </span>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
                placeholder="Enter your email address"
            required 
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6C63FF'
                  e.target.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Send Reset Link Button */}
            <button 
            type="submit"
              disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              background: isSubmitting 
                ? '#9ca3af' 
                : '#6C63FF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isSubmitting 
                ? 'none' 
                : '0 4px 12px rgba(108, 99, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 6px 16px rgba(108, 99, 255, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(108, 99, 255, 0.3)'
              }
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send Link'}
            </button>
        </form>

        {/* Secondary Actions */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            Remembered your password?{' '}
          </span>
          <a
            href="/login"
            style={{ 
              color: '#6C63FF',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Login here
          </a>
        </div>

        {/* Footer Message (appears after submission) */}
        {step === 'success' && (
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{
              color: '#9ca3af',
              fontSize: '12px',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Check your inbox for reset instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ResetPassword() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const uid = search.get('uid') || ''
  const token = search.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    if (password !== confirm) { 
      setError('Passwords do not match')
      setIsSubmitting(false)
      return 
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsSubmitting(false)
      return
    }
    
    try {
      const res = await fetch('/api/auth/password/reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: password })
      })
      
      if (res.ok) {
        alert('Password updated successfully. Please login.')
        navigate('/login', { replace: true })
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Reset failed' }))
        setError(errorData.detail || 'Reset failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', padding: 16 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', padding: 14, display: 'grid', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--title)', fontSize: '1.4rem' }}>Reset Password</h2>
            <div style={{ color: 'var(--muted)', marginTop: 6 }}>Enter a new password</div>
          </div>
          {error ? <div style={{ color: 'red' }}>{error}</div> : null}
          <input 
            className="input" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="New password" 
            required 
            style={{ width: 280, margin: '0 auto' }}
          />
          <input 
            className="input" 
            type="password" 
            value={confirm} 
            onChange={e => setConfirm(e.target.value)} 
            placeholder="Confirm password" 
            required 
            style={{ width: 280, margin: '0 auto' }}
          />
          <button 
            className="btn" 
            type="submit" 
            disabled={isSubmitting}
            style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)' }}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--muted)', 
              cursor: 'pointer', 
              textDecoration: 'underline',
              fontSize: 'inherit',
              padding: 0,
              textAlign: 'center'
            }}
          >
            Back to login
          </button>
        </div>
      </form>
    </div>
  )
}

function ResetPasswordOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { email, token } = location.state || {}

  useEffect(() => {
    if (!email || !token) {
      navigate('/forgot-password', { replace: true })
    }
  }, [email, token, navigate])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    if (password !== confirm) { 
      setError('Passwords do not match')
      setIsSubmitting(false)
      return 
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsSubmitting(false)
      return
    }
    
    try {
      const res = await fetch('/api/auth/password/otp/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, new_password: password })
      })
      
      if (res.ok) {
        alert('Password updated successfully. Please login.')
        navigate('/login', { replace: true })
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Reset failed' }))
        setError(errorData.detail || 'Reset failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!email || !token) {
    return null
  }
  
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', padding: 16 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', padding: 14, display: 'grid', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--title)', fontSize: '1.4rem' }}>Reset Password</h2>
            <div style={{ color: 'var(--muted)', marginTop: 6 }}>Enter a new password for {email}</div>
          </div>
          {error ? <div style={{ color: 'red' }}>{error}</div> : null}
          <input 
            className="input" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="New password" 
            required 
            style={{ width: 280, margin: '0 auto' }}
          />
          <input 
            className="input" 
            type="password" 
            value={confirm} 
            onChange={e => setConfirm(e.target.value)} 
            placeholder="Confirm password" 
            required 
            style={{ width: 280, margin: '0 auto' }}
          />
          <button 
            className="btn" 
            type="submit" 
            disabled={isSubmitting}
            style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)' }}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--muted)', 
              cursor: 'pointer', 
              textDecoration: 'underline',
              fontSize: 'inherit',
              padding: 0,
              textAlign: 'center'
            }}
          >
            Back to login
          </button>
        </div>
      </form>
    </div>
  )
}

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize Google Sign-Up
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    if (!clientId) return

    let attempts = 0
    let intervalId

    const tryInit = () => {
      const hasGoogle = typeof window !== 'undefined' && window.google && window.google.accounts && window.google.accounts.id
      if (!hasGoogle) return false
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              // Store email for greeting if available from Google ID token
              try {
                const cred = response.credential || ''
                const payload = JSON.parse(atob((cred.split('.')[1] || '')) || '{}')
                if (payload && payload.email) {
                  localStorage.setItem('userEmail', String(payload.email))
                }
              } catch {}
              const res = await fetch('/api/auth/google/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_token: response.credential })
              })
              if (res.ok) {
                const data = await res.json()
                localStorage.setItem('accessToken', data.access)
                navigate('/home', { replace: true })
              } else {
                const t = await res.text()
                setError(t || 'Google sign-up failed')
              }
            } catch (e) {
              setError('Network error during Google sign-up')
            }
          }
        })
        const el = document.getElementById('gsi-signup-btn')
        if (el) {
          try { el.innerHTML = '' } catch {}
          window.google.accounts.id.renderButton(el, { 
            theme: 'outline', 
            size: 'large', 
            type: 'standard', 
            shape: 'rectangular', 
            width: '100%',
            text: 'signup_with'
          })
        }
        return true
      } catch {
        return false
      }
    }

    if (!tryInit()) {
      intervalId = setInterval(() => {
        attempts += 1
        if (tryInit() || attempts > 40) {
          clearInterval(intervalId)
        }
      }, 150)
    }

    return () => { if (intervalId) clearInterval(intervalId) }
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password,
          first_name: formData.fullName.split(' ')[0] || '',
          last_name: formData.fullName.split(' ').slice(1).join(' ') || ''
        })
      })
      if (!res.ok) {
        const t = await res.text(); 
        setError(t || 'Signup failed'); 
        setIsSubmitting(false); 
        return
      }
      // Auto-login
      const loginRes = await fetch('/api/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })
      if (loginRes.ok) {
        const data = await loginRes.json()
        localStorage.setItem('accessToken', data.access)
        try { localStorage.setItem('userEmail', formData.email) } catch {}
        if (data.refresh) try { localStorage.setItem('refreshToken', data.refresh) } catch {}
        navigate('/workspaces', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        width: '100%',
        maxWidth: '380px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px',
            letterSpacing: '-0.02em'
          }}>
            TaskFlow Management
          </div>
          <p style={{
            color: '#6b7280',
            fontSize: '13px',
            margin: 0,
            fontWeight: '400'
          }}>
            Create your account to get started
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#dc2626',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Full Name Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#9ca3af'
              }}>
                👤
              </span>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6C63FF'
                  e.target.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
          </div>
        </div>

          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#9ca3af'
              }}>
                📧
              </span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6C63FF'
                  e.target.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#9ca3af'
              }}>
                🔒
              </span>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6C63FF'
                  e.target.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#9ca3af'
              }}>
                🔒
              </span>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6C63FF'
                  e.target.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              background: isSubmitting 
                ? '#9ca3af' 
                : '#6C63FF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isSubmitting 
                ? 'none' 
                : '0 4px 12px rgba(108, 99, 255, 0.3)',
              marginTop: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 6px 16px rgba(108, 99, 255, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(108, 99, 255, 0.3)'
              }
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
      </form>

        {/* Secondary Actions */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            Already have an account?{' '}
          </span>
          <a
            href="/login"
            style={{
              color: '#6C63FF',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Login here
          </a>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '12px 0',
          color: '#9ca3af'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ padding: '0 16px', fontSize: '14px', fontWeight: '500' }}>
            OR
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Google Sign Up Button */}
        <div style={{ marginBottom: '12px' }}>
          <div id="gsi-signup-btn" style={{ width: '100%' }} />
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            color: '#9ca3af',
            fontSize: '12px',
            margin: 0,
            lineHeight: '1.4'
          }}>
            By signing up, you agree to our{' '}
            <a href="#" style={{ color: '#6C63FF', textDecoration: 'none' }}>Terms</a>
            {' '}&{' '}
            <a href="#" style={{ color: '#6C63FF', textDecoration: 'none' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function DevLogin() {
  const navigate = useNavigate()
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/auth/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'demo123', password: 'StrongPass123!' })
        })
        if (res.ok) {
          const data = await res.json()
          localStorage.setItem('accessToken', data.access)
          navigate('/projects', { replace: true })
        } else {
          navigate('/login', { replace: true })
        }
      } catch (e) {
        navigate('/login', { replace: true })
      }
    })()
  }, [navigate])
  return null
}

function Board() {
  const { id } = useParams()
  const projectId = Number(id)
  const token = getToken()
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [openTaskId, setOpenTaskId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [topMenuOpen, setTopMenuOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  
  // Enhanced notification system
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const [notificationPageOpen, setNotificationPageOpen] = useState(false)
  const [notificationTab, setNotificationTab] = useState('all') // 'all' or 'unread'
  const [snoozeUntil, setSnoozeUntil] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [teamMembersOpen, setTeamMembersOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [projectInfo, setProjectInfo] = useState(null)

  // Notification types and icons
  const notificationTypes = {
    // Project-Level Notifications
    PROJECT_INVITE: { icon: '📂', category: 'project' },
    PROJECT_INVITATION: { icon: '📂', category: 'project' },
    PROJECT_INVITE_RESPONSE: { icon: '📂', category: 'project' },
    PROJECT_INVITATION_ACCEPTED: { icon: '📂', category: 'project' },
    PROJECT_INVITATION_DECLINED: { icon: '📂', category: 'project' },
    PROJECT_DEADLINE_CHANGED: { icon: '📂', category: 'project' },
    PROJECT_DELETED: { icon: '📂', category: 'project' },
    PROJECT_REMOVED: { icon: '📂', category: 'project' },
    PROJECT_REPORTER_ASSIGNED: { icon: '📂', category: 'project' },
    
    // Task-Level Notifications
    TASK_ASSIGNED: { icon: '📌', category: 'task' },
    TASK_DEADLINE_REMINDER: { icon: '📌', category: 'task' },
    TASK_COMPLETED: { icon: '📌', category: 'task' },
    TASK_STATUS_CHANGED: { icon: '📌', category: 'task' },
    TASK_REMOVED: { icon: '📌', category: 'task' },
    TASK_UPDATE: { icon: '📌', category: 'task' },
    
    // Collaboration/Comments
    COMMENT_MENTION: { icon: '🗨️', category: 'comment' },
    COMMENT_ADDED: { icon: '🗨️', category: 'comment' },
    ATTACHMENT_UPLOADED: { icon: '🗨️', category: 'comment' },
    MENTION: { icon: '🗨️', category: 'comment' },
    
    // Reminders & Productivity Alerts
    REMINDER_24H: { icon: '🔔', category: 'reminder' },
    REMINDER_IDLE: { icon: '🔔', category: 'reminder' },
    DAILY_SUMMARY: { icon: '🔔', category: 'reminder' },
    WEEKLY_UPDATE: { icon: '🔔', category: 'reminder' },
    
    // System/General
    PASSWORD_CHANGED: { icon: '⚙️', category: 'system' },
    APP_UPDATE: { icon: '⚙️', category: 'system' },
    NOTIFICATIONS_SNOOZED: { icon: '⚙️', category: 'system' }
  }

  // Helper function to create notifications
  const createNotification = (type, message, data = {}) => {
    const notificationType = notificationTypes[type]
    if (!notificationType) return null

    return {
      id: Date.now() + Math.random(),
      type,
      message,
      icon: notificationType.icon,
      category: notificationType.category,
      timestamp: new Date().toISOString(),
      isRead: false,
      data
    }
  }

  // Helper function to add notification
  const addNotification = (notification) => {
    if (!notification) return
    
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted' && !snoozeUntil) {
      new Notification('TaskFlow Notification', {
        body: notification.message,
        icon: '/favicon.ico'
      })
    }
  }

  // Notification management functions
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    )
    setUnreadCount(0)
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const snoozeNotifications = (duration) => {
    const snoozeTime = new Date(Date.now() + duration)
    setSnoozeUntil(snoozeTime)
    
    const notification = createNotification(
      'NOTIFICATIONS_SNOOZED',
      `Notifications snoozed for ${duration / (1000 * 60)} minutes`
    )
    addNotification(notification)
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffMs = now - notificationTime
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notificationTime.toLocaleDateString()
  }
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    team: [],
    start_date: '',
    due_date: '',
    reporter_name: ''
  })
  const [isSavingProject, setIsSavingProject] = useState(false)
  const [activeTab, setActiveTab] = useState('BOARD')
  const [columnsState, setColumnsState] = useState([
    { key: 'TO_DO', title: 'To Do', next: 'IN_PROGRESS' },
    { key: 'IN_PROGRESS', title: 'In Progress', next: 'REVIEW' },
    { key: 'REVIEW', title: 'Review', next: 'DONE' },
    { key: 'DONE', title: 'Done', next: null },
  ])
  const [openColMenuKey, setOpenColMenuKey] = useState(null)

  // Check if current user is project owner
  const isProjectOwner = () => {
    if (!projectInfo || !token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentUserId = payload.user_id
      return projectInfo.created_by && projectInfo.created_by.id === currentUserId
    } catch {
      return false
    }
  }

  // Check if current user is project manager (owner/creator)
  const isProjectManager = () => {
    if (!projectInfo || !token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentUserId = payload.user_id
      // Project manager is the creator/owner of the project
      return projectInfo.created_by && projectInfo.created_by.id === currentUserId
    } catch {
      return false
    }
  }

  // Initialize edit form data when project info changes
  useEffect(() => {
    if (projectInfo) {
      console.log('Initializing edit form with project info:', projectInfo)
      console.log('All available fields:', Object.keys(projectInfo))
      console.log('Assignees from project:', projectInfo.assignees)
      console.log('Team members from project:', projectInfo.team_members)
      console.log('Team field from project:', projectInfo.team)
      console.log('Members field from project:', projectInfo.members)
      
      // Convert team string to user objects for AssigneeMultiSelect
      const teamString = projectInfo.team || ''
      const teamEmails = teamString ? teamString.split(',').map(email => email.trim()).filter(email => email) : []
      const teamUsers = teamEmails.map(email => ({ email, id: email, first_name: email.split('@')[0], last_name: '' }))
      
      // Convert reporter to user object for AssigneeMultiSelect
      const reporterUser = projectInfo.reporter ? [projectInfo.reporter] : []
      
      setEditFormData({
        name: projectInfo.name || '',
        description: projectInfo.description || '',
        team: teamUsers,
        start_date: projectInfo.start_date || '',
        due_date: projectInfo.due_date || '',
        reporter: reporterUser
      })
    }
  }, [projectInfo])

  // Handle project invite acceptance
  const handleProjectInviteAccept = async (notificationId, projectId, projectName) => {
    try {
      // First, add the user to the project team
      const currentUserEmail = localStorage.getItem('userEmail')
      if (!currentUserEmail) {
        alert('User email not found. Please log in again.')
        return
      }

      // Get current project info to update team
      const projectRes = await authFetch(`/api/projects/${projectId}/`)
      if (!projectRes.ok) {
        alert('Failed to fetch project information.')
        return
      }
      
      const projectData = await projectRes.json()
      const currentTeam = projectData.team || ''
      const teamEmails = currentTeam ? currentTeam.split(',').map(email => email.trim()).filter(email => email) : []
      
      // Add current user to team if not already there
      if (!teamEmails.includes(currentUserEmail)) {
        teamEmails.push(currentUserEmail)
        
        // Update project with new team member
        const updateForm = new FormData()
        updateForm.append('team', teamEmails.join(','))
        
        const updateRes = await authFetch(`/api/projects/${projectId}/`, {
          method: 'PATCH',
          body: updateForm
        })
        
        if (!updateRes.ok) {
          alert('Failed to add you to the project team.')
          return
        }
        
        console.log(`Added ${currentUserEmail} to project ${projectName} team`)
      }

      // Update notification status
      await authFetch(`/api/notifications/${notificationId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'ACCEPTED',
          action_taken: 'ACCEPTED'
        })
      })

      // Send notification to project manager
      const projectManagerNotification = {
        type: 'PROJECT_INVITE_RESPONSE',
        recipient_id: projectData.created_by.id,
        payload: {
          project_id: projectId,
          project_name: projectName,
          message: `${currentUserEmail} has accepted your invite to join the project "${projectName}" at ${new Date().toLocaleString()}.`,
          action_required: false,
          related_notification_id: notificationId
        }
      }

      await authFetch('/api/notifications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectManagerNotification)
      })

      console.log(`Project invite accepted. User added to project team. Notification sent to project manager.`)
      alert('You have accepted the project invite and been added to the project team! The project manager has been notified.')
      
      // Refresh notifications
      if (typeof refreshNotifications === 'function') {
        refreshNotifications()
      }
    } catch (error) {
      console.error('Error accepting project invite:', error)
      alert('Failed to accept invite. Please try again.')
    }
  }

  // Handle project invite decline
  const handleProjectInviteDecline = async (notificationId, projectId, projectName) => {
    try {
      // Get project info to find project manager
      const projectRes = await authFetch(`/api/projects/${projectId}/`)
      if (!projectRes.ok) {
        alert('Failed to fetch project information.')
        return
      }
      
      const projectData = await projectRes.json()
      const currentUserEmail = localStorage.getItem('userEmail') || 'A user'

      // Update notification status
      await authFetch(`/api/notifications/${notificationId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'DECLINED',
          action_taken: 'DECLINED'
        })
      })

      // Send notification to project manager
      const projectManagerNotification = {
        type: 'PROJECT_INVITE_RESPONSE',
        recipient_id: projectData.created_by.id,
        payload: {
          project_id: projectId,
          project_name: projectName,
          message: `${currentUserEmail} has declined your invite to join the project "${projectName}" at ${new Date().toLocaleString()}.`,
          action_required: false,
          related_notification_id: notificationId
        }
      }

      await authFetch('/api/notifications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectManagerNotification)
      })

      console.log(`Project invite declined. Notification sent to project manager.`)
      alert('You have declined the project invite. The project manager has been notified.')
      
      // Refresh notifications
      if (typeof refreshNotifications === 'function') {
        refreshNotifications()
      }
    } catch (error) {
      console.error('Error declining project invite:', error)
      alert('Failed to decline invite. Please try again.')
    }
  }

  // Send invitations to newly added team members using proper backend invitation system
  const sendTeamMemberNotifications = async (newTeamMembers, projectName) => {
    try {
      for (const member of newTeamMembers) {
        // Use the proper backend invitation endpoint
        const inviteRes = await authFetch(`/api/projects/${projectId}/invite_member/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: member.email })
        })
        
        if (inviteRes.ok) {
          console.log(`Invitation sent to ${member.email} for project ${projectName}`)
        } else {
          console.error(`Failed to send invitation to ${member.email}:`, await inviteRes.text())
        }
      }
    } catch (error) {
      console.error('Error sending invitations:', error)
    }
  }

  // Send notification to assigned reporter
  const sendReporterNotification = async (reporterEmail, projectId, projectName) => {
    try {
      // First, find the user by email to get their ID
      const userRes = await authFetch(`/api/users/search/?email=${encodeURIComponent(reporterEmail)}`)
      if (!userRes.ok) {
        console.error(`Failed to find user with email ${reporterEmail}`)
        return
      }
      
      const users = await userRes.json()
      if (users.length === 0) {
        console.error(`No user found with email ${reporterEmail}`)
        return
      }
      
      const reporter = users[0]
      
      const notificationData = {
        type: 'PROJECT_REPORTER_ASSIGNED',
        recipient_id: reporter.id,
        payload: {
          project_id: projectId,
          project_name: projectName,
          assigned_by: localStorage.getItem('userEmail'),
          assigned_at: new Date().toISOString(),
          message: `You have been assigned as a reporter to the project "${projectName}".`
        }
      }
      
      const res = await authFetch('/api/notifications/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      })
      
      if (res.ok) {
        console.log(`Reporter notification sent to ${reporterEmail}`)
      } else {
        console.error(`Failed to send reporter notification to ${reporterEmail}:`, res.status)
      }
    } catch (error) {
      console.error(`Error sending reporter notification to ${reporterEmail}:`, error)
    }
  }

  // Save project updates
  async function saveProjectUpdates(e) {
    e.preventDefault()
    setIsSavingProject(true)
    try {
      // Get current team emails
      const currentTeamString = projectInfo.team || ''
      const currentTeamEmails = currentTeamString ? currentTeamString.split(',').map(email => email.trim()).filter(email => email) : []
      
      // Get new team emails
      const newTeamEmails = editFormData.team.map(user => user.email)
      
      // Find newly added team members
      const newlyAddedEmails = newTeamEmails.filter(email => !currentTeamEmails.includes(email))
      const newlyAddedMembers = editFormData.team.filter(user => newlyAddedEmails.includes(user.email))
      
      // Get current and new reporter
      const currentReporter = projectInfo.reporter ? projectInfo.reporter.email : null
      const newReporter = editFormData.reporter && editFormData.reporter.length > 0 ? editFormData.reporter[0].email : null
      const reporterChanged = currentReporter !== newReporter
      
      console.log('Current team emails:', currentTeamEmails)
      console.log('New team emails:', newTeamEmails)
      console.log('Newly added members:', newlyAddedMembers)
      console.log('Current reporter:', currentReporter)
      console.log('New reporter:', newReporter)
      console.log('Reporter changed:', reporterChanged)
      
      const form = new FormData()
      form.append('name', editFormData.name.trim())
      form.append('description', editFormData.description.trim())
      if (editFormData.start_date) form.append('start_date', editFormData.start_date)
      if (editFormData.due_date) form.append('due_date', editFormData.due_date)
      if (editFormData.reporter && editFormData.reporter.length > 0) {
        form.append('reporter_id', editFormData.reporter[0].id)
      }
      
      // Send team members as comma-separated emails (same format as backend expects)
      if (editFormData.team && editFormData.team.length > 0) {
        form.append('team', editFormData.team.map(user => user.email).join(','))
        console.log('Sending team emails as:', editFormData.team.map(user => user.email).join(','))
      }
      
      const res = await authFetch(`/api/projects/${projectId}/`, {
        method: 'PATCH',
        body: form
      })

      if (res.ok) {
        const updatedProject = await res.json()
        console.log('Updated project data:', updatedProject)
        console.log('All fields in response:', Object.keys(updatedProject))
        console.log('Assignees in response:', updatedProject.assignees)
        console.log('Team members in response:', updatedProject.team_members)
        console.log('Team field in response:', updatedProject.team)
        console.log('Members field in response:', updatedProject.members)
        setProjectInfo(updatedProject)
        setIsEditingProject(false)
        
        // Send notifications to newly added team members
        if (newlyAddedMembers.length > 0) {
          await sendTeamMemberNotifications(newlyAddedMembers, projectId, editFormData.name)
        }
        
        // Send notification to newly assigned reporter
        if (reporterChanged && newReporter) {
          await sendReporterNotification(newReporter, projectId, editFormData.name)
        }
        
        if (newlyAddedMembers.length > 0 || reporterChanged) {
          alert(`Project updated successfully! Notifications sent.`)
        } else {
          alert('Project updated successfully!')
        }
      } else {
        const errorText = await res.text()
        console.error('Update failed:', res.status, errorText)
        alert(`Failed to update project: ${res.status} - ${errorText}`)
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setIsSavingProject(false)
    }
  }
  async function inviteMember(e) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    
    // Additional safety check - only project owners can invite members
    if (!isProjectOwner()) {
      alert('Only project owners can invite members.')
      return
    }
    
    setIsInviting(true)
    try {
      const res = await authFetch(`/api/projects/${projectId}/invite_member/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() })
      })
      
      if (res.ok) {
        const data = await res.json()
        
        // Add notification for project invitation
        const notification = createNotification(
          'PROJECT_INVITE',
          `You have been invited to join the project "${projectInfo?.name || 'this project'}"`
        )
        addNotification(notification)
        
        alert(data.detail)
        setInviteEmail('')
        setInviteOpen(false)
      } else {
        try {
          const errorData = await res.json()
          alert(errorData.detail || 'Failed to send invitation')
        } catch {
          alert('Failed to send invitation')
        }
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setIsInviting(false)
    }
  }

  async function loadTeamMembers() {
    try {
      const res = await authFetch(`/api/projects/${projectId}/members/`)
      if (res && res.ok) {
        const data = await res.json()
        console.log('Team members loaded:', data)
        setTeamMembers(data)
      } else {
        console.error('Failed to load team members')
        setTeamMembers([])
      }
    } catch (error) {
      console.error('Error loading team members:', error)
      setTeamMembers([])
    }
  }

  // Analytics derived metrics
  const now = new Date()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const sevenDaysAgo = new Date(now.getTime() - sevenDaysMs)
  const inSevenDays = new Date(now.getTime() + sevenDaysMs)
  const tasksForProject = tasks
  const doneLast7 = tasksForProject.filter(t => {
    if (t.status !== 'DONE') return false
    if (t.completed_at) return new Date(t.completed_at) >= sevenDaysAgo
    // fallback if completed_at not exposed by API
    return t.updated_at && new Date(t.updated_at) >= sevenDaysAgo
  }).length
  const updatedLast7 = tasksForProject.filter(t => t.updated_at && new Date(t.updated_at) >= sevenDaysAgo).length
  const createdLast7 = tasksForProject.filter(t => t.created_at && new Date(t.created_at) >= sevenDaysAgo).length
  const dueNext7 = tasksForProject.filter(t => t.due_at && new Date(t.due_at) >= now && new Date(t.due_at) <= inSevenDays && t.status !== 'DONE').length
  const byStatus = {
    TO_DO: tasksForProject.filter(t => t.status === 'TO_DO').length,
    IN_PROGRESS: tasksForProject.filter(t => t.status === 'IN_PROGRESS').length,
    REVIEW: tasksForProject.filter(t => t.status === 'REVIEW').length,
    DONE: tasksForProject.filter(t => t.status === 'DONE').length,
  }
  const statusMeta = {
    TO_DO: { label: 'To Do', color: '#9ca3af' },
    IN_PROGRESS: { label: 'In Progress', color: '#3b82f6' },
    REVIEW: { label: 'Review', color: '#f59e0b' },
    DONE: { label: 'Done', color: '#10b981' },
  }
  const totalCount = byStatus.TO_DO + byStatus.IN_PROGRESS + byStatus.REVIEW + byStatus.DONE
  const donutRadius = 70
  const donutC = 2 * Math.PI * donutRadius
  const statusOrder = ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE']
  let accLen = 0
  const donutSegs = statusOrder.map(k => {
    const value = byStatus[k]
    const segLen = totalCount > 0 ? (value / totalCount) * donutC : 0
    const start = accLen
    accLen += segLen
    return { key: k, len: segLen, offset: donutC - start, color: statusMeta[k].color }
  })

  async function loadTasks() {
    const res = await authFetch('/api/tasks/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const all = await res.json()
    setTasks(all.filter(t => t.project === projectId))
  }

  useEffect(() => { loadTasks() }, [projectId])
  useEffect(() => {
    ;(async () => {
      try {
        const res = await authFetch(`/api/projects/${projectId}/`)
        if (res && res.ok) {
          const data = await res.json()
          setProjectInfo(data)
        }
      } catch {}
    })()
  }, [projectId])

  // Initialize notification system
  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])
  useEffect(() => {
    if (teamMembersOpen) {
      loadTeamMembers()
    }
  }, [teamMembersOpen, projectId])
  useEffect(() => { try { localStorage.setItem('lastProjectId', String(projectId)) } catch {} }, [projectId])
  // record recently viewed project
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem('recentProjectIds') || '[]')
      const next = [projectId, ...arr.filter((x)=>x!==projectId)].slice(0, 8)
      localStorage.setItem('recentProjectIds', JSON.stringify(next))
    } catch {}
  }, [projectId])

  async function loadTaskDetail(taskId) {
    const [tr, cr] = await Promise.all([
      authFetch(`/api/tasks/${taskId}/`),
      authFetch(`/api/tasks/${taskId}/comments/`),
    ])
    const task = await tr.json()
    const comms = await cr.json()
    setDetail(task)
    setComments(comms)
  }

  async function createTask(e) {
    e.preventDefault()
    
    console.log('Form submitted!', { title, projectId, token: !!token })
    
    // Validate input
    if (!title.trim()) {
      console.error('Task title is required')
      alert('Please enter a task title')
      return
    }
    
    if (!token) {
      console.error('No authentication token')
      alert('Please log in to create tasks')
      return
    }
    
    setIsCreatingTask(true)
    console.log('Creating task:', { project: projectId, title: title.trim() })
    
    try {
      const requestBody = { project: projectId, title: title.trim() }
      console.log('Request body:', requestBody)
      
    const res = await authFetch('/api/tasks/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    })
      
      console.log('Response status:', res.status)
      console.log('Response ok:', res.ok)
      
    if (res.ok) {
        console.log('Task created successfully')
        
        // Add notification for task creation
        const notification = createNotification(
          'TASK_ASSIGNED',
          `You have been assigned a new task: ${title.trim()}`
        )
        addNotification(notification)
        
      setTitle('')
        await loadTasks()
        alert('Task created successfully!')
      } else {
        console.error('Failed to create task:', res.status, res.statusText)
        try {
          const errorData = await res.text()
          console.error('Error details:', errorData)
          alert(`Failed to create task: ${errorData}`)
        } catch (e) {
          console.error('Could not read error response')
          alert('Failed to create task: Unknown error')
        }
      }
    } catch (error) {
      console.error('Network error creating task:', error)
      alert(`Network error: ${error.message}`)
    } finally {
      setIsCreatingTask(false)
    }
  }

  async function move(taskId, status) {
    const res = await authFetch(`/api/tasks/${taskId}/transition/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (res.ok) {
      const updated = await res.json()
      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))
      
      // Add notification for status change
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        const statusLabels = { TO_DO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done' }
        const notification = createNotification(
          'TASK_STATUS_CHANGED',
          `Task "${task.title}" was updated to ${statusLabels[status] || status}`
        )
        addNotification(notification)
        
        // Special notification for completion
        if (status === 'DONE') {
          const completionNotification = createNotification(
            'TASK_COMPLETED',
            `Task "${task.title}" was marked as Done`
          )
          addNotification(completionNotification)
        }
      }
    }
  }

  function reorder(list, startIndex, endIndex) {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  async function onDragEnd(result) {
    const { source, destination, draggableId } = result
    if (!destination) return
    // Same column reordering (client-side only)
    if (destination.droppableId === source.droppableId) {
      const sameColTasks = tasks.filter(t => t.status === source.droppableId)
      const otherTasks = tasks.filter(t => t.status !== source.droppableId)
      const reordered = reorder(sameColTasks, source.index, destination.index)
      setTasks([...otherTasks, ...reordered])
      return
    }
    // Moved across columns → update status via API
    const taskId = parseInt(draggableId, 10)
    const newStatus = destination.droppableId
    // Optimistic UI update
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)))
    await move(taskId, newStatus)
  }

  async function loadNotifications() {
    try {
      const res = await authFetch('/api/notifications/')
      if (res.ok) {
        const data = await res.json()
        setNotifs(data)
        setNotifOpen(true)
      }
    } catch {}
  }

  function renameColumn(colKey) {
    const current = columnsState.find(c => c.key === colKey)
    const nextTitle = window.prompt('Rename column', current ? current.title : '')
    if (nextTitle && nextTitle.trim()) {
      setColumnsState(prev => prev.map(c => (c.key === colKey ? { ...c, title: nextTitle.trim() } : c)))
    }
    setOpenColMenuKey(null)
  }

  function deleteColumn(colKey) {
    if (!confirm('Delete this column from view?')) { return }
    setColumnsState(prev => prev.filter(c => c.key !== colKey))
    setOpenColMenuKey(null)
  }

  // Track Progress view component (separate to keep Hooks order stable)
  function CalendarView({ tasks, token, projectId }) {
    const storageBase = `board_cal_${projectId}`
    const [filterStatuses, setFilterStatuses] = useState(() => {
      try { const raw = localStorage.getItem(`${storageBase}_statuses`); const arr = JSON.parse(raw||'null'); return Array.isArray(arr)&&arr.length?arr:['TO_DO','IN_PROGRESS','REVIEW','DONE'] } catch { return ['TO_DO','IN_PROGRESS','REVIEW','DONE'] }
    })
    const [filterAssignees, setFilterAssignees] = useState(() => {
      try { const raw = localStorage.getItem(`${storageBase}_assignees`); const arr = JSON.parse(raw||'null'); return Array.isArray(arr)?arr:[] } catch { return [] }
    })
    const [monthStart, setMonthStart] = useState(() => {
      try { const raw = localStorage.getItem(`${storageBase}_month`); if (raw) { const dt = new Date(raw); if (!isNaN(dt)) return new Date(dt.getFullYear(), dt.getMonth(), 1) } } catch {}
      const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1)
    })
    const [selectedDate, setSelectedDate] = useState(() => { try { return localStorage.getItem(`${storageBase}_date`) || '' } catch { return '' } })

    useEffect(() => { try { localStorage.setItem(`${storageBase}_statuses`, JSON.stringify(filterStatuses)) } catch {} }, [filterStatuses])
    useEffect(() => { try { const compact = filterAssignees.map(a=>({ id:a.id, email:a.email, first_name:a.first_name, last_name:a.last_name, name:a.name })) ; localStorage.setItem(`${storageBase}_assignees`, JSON.stringify(compact)) } catch {} }, [filterAssignees])
    useEffect(() => { try { localStorage.setItem(`${storageBase}_month`, monthStart.toISOString()) } catch {} }, [monthStart])
    useEffect(() => { try { localStorage.setItem(`${storageBase}_date`, selectedDate||'') } catch {} }, [selectedDate])

    const statusColor = { TO_DO: '#9ca3af', IN_PROGRESS: '#3b82f6', REVIEW: '#f59e0b', DONE: '#10b981' }
    const statusLabel = { TO_DO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done' }
    const fmt = (d) => d.toISOString().slice(0,10)
    const endOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth()+1, 0)
    const daysInMonth = endOfMonth.getDate()
    const startWeekday = monthStart.getDay()
    const todayKey = new Date().toISOString().slice(0,10)

    const assigneeMatch = (t) => {
      if (!filterAssignees.length) return true
      const ids = new Set(filterAssignees.map(a => a.id))
      if (t.assignee && ids.has(t.assignee.id)) return true
      if (Array.isArray(t.assignees)) {
        for (const u of t.assignees) { if (ids.has(u.id)) return true }
      }
      return false
    }
    
    // Apply both status and assignee filters
    const filtered = tasks.filter(t => {
      const statusMatch = filterStatuses.includes(t.status)
      const assigneeMatchResult = assigneeMatch(t)
      return statusMatch && assigneeMatchResult
    })
    
    // Group filtered tasks by date
    const byDate = filtered.reduce((acc, t) => {
      const k = t.due_at ? fmt(new Date(t.due_at)) : ''
      if (!k) return acc
      if (!acc[k]) acc[k] = []
      acc[k].push(t)
      return acc
    }, {})


    const monthLabel = monthStart.toLocaleString(undefined, { month: 'long', year: 'numeric' })
    const goToToday = () => {
      const d = new Date()
      setMonthStart(new Date(d.getFullYear(), d.getMonth(), 1))
      setSelectedDate(d.toISOString().slice(0,10))
    }
    const resetFilters = () => {
      setFilterStatuses(['TO_DO','IN_PROGRESS','REVIEW','DONE'])
      setFilterAssignees([])
      const d = new Date()
      setMonthStart(new Date(d.getFullYear(), d.getMonth(), 1))
      setSelectedDate('')
      try {
        localStorage.removeItem(`${storageBase}_statuses`)
        localStorage.removeItem(`${storageBase}_assignees`)
        localStorage.removeItem(`${storageBase}_month`)
        localStorage.removeItem(`${storageBase}_date`)
      } catch {}
    }
    
    const clearDateSelection = () => {
      setSelectedDate('')
    }

    return (
      <div style={{ background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, padding: 12, width: 'min(820px, 96vw)', margin: '32px auto 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, color: '#e5e7eb' }}>Calendar</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" className="btn ghost" onClick={() => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth()-1, 1))} style={{ borderColor: 'var(--border)', color: '#e5e7eb' }}>◀</button>
            <div style={{ color: '#e5e7eb', minWidth: 140, textAlign: 'center' }}>{monthLabel}</div>
            <button type="button" className="btn ghost" onClick={() => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth()+1, 1))} style={{ borderColor: 'var(--border)', color: '#e5e7eb' }}>▶</button>
            <button type="button" className="btn ghost" onClick={goToToday} style={{ borderColor: 'var(--border)', color: '#e5e7eb' }}>Today</button>
            {selectedDate && (
              <button type="button" className="btn ghost" onClick={clearDateSelection} style={{ borderColor: 'var(--border)', color: '#e5e7eb' }}>Clear Date</button>
            )}
            <button type="button" className="btn ghost" onClick={resetFilters} style={{ borderColor: 'var(--border)', color: '#e5e7eb' }}>Reset</button>
          </div>
        </div>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: '#e5e7eb', fontSize: 12, fontWeight: 600 }}>Status Filter</label>
            <StatusMultiSelect 
              value={filterStatuses} 
              onChange={setFilterStatuses} 
              statusColor={statusColor} 
              statusLabel={statusLabel} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: '#e5e7eb', fontSize: 12, fontWeight: 600 }}>Assignee Filter</label>
            <div style={{ width: 280 }}>
              <AssigneeMultiSelect token={token} value={filterAssignees} onChange={setFilterAssignees} placeholder="Search assignees..." />
            </div>
          </div>
        </div>

        {/* Track Progress */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (<div key={d} style={{ textAlign: 'center' }}>{d}</div>))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {Array.from({ length: startWeekday }).map((_,i)=>(<div key={`pad-${i}`} style={{ minHeight: 50 }} />))}
          {Array.from({ length: daysInMonth }).map((_,i)=>{
            const day = i+1
            const key = fmt(new Date(monthStart.getFullYear(), monthStart.getMonth(), day))
            const list = byDate[key] || []
            const isSelected = selectedDate === key
            const isToday = key === todayKey
            const hasTasks = list.length > 0
            
            return (
              <button 
                key={key} 
                type="button" 
                onClick={()=>setSelectedDate(key)} 
                style={{ 
                  background: isSelected ? '#1e3a8a' : (isToday ? '#fbbf24' : '#0f1025'), 
                  border: `1px solid ${isSelected ? '#3b82f6' : (isToday ? '#f59e0b' : 'var(--border)')}`, 
                  borderRadius: 8, 
                  minHeight: 60, 
                  padding: 8, 
                  cursor: 'pointer', 
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && !isToday) {
                    e.target.style.background = '#1a1b2e'
                    e.target.style.borderColor = '#4b5563'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected && !isToday) {
                    e.target.style.background = '#0f1025'
                    e.target.style.borderColor = 'var(--border)'
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ 
                    color: isToday ? '#1f2937' : '#e5e7eb', 
                    fontWeight: isToday ? 700 : (isSelected ? 600 : 500),
                    fontSize: isToday ? 16 : 14
                  }}>
                    {day}
                  </span>
                  {isSelected && (
                    <span style={{ color: '#3b82f6', fontSize: 12 }}>✓</span>
                  )}
                </div>
                
                {/* Task Status Indicators */}
                <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', maxWidth: 48 }}>
                  {Array.from(new Set(list.map(t=>t.status))).slice(0,4).map((s,idx)=>(
                    <span 
                      key={idx} 
                      style={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: 3, 
                        background: statusColor[s],
                        opacity: isSelected ? 1 : 0.7
                      }} 
                    />
                  ))}
                  {list.length > 4 && (
                    <span style={{ color: '#9ca3af', fontSize: 10 }}>+{list.length - 4}</span>
                  )}
                  </div>
                
                {/* Task Count */}
                {hasTasks && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 4, 
                    right: 4, 
                    background: isSelected ? '#3b82f6' : '#374151', 
                    color: '#fff', 
                    borderRadius: 8, 
                    padding: '2px 6px', 
                    fontSize: 10,
                    fontWeight: 600
                  }}>
                    {list.length}
                </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Task List Display */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h4 style={{ margin: 0, color: '#e5e7eb', fontSize: 16 }}>
                {selectedDate ? `Tasks for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'All Tasks'}
              </h4>
              {/* Active Filters Indicator */}
              {(filterAssignees.length > 0 || filterStatuses.length < 4) && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: '#9ca3af', fontSize: 11 }}>Filters:</span>
                  {filterAssignees.length > 0 && (
                    <span style={{ 
                      background: '#1e3a8a', 
                      color: '#e5e7eb', 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      fontSize: 10 
                    }}>
                      {filterAssignees.length} assignee{filterAssignees.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {filterStatuses.length < 4 && (
                    <span style={{ 
                      background: '#1e3a8a', 
                      color: '#e5e7eb', 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      fontSize: 10 
                    }}>
                      {filterStatuses.length} status{filterStatuses.length > 1 ? 'es' : ''}
                    </span>
                  )}
                  </div>
              )}
            </div>
            <div style={{ color: '#9ca3af', fontSize: 12 }}>
              {(() => {
                const displayTasks = selectedDate ? (byDate[selectedDate] || []) : filtered;
                return `${displayTasks.length} task${displayTasks.length !== 1 ? 's' : ''}`;
              })()}
            </div>
          </div>
          
          {(() => {
            // Get tasks to display based on whether a date is selected
            const displayTasks = selectedDate ? (byDate[selectedDate] || []) : filtered;
            
            // Debug info (you can remove this later)
            console.log('Filter Debug:', {
              selectedDate,
              filterStatuses,
              filterAssignees: filterAssignees.map(a => a.name || a.email),
              totalTasks: tasks.length,
              filteredTasks: filtered.length,
              displayTasks: displayTasks.length,
              byDateKeys: Object.keys(byDate)
            });
            
            if (displayTasks.length === 0) {
              return (
                <div style={{ 
                  marginTop: 8, 
                  color: '#9ca3af', 
                  display: 'grid', 
                  placeItems: 'center', 
                  padding: 40,
                  background: '#0f1025',
                  border: '1px solid var(--border)',
                  borderRadius: 12
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No tasks found</div>
                  <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
                    {selectedDate 
                      ? `No tasks found for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} with the selected filters.`
                      : 'There are no matching tasks for the selected filters.'
                    }
                  </div>
                </div>
              );
            }
            
            return (
              <div style={{ display: 'grid', gap: 12 }}>
                {displayTasks.map(t => (
                  <div key={t.id} style={{ 
                    background: '#0f1025', 
                    border: '1px solid var(--border)', 
                    borderRadius: 12, 
                    padding: 16,
                    display: 'grid',
                    gap: 12
                  }}>
                    {/* Task Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ color: '#e5e7eb', fontWeight: 600, fontSize: 16 }}>{t.title}</div>
                        <div style={{ color: '#9ca3af', fontSize: 12 }}>
                          Project: {(t.project_key ? t.project_key.toUpperCase() : 'PRJ')}-{(typeof t.sequence==='number'&&t.sequence>0)?t.sequence:t.id}
                        </div>
                      </div>
                      <span style={{ 
                        background: statusColor[t.status], 
                        color: '#0f1025', 
                        borderRadius: 8, 
                        padding: '4px 8px', 
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {statusLabel[t.status] || t.status}
                      </span>
                    </div>
                    
                    {/* Task Details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>Assignee:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {(() => {
                            // Get unique assignees to avoid duplicates
                            const assignees = []
                            const seenIds = new Set()
                            
                            // Add single assignee if exists
                            if (t.assignee && !seenIds.has(t.assignee.id)) {
                              assignees.push(t.assignee)
                              seenIds.add(t.assignee.id)
                            }
                            
                            // Add multiple assignees if they exist
                            if (Array.isArray(t.assignees)) {
                              t.assignees.forEach(u => {
                                if (u && !seenIds.has(u.id)) {
                                  assignees.push(u)
                                  seenIds.add(u.id)
                                }
                              })
                            }
                            
                            return assignees.slice(0, 3).map((u, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span 
                                  title={`${u.name || (u.first_name||'') + ' ' + (u.last_name||'')} (${u.email})`} 
                                  style={{ 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: 12, 
                                    background: '#21375f', 
                                    color: '#a78bfa', 
                                    display: 'grid', 
                                    placeItems: 'center', 
                                    fontWeight: 800,
                                    fontSize: 12
                                  }}
                                >
                          {(u.first_name||u.email||'?')[0]?.toUpperCase?.()||'?'}
                        </span>
                                <span style={{ color: '#e5e7eb', fontSize: 12 }}>
                                  {u.name || (u.first_name||'') + ' ' + (u.last_name||'')}
                                </span>
                    </div>
                            ))
                          })()}
                  </div>
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: 12 }}>
                        Deadline: {t.due_at ? new Date(t.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            );
          })()}
        </div>
      </div>
    )
  }

  // Enhanced WhatsApp-style Project Chat
  function ProjectChat({ projectId, token, projectInfo, inline = false }) {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [file, setFile] = useState(null)
    const [members, setMembers] = useState([])
    const [mentionOpen, setMentionOpen] = useState(false)
    const [mentionQuery, setMentionQuery] = useState('')
    const [lastTs, setLastTs] = useState('')
    const [hasUnread, setHasUnread] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [typingUsers, setTypingUsers] = useState([])
    const [onlineUsers, setOnlineUsers] = useState(new Set())
    const [pinnedMessages, setPinnedMessages] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [isSending, setIsSending] = useState(false)

    // Get current user info
    useEffect(() => {
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          setCurrentUser({ id: payload.user_id })
        } catch (error) {
          console.error('Error parsing token:', error)
        }
      }
    }, [token])

    useEffect(() => {
      // load members of project for mentions
      ;(async () => {
        const res = await authFetch(`/api/projects/${projectId}/`)
        if (res && res.ok) {
          const p = await res.json()
          const teamEmails = (p.team || '').split(',').map(s=>s.trim()).filter(Boolean)
          const arr = []
          for (const email of teamEmails) { arr.push({ id: email, email, name: email }) }
          if (p.created_by) { arr.push({ id: p.created_by.id, email: p.created_by.email, name: p.created_by.email }) }
          setMembers(arr)
        }
      })()
    }, [projectId])

    const fetchNew = useCallback(async () => {
      const url = lastTs ? `/api/project-chat/?project=${projectId}&after=${encodeURIComponent(lastTs)}` : `/api/project-chat/?project=${projectId}`
      const res = await authFetch(url)
      if (res && res.ok) {
        const data = await res.json()
        console.log('Fetched messages from API:', data.map(m => ({
          id: m.id,
          text: m.text?.substring(0, 20),
          pinned: m.pinned,
          sender: m.sender?.email
        })))
        if (Array.isArray(data) && data.length) {
          setMessages(prev => {
            // Create a Set of existing message IDs to prevent duplicates
            const existingIds = new Set(prev.map(m => m.id))
            const newMessages = data.filter(m => !existingIds.has(m.id))
            return [...prev, ...newMessages]
          })
          const ts = data[data.length-1].created_at
          if (ts) setLastTs(ts)
          // flag unread if panel is closed
          if (!open) {
            setHasUnread(true)
          }
        }
      }
    }, [projectId, lastTs, open])

    useEffect(() => {
      if (!open) return
      fetchNew()
      const id = setInterval(fetchNew, 3000)
      return () => clearInterval(id)
    }, [open]) // Remove fetchNew from dependencies to prevent re-creation

    // background lightweight checker for unread when closed
    useEffect(() => {
      const check = async () => {
        try {
          const seen = localStorage.getItem(`chat_last_seen_${projectId}`) || ''
          const url = seen ? `/api/project-chat/?project=${projectId}&after=${encodeURIComponent(seen)}` : `/api/project-chat/?project=${projectId}`
          const res = await authFetch(url)
          if (res && res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length && !open) {
              setHasUnread(true)
            }
          }
        } catch {}
      }
      const id = setInterval(check, 10000)
      return () => clearInterval(id)
    }, [projectId, open])

    const send = async () => {
      if ((!text && !file) || isSending) return
      
      setIsSending(true)
      try {
        const form = new FormData()
        form.append('project', projectId)
        if (text) form.append('text', text)
        if (file) form.append('file', file)
        
        const res = await authFetch('/api/project-chat/', { method: 'POST', body: form })
        if (res && res.ok) {
          setText('')
          setFile(null)
          setMentionOpen(false)
          setMentionQuery('')
          setLastTs('')
          // Clear the file input
          const fileInput = document.getElementById('file-input')
          if (fileInput) fileInput.value = ''
          // Don't call fetchNew immediately - let the polling handle it
        }
      } catch (error) {
        console.error('Error sending message:', error)
      } finally {
        setIsSending(false)
      }
    }

    const onKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        send()
      }
      if (e.key === '@') {
        setMentionOpen(true); setMentionQuery('')
      }
    }

    const onChangeText = (e) => {
      const v = e.target.value
      setText(v)
      const atIndex = v.lastIndexOf('@')
      if (atIndex !== -1) {
        const q = v.slice(atIndex + 1).trim()
        setMentionOpen(true)
        setMentionQuery(q)
      } else {
        setMentionOpen(false)
      }
    }

    const filteredMembers = members.filter(m => (m.email||'').toLowerCase().startsWith((mentionQuery||'').toLowerCase())).slice(0,6)

    const applyMention = (m) => {
      const atIndex = text.lastIndexOf('@')
      const before = text.slice(0, atIndex + 1)
      const after = ''
      setText(`${before}${m.email} ${after}`)
      setMentionOpen(false)
    }

    // Format time for display
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Format date for grouping
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
      } else {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    }

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
      const date = formatDate(message.created_at)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    }, {})

    // Filter messages based on search
    const filteredMessages = searchQuery 
      ? messages.filter(m => 
          (m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (m.sender?.email && m.sender.email.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : messages

    // Check if message is from current user
    const isCurrentUser = (message) => {
      if (!currentUser || !message.sender) return false
      return message.sender.id === currentUser.id
    }

    // Get first letter for profile icon
    const getProfileLetter = (email) => {
      return (email || '?')[0]?.toUpperCase() || '?'
    }

    // Check if current user is project owner
    const isProjectOwner = () => {
      if (!currentUser || !projectInfo) {
        console.log('isProjectOwner: false - missing currentUser or projectInfo', { currentUser: !!currentUser, projectInfo: !!projectInfo })
        return false
      }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentUserId = payload.user_id
        const isOwner = projectInfo.created_by && projectInfo.created_by.id === currentUserId
        console.log('isProjectOwner check:', {
          currentUserId,
          projectOwnerId: projectInfo.created_by?.id,
          isOwner
        })
        return isOwner
      } catch (error) {
        console.log('isProjectOwner: false - token parsing error', error)
        return false
      }
    }

    // Pin/Unpin message functions
    const pinMessage = async (messageId) => {
      console.log('Attempting to pin message:', messageId, 'isProjectOwner:', isProjectOwner())
      try {
        const res = await authFetch(`/api/project-chat/${messageId}/pin_message/`, {
          method: 'POST'
        })
        console.log('Pin response:', res?.status, res?.ok)
        if (res && res.ok) {
          console.log('Message pinned successfully, refreshing...')
          fetchNew() // Refresh messages
        } else {
          const errorData = await res.json()
          console.error('Pin error:', errorData)
        }
      } catch (error) {
        console.error('Error pinning message:', error)
      }
    }

    const unpinMessage = async (messageId) => {
      console.log('Attempting to unpin message:', messageId, 'isProjectOwner:', isProjectOwner())
      try {
        const res = await authFetch(`/api/project-chat/${messageId}/unpin_message/`, {
          method: 'POST'
        })
        console.log('Unpin response:', res?.status, res?.ok)
        if (res && res.ok) {
          console.log('Message unpinned successfully, refreshing...')
          fetchNew() // Refresh messages
        } else {
          const errorData = await res.json()
          console.error('Unpin error:', errorData)
        }
      } catch (error) {
        console.error('Error unpinning message:', error)
      }
    }

    // Render message component
    const renderMessage = (message) => {
      const isOwn = isCurrentUser(message)
      const isPinned = message.pinned === true
      
      console.log('Rendering message:', {
        id: message.id,
        text: message.text?.substring(0, 20),
        pinned: message.pinned,
        isPinned: isPinned,
        isOwn: isOwn,
        isProjectOwner: isProjectOwner()
      })
      
      return (
        <div key={message.id} style={{ 
          display: 'flex', 
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          marginBottom: 8,
          alignItems: 'flex-end',
          position: 'relative'
        }}>
          {!isOwn && (
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 16, 
              background: '#e5e7eb', 
              color: '#374151', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 600,
              marginRight: 8,
              position: 'relative'
            }}>
              {getProfileLetter(message.sender?.email)}
              {onlineUsers.has(message.sender?.id) && (
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: '#10b981',
                  border: '2px solid white'
                }} />
              )}
            </div>
          )}
          
          <div style={{ maxWidth: '70%', position: 'relative' }}>
            {!isOwn && (
              <div style={{ 
                fontSize: 12, 
                color: '#6b7280', 
                marginBottom: 2,
                fontWeight: 500
              }}>
                {message.sender?.email || 'Unknown'}
              </div>
            )}
            
            <div style={{
              background: isPinned ? '#fff3cd' : (isOwn ? '#dcf8c6' : '#ffffff'),
              color: isPinned ? '#856404' : (isOwn ? '#1f2937' : '#1f2937'),
              padding: '8px 12px',
              borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              wordWrap: 'break-word',
              position: 'relative',
              border: isPinned ? '1px solid #ffeaa7' : (isOwn ? '1px solid #d1fae5' : '1px solid #e5e7eb'),
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {isPinned && (
                <div style={{
                  fontSize: 10,
                  color: '#856404',
                  fontWeight: 600,
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  📌 Pinned
                </div>
              )}
              
              {message.text && (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </div>
              )}
              
              {message.file && (
                <div style={{ marginTop: message.text ? 8 : 0 }}>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 12,
                      background: isOwn ? 'rgba(255,255,255,0.2)' : '#f8fafc',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => {
                      // Create download link
                      const link = document.createElement('a')
                      link.href = message.file
                      link.download = message.file_name || 'attachment'
                      link.target = '_blank'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = isOwn ? 'rgba(255,255,255,0.3)' : '#f1f5f9'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = isOwn ? 'rgba(255,255,255,0.2)' : '#f8fafc'
                    }}
                  >
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 8, 
                      background: '#3b82f6', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: 12
                    }}>
                      {(() => {
                        const fileName = message.file_name || 'file'
                        const extension = fileName.split('.').pop()?.toLowerCase()
                        
                        // Different icons for different file types
                        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>
                          )
                        } else if (['pdf'].includes(extension)) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                          )
                        } else if (['doc', 'docx'].includes(extension)) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                          )
                        } else if (['xls', 'xlsx'].includes(extension)) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                          )
                        } else if (['zip', 'rar', '7z'].includes(extension)) {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                          )
                        } else {
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                          )
                        }
                      })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 600, 
                        color: isOwn ? '#ffffff' : '#1f2937',
                        fontSize: 14,
                        marginBottom: 2
                      }}>
                        {message.file_name || 'Attachment'}
                      </div>
                      <div style={{ 
                        fontSize: 12, 
                        color: isOwn ? 'rgba(255,255,255,0.8)' : '#6b7280'
                      }}>
                        Click to download
                      </div>
                    </div>
                    <div style={{ 
                      color: isOwn ? 'rgba(255,255,255,0.8)' : '#6b7280',
                      fontSize: 12
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{
                fontSize: 10,
                color: isOwn ? '#6b7280' : '#9ca3af',
                marginTop: 4,
                textAlign: 'right',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{formatTime(message.created_at)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isOwn && (
                    <span style={{ marginLeft: 4 }}>
                      ✓✓
                    </span>
                  )}
                  {!isPinned && (
                    <button
                      onClick={() => {
                        console.log('Pin button clicked for message:', message.id, 'isProjectOwner:', isProjectOwner())
                        if (isProjectOwner()) {
                          pinMessage(message.id)
                        } else {
                          alert('Only project owners can pin messages')
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 4,
                        opacity: 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Pin message"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                        <path d="M12 17l-6 6V3h12v20l-6-6z"/>
                      </svg>
                    </button>
                  )}
                  {isPinned && (
                    <button
                      onClick={() => {
                        console.log('Unpin button clicked for message:', message.id, 'isProjectOwner:', isProjectOwner())
                        if (isProjectOwner()) {
                          unpinMessage(message.id)
                        } else {
                          alert('Only project owners can unpin messages')
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 4,
                        opacity: 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Unpin message"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2">
                        <path d="M12 17l-6 6V3h12v20l-6-6z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <>
        <button
          type="button"
          onClick={() => { const nowOpen = !open; setOpen(nowOpen); if (nowOpen) { setHasUnread(false); try { const last = (messages[messages.length-1]?.created_at)||''; if (last) localStorage.setItem(`chat_last_seen_${projectId}`, last) } catch {} } }}
          title="Project Chat"
          style={inline ? { background: 'transparent', color: '#ffffff', border: 'none', borderRadius: 0, width: 'auto', height: 'auto', padding: 4, display: 'inline-grid', placeItems: 'center', cursor: 'pointer', marginRight: 8 }
                         : { position: 'fixed', right: 20, bottom: 20, zIndex: 1000, background: '#7c3aed', color: 'white', border: 'none', borderRadius: 999, width: 46, height: 46, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
        >
          <span style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <svg aria-label="Project chat" width={inline ? 20 : 22} height={inline ? 20 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <path d="M21 15c0 1.66-1.79 3-4 3H9l-4 4v-4H5c-2.21 0-4-1.34-4-3V7c0-1.66 1.79-3 4-3h12c2.21 0 4 1.34 4 3v8z" />
              <circle cx="8" cy="11" r="1" />
              <circle cx="12" cy="11" r="1" />
              <circle cx="16" cy="11" r="1" />
            </svg>
            {hasUnread ? (<span style={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, borderRadius: 6, background: '#ef4444', border: inline ? '2px solid #11132a' : '2px solid #7c3aed' }} />) : null}
          </span>
        </button>
        
        {open ? (
          <div style={{ 
            position: 'fixed', 
            right: 20, 
            bottom: 76, 
            width: 400, 
            height: '70vh', 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: 12, 
            overflow: 'hidden', 
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            {/* Header */}
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid #e5e7eb', 
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 16 }}>Project Chat</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{members.length} members</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
                <button 
                  onClick={() => setOpen(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
                <input 
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />
              </div>
            )}

            {/* Messages Area */}
            <div style={{ 
              flex: 1, 
              padding: '16px 20px', 
              overflowY: 'auto',
              background: '#fafafa'
            }}>
              {/* Pinned Messages Section */}
              {(() => {
                const pinnedMessages = messages.filter(m => m.pinned === true)
                console.log('Pinned messages count:', pinnedMessages.length, 'All messages:', messages.length)
                return pinnedMessages.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: 12,
                      color: '#6b7280',
                      fontWeight: 600,
                      marginBottom: 8,
                      textAlign: 'center'
                    }}>
                      📌 Pinned Messages
                    </div>
                    {pinnedMessages.map(renderMessage)}
                  </div>
                )
              })()}
              
              {/* Regular Messages */}
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div style={{
                    textAlign: 'center',
                    margin: '16px 0',
                    fontSize: 12,
                    color: '#6b7280',
                    fontWeight: 500
                  }}>
                    {date}
                  </div>
                  {dateMessages.filter(m => m.pinned !== true).map(renderMessage)}
                </div>
              ))}
              
              {filteredMessages.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#9ca3af', 
                  marginTop: '50%',
                  fontSize: 14
                }}>
                  {searchQuery ? 'No messages found' : 'No messages yet'}
                </div>
              )}
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div style={{ 
                padding: '8px 20px', 
                background: '#f8fafc',
                borderTop: '1px solid #e5e7eb',
                fontSize: 12,
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* Input Area */}
            <div style={{ 
              padding: '16px 20px', 
              borderTop: '1px solid #e5e7eb',
              background: 'white'
            }}>
              {mentionOpen && filteredMembers.length ? (
                <div style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 8, 
                  padding: 8, 
                  marginBottom: 8,
                  maxHeight: 120,
                  overflowY: 'auto'
                }}>
                  {filteredMembers.map(m => (
                    <button 
                      key={m.email} 
                      type="button" 
                      onClick={()=>applyMention(m)} 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        textAlign: 'left', 
                        color: '#374151', 
                        cursor: 'pointer', 
                        padding: '4px 8px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 4
                      }}
                    >
                      <span style={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: 10, 
                        background: '#e5e7eb', 
                        color: '#374151', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 600, 
                        marginRight: 8,
                        fontSize: 12
                      }}>
                        {getProfileLetter(m.email)}
                      </span>
                      {m.email}
                    </button>
                  ))}
                </div>
              ) : null}
              
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea 
                    value={text} 
                    onChange={onChangeText} 
                    onKeyDown={onKeyDown} 
                    placeholder="Type a message..." 
                    rows={1}
                    style={{ 
                      width: 'calc(100% - 20px)',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: 20,
                      resize: 'none',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      marginRight: 8
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input 
                    type="file" 
                    onChange={e=>setFile(e.target.files?.[0]||null)}
                    style={{ display: 'none' }}
                    id="file-input"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.7z,.txt,.csv"
                  />
                  <label 
                    htmlFor="file-input"
                    style={{ 
                      cursor: 'pointer', 
                      padding: 6,
                      borderRadius: 20,
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s',
                      border: '1px solid #d1d5db',
                      minWidth: 32,
                      height: 32
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e5e7eb'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                    </svg>
                  </label>
                  {file && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 8px',
                      background: '#e0f2fe',
                      borderRadius: 12,
                      fontSize: 12,
                      color: '#0369a1'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFile(null)
                          const fileInput = document.getElementById('file-input')
                          if (fileInput) fileInput.value = ''
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          color: '#dc2626',
                          fontSize: 12
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <button 
                    type="button" 
                    onClick={send}
                    disabled={(!text && !file) || isSending}
                    style={{ 
                      background: (text || file) && !isSending ? '#25d366' : '#d1d5db',
                      color: (text || file) && !isSending ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: (text || file) && !isSending ? 'pointer' : 'not-allowed',
                      boxShadow: (text || file) && !isSending ? '0 2px 4px rgba(37, 211, 102, 0.3)' : 'none',
                      transition: 'all 0.2s ease',
                      opacity: isSending ? 0.7 : 1
                    }}
                  >
                    {isSending ? (
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <div style={{ padding: 16, paddingTop: 72 }}>
      <ProfileButton />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, position: 'relative' }}>
        <a href="/projects" onClick={() => { try { localStorage.setItem('lastProjectId', String(projectId)) } catch {} }}>← Back to Projects</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Inline chat button placed to the left of global 3-dot */}
          <ProjectChat projectId={projectId} token={token} projectInfo={projectInfo} inline />
          
          <button type="button" aria-label="Board menu" onClick={() => setTopMenuOpen(v => !v)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="#ffffff">
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          {topMenuOpen ? (
            <div style={{ position: 'absolute', top: 30, right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 10px 20px rgba(0,0,0,0.08)', zIndex: 20, width: 200 }}>
              <button type="button" onClick={() => { setTopMenuOpen(false); setDetailsOpen(true) }}
                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 12px', cursor: 'pointer', color: '#21375f' }}>Project details</button>
              <button type="button" onClick={() => { setTopMenuOpen(false); setTeamMembersOpen(true) }}
                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 12px', cursor: 'pointer', color: '#21375f' }}>Team Members</button>
              {isProjectOwner() && (
                <button type="button" onClick={() => { setTopMenuOpen(false); setInviteOpen(true) }}
                  style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 12px', cursor: 'pointer', color: '#21375f' }}>Invite Members</button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={() => setActiveTab('BOARD')} style={{ height: 34, padding: '6px 8px', fontWeight: 700, background: 'transparent', border: 'none', color: '#f5f5dc', cursor: 'pointer' }}>Board</button>
        <button type="button" onClick={() => setActiveTab('ANALYTICS')} style={{ height: 34, padding: '6px 8px', fontWeight: 700, background: 'transparent', border: 'none', color: '#f5f5dc', cursor: 'pointer' }}>Analytics</button>
        <button type="button" onClick={() => setActiveTab('CALENDAR')} style={{ height: 34, padding: '6px 8px', fontWeight: 700, background: 'transparent', border: 'none', color: '#f5f5dc', cursor: 'pointer' }}>Track Progress</button>
      </div>

      {/* Track Progress calendar with filters */}
      {activeTab === 'CALENDAR' ? (
        <CalendarView tasks={tasks} token={token} projectId={projectId} />
      ) : null}

      {/* Removed floating chat control to avoid duplicate icons */}

      {detailsOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1200 }}>
          <div style={{ background: '#fff', width: 'min(720px, 96vw)', maxHeight: '90vh', overflow: 'auto', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 16px 40px rgba(0,0,0,0.25)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#6d28d9' }}>Project Details</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {!isEditingProject && (
                  <button 
                    type="button" 
                    onClick={() => setIsEditingProject(true)}
                    className="btn"
                    style={{ 
                      fontSize: 12, 
                      padding: '6px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Edit
                  </button>
                )}
                <button type="button" onClick={() => { setDetailsOpen(false); setIsEditingProject(false) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>✕</button>
              </div>
            </div>
            {!projectInfo ? (
              <div style={{ marginTop: 12 }}>Loading…</div>
            ) : (
              <form onSubmit={isEditingProject ? saveProjectUpdates : undefined}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, width: '100%', marginTop: 12 }}>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Project Name</span>
                    {isEditingProject ? (
                      <input 
                        className="input" 
                        value={editFormData.name}
                        onChange={e => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Project name"
                        required
                      />
                    ) : (
                      <div className="input" style={{ background: '#ffffff', color: 'var(--title)' }}>{projectInfo.name || '-'}</div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Project Description</span>
                    {isEditingProject ? (
                      <textarea 
                        className="input" 
                        rows={4}
                        value={editFormData.description}
                        onChange={e => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Project description"
                      />
                    ) : (
                      <div className="input" style={{ background: '#ffffff', color: 'var(--title)', whiteSpace: 'pre-wrap' }}>{projectInfo.description || '-'}</div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Project Manager</span>
                    <div className="input" style={{ background: '#ffffff', color: 'var(--title)' }}>{(projectInfo.created_by && (projectInfo.created_by.email || `${projectInfo.created_by.first_name||''} ${projectInfo.created_by.last_name||''}`.trim())) || '-'}</div>
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Team</span>
                    {isEditingProject ? (
                      <AssigneeMultiSelect 
                        token={token} 
                        value={editFormData.team}
                        onChange={(team) => setEditFormData(prev => ({ ...prev, team }))}
                        placeholder="Enter assignee's mail id..."
                      />
                    ) : (
                      <div className="input" style={{ background: '#ffffff', color: 'var(--title)', minHeight: '40px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        {(() => {
                          // Handle team as string (comma-separated emails)
                          const teamString = projectInfo.team || ''
                          const teamEmails = teamString ? teamString.split(',').map(email => email.trim()).filter(email => email) : []
                          console.log('Team string:', teamString)
                          console.log('Team emails array:', teamEmails)
                          return teamEmails.length > 0 ? (
                            teamEmails.map((email, index) => (
                              <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                                <span style={{ width: '20px', height: '20px', borderRadius: '10px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                  {email[0]?.toUpperCase()}
                                </span>
                                <span style={{ fontSize: '12px' }}>{email}</span>
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '14px' }}>No team members yet</span>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Start Date</span>
                    {isEditingProject ? (
                      <input 
                        className="input" 
                        type="date"
                        value={editFormData.start_date}
                        onChange={e => setEditFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    ) : (
                      <div className="input" style={{ background: '#ffffff', color: 'var(--title)' }}>{projectInfo.start_date || '-'}</div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Deadline / Due Date</span>
                    {isEditingProject ? (
                      <input 
                        className="input" 
                        type="date"
                        value={editFormData.due_date}
                        onChange={e => setEditFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      />
                    ) : (
                      <div className="input" style={{ background: '#ffffff', color: 'var(--title)' }}>{projectInfo.due_date || '-'}</div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Reporter</span>
                    {isEditingProject ? (
                      <AssigneeMultiSelect 
                        token={token} 
                        value={editFormData.reporter}
                        onChange={(reporter) => setEditFormData(prev => ({ ...prev, reporter }))}
                        placeholder="Enter reporter's mail id..."
                        maxSelections={1}
                      />
                    ) : (
                      <div className="input" style={{ background: '#ffffff', color: 'var(--title)', minHeight: '40px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        {projectInfo.reporter ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                            <span style={{ width: '20px', height: '20px', borderRadius: '10px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                              {projectInfo.reporter.email[0]?.toUpperCase()}
                            </span>
                            <span style={{ fontSize: '12px' }}>{projectInfo.reporter.email}</span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {isEditingProject && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingProject(false)}
                      style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSavingProject}
                      style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      {isSavingProject ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      ) : null}
      
      {/* Invite Members Modal */}
      {inviteOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#21375f' }}>Invite Member</h3>
              <button type="button" onClick={() => setInviteOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={inviteMember}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#6b7280', fontWeight: 600 }}>Email Address</label>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="Enter member's email address"
                  required
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setInviteOpen(false)} className="btn ghost">Cancel</button>
                <button type="submit" disabled={isInviting} className="btn">
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      
      {/* Team Members Modal */}
      {teamMembersOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: '100%', maxWidth: 500, maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#21375f' }}>Team Members</h3>
              <button type="button" onClick={() => setTeamMembersOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#1f2937', fontWeight: 'bold' }}>×</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                All team members assigned to this project
              </p>
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {teamMembers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {teamMembers.map((member, index) => (
                    <div key={member.id || index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: 12, 
                      background: member.role === 'OWNER' ? '#fef3c7' : '#f8fafc', 
                      borderRadius: 8, 
                      border: member.role === 'OWNER' ? '1px solid #f59e0b' : '1px solid #e5e7eb' 
                    }}>
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 20, 
                        background: member.role === 'OWNER' ? '#f59e0b' : '#e5e7eb', 
                        color: member.role === 'OWNER' ? 'white' : '#374151', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 600,
                        marginRight: 12,
                        fontSize: 14
                      }}>
                        {(member.user?.email || member.email || '?')[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#21375f', marginBottom: 2 }}>
                          {member.user?.email || member.email || 'Unknown User'}
                          {member.role === 'OWNER' && (
                            <span style={{ 
                              marginLeft: 8, 
                              background: '#f59e0b', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: 4, 
                              fontSize: 10, 
                              fontWeight: 600 
                            }}>
                              OWNER
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          Role: {member.role === 'OWNER' ? 'Owner' : 'Employee'} • Status: {member.status === 'ACCEPTED' ? 'Active' : member.status || 'Active'}
                        </div>
                        {member.joined_at && (
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                            Joined: {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 40, 
                  color: '#9ca3af' 
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No team members yet</div>
                  <div style={{ fontSize: 14 }}>Invite members to start collaborating on this project</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Notifications Page Modal */}
      {notificationPageOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: '100%', maxWidth: 600, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#21375f' }}>Notifications</h3>
              <button type="button" onClick={() => setNotificationPageOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#1f2937', fontWeight: 'bold' }}>×</button>
            </div>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setNotificationTab('all')}
                style={{
                  padding: '8px 16px',
                  background: notificationTab === 'all' ? '#3b82f6' : 'transparent',
                  color: notificationTab === 'all' ? 'white' : '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setNotificationTab('unread')}
                style={{
                  padding: '8px 16px',
                  background: notificationTab === 'unread' ? '#3b82f6' : 'transparent',
                  color: notificationTab === 'unread' ? 'white' : '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                style={{
                  padding: '6px 12px',
                  background: unreadCount === 0 ? '#f3f4f6' : '#10b981',
                  color: unreadCount === 0 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                  fontWeight: 500
                }}
              >
                Mark All as Read
              </button>
              <button
                type="button"
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
                style={{
                  padding: '6px 12px',
                  background: notifications.length === 0 ? '#f3f4f6' : '#ef4444',
                  color: notifications.length === 0 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: notifications.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                  fontWeight: 500
                }}
              >
                Clear All
              </button>
            </div>
            
            {/* Notifications List */}
            <div style={{ flex: 1, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              {(() => {
                const filteredNotifications = notificationTab === 'unread' 
                  ? notifications.filter(n => !n.isRead)
                  : notifications
                
                if (filteredNotifications.length === 0) {
                  return (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                        {notificationTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                      </div>
                      <div style={{ fontSize: 14 }}>
                        {notificationTab === 'unread' 
                          ? 'All caught up! Check back later for updates.' 
                          : 'You\'ll see notifications here when they arrive.'}
                      </div>
                    </div>
                  )
                }
                
                return filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: notification.isRead ? 'transparent' : '#f8fafc',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.background = notification.isRead ? 'transparent' : '#f8fafc'}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 20, marginTop: 2 }}>{notification.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: 14, 
                          color: '#21375f', 
                          fontWeight: notification.isRead ? 400 : 600,
                          lineHeight: 1.5,
                          marginBottom: 4
                        }}>
                          {notification.message}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                          {formatTimestamp(notification.timestamp)}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#3b82f6',
                          marginTop: 8
                        }} />
                      )}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      ) : null}
      
      <div>
      {activeTab === 'BOARD' ? (
        <>
      <form onSubmit={createTask} style={{ display: 'flex', gap: 8, marginBottom: 16, maxWidth: 400 }}>
        <input 
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
          placeholder="New task title" 
          required 
          style={{ 
            flex: 1, 
            padding: '8px 12px', 
            border: '1px solid var(--border)', 
            borderRadius: 8, 
            background: '#0f1025', 
            color: '#e5e7eb',
            fontSize: 14,
            maxWidth: 300
          }}
        />
        <button 
          type="submit" 
          disabled={isCreatingTask || !title.trim()}
          onClick={(e) => {
            console.log('Button clicked!', { title, isCreatingTask })
            if (!title.trim()) {
              e.preventDefault()
              alert('Please enter a task title')
            }
          }}
          style={{
            padding: '8px 16px',
            background: isCreatingTask || !title.trim() ? '#6b7280' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: isCreatingTask || !title.trim() ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: 'background-color 0.2s ease',
            opacity: isCreatingTask || !title.trim() ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isCreatingTask && title.trim()) {
              e.target.style.background = '#2563eb'
            }
          }}
          onMouseLeave={(e) => {
            if (!isCreatingTask && title.trim()) {
              e.target.style.background = '#3b82f6'
            }
          }}
        >
          {isCreatingTask ? 'Adding...' : 'Add Task'}
        </button>
      </form>
      <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnsState.length}, 1fr)`, gap: 12 }}>
              {columnsState.map(col => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                      style={{ background: snapshot.isDraggingOver ? '#eef2ff' : '#f7f7f9', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, minHeight: 200, position: 'relative' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, color: '#6d28d9' }}>{col.title}</div>
                        <button type="button" aria-label="Column menu" onClick={() => setOpenColMenuKey(k => (k === col.key ? null : col.key))} style={{ background: 'transparent', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 4 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="var(--title)">
                            <circle cx="12" cy="5" r="1"/>
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="12" cy="19" r="1"/>
                          </svg>
                        </button>
                      </div>
                      {openColMenuKey === col.key ? (
                        <div style={{ position: 'absolute', top: 34, right: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 10px 20px rgba(0,0,0,0.08)', zIndex: 10, width: 160 }}>
                          <button type="button" onClick={() => renameColumn(col.key)} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '8px 10px', cursor: 'pointer', color: '#21375f' }}>Rename column</button>
                          <button type="button" onClick={() => deleteColumn(col.key)} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '8px 10px', cursor: 'pointer', color: '#21375f' }}>Delete column</button>
                        </div>
                      ) : null}
                  {(tasks.filter(t => t.status === col.key)).sort((a,b)=>a.id-b.id).map((t, index) => (
                    <Draggable draggableId={String(t.id)} index={index} key={t.id}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          style={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: 6,
                            padding: 8,
                            marginBottom: 8,
                            boxShadow: dragSnapshot.isDragging ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
                            position: 'relative',
                            ...dragProvided.draggableProps.style,
                          }}
                          onClick={() => { setOpenTaskId(t.id); loadTaskDetail(t.id) }}
                        >
                          <button
                            type="button"
                            aria-label="Delete task"
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (!confirm('Delete this task?')) return
                              const res = await authFetch(`/api/tasks/${t.id}/`, { method: 'DELETE' })
                              if (res && res.ok) {
                                setTasks(prev => prev.filter(x => x.id !== t.id))
                              }
                            }}
                            style={{ position: 'absolute', top: 6, right: 6, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', lineHeight: 1, fontSize: 12, padding: 0 }}
                          >
                            ✕
                          </button>
                          <div style={{ fontWeight: 500, color: '#6d28d9' }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{(() => {
                            const base = (typeof t.project_key === 'string' && t.project_key) ? t.project_key.toLowerCase() : ''
                            const num = (typeof t.sequence === 'number' && t.sequence > 0) ? t.sequence : t.id
                            return base ? `${base}#${num}` : `#${num}`
                          })()}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
        </>
      ) : null}

      
      </div>

      {activeTab === 'ANALYTICS' ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            {[{label: 'Done (7d)', value: doneLast7, icon: '✅'}, {label: 'Updated (7d)', value: updatedLast7, icon: '✏️'}, {label: 'Created (7d)', value: createdLast7, icon: '🆕'}, {label: 'Due next 7d', value: dueNext7, icon: '⏰'}].map((c, i) => (
              <div key={i} style={{ background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#1a1b3a', display: 'grid', placeItems: 'center', fontSize: 18 }}>{c.icon}</div>
                <div>
                  <div style={{ color: '#e5e7eb', fontSize: 20, fontWeight: 700 }}>{c.value}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
            <div style={{ background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: '#e5e7eb', fontWeight: 700, marginBottom: 8 }}>Status Overview</div>
              <div style={{ display: 'grid', placeItems: 'center', padding: 8 }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <g transform="translate(100,100)">
                    {donutSegs.map(seg => (
                      <circle key={seg.key} r={donutRadius} cx="0" cy="0" fill="transparent"
                        stroke={seg.color} strokeWidth="28" strokeDasharray={`${Math.max(0, seg.len)} ${Math.max(0, donutC - seg.len)}`} strokeDashoffset={seg.offset} />
                    ))}
                    <circle r={donutRadius - 18} cx="0" cy="0" fill="#0f1025" />
                    <text x="0" y="6" textAnchor="middle" fontSize="18" fill="#e5e7eb" fontWeight="700">{totalCount}</text>
                  </g>
                </svg>
              </div>
            </div>
            <div style={{ background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: '#e5e7eb', fontWeight: 700, marginBottom: 8 }}>Breakdown</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {statusOrder.map(k => (
                  <li key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f1025', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: statusMeta[k].color }} />
                      <span style={{ color: '#d1d5db', fontWeight: 600 }}>{statusMeta[k].label}</span>
                    </div>
                    <div style={{ color: '#e5e7eb', fontWeight: 700 }}>{byStatus[k]}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {(openTaskId != null) ? (
        <TaskModal
          task={detail || { id: openTaskId, title: `Task #${openTaskId}`, description: '', priority: 'MEDIUM', tags: '', status: 'TO_DO', due_date_local: '' }}
          comments={comments}
          onClose={() => { setOpenTaskId(null); setDetail(null); setComments([]) }}
          onChange={setDetail}
          onRefresh={() => { loadTaskDetail(openTaskId); loadTasks() }}
          newComment={newComment}
          setNewComment={setNewComment}
          token={token}
        />
      ) : null}

      {notifOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', width: 'min(700px, 96vw)', maxHeight: '80vh', overflow: 'auto', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Notifications</h3>
              <button onClick={() => setNotifOpen(false)}>Close</button>
            </div>
            <ul style={{ marginTop: 12 }}>
              {notifs.map(n => (
                <li key={n.id} style={{ borderBottom: '1px solid #e5e7eb', padding: '8px 0' }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(n.created_at).toLocaleString()}</div>
                  <div style={{ fontWeight: 500 }}>{n.type}</div>
                  <div style={{ fontSize: 12, color: '#374151' }}>{n.payload ? JSON.stringify(n.payload) : ''}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TaskModal({ task, comments, onClose, onChange, onRefresh, newComment, setNewComment, token }) {
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [assigneesSel, setAssigneesSel] = useState([])

  // Update assignees when task changes
  useEffect(() => {
    if (task) {
      console.log('TaskModal: Task data received:', task)
      console.log('TaskModal: task.assignees:', task.assignees)
      console.log('TaskModal: task.assignee:', task.assignee)
      
      // Use assignees (plural) if available, otherwise fall back to assignee (singular)
      const assignees = task.assignees || (task.assignee ? [task.assignee] : [])
      const formattedAssignees = assignees.map(u => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        name: (u.first_name || '') + ' ' + (u.last_name || '')
      }))
      setAssigneesSel(formattedAssignees)
      console.log('TaskModal: Updated assignees from task:', formattedAssignees)
    }
  }, [task])

  async function ensureHistory() {
    if (history.length > 0) return
    const res = await fetch(`/api/tasks/${task.id}/activity/`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      setHistory(data)
    }
  }
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function saveTask(e) {
    e.preventDefault()
    
    console.log('Saving task:', { taskId: task.id, title: task.title })
    
    setIsSaving(true)
    setSaveError('')
    
    try {
    const payload = {
      title: task.title,
      description: task.description || '',
      status: task.status || 'TO_DO',
      priority: task.priority || 'MEDIUM',
      tags: task.tags || '',
    }
      
    if (task.due_date_local !== undefined) {
      if (!task.due_date_local) {
        payload.due_at = null
      } else {
        // Build date at 00:00 local and convert to ISO
        const dt = new Date(`${task.due_date_local}T00:00:00`)
        payload.due_at = isNaN(dt.getTime()) ? null : dt.toISOString()
      }
    }
      
    payload.assignee_id = (Array.isArray(assigneesSel) && assigneesSel[0] && assigneesSel[0].id) ? Number(assigneesSel[0].id) : ''
    payload.assignee_ids = Array.isArray(assigneesSel) ? assigneesSel.map(u => u.id) : []
      
      console.log('Sending payload:', payload)
      console.log('Assignees being saved:', assigneesSel)
      console.log('Assignee IDs being sent:', payload.assignee_ids)
      
      const res = await fetch(`/api/tasks/${task.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
      
      console.log('Save response:', res.status, res.ok)
      
      if (res.ok) {
        console.log('Task saved successfully')
    onRefresh()
        alert('Task saved successfully!')
      } else {
        const errorText = await res.text()
        console.error('Save failed:', res.status, errorText)
        setSaveError(`Failed to save task: ${errorText}`)
      }
    } catch (error) {
      console.error('Network error saving task:', error)
      setSaveError(`Network error: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  async function postComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    await fetch(`/api/tasks/${task.id}/comments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body: newComment })
    })
    setNewComment('')
    onRefresh()
  }

  // prepare local value for date input (YYYY-MM-DD)
  const dueDateLocal = task.due_at ? new Date(task.due_at).toISOString().slice(0,10) : ''
  if (task.due_at && !task.due_date_local) {
    onChange({ ...task, due_date_local: dueDateLocal })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 3000 }}>
      <div style={{ background: 'white', width: 'min(900px, 96vw)', maxHeight: '90vh', overflow: 'auto', borderRadius: 8, padding: 16, zIndex: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--title)', fontWeight: 700 }}>Task Details</h3>
          <button onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); onClose() }} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        <form onSubmit={saveTask} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 12 }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ color: 'var(--title)', fontWeight: 600 }}>Task Title</span>
            <input value={task.title || ''} onChange={e=>onChange({ ...task, title: e.target.value })} required />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ color: 'var(--title)', fontWeight: 600 }}>Task Description</span>
            <textarea rows={4} value={task.description || ''} onChange={e=>onChange({ ...task, description: e.target.value })} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ color: 'var(--title)', fontWeight: 600 }}>Assignee</span>
            <AssigneeMultiSelect token={token} value={assigneesSel} onChange={setAssigneesSel} placeholder="Enter email id's of  assignees" />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ color: 'var(--title)', fontWeight: 600 }}>Status</span>
            <select value={task.status || 'TO_DO'} onChange={e=>onChange({ ...task, status: e.target.value })}>
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ color: 'var(--title)', fontWeight: 600 }}>Deadline / Due Date</span>
            <input type="date" value={task.due_date_local || ''} onChange={e=>onChange({ ...task, due_date_local: e.target.value })} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ color: 'var(--title)', fontWeight: 600 }}>Priority</span>
            <select value={task.priority || 'MEDIUM'} onChange={e=>onChange({ ...task, priority: e.target.value })}>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ color: 'var(--title)', fontWeight: 600 }}>Labels / Tags</span>
            <input value={task.tags || ''} onChange={e=>onChange({ ...task, tags: e.target.value })} placeholder="e.g., Bug, Feature, UI" />
          </label>
          
          {saveError && (
            <div style={{ color: 'red', fontSize: 14, padding: '8px 12px', background: '#fee', border: '1px solid #fcc', borderRadius: 4 }}>
              {saveError}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              style={{
                padding: '8px 16px',
                background: isSaving ? '#6b7280' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                opacity: isSaving ? 0.6 : 1
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        
          </div>
    </div>
  )
}

function TaskAttachments({ taskId, token, refreshKey }) {
  const [items, setItems] = useState([])
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/tasks/${taskId}/attachments/`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setItems(Array.isArray(data) ? data : [])
        }
      } catch {}
    })()
  }, [taskId, token, refreshKey])
  return (
          <div>
      {!items.length ? (
        <div style={{ fontSize: 12, color: 'var(--title)' }}>No files chosen</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {items.map(a => (
            <li key={a.id}>
              {(() => { const raw = a.download_url || a.url || ''; const url = raw ? encodeURI(raw) : ''; return (
                <button type="button" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); window.location.href = url }} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  {a.filename}
        </button>
              )})()}
                  </li>
                ))}
              </ul>
      )}
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [assigned, setAssigned] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          authFetch('/api/tasks/'),
          authFetch('/api/projects/')
        ])
        const tasks = tasksRes && tasksRes.ok ? await tasksRes.json() : []
        const projectsData = projectsRes && projectsRes.ok ? await projectsRes.json() : []
        setProjects(projectsData)
        
        // Get current user email
        const currentUserEmail = localStorage.getItem('userEmail')
        
        // Assigned to me - check multiple assignment methods
        const meTasks = tasks.filter(t => {
          // Check single assignee
          if (t.assignee && t.assignee.email === currentUserEmail) return true
          
          // Check multiple assignees
          if (t.assignees && t.assignees.some(a => a.email === currentUserEmail)) return true
          
          // Check if user is in project team
          const project = projectsData.find(p => p.id === t.project)
          if (project && project.team) {
            const teamEmails = project.team.split(',').map(email => email.trim().toLowerCase())
            if (teamEmails.includes(currentUserEmail?.toLowerCase())) return true
          }
          
          return false
        })
        setAssigned(meTasks)
        
        // Gather activity from all accessible projects - ONLY current user's actions
        const projectIds = projectsData.map(p => p.id)
        const all = []
        
        for (const pid of projectIds) {
          // Get task activity - filter for current user only
          const taskActivityRes = await authFetch(`/api/projects/${pid}/activity/`)
          if (taskActivityRes && taskActivityRes.ok) {
            const taskData = await taskActivityRes.json()
            for (const ev of taskData) {
              // Only include activities by the current user
              if (ev.actor && ev.actor.email === currentUserEmail) {
                all.push({
                  ...ev,
                  activity_type: 'task',
                  project_id: pid
                })
              }
            }
          }
          
          // Get project membership activity (joins, invitations, etc.) - current user only
          const membersRes = await authFetch(`/api/projects/${pid}/members/`)
          if (membersRes && membersRes.ok) {
            const membersData = await membersRes.json()
            for (const member of membersData) {
              // Only include current user's membership activities
              if (member.user && member.user.email === currentUserEmail) {
                // Add join event
                if (member.joined_at) {
                  all.push({
                    id: `join_${member.id}`,
                    actor: member.user,
                    entity_type: 'PROJECT',
                    entity_id: pid,
                    action: 'JOINED',
                    metadata: { 
                      project_name: projectsData.find(p => p.id === pid)?.name || 'Unknown Project',
                      role: member.role 
                    },
                    created_at: member.joined_at,
                    activity_type: 'membership',
                    project_id: pid
                  })
                }
                
                // Add invitation acceptance event
                if (member.responded_at && member.status === 'ACCEPTED') {
                  all.push({
                    id: `accept_${member.id}`,
                    actor: member.user,
                    entity_type: 'PROJECT',
                    entity_id: pid,
                    action: 'ACCEPTED_INVITATION',
                    metadata: { 
                      project_name: projectsData.find(p => p.id === pid)?.name || 'Unknown Project',
                      role: member.role,
                      invited_by: member.invited_by?.email || 'Unknown'
                    },
                    created_at: member.responded_at,
                    activity_type: 'membership',
                    project_id: pid
                  })
                }
              }
            }
          }
        }
        
        // Sort by created_at descending
        all.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        setActivities(all)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  function formatKey(ev) {
    try {
      if (ev && ev.entity_type === 'TASK' && ev.entity_id) {
        // Try to get project info from the current projects state
        const project = projects.find(p => p.id === ev.project_id)
        if (project) {
          return `${project.key ? project.key.toUpperCase() : 'PRJ'}-${ev.entity_id}`
        }
        return `#${ev.entity_id}`
      }
    } catch {}
    return ''
  }

  function groupByDate(items) {
    const groups = {}
    for (const it of items) {
      const d = new Date(it.created_at)
      const key = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(it)
    }
    const ordered = Object.entries(groups)
      .map(([k,v])=>({ date:k, items:v }))
      .sort((a,b)=> new Date(b.items[0].created_at) - new Date(a.items[0].created_at))
    return ordered
  }

  return (
    <div style={{ padding: 16, paddingTop: 72, maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      <ProfileButton />
      <button
        type="button"
        aria-label="Menu"
        style={{
          position: 'fixed', top: 12, right: 12,
          background: 'transparent',
          border: '2px solid var(--title)',
          borderRadius: 8,
          width: 36, height: 36,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 0, cursor: 'pointer', zIndex: 1000,
          outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent'
        }}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
      </button>
      {menuOpen ? (
        <div style={{ position: 'fixed', top: 56, right: 12, background: '#0f1025', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', width: 260, padding: 8, zIndex: 1000 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/home') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #ff6b6b, #ff8e53, #ff6b6b)', display: 'grid', placeItems: 'center' }}>
                <Icon name="home" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Home</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/projects') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'grid', placeItems: 'center' }}>
                <Icon name="rocket" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Projects</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/dashboard') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'grid', placeItems: 'center' }}>
                <Icon name="board" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Dashboards</div>
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/notifications') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: '#21375f', display: 'grid', placeItems: 'center' }}>
                <Icon name="bell" color="#fbbf24" />
              </div>
              <div style={{ fontSize: 14 }}>Notifications</div>
            </button>
          </div>
        </div>
      ) : null}
      <h2 style={{ color: '#6d28d9', margin: '8px 0 16px' }}>Dashboard</h2>

      <div style={{ background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ color: '#e5e7eb', fontWeight: 700, marginBottom: 8 }}>Assigned to Me</div>
        {assigned.length === 0 ? (
          <div style={{ color: '#9ca3af' }}>No matching work items found.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {assigned.map(t => {
              const currentUserEmail = localStorage.getItem('userEmail')
              const project = projects.find(p => p.id === t.project)
              let assignmentReason = ''
              
              if (t.assignee && t.assignee.email === currentUserEmail) {
                assignmentReason = 'Directly assigned'
              } else if (t.assignees && t.assignees.some(a => a.email === currentUserEmail)) {
                assignmentReason = 'Multiple assignee'
              } else if (project && project.team) {
                const teamEmails = project.team.split(',').map(email => email.trim().toLowerCase())
                if (teamEmails.includes(currentUserEmail?.toLowerCase())) {
                  assignmentReason = 'Project team member'
                }
              }
              
              return (
                <li key={t.id} style={{ background: '#0f1025', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'grid' }}>
                    <div style={{ color: '#e5e7eb', fontWeight: 600 }}>{t.title}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>
                      {(t.project_key ? t.project_key.toUpperCase() : 'PRJ')}-{(typeof t.sequence==='number'&&t.sequence>0)?t.sequence:t.id} • {t.status.replace('_',' ')} • {assignmentReason}
                    </div>
                  </div>
                  <a href={`/projects/${t.project}/board`} style={{ color: 'var(--primary)' }}>Open</a>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div style={{ background: '#11132a', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
        <div style={{ color: '#e5e7eb', fontWeight: 700, marginBottom: 8 }}>Activity Stream</div>
        {loading ? <div style={{ color: '#9ca3af' }}>Loading...</div> : null}
        {!loading && activities.length === 0 ? (
          <div style={{ color: '#9ca3af' }}>No activity</div>
        ) : null}
        {!loading && activities.length > 0 ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {groupByDate(activities).map(group => (
              <div key={group.date}>
                <div style={{ color: '#b3a6d6', fontSize: 12, marginBottom: 6 }}>{group.date}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                  {group.items.map(ev => (
                    <li key={ev.id} style={{ background: '#0f1025', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: '#21375f', color: '#a78bfa', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                        {(ev.actor && (ev.actor.first_name || ev.actor.last_name)) ? `${(ev.actor.first_name||'')[0]||''}${(ev.actor.last_name||'')[0]||''}`.toUpperCase() : (ev.actor && ev.actor.email ? ev.actor.email[0].toUpperCase() : '?')}
                      </div>
                      <div style={{ display: 'grid' }}>
                        <div style={{ color: '#e5e7eb' }}>
                          {ev.activity_type === 'membership' ? (
                            ev.action === 'JOINED' ? (
                              `You joined project "${ev.metadata?.project_name || 'Unknown'}" as ${ev.metadata?.role || 'member'}`
                            ) : ev.action === 'ACCEPTED_INVITATION' ? (
                              `You accepted invitation to project "${ev.metadata?.project_name || 'Unknown'}" from ${ev.metadata?.invited_by || 'Unknown'}`
                            ) : (
                              `You ${ev.action.toLowerCase().replace('_', ' ')} ${ev.metadata?.project_name || 'project'}`
                            )
                          ) : (
                            `You ${ev.action.toLowerCase()} ${formatKey(ev)}${ev.metadata?.title ? ` - ${ev.metadata.title}` : ''}`
                          )}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: 12 }}>
                          {new Date(ev.created_at).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function NotificationsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('all') // 'all' or 'unread'
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false) // three-dot actions
  const [snoozeOpen, setSnoozeOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false) // hamburger nav
  const [snoozeUntil, setSnoozeUntil] = useState(null)

  // Notification types and icons
  const notificationTypes = {
    // Project-Level Notifications
    PROJECT_INVITATION: { icon: '📂', category: 'project' },
    PROJECT_INVITE: { icon: '📂', category: 'project' },
    PROJECT_INVITE_RESPONSE: { icon: '📂', category: 'project' },
    PROJECT_INVITATION_ACCEPTED: { icon: '📂', category: 'project' },
    PROJECT_INVITATION_DECLINED: { icon: '📂', category: 'project' },
    PROJECT_DEADLINE_CHANGED: { icon: '📂', category: 'project' },
    PROJECT_DELETED: { icon: '📂', category: 'project' },
    PROJECT_REMOVED: { icon: '📂', category: 'project' },
    PROJECT_REPORTER_ASSIGNED: { icon: '📂', category: 'project' },
    
    // Task-Level Notifications
    TASK_ASSIGNED: { icon: '📌', category: 'task' },
    TASK_DEADLINE_REMINDER: { icon: '📌', category: 'task' },
    TASK_COMPLETED: { icon: '📌', category: 'task' },
    TASK_STATUS_CHANGED: { icon: '📌', category: 'task' },
    TASK_REMOVED: { icon: '📌', category: 'task' },
    TASK_UPDATE: { icon: '📌', category: 'task' },
    
    // Collaboration/Comments
    COMMENT_MENTION: { icon: '🗨️', category: 'comment' },
    COMMENT_ADDED: { icon: '🗨️', category: 'comment' },
    ATTACHMENT_UPLOADED: { icon: '🗨️', category: 'comment' },
    MENTION: { icon: '🗨️', category: 'comment' },
    
    // Reminders & Productivity Alerts
    REMINDER_24H: { icon: '🔔', category: 'reminder' },
    REMINDER_IDLE: { icon: '🔔', category: 'reminder' },
    DAILY_SUMMARY: { icon: '🔔', category: 'reminder' },
    WEEKLY_UPDATE: { icon: '🔔', category: 'reminder' },
    
    // System/General
    PASSWORD_CHANGED: { icon: '⚙️', category: 'system' },
    APP_UPDATE: { icon: '⚙️', category: 'system' },
    NOTIFICATIONS_SNOOZED: { icon: '⚙️', category: 'system' }
  }

  // Load real notifications from backend
  const loadRealNotifications = async () => {
    try {
      console.log('Loading real notifications from backend...')
      const res = await authFetch('/api/notifications/')
      console.log('Notifications API response status:', res.status)
      
      if (res.ok) {
        const realNotifications = await res.json()
        console.log('Real notifications from backend:', realNotifications)
        
        // Debug: Log each notification's data structure
        realNotifications.forEach((notification, index) => {
          console.log(`Notification ${index} data:`, {
            type: notification.type,
            message: notification.message,
            data: notification.data,
            payload: notification.payload,
            allKeys: Object.keys(notification)
          })
        })
        
        // Set only real notifications (replace any existing ones)
        if (realNotifications && realNotifications.length > 0) {
          // Format notifications for display
          const formattedNotifications = realNotifications.map(notification => {
            const notificationType = notificationTypes[notification.type]
            const icon = notificationType ? notificationType.icon : '📢'
            const category = notificationType ? notificationType.category : 'system'
            
            // Use message from backend if available, otherwise format based on type
            let formattedMessage = notification.message || notification.type
            
            return {
              ...notification,
              icon,
              category,
              message: formattedMessage,
              timestamp: notification.created_at || notification.timestamp,
              isRead: notification.read_at !== null
            }
          })
          
          setNotifications(formattedNotifications)
          setUnreadCount(formattedNotifications.filter(n => !n.isRead).length)
        } else {
          // No real notifications, set empty
          setNotifications([])
          setUnreadCount(0)
        }
      } else {
        // No notifications endpoint or error, set empty
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error loading real notifications:', error)
      // On error, set empty
      setNotifications([])
      setUnreadCount(0)
    }
  }

  // Initialize notification system
  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    // Load real notifications from backend
    loadRealNotifications()
  }, [])

  // Refresh notifications function
  const refreshNotifications = () => {
    console.log('Refreshing notifications...')
    loadRealNotifications()
  }

  // Helper function to mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true }
          : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Helper function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  // Helper function to clear all notifications
  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  // Helper function to accept invitation
  const acceptInvitation = async (notificationId) => {
    try {
      const res = await authFetch(`/api/notifications/${notificationId}/accept_invitation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (res.ok) {
        const data = await res.json()

      // Update local notification state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true, type: 'PROJECT_INVITATION_ACCEPTED' }
          : n
      ))
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
      
        alert(`You have joined the project ${data.project?.name || 'Unknown Project'}!`)
      } else {
        const errorText = await res.text()
        alert(`Failed to accept invitation: ${errorText}`)
      }
      
    } catch (error) {
      console.error('Error accepting invitation:', error)
      alert(`Failed to accept invitation: ${error.message}`)
    }
  }

  // Helper function to decline invitation
  const declineInvitation = async (notificationId) => {
    try {
      const res = await authFetch(`/api/notifications/${notificationId}/decline_invitation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (res.ok) {
        const data = await res.json()

      // Update local notification state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true, type: 'PROJECT_INVITATION_DECLINED' }
          : n
      ))
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
      
        alert(`You have declined the invitation to join the project ${data.project?.name || 'Unknown Project'}.`)
      } else {
        const errorText = await res.text()
        alert(`Failed to decline invitation: ${errorText}`)
      }
      
    } catch (error) {
      console.error('Error declining invitation:', error)
      alert(`Failed to decline invitation: ${error.message}`)
    }
  }

  // Helper function to snooze notifications
  const snoozeNotifications = (duration) => {
    const snoozeTime = new Date(Date.now() + duration)
    setSnoozeUntil(snoozeTime)
    
    // Add snooze notification
    const snoozeNotification = {
      id: Date.now(),
      type: 'NOTIFICATIONS_SNOOZED',
      message: `Notifications snoozed until ${snoozeTime.toLocaleString()}`,
      icon: '⚙️',
      category: 'system',
      timestamp: new Date().toISOString(),
      isRead: false,
      data: { snoozeUntil: snoozeTime.toISOString() }
    }
    
    setNotifications(prev => [snoozeNotification, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'Just now'
      
      const now = new Date()
      const notificationTime = new Date(timestamp)
      
      // Check if the date is valid
      if (isNaN(notificationTime.getTime())) {
        console.error('Invalid timestamp:', timestamp)
        return 'Just now'
      }
      
      const diffInSeconds = Math.floor((now - notificationTime) / 1000)
      
      if (diffInSeconds < 60) return `${diffInSeconds}s ago`
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
      return notificationTime.toLocaleDateString()
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp)
      return 'Just now'
    }
  }

  // Filter notifications based on tab
  const filteredNotifications = notifications.filter(n => 
    tab === 'all' ? true : !n.isRead
  )

  // Debug: Log notifications data
  useEffect(() => {
    console.log('All notifications:', notifications)
    notifications.forEach((n, index) => {
      console.log(`Notification ${index}:`, {
        id: n.id,
        type: n.type,
        message: n.message,
        timestamp: n.timestamp,
        isRead: n.isRead,
        data: n.data
      })
    })
  }, [notifications])

  const empty = (
    <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 8 }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
      <div style={{ color: '#e5e7eb', fontWeight: 700 }}>Nothing's happened yet</div>
      <div style={{ marginTop: 6 }}>When there's activity on your work, this is where we'll let you know. Pull down to refresh any time.</div>
    </div>
  )

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto', position: 'relative' }}>
      <ProfileButton />
      <button
        type="button"
        aria-label="Menu"
        style={{
          position: 'fixed', top: 12, right: 12,
          background: 'transparent',
          border: '2px solid var(--title)',
          borderRadius: 8,
          width: 36, height: 36,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 0, cursor: 'pointer', zIndex: 1000,
          outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent'
        }}
        onClick={() => setNavOpen(prev => !prev)}
      >
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
        <div style={{ width: 20, height: 2, background: 'var(--text-strong)', margin: '2px 0' }} />
      </button>
      {navOpen ? (
        <div style={{ position: 'fixed', top: 56, right: 12, background: '#0f1025', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', width: 260, padding: 8, zIndex: 1000 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <button type="button" onClick={() => { setNavOpen(false); navigate('/home') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #ff6b6b, #ff8e53, #ff6b6b)', display: 'grid', placeItems: 'center' }}>
                <Icon name="home" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Home</div>
            </button>
            <button type="button" onClick={() => { setNavOpen(false); navigate('/projects') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'grid', placeItems: 'center' }}>
                <Icon name="rocket" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Projects</div>
            </button>
            <button type="button" onClick={() => { setNavOpen(false); navigate('/dashboard') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'grid', placeItems: 'center' }}>
                <Icon name="board" color="#ffffff" />
              </div>
              <div style={{ fontSize: 14 }}>Dashboards</div>
            </button>
            <button type="button" onClick={() => { setNavOpen(false); navigate('/notifications') }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: '#21375f', display: 'grid', placeItems: 'center' }}>
                <Icon name="bell" color="#a78bfa" />
              </div>
              <div style={{ fontSize: 14 }}>Notifications</div>
            </button>
          </div>
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ color: '#6d28d9', margin: 0 }}>Notifications</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={() => setMenuOpen(v=>!v)} aria-label="More" style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: 6, color: '#e5e7eb' }}>⋯</button>
          {menuOpen ? (
            <div style={{ position: 'absolute', top: 44, right: 12, background: '#0f1025', border: '1px solid var(--border)', borderRadius: 10, padding: 6, width: 200 }}>
              <button type="button" onClick={() => { setMenuOpen(false); refreshNotifications() }} style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', color: '#d1d5db', padding: '8px 10px', cursor: 'pointer' }}>🔄 Refresh</button>
              <button type="button" onClick={() => { setMenuOpen(false); markAllAsRead() }} style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', color: '#d1d5db', padding: '8px 10px', cursor: 'pointer' }}>Mark All as Read</button>
              <button type="button" onClick={() => { setMenuOpen(false); clearAll() }} style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', color: '#d1d5db', padding: '8px 10px', cursor: 'pointer' }}>Clear All</button>
              <button type="button" onClick={() => { setMenuOpen(false); setSnoozeOpen(true) }} style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', color: '#d1d5db', padding: '8px 10px', cursor: 'pointer' }}>🔔 Snooze</button>
            </div>
          ) : null}
          {snoozeOpen ? (
            <div style={{ position: 'absolute', top: 44, right: 220, background: '#0f1025', border: '1px solid var(--border)', borderRadius: 10, padding: 8, width: 220 }}>
              <div style={{ color: '#e5e7eb', fontWeight: 600, marginBottom: 8 }}>Snooze push notifications</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {[
                  { label: '20 mins', duration: 20 * 60 * 1000 },
                  { label: '1 hr', duration: 60 * 60 * 1000 },
                  { label: '4 hrs', duration: 4 * 60 * 60 * 1000 },
                  { label: '24 hrs', duration: 24 * 60 * 60 * 1000 },
                  { label: '2 days', duration: 2 * 24 * 60 * 60 * 1000 },
                  { label: '1 week', duration: 7 * 24 * 60 * 60 * 1000 }
                ].map(opt => (
                  <button key={opt.label} type="button" onClick={() => { setSnoozeOpen(false); snoozeNotifications(opt.duration) }} style={{ background: '#1a1b3a', border: '1px solid var(--border)', borderRadius: 8, padding: 6, color: '#d1d5db', textAlign: 'left' }}>{opt.label}</button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setTab('all')} style={{ background: tab==='all' ? '#1a1b3a' : 'transparent', border: '1px solid var(--border)', color: '#e5e7eb', padding: '6px 10px', borderRadius: 8 }}>All</button>
        <button type="button" onClick={() => setTab('unread')} style={{ background: tab==='unread' ? '#1a1b3a' : 'transparent', border: '1px solid var(--border)', color: '#e5e7eb', padding: '6px 10px', borderRadius: 8 }}>Unread</button>
      </div>

      {filteredNotifications.length === 0 ? empty : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {filteredNotifications.map(n => (
            <li key={n.id} style={{ background: n.isRead ? '#0f1025' : '#1a1b3a', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: '#21375f', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16 }}>{n.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                {/* Notification Type */}
                <div style={{ color: '#e5e7eb', fontWeight: n.isRead ? 500 : 700, marginBottom: 4 }}>
                  {n.type === 'PROJECT_INVITATION' ? 'Project Invite' : n.message || n.type}
                </div>
                
                {/* Project Name and Sender Info for Project Invitations */}
                {n.type === 'PROJECT_INVITATION' && n.payload && (
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ color: '#d1d5db', fontSize: 13, fontWeight: 600 }}>
                      {n.payload.project_name || 'Unknown Project'}
                </div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>
                      Invited by: {n.payload.invited_by || 'Unknown User'}
                    </div>
                  </div>
                )}
                
                {/* Timestamp */}
                <div style={{ color: '#9ca3af', fontSize: 12 }}>
                  {formatTimestamp(n.timestamp)}
                </div>
                
                {/* Show Accept/Decline buttons for project invitations */}
                {(n.type === 'PROJECT_INVITATION' || n.type === 'PROJECT_INVITE') && !n.isRead && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button 
                      type="button"
                      onClick={() => acceptInvitation(n.id)}
                      style={{ 
                        background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)', 
                        border: 'none', 
                        color: 'white', 
                        padding: '6px 12px', 
                        borderRadius: 6, 
                        fontSize: 12, 
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Accept
                    </button>
                    <button 
                      type="button"
                      onClick={() => declineInvitation(n.id)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #ef4444', 
                        color: '#ef4444', 
                        padding: '6px 12px', 
                        borderRadius: 6, 
                        fontSize: 12, 
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Decline
                    </button>
                  </div>
                )}
                
                {/* Show Mark as read button for other notifications */}
                {n.type !== 'PROJECT_INVITATION' && n.type !== 'PROJECT_INVITE' && !n.isRead && (
                  <button 
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#3b82f6', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginTop: 4
                    }}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

