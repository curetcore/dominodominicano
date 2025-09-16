import { Howl } from 'howler'

// Sound effect URLs (we'll use free sounds or generate them)
const soundUrls = {
  placeDomino: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAAA=',
  shuffle: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAAA=',
  win: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAAA=',
  yourTurn: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAAA=',
  capicua: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAAA=',
  click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAAA='
}

class SoundManager {
  constructor() {
    this.sounds = {}
    this.enabled = true
    this.volume = 0.7
    
    // Initialize sounds
    this.loadSounds()
    
    // Check if sounds are enabled in localStorage
    const savedEnabled = localStorage.getItem('soundEnabled')
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true'
    }
    
    const savedVolume = localStorage.getItem('soundVolume')
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume)
    }
  }
  
  loadSounds() {
    // For now, we'll use simple web audio API sounds
    // In production, replace with actual sound files
    
    // Place domino sound
    this.sounds.placeDomino = this.createClickSound(200, 0.1)
    
    // Shuffle sound
    this.sounds.shuffle = this.createShuffleSound()
    
    // Win sound
    this.sounds.win = this.createWinSound()
    
    // Your turn sound
    this.sounds.yourTurn = this.createBellSound()
    
    // Capicua sound
    this.sounds.capicua = this.createSpecialSound()
    
    // Click sound
    this.sounds.click = this.createClickSound(300, 0.05)
  }
  
  createClickSound(frequency = 200, duration = 0.1) {
    return () => {
      if (!this.enabled) return
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      gainNode.gain.value = this.volume * 0.3
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    }
  }
  
  createShuffleSound() {
    return () => {
      if (!this.enabled) return
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const bufferSize = 4096
      const brownNoise = audioContext.createScriptProcessor(bufferSize, 1, 1)
      
      brownNoise.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.1
        }
      }
      
      const gainNode = audioContext.createGain()
      gainNode.gain.value = this.volume * 0.2
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)
      
      brownNoise.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      setTimeout(() => brownNoise.disconnect(), 500)
    }
  }
  
  createBellSound() {
    return () => {
      if (!this.enabled) return
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.value = this.volume * 0.4
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
  }
  
  createWinSound() {
    return () => {
      if (!this.enabled) return
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const notes = [523.25, 659.25, 783.99, 1046.50] // C, E, G, C
      
      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = freq
        oscillator.type = 'sine'
        
        const startTime = audioContext.currentTime + i * 0.1
        gainNode.gain.value = 0
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.3)
      })
    }
  }
  
  createSpecialSound() {
    return () => {
      if (!this.enabled) return
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 600 + i * 200
        oscillator.type = 'square'
        
        const startTime = audioContext.currentTime + i * 0.05
        gainNode.gain.value = this.volume * 0.2
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.2)
      }
    }
  }
  
  play(soundName) {
    if (this.sounds[soundName] && this.enabled) {
      try {
        this.sounds[soundName]()
      } catch (error) {
        console.error('Error playing sound:', error)
      }
    }
  }
  
  setEnabled(enabled) {
    this.enabled = enabled
    localStorage.setItem('soundEnabled', enabled.toString())
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    localStorage.setItem('soundVolume', this.volume.toString())
  }
}

// Create singleton instance
const soundManager = new SoundManager()

export default soundManager