import { useState, useEffect, useCallback } from 'react'

export interface UserLocation {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}

interface UseUserLocationOptimizedReturn {
  userLocation: UserLocation | null
  isLoading: boolean
  error: string | null
  requestLocation: () => Promise<void>
  isSupported: boolean
  hasPermission: boolean | null
  lastUpdate: Date | null
}

export function useUserLocationOptimized(): UseUserLocationOptimizedReturn {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const isSupported = 'geolocation' in navigator

  // Check for stored location on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userLocation')
      if (stored) {
        const location = JSON.parse(stored)
        // Only use if less than 30 minutes old and has valid coordinates
        if (
          Date.now() - location.timestamp < 1800000 && 
          location.latitude && 
          location.longitude
        ) {
          setUserLocation(location)
          setLastUpdate(new Date(location.timestamp))
        } else {
          localStorage.removeItem('userLocation')
        }
      }
    } catch (error) {
      console.warn('Failed to load stored user location:', error)
      localStorage.removeItem('userLocation')
    }
  }, [])

  // Check permission status
  useEffect(() => {
    if (!isSupported || !navigator.permissions) return

    navigator.permissions.query({ name: 'geolocation' })
      .then((result) => {
        setHasPermission(result.state === 'granted')
        
        // Listen for permission changes
        result.onchange = () => {
          setHasPermission(result.state === 'granted')
        }
      })
      .catch(() => {
        // Permissions API not supported, will check on request
        setHasPermission(null)
      })
  }, [isSupported])

  const requestLocation = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser')
      return Promise.reject(new Error('Geolocation not supported'))
    }

    setIsLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes cache for GPS
      }

      const successCallback = (position: GeolocationPosition) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }
        
        setUserLocation(location)
        setLastUpdate(new Date())
        setIsLoading(false)
        setHasPermission(true)
        
        // Store in localStorage with expiration
        try {
          localStorage.setItem('userLocation', JSON.stringify(location))
        } catch (error) {
          console.warn('Failed to store user location:', error)
        }
        
        resolve()
      }

      const errorCallback = (error: GeolocationPositionError) => {
        let errorMessage = 'Unable to retrieve location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.'
            setHasPermission(false)
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your GPS settings.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timeout. Please try again.'
            break
          default:
            errorMessage = 'An unknown error occurred while retrieving location.'
        }
        
        setError(errorMessage)
        setIsLoading(false)
        
        reject(new Error(errorMessage))
      }

      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      )
    })
  }, [isSupported])

  // Disabled auto-request to prevent CoreLocationProvider errors
  // Users can manually request location when needed
  // useEffect(() => {
  //   if (hasPermission === true && !userLocation && !isLoading) {
  //     requestLocation().catch(() => {
  //       // Ignore errors from auto-request
  //     })
  //   }
  // }, [hasPermission, userLocation, isLoading, requestLocation])

  return {
    userLocation,
    isLoading,
    error,
    requestLocation,
    isSupported,
    hasPermission,
    lastUpdate
  }
}