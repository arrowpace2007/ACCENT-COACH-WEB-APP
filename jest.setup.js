import '@testing-library/jest-dom'

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createAnalyser: jest.fn(),
  createGain: jest.fn(),
  createMediaStreamSource: jest.fn(),
  createScriptProcessor: jest.fn(),
  createDynamicsCompressor: jest.fn(),
  createBiquadFilter: jest.fn(),
  destination: {},
  sampleRate: 44100,
  state: 'running',
  resume: jest.fn(),
  close: jest.fn(),
}))

global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  ondataavailable: null,
  onstop: null,
  state: 'inactive',
}))

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn() }
      ])
    }),
  },
})

// Mock service worker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn().mockResolvedValue({}),
    controller: {
      postMessage: jest.fn(),
    },
  },
})

// Mock Redis client
jest.mock('./lib/cache/redis-client', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    setJSON: jest.fn(),
    getJSON: jest.fn(),
    isHealthy: jest.fn().mockReturnValue(true),
  },
}))

// Mock performance monitor
jest.mock('./lib/monitoring/performance-monitor', () => ({
  performanceMonitor: {
    recordMetric: jest.fn(),
    getMetrics: jest.fn(),
    getSystemHealth: jest.fn(),
    recordUserAnalytics: jest.fn(),
  },
}))

// Suppress console warnings in tests
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
})