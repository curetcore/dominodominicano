import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'

// In production, use the same origin. In development, use localhost:3001
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:3001')

export function useSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      })

      socketRef.current.on('connect', () => {
        setConnected(true)
        console.log('Conectado al servidor')
      })

      socketRef.current.on('disconnect', () => {
        setConnected(false)
        console.log('Desconectado del servidor')
      })

      socketRef.current.on('error', (error) => {
        console.error('Error de socket:', error)
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }

  const on = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler)
    }
  }

  const off = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler)
    }
  }

  return {
    socket: socketRef.current,
    connected,
    emit,
    on,
    off
  }
}