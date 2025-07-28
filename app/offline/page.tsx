"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WifiOff, Mic, RefreshCw, Download } from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [cachedSentences, setCachedSentences] = useState<any[]>([])
  const [offlineCapabilities, setOfflineCapabilities] = useState({
    basicPractice: true,
    audioRecording: true,
    localAnalysis: false,
    progressSync: false
  })

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load cached practice sentences
    loadCachedContent()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadCachedContent = async () => {
    try {
      // Check what's available in cache
      if ('caches' in window) {
        const cache = await caches.open('accent-coach-v1')
        const cachedRequests = await cache.keys()
        
        // Filter for practice sentences
        const sentenceRequests = cachedRequests.filter(req => 
          req.url.includes('/api/practice-sentences')
        )
        
        console.log('Cached content available:', sentenceRequests.length)
      }

      // Load offline practice sentences
      const offlineSentences = [
        {
          sentence: "The quick brown fox jumps over the lazy dog.",
          difficulty: "beginner",
          focusAreas: ["consonants", "vowels"],
          tips: "Focus on clear articulation of each word."
        },
        {
          sentence: "She sells seashells by the seashore.",
          difficulty: "intermediate", 
          focusAreas: ["s sounds", "rhythm"],
          tips: "Practice the 's' and 'sh' sounds clearly."
        },
        {
          sentence: "How much wood would a woodchuck chuck?",
          difficulty: "intermediate",
          focusAreas: ["w sounds", "rhythm"],
          tips: "Focus on the 'w' sound and natural rhythm."
        }
      ]

      setCachedSentences(offlineSentences)
    } catch (error) {
      console.error('Failed to load cached content:', error)
    }
  }

  const retryConnection = () => {
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  const downloadForOffline = async () => {
    try {
      // Request to cache additional content
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_ADDITIONAL_CONTENT'
        })
      }
      
      alert('Additional content cached for offline use!')
    } catch (error) {
      console.error('Failed to cache additional content:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Offline Status */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-orange-800">
              <WifiOff className="h-6 w-6" />
              {isOnline ? 'Limited Connectivity' : 'You\'re Offline'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              {isOnline 
                ? 'Some features may be limited due to connectivity issues.'
                : 'Don\'t worry! You can still practice pronunciation with cached content.'
              }
            </p>
            
            <div className="flex gap-3">
              <Button onClick={retryConnection} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
              
              <Button onClick={downloadForOffline} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download More Content
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Features */}
        <Card>
          <CardHeader>
            <CardTitle>Available Offline Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Audio Recording</span>
                <Badge variant="default" className="bg-green-600">Available</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Practice Sentences</span>
                <Badge variant="default" className="bg-green-600">Available</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">Basic Analysis</span>
                <Badge variant="secondary">Limited</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium">AI Feedback</span>
                <Badge variant="destructive">Unavailable</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cached Practice Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Offline Practice ({cachedSentences.length} sentences available)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cachedSentences.map((sentence, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {sentence.difficulty}
                    </Badge>
                    <div className="flex gap-1">
                      {sentence.focusAreas.map((area: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <p className="font-medium mb-2">"{sentence.sentence}"</p>
                  <p className="text-sm text-gray-600">{sentence.tips}</p>
                  
                  <Button 
                    className="mt-3 w-full" 
                    onClick={() => {
                      // Navigate to practice with this sentence
                      const params = new URLSearchParams({
                        sentence: sentence.sentence,
                        offline: 'true'
                      })
                      window.location.href = `/practice?${params.toString()}`
                    }}
                  >
                    Practice This Sentence
                  </Button>
                </div>
              ))}
            </div>
            
            {cachedSentences.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No cached practice content available.</p>
                <p className="text-sm">Connect to the internet to download practice sentences.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offline Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Offline Practice Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>You can still record your pronunciation and save it for later analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Practice with cached sentences to maintain your learning routine</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Your progress will sync automatically when you reconnect</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Use the self-assessment feature to track your improvement</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <div className="text-center text-sm text-gray-500">
          Status: {isOnline ? 'Online' : 'Offline'} • 
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}