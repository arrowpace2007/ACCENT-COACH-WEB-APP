// Service Worker for offline pronunciation practice
const CACHE_NAME = 'accent-coach-v1'
const STATIC_CACHE = 'accent-coach-static-v1'
const AUDIO_CACHE = 'accent-coach-audio-v1'

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/practice',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
]

// Audio files to cache
const AUDIO_ASSETS = [
  '/audio/examples/',
  '/audio/pronunciation-guides/',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS.filter(url => !url.includes('undefined')))
      }),
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.addAll(AUDIO_ASSETS)
      })
    ]).then(() => {
      console.log('Service Worker installed successfully')
      return self.skipWaiting()
    }).catch((error) => {
      console.error('Service Worker installation failed:', error)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== AUDIO_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker activated')
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first, cache fallback
    event.respondWith(handleApiRequest(request))
  } else if (url.pathname.startsWith('/audio/')) {
    // Audio files - cache first, network fallback
    event.respondWith(handleAudioRequest(request))
  } else if (url.pathname.startsWith('/_next/static/')) {
    // Static assets - cache first
    event.respondWith(handleStaticRequest(request))
  } else {
    // Pages - network first, cache fallback
    event.respondWith(handlePageRequest(request))
  }
})

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed for API request, trying cache...')
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for critical APIs
    if (request.url.includes('/api/practice-sentences')) {
      return new Response(JSON.stringify({
        sentences: [
          {
            sentence: "The quick brown fox jumps over the lazy dog.",
            difficulty: "beginner",
            focusAreas: ["consonants", "vowels"],
            tips: "Focus on clear articulation of each word."
          }
        ]
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Handle audio requests
async function handleAudioRequest(request) {
  // Try cache first for audio files
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(AUDIO_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Audio file not available offline')
    return new Response('Audio not available offline', { status: 503 })
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    return new Response('Static asset not available', { status: 503 })
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed for page request, trying cache...')
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/offline')
    if (offlineResponse) {
      return offlineResponse
    }
    
    return new Response('Page not available offline', { status: 503 })
  }
}

// Background sync for audio analysis
self.addEventListener('sync', (event) => {
  if (event.tag === 'audio-analysis-sync') {
    event.waitUntil(syncAudioAnalysis())
  }
})

async function syncAudioAnalysis() {
  console.log('Syncing pending audio analysis...')
  
  try {
    // Get pending analysis from IndexedDB
    const pendingAnalysis = await getPendingAnalysis()
    
    for (const analysis of pendingAnalysis) {
      try {
        const response = await fetch('/api/analyze-audio', {
          method: 'POST',
          body: analysis.formData
        })
        
        if (response.ok) {
          // Remove from pending queue
          await removePendingAnalysis(analysis.id)
          
          // Notify client
          const clients = await self.clients.matchAll()
          clients.forEach(client => {
            client.postMessage({
              type: 'ANALYSIS_SYNCED',
              data: { id: analysis.id, success: true }
            })
          })
        }
      } catch (error) {
        console.error('Failed to sync analysis:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// IndexedDB helpers for offline storage
async function getPendingAnalysis() {
  // Implementation would use IndexedDB to store pending analysis
  return []
}

async function removePendingAnalysis(id) {
  // Implementation would remove from IndexedDB
}

// Push notifications for practice reminders
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.body || 'Time for your pronunciation practice!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'practice-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'practice',
        title: 'Start Practice',
        icon: '/icons/practice-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ],
    data: {
      url: '/practice',
      timestamp: Date.now()
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Accent Coach', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'practice') {
    event.waitUntil(
      clients.openWindow('/practice')
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    event.waitUntil(cacheAudioFile(event.data.url))
  }
})

async function cacheAudioFile(url) {
  try {
    const cache = await caches.open(AUDIO_CACHE)
    await cache.add(url)
    console.log('Audio file cached:', url)
  } catch (error) {
    console.error('Failed to cache audio file:', error)
  }
}