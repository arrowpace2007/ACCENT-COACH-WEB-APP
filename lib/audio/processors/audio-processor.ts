import { AudioFeatures, VoiceActivityDetection, RealTimeAudioData } from '../types'

export class AudioProcessor {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private processor: ScriptProcessorNode | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private stream: MediaStream | null = null
  
  // Audio processing parameters
  private readonly SAMPLE_RATE = 44100
  private readonly FFT_SIZE = 2048
  private readonly BUFFER_SIZE = 4096
  private readonly VAD_THRESHOLD = 0.01
  private readonly SMOOTHING_FACTOR = 0.8

  // Noise reduction and enhancement
  private noiseGate: GainNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private highPassFilter: BiquadFilterNode | null = null

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.SAMPLE_RATE,
        latencyHint: 'interactive'
      })

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Set up audio processing chain
      this.setupAudioProcessingChain()
    } catch (error) {
      console.error('Failed to initialize audio processor:', error)
      throw new Error('Audio initialization failed')
    }
  }

  private setupAudioProcessingChain(): void {
    if (!this.audioContext) return

    // Create analyser for real-time analysis
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = this.FFT_SIZE
    this.analyser.smoothingTimeConstant = this.SMOOTHING_FACTOR
    this.analyser.minDecibels = -90
    this.analyser.maxDecibels = -10

    // Create noise gate
    this.noiseGate = this.audioContext.createGain()
    this.noiseGate.gain.value = 1.0

    // Create compressor for dynamic range control
    this.compressor = this.audioContext.createDynamicsCompressor()
    this.compressor.threshold.value = -24
    this.compressor.knee.value = 30
    this.compressor.ratio.value = 12
    this.compressor.attack.value = 0.003
    this.compressor.release.value = 0.25

    // Create high-pass filter to remove low-frequency noise
    this.highPassFilter = this.audioContext.createBiquadFilter()
    this.highPassFilter.type = 'highpass'
    this.highPassFilter.frequency.value = 80
    this.highPassFilter.Q.value = 1

    // Create script processor for real-time analysis
    this.processor = this.audioContext.createScriptProcessor(this.BUFFER_SIZE, 1, 1)
  }

  async startProcessing(stream: MediaStream, onAudioData: (data: RealTimeAudioData) => void): Promise<void> {
    if (!this.audioContext || !this.analyser || !this.processor) {
      throw new Error('Audio processor not initialized')
    }

    this.stream = stream
    this.source = this.audioContext.createMediaStreamSource(stream)

    // Connect audio processing chain
    this.source
      .connect(this.highPassFilter!)
      .connect(this.noiseGate!)
      .connect(this.compressor!)
      .connect(this.analyser)
      .connect(this.processor)

    this.processor.connect(this.audioContext.destination)

    // Set up real-time processing
    this.processor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer.getChannelData(0)
      const audioData = this.processAudioFrame(inputBuffer)
      onAudioData(audioData)
    }
  }

  private processAudioFrame(audioBuffer: Float32Array): RealTimeAudioData {
    const timestamp = Date.now()
    
    // Voice Activity Detection
    const vad = this.detectVoiceActivity(audioBuffer)
    
    // Extract basic features
    const features = this.extractBasicFeatures(audioBuffer)

    return {
      audioBuffer: new Float32Array(audioBuffer),
      timestamp,
      vad,
      features
    }
  }

  private detectVoiceActivity(audioBuffer: Float32Array): VoiceActivityDetection {
    // Calculate energy
    const energy = this.calculateEnergy(audioBuffer)
    
    // Calculate zero crossing rate
    const zcr = this.calculateZeroCrossingRate(audioBuffer)
    
    // Calculate spectral entropy
    const spectralEntropy = this.calculateSpectralEntropy(audioBuffer)
    
    // Combine metrics for VAD decision
    const energyThreshold = 0.01
    const zcrThreshold = 0.3
    const entropyThreshold = 0.5
    
    const isActive = energy > energyThreshold && 
                    zcr < zcrThreshold && 
                    spectralEntropy > entropyThreshold
    
    const confidence = Math.min(1.0, (energy / energyThreshold + 
                                    (1 - zcr / zcrThreshold) + 
                                    spectralEntropy / entropyThreshold) / 3)

    return {
      isActive,
      confidence,
      energy,
      spectralEntropy,
      zeroCrossingRate: zcr
    }
  }

  private extractBasicFeatures(audioBuffer: Float32Array): Partial<AudioFeatures> {
    return {
      energy: [this.calculateEnergy(audioBuffer)],
      zeroCrossingRate: [this.calculateZeroCrossingRate(audioBuffer)],
      spectralCentroid: [this.calculateSpectralCentroid(audioBuffer)],
      spectralRolloff: [this.calculateSpectralRolloff(audioBuffer)]
    }
  }

  private calculateEnergy(buffer: Float32Array): number {
    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i]
    }
    return Math.sqrt(sum / buffer.length)
  }

  private calculateZeroCrossingRate(buffer: Float32Array): number {
    let crossings = 0
    for (let i = 1; i < buffer.length; i++) {
      if ((buffer[i] >= 0) !== (buffer[i - 1] >= 0)) {
        crossings++
      }
    }
    return crossings / (buffer.length - 1)
  }

  private calculateSpectralCentroid(buffer: Float32Array): number {
    if (!this.analyser) return 0

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(frequencyData)

    let weightedSum = 0
    let magnitudeSum = 0

    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = frequencyData[i] / 255.0
      const frequency = (i * this.SAMPLE_RATE) / (2 * frequencyData.length)
      
      weightedSum += frequency * magnitude
      magnitudeSum += magnitude
    }

    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
  }

  private calculateSpectralRolloff(buffer: Float32Array): number {
    if (!this.analyser) return 0

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(frequencyData)

    const totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0)
    const threshold = totalEnergy * 0.85 // 85% rolloff

    let cumulativeEnergy = 0
    for (let i = 0; i < frequencyData.length; i++) {
      cumulativeEnergy += frequencyData[i]
      if (cumulativeEnergy >= threshold) {
        return (i * this.SAMPLE_RATE) / (2 * frequencyData.length)
      }
    }

    return this.SAMPLE_RATE / 2
  }

  private calculateSpectralEntropy(buffer: Float32Array): number {
    if (!this.analyser) return 0

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(frequencyData)

    const normalizedData = frequencyData.map(val => val / 255.0)
    const sum = normalizedData.reduce((acc, val) => acc + val, 0)
    
    if (sum === 0) return 0

    const probabilities = normalizedData.map(val => val / sum)
    
    let entropy = 0
    for (const p of probabilities) {
      if (p > 0) {
        entropy -= p * Math.log2(p)
      }
    }

    return entropy / Math.log2(frequencyData.length) // Normalize
  }

  async extractMFCC(audioBuffer: Float32Array): Promise<number[][]> {
    // Implement MFCC extraction
    const frameSize = 512
    const hopSize = 256
    const numMfcc = 13
    const numFilters = 26
    const minFreq = 0
    const maxFreq = this.SAMPLE_RATE / 2

    const frames = this.frameSignal(audioBuffer, frameSize, hopSize)
    const mfccFeatures: number[][] = []

    for (const frame of frames) {
      const mfcc = this.computeMFCCFrame(frame, numMfcc, numFilters, minFreq, maxFreq)
      mfccFeatures.push(mfcc)
    }

    return mfccFeatures
  }

  private frameSignal(signal: Float32Array, frameSize: number, hopSize: number): Float32Array[] {
    const frames: Float32Array[] = []
    const numFrames = Math.floor((signal.length - frameSize) / hopSize) + 1

    for (let i = 0; i < numFrames; i++) {
      const start = i * hopSize
      const frame = signal.slice(start, start + frameSize)
      
      // Apply Hamming window
      const windowedFrame = new Float32Array(frameSize)
      for (let j = 0; j < frameSize; j++) {
        const window = 0.54 - 0.46 * Math.cos(2 * Math.PI * j / (frameSize - 1))
        windowedFrame[j] = frame[j] * window
      }
      
      frames.push(windowedFrame)
    }

    return frames
  }

  private computeMFCCFrame(frame: Float32Array, numMfcc: number, numFilters: number, minFreq: number, maxFreq: number): number[] {
    // Simplified MFCC computation
    // In production, use a proper MFCC library
    const fft = this.computeFFT(frame)
    const powerSpectrum = fft.map(val => val * val)
    const melFilters = this.createMelFilterBank(numFilters, frame.length, minFreq, maxFreq)
    
    const melEnergies = melFilters.map(filter => {
      let energy = 0
      for (let i = 0; i < filter.length; i++) {
        energy += powerSpectrum[i] * filter[i]
      }
      return Math.log(Math.max(energy, 1e-10))
    })

    return this.dct(melEnergies).slice(0, numMfcc)
  }

  private computeFFT(signal: Float32Array): number[] {
    // Simplified FFT - in production use a proper FFT library
    const N = signal.length
    const result = new Array(N).fill(0)
    
    for (let k = 0; k < N; k++) {
      let real = 0
      let imag = 0
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N
        real += signal[n] * Math.cos(angle)
        imag += signal[n] * Math.sin(angle)
      }
      result[k] = Math.sqrt(real * real + imag * imag)
    }
    
    return result
  }

  private createMelFilterBank(numFilters: number, fftSize: number, minFreq: number, maxFreq: number): number[][] {
    const melMin = this.hzToMel(minFreq)
    const melMax = this.hzToMel(maxFreq)
    const melPoints = []
    
    for (let i = 0; i <= numFilters + 1; i++) {
      melPoints.push(melMin + (melMax - melMin) * i / (numFilters + 1))
    }
    
    const hzPoints = melPoints.map(mel => this.melToHz(mel))
    const binPoints = hzPoints.map(hz => Math.floor((fftSize + 1) * hz / (this.SAMPLE_RATE / 2)))
    
    const filters: number[][] = []
    
    for (let i = 1; i <= numFilters; i++) {
      const filter = new Array(Math.floor(fftSize / 2) + 1).fill(0)
      
      for (let j = binPoints[i - 1]; j < binPoints[i]; j++) {
        filter[j] = (j - binPoints[i - 1]) / (binPoints[i] - binPoints[i - 1])
      }
      
      for (let j = binPoints[i]; j < binPoints[i + 1]; j++) {
        filter[j] = (binPoints[i + 1] - j) / (binPoints[i + 1] - binPoints[i])
      }
      
      filters.push(filter)
    }
    
    return filters
  }

  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700)
  }

  private melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1)
  }

  private dct(input: number[]): number[] {
    const N = input.length
    const output = new Array(N)
    
    for (let k = 0; k < N; k++) {
      let sum = 0
      for (let n = 0; n < N; n++) {
        sum += input[n] * Math.cos(Math.PI * k * (2 * n + 1) / (2 * N))
      }
      output[k] = sum
    }
    
    return output
  }

  stopProcessing(): void {
    if (this.processor) {
      this.processor.disconnect()
      this.processor = null
    }
    
    if (this.source) {
      this.source.disconnect()
      this.source = null
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  getAudioQualityMetrics(audioBuffer: Float32Array): Partial<AudioQualityMetrics> {
    const energy = this.calculateEnergy(audioBuffer)
    const zcr = this.calculateZeroCrossingRate(audioBuffer)
    
    // Estimate SNR based on signal characteristics
    const snr = this.estimateSNR(audioBuffer)
    
    // Calculate clarity based on spectral characteristics
    const clarity = this.calculateClarity(audioBuffer)
    
    return {
      snr,
      clarity,
      volume: energy,
      backgroundNoise: 1 - clarity,
      duration: audioBuffer.length / this.SAMPLE_RATE,
      sampleRate: this.SAMPLE_RATE
    }
  }

  private estimateSNR(buffer: Float32Array): number {
    // Simplified SNR estimation
    const energy = this.calculateEnergy(buffer)
    const noise = this.estimateNoiseLevel(buffer)
    return energy > 0 && noise > 0 ? 20 * Math.log10(energy / noise) : 0
  }

  private estimateNoiseLevel(buffer: Float32Array): number {
    // Estimate noise as the minimum energy in quiet segments
    const frameSize = 1024
    const frames = this.frameSignal(buffer, frameSize, frameSize / 2)
    const energies = frames.map(frame => this.calculateEnergy(frame))
    
    // Use 10th percentile as noise estimate
    const sortedEnergies = energies.sort((a, b) => a - b)
    const noiseIndex = Math.floor(sortedEnergies.length * 0.1)
    return sortedEnergies[noiseIndex] || 0.001
  }

  private calculateClarity(buffer: Float32Array): number {
    const spectralCentroid = this.calculateSpectralCentroid(buffer)
    const spectralRolloff = this.calculateSpectralRolloff(buffer)
    
    // Normalize clarity based on spectral characteristics
    const normalizedCentroid = Math.min(1, spectralCentroid / 4000)
    const normalizedRolloff = Math.min(1, spectralRolloff / 8000)
    
    return (normalizedCentroid + normalizedRolloff) / 2
  }
}