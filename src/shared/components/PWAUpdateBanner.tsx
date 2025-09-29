import { useState } from 'react'
import { usePWAUpdate } from '@/shared/hooks/usePWAUpdate'

export function PWAUpdateBanner() {
  const {
    updateAvailable,
    isUpdating,
    updateServiceWorker,
    forceUpdate,
    clearAllCaches
  } = usePWAUpdate()
  
  const [showForceOptions, setShowForceOptions] = useState(false)

  if (!updateAvailable && !showForceOptions) {
    return (
      <button
        onClick={() => setShowForceOptions(true)}
        className="fixed top-4 right-4 z-50 px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
        title="Opciones de actualización PWA"
      >
        🔄 PWA
      </button>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      {updateAvailable && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-600">✓</span>
            <span className="text-sm font-medium">Nueva versión disponible</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Hay una actualización de la aplicación disponible.
          </p>
          <button
            onClick={updateServiceWorker}
            disabled={isUpdating}
            className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'Actualizando...' : 'Actualizar Ahora'}
          </button>
        </div>
      )}

      {showForceOptions && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Opciones de Actualización</span>
            <button
              onClick={() => setShowForceOptions(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            🔄 Recargar Página
          </button>
          
          <button
            onClick={clearAllCaches}
            className="w-full px-3 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
          >
            🗑️ Limpiar Cache
          </button>
          
          <button
            onClick={forceUpdate}
            disabled={isUpdating}
            className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'Forzando...' : '⚡ Forzar Actualización'}
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            <strong>Forzar Actualización:</strong> Elimina todo el cache, desregistra service workers y recarga la aplicación.
          </p>
        </div>
      )}
    </div>
  )
}