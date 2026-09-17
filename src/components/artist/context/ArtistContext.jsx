import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'

const ArtistContext = createContext(null)

const readStoredArtist = () => {
  try {
    const saved = localStorage.getItem('artistData')
    return saved ? JSON.parse(saved) : null
  } catch {
    localStorage.removeItem('artistData')
    return null
  }
}

export const ArtistProvider = ({ children }) => {
  const { user } = useAuth()
  const [artist, setArtist] = useState(readStoredArtist)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('artistToken')
  })

  const login = useCallback((token, artistData) => {
    localStorage.setItem('artistToken', token)
    localStorage.setItem('artistData', JSON.stringify(artistData))
    setArtist(artistData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('artistToken')
    localStorage.removeItem('artistData')
    setArtist(null)
    setIsAuthenticated(false)
  }, [])

  // Sync artist state with main user session
  useEffect(() => {
    if (!user) {
      // If user logs out, clear artist session
      if (artist || localStorage.getItem('artistToken')) {
        logout();
      }
    } else if (artist && artist.email && user.email) {
      // If user emails don't match, clear artist session
      if (user.email.toLowerCase() !== artist.email.toLowerCase()) {
        logout();
      }
    }
  }, [user, artist, logout]);

  const updateArtist = useCallback((updates) => {
    const updated = { ...artist, ...updates }
    localStorage.setItem('artistData', JSON.stringify(updated))
    setArtist(updated)
  }, [artist])

  const value = {
    artist,
    isAuthenticated,
    login,
    logout,
    updateArtist,
  }

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  )
}

export const useArtist = () => {
  const context = useContext(ArtistContext)
  if (!context) {
    throw new Error('useArtist must be used within ArtistProvider')
  }
  return context
}
