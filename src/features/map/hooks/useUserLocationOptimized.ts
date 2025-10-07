import { useState, useEffect, useCallback } from 'react'
import { MapCache } from '@/config/map.config'

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
  requestLocation: (options?: { allowFallback?: boolean }) => Promise<UserLocation>
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

  // Helper function to get location with specific options
  const getCurrentPositionPromise = useCallback((options: PositionOptions): Promise<UserLocation> => {
    return new Promise<UserLocation>((resolve, reject) => {
      const successCallback = (position: GeolocationPosition) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }
        resolve(location)
      }

      const errorCallback = (error: GeolocationPositionError) => {
        reject(error)
      }

      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options)
    })
  }, [])



  // OSM Nominatim API fallback for location
  const getLocationFromOSM = useCallback(async (): Promise<UserLocation> => {
    try {
      // Get IP-based location using a free service
      const ipResponse = await fetch('https://ipapi.co/json/', {
        timeout: 5000
      } as any)
      
      if (!ipResponse.ok) {
        throw new Error('IP location service failed')
      }
      
      const ipData = await ipResponse.json()
      
      if (ipData.latitude && ipData.longitude) {
        return {
          latitude: ipData.latitude,
          longitude: ipData.longitude,
          accuracy: 10000, // Low accuracy for IP-based location
          timestamp: Date.now()
        }
      }
      
      throw new Error('No coordinates from IP service')
    } catch (error) {
      // Fallback to a default location (center map - South America)
      console.warn('IP location failed, using default center:', error)
      return {
        latitude: -15.0,
        longitude: -59.0,
        accuracy: 50000, // Very low accuracy for default
        timestamp: Date.now()
      }
    }
  }, [])

  const requestLocation = useCallback(async (options: { allowFallback?: boolean } = {}): Promise<UserLocation> => {
    const { allowFallback = false } = options
    
    if (!isSupported) {
      // No GPS support - only use OSM fallback if explicitly allowed (initial load)
      if (allowFallback) {
        const location = await getLocationFromOSM()
        setUserLocation(location)
        setLastUpdate(new Date())
        setIsLoading(false)
        
        try {
          localStorage.setItem('userLocation', JSON.stringify(location))
        } catch (error) {
          console.warn('Failed to store user location:', error)
        }
        
        // Preload map tiles around fallback location in background
        MapCache.preloadTilesAroundLocation(location.longitude, location.latitude)
          .catch(() => {
            // Silent fail - tile preloading is an enhancement
          })
        
        return location
      } else {
        throw new Error('Geolocation not supported and fallback not allowed')
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const geoOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
      
      const location = await getCurrentPositionPromise(geoOptions)
      
      // Update state
      setUserLocation(location)
      setLastUpdate(new Date())
      setIsLoading(false)
      setHasPermission(true)
      
      // Store in localStorage
      try {
        localStorage.setItem('userLocation', JSON.stringify(location))
      } catch (error) {
        console.warn('Failed to store user location:', error)
      }
      
      // Preload map tiles around user location in background
      MapCache.preloadTilesAroundLocation(location.longitude, location.latitude)
        .catch(() => {
          // Silent fail - tile preloading is an enhancement
        })
      
      return location
      
    } catch (error) {
      // GPS failed - only try OSM fallback if explicitly allowed (initial load)
      if (allowFallback) {
        console.log('GPS failed, trying OSM fallback for initial load...')
        
        try {
          const fallbackLocation = await getLocationFromOSM()
          
          setUserLocation(fallbackLocation)
          setLastUpdate(new Date())
          setIsLoading(false)
          setError(null) // Clear error since we got a fallback
          
          try {
            localStorage.setItem('userLocation', JSON.stringify(fallbackLocation))
          } catch (error) {
            console.warn('Failed to store fallback location:', error)
          }
          
          // Preload map tiles around fallback location in background
          MapCache.preloadTilesAroundLocation(fallbackLocation.longitude, fallbackLocation.latitude)
            .catch(() => {
              // Silent fail - tile preloading is an enhancement
            })
          
          return fallbackLocation
          
        } catch (fallbackError) {
          console.warn('OSM fallback also failed:', fallbackError)
          // Continue to handle GPS error below
        }
      }

      // Handle GPS error (either fallback not allowed or fallback also failed)
      const geolocationError = error as GeolocationPositionError
      let errorMessage = 'Unable to retrieve location'
      
      switch (geolocationError.code) {
        case geolocationError.PERMISSION_DENIED:
          errorMessage = 'Location access denied'
          setHasPermission(false)
          break
        case geolocationError.POSITION_UNAVAILABLE:
          errorMessage = 'Location unavailable'
          break
        case geolocationError.TIMEOUT:
          errorMessage = 'Location request timeout'
          break
      }
      
      setError(errorMessage)
      setIsLoading(false)
      
      return Promise.reject(new Error(errorMessage))
    }
  }, [isSupported, getCurrentPositionPromise, getLocationFromOSM])

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