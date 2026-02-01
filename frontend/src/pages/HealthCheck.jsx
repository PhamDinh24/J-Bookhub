import { useState, useEffect } from 'react'
import api from '../services/api'
import imageService from '../services/imageService'

function HealthCheck() {
  const [checks, setChecks] = useState({
    backend: null,
    imageService: null,
    database: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runHealthChecks()
  }, [])

  const runHealthChecks = async () => {
    setLoading(true)
    const results = {
      backend: null,
      imageService: null,
      database: null
    }

    // Check backend
    try {
      const response = await api.get('/health')
      results.backend = { status: 'OK', message: response.data.message }
    } catch (err) {
      results.backend = { status: 'ERROR', message: err.message }
    }

    // Check image service
    try {
      const response = await imageService.checkHealth()
      results.imageService = { status: 'OK', message: response.message }
    } catch (err) {
      results.imageService = { status: 'ERROR', message: err.message }
    }

    // Check database (via books endpoint)
    try {
      await api.get('/books')
      results.database = { status: 'OK', message: 'Database connected' }
    } catch (err) {
      results.database = { status: 'ERROR', message: err.message }
    }

    setChecks(results)
    setLoading(false)
  }

  const getStatusColor = (status) => {
    return status === 'OK' ? '#4caf50' : '#f44336'
  }

  const getStatusIcon = (status) => {
    return status === 'OK' ? '✓' : '✗'
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>System Health Check</h1>
      
      {loading ? (
        <p>Checking system health...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(checks).map(([key, check]) => (
            <div
              key={key}
              style={{
                padding: '1rem',
                border: `2px solid ${getStatusColor(check.status)}`,
                borderRadius: '8px',
                backgroundColor: check.status === 'OK' ? '#e8f5e9' : '#ffebee'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '1.5rem',
                    color: getStatusColor(check.status)
                  }}
                >
                  {getStatusIcon(check.status)}
                </span>
                <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                {check.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Configuration Info</h3>
        <ul>
          <li>Backend URL: http://localhost:8080/api</li>
          <li>Frontend URL: http://localhost:5173</li>
          <li>Database: MySQL on localhost:3306</li>
          <li>Image Service: Cloudinary</li>
        </ul>
      </div>

      <button
        onClick={runHealthChecks}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Refresh
      </button>
    </div>
  )
}

export default HealthCheck
