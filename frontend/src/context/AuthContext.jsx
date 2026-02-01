import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    } catch (err) {
      console.error('Error loading auth from localStorage:', err)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

    setLoading(false)
  }, [])

  const login = (userData, authToken) => {
    try {
      setUser(userData)
      setToken(authToken)
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (err) {
      console.error('Error saving auth to localStorage:', err)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
