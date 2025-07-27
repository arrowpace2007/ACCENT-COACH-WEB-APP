# Accent Coach - Advanced AI-Powered Pronunciation Training

A production-ready pronunciation training platform with industry-standard audio analysis, real-time feedback, and multi-model AI assessment.

## 🚀 Features

### Advanced Audio Analysis
- **Multi-Model Analysis**: Google Cloud Speech, Azure Speech, Gemini Pro, and local processing
- **Real-time Processing**: WebSocket-based streaming analysis with voice activity detection
- **GOP Scoring**: Goodness of Pronunciation algorithm with phoneme-level accuracy
- **MFCC Features**: Mel-Frequency Cepstral Coefficients extraction for acoustic analysis
- **Prosody Analysis**: Stress, rhythm, intonation, and pace assessment
- **Native Similarity**: DTW-based comparison with native speaker patterns

### Audio Processing Pipeline
- **Noise Reduction**: Advanced noise gate and filtering
- **Echo Cancellation**: Real-time echo suppression
- **Automatic Gain Control**: Dynamic range optimization
- **Quality Assessment**: SNR, clarity, and distortion analysis
- **Voice Activity Detection**: Intelligent speech/silence detection

### Production Features
- **Ensemble Scoring**: Multiple AI models with weighted results
- **Fallback Systems**: Graceful degradation when services are unavailable
- **Error Handling**: Comprehensive error recovery and logging
- **Performance Monitoring**: Real-time metrics and health checks
- **Scalable Architecture**: Modular design for easy extension

## 🛠 Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account
- AI service API keys (optional but recommended)

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - AI Services (for enhanced analysis)
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=eastus

# Optional - Real-time Analysis
NEXT_PUBLIC_REALTIME_ENDPOINT=ws://localhost:3001
```

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up database
npm run db:setup

# Start development server
npm run dev
```

## 🏗 Architecture

### Audio Analysis Pipeline

```
Audio Input → Audio Processor → Feature Extraction → Multi-Model Analysis → Ensemble Results
     ↓              ↓                    ↓                    ↓                ↓
Voice Activity → Noise Reduction → MFCC/Spectral → GOP/Prosody/Native → Weighted Scoring
Detection        Echo Cancel.      Features        Similarity Analysis   Confidence
```

### Model Hierarchy

1. **Google Cloud Speech** - Highest accuracy for transcription and timing
2. **Azure Speech** - Built-in pronunciation assessment
3. **Gemini Pro** - Advanced linguistic analysis
4. **Local Analysis** - Fallback processing using signal analysis

### Real-time Processing

```
Microphone → Web Audio API → Voice Activity Detection → Feature Extraction → WebSocket → Analysis Server
                ↓                        ↓                      ↓              ↓
            Audio Buffer → Speech Segments → MFCC Features → Real-time Results
```

## 📊 Analysis Components

### GOP (Goodness of Pronunciation) Scoring
- Phoneme-level accuracy assessment
- Acoustic model comparison
- Duration and timing analysis
- Confidence scoring

### Prosody Analysis
- **Stress**: Word and syllable emphasis patterns
- **Rhythm**: Timing regularity and naturalness
- **Intonation**: Pitch contour and range analysis
- **Pace**: Speaking rate and fluency assessment

### Native Similarity Scoring
- Phonetic similarity to native speakers
- Prosodic pattern matching
- Temporal alignment using DTW
- Overall naturalness assessment

### Audio Quality Metrics
- Signal-to-Noise Ratio (SNR)
- Spectral clarity analysis
- Background noise detection
- Echo and distortion measurement

## 🔧 Configuration

### Model Configuration

```typescript
const config: AnalysisConfig = {
  models: {
    google: { enabled: true, priority: 3, timeout: 10000 },
    azure: { enabled: true, priority: 2, timeout: 10000 },
    gemini: { enabled: true, priority: 1, timeout: 15000 },
    local: { enabled: true, priority: 0, timeout: 5000 }
  },
  audio: {
    sampleRate: 44100,
    enableNoiseReduction: true,
    enableEchoCancellation: true,
    enableAutoGainControl: true
  },
  analysis: {
    enableRealTime: true,
    enableGOP: true,
    enableProsody: true,
    enableNativeSimilarity: true,
    confidenceThreshold: 0.7
  }
}
```

### Audio Processing Settings

```typescript
const audioConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
    channelCount: 1,
    latency: 0.01
  }
}
```

## 🧪 Usage Examples

### Basic Analysis

```typescript
import { advancedAudioAnalyzer } from '@/lib/audio/advanced-audio-analyzer'

// Initialize
await advancedAudioAnalyzer.initialize()

// Analyze audio
const result = await advancedAudioAnalyzer.analyzeAudio(
  audioBuffer,
  "The quick brown fox jumps over the lazy dog",
  {
    modelPreference: ['gemini', 'google', 'azure', 'local'],
    userAccent: 'american'
  }
)

console.log('Overall Score:', result.overallScore)
console.log('GOP Score:', result.gopScore)
console.log('Native Similarity:', result.nativeSimilarity)
```

### Real-time Analysis

```typescript
// Start real-time analysis
await advancedAudioAnalyzer.startRealTimeAnalysis(
  mediaStream,
  targetSentence,
  (result) => {
    console.log('Real-time result:', result)
  },
  (audioData) => {
    console.log('Audio level:', audioData.vad.energy)
    console.log('Speech detected:', audioData.vad.isActive)
  }
)

// Stop analysis
advancedAudioAnalyzer.stopRealTimeAnalysis()
```

### Health Monitoring

```typescript
// Check system health
const health = await advancedAudioAnalyzer.getSystemHealth()
console.log('Overall health:', health.overall)
console.log('Model status:', health.models)
console.log('Real-time status:', health.realTime)

// Get performance metrics
const metrics = advancedAudioAnalyzer.getPerformanceMetrics()
console.log('Average processing time:', metrics.averageProcessingTime)
console.log('Success rate:', metrics.successRate)
```

## 🔍 API Reference

### AdvancedPronunciationAnalysis

```typescript
interface AdvancedPronunciationAnalysis {
  overallScore: number                    // 0-100 overall pronunciation score
  gopScore: GOPScore                      // Goodness of Pronunciation metrics
  nativeSimilarity: NativeSimilarityScore // Native speaker similarity
  prosody: ProsodyAnalysis               // Stress, rhythm, intonation
  words: WordAnalysis[]                  // Word-level analysis
  audioFeatures: AudioFeatures           // MFCC and spectral features
  audioQuality: AudioQualityMetrics      // Recording quality metrics
  feedback: ComprehensiveFeedback        // Detailed feedback and tips
  confidence: number                     // Analysis confidence (0-100)
  processingTime: number                 // Analysis duration (ms)
  modelUsed: string[]                    // Models used for analysis
  timestamp: string                      // Analysis timestamp
}
```

### Real-time Data

```typescript
interface RealTimeAudioData {
  audioBuffer: Float32Array              // Raw audio data
  timestamp: number                      // Capture timestamp
  vad: VoiceActivityDetection           // Speech detection results
  features: Partial<AudioFeatures>      // Extracted features
}
```

## 🚀 Deployment

### Production Checklist

- [ ] Configure all API keys
- [ ] Set up Supabase database
- [ ] Configure real-time WebSocket server
- [ ] Set up monitoring and logging
- [ ] Configure CDN for audio assets
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Set up backup analysis services

### Performance Optimization

- Use WebWorkers for heavy audio processing
- Implement audio compression for network transfer
- Cache analysis results for repeated content
- Use streaming for large audio files
- Implement progressive loading for features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the troubleshooting guide
- Review API documentation
- Open an issue on GitHub
- Contact support team

---

Built with ❤️ for language learners worldwide