import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioStreamState {
  isStreaming: boolean;
  isMuted: boolean;
  audioLevel: number;
  isClipping: boolean;
  isConnected: boolean;
  error: string | null;
}

interface AudioStreamControls {
  startStream: () => Promise<void>;
  stopStream: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setGain: (gain: number) => void;
  enableLimiter: (enabled: boolean) => void;
  enableNormalizer: (enabled: boolean) => void;
}

export const useAudioStream = (): [AudioStreamState, AudioStreamControls] => {
  const [state, setState] = useState<AudioStreamState>({
    isStreaming: false,
    isMuted: false,
    audioLevel: 0,
    isClipping: false,
    isConnected: false,
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  const animationFrameRef = useRef<number>();

  const [volume, setVolumeState] = useState(100);
  const [gain, setGainState] = useState(150);
  const [limiterEnabled, setLimiterEnabled] = useState(true);
  const [normalizerEnabled, setNormalizerEnabled] = useState(true);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS (Root Mean Square) for more accurate level detection
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);
    const level = (rms / 255) * 100;

    // Detect clipping (when signal exceeds safe threshold)
    const isClipping = level > 85;

    setState(prev => ({
      ...prev,
      audioLevel: state.isMuted ? 0 : level,
      isClipping: state.isMuted ? false : isClipping,
    }));

    if (state.isStreaming) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [state.isStreaming, state.isMuted]);

  const setupAudioProcessing = useCallback(async (stream: MediaStream) => {
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;

      // Create source node from microphone
      sourceNodeRef.current = audioContext.createMediaStreamSource(stream);
      const sourceNode = sourceNodeRef.current;

      // Create gain node for volume control
      gainNodeRef.current = audioContext.createGain();
      const gainNode = gainNodeRef.current;
      gainNode.gain.value = (volume * gain) / 10000; // Convert to 0-2 range

      // Create compressor/limiter
      limiterRef.current = audioContext.createDynamicsCompressor();
      const limiter = limiterRef.current;
      limiter.threshold.value = -10; // dB
      limiter.knee.value = 40;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.25;

      // Create analyser for level monitoring
      analyserRef.current = audioContext.createAnalyser();
      const analyser = analyserRef.current;
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      // Connect the audio pipeline
      sourceNode.connect(gainNode);
      
      if (limiterEnabled) {
        gainNode.connect(limiter);
        limiter.connect(analyser);
      } else {
        gainNode.connect(analyser);
      }

      // Start audio analysis
      analyzeAudio();

      setState(prev => ({ ...prev, isConnected: true, error: null }));
    } catch (error) {
      console.error('Error setting up audio processing:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to setup audio processing',
        isConnected: false 
      }));
    }
  }, [volume, gain, limiterEnabled, analyzeAudio]);

  const setupWebRTC = useCallback(async (stream: MediaStream) => {
    // Mock WebRTC setup for frontend-only version
    console.log('Mock WebRTC setup with stream:', stream);
    
    // Simulate connection after 2 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isConnected: true
      }));
    }, 2000);
  }, []);

  const startStream = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false, // We'll handle gain manually
          sampleRate: 48000,
          channelCount: 2
        }
      });

      mediaStreamRef.current = stream;

      // Setup audio processing pipeline
      await setupAudioProcessing(stream);

      // Setup WebRTC for streaming (mock)
      await setupWebRTC(stream);

      setState(prev => ({ 
        ...prev, 
        isStreaming: true,
        error: null
      }));

    } catch (error) {
      console.error('Error starting stream:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start stream',
        isStreaming: false
      }));
    }
  }, [setupAudioProcessing, setupWebRTC]);

  const stopStream = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Reset refs
    sourceNodeRef.current = null;
    analyserRef.current = null;
    gainNodeRef.current = null;
    limiterRef.current = null;

    setState(prev => ({
      ...prev,
      isStreaming: false,
      audioLevel: 0,
      isClipping: false,
      isConnected: false,
      error: null
    }));
  }, []);

  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = state.isMuted;
      });
    }

    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, [state.isMuted]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = (newVolume * gain) / 10000;
    }
  }, [gain]);

  const setGain = useCallback((newGain: number) => {
    setGainState(newGain);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = (volume * newGain) / 10000;
    }
  }, [volume]);

  const enableLimiter = useCallback((enabled: boolean) => {
    setLimiterEnabled(enabled);
    // Reconnect audio pipeline when limiter setting changes
    if (state.isStreaming && mediaStreamRef.current) {
      setupAudioProcessing(mediaStreamRef.current);
    }
  }, [state.isStreaming, setupAudioProcessing]);

  const enableNormalizer = useCallback((enabled: boolean) => {
    setNormalizerEnabled(enabled);
    // Normalizer implementation would go here
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return [
    state,
    {
      startStream,
      stopStream,
      toggleMute,
      setVolume,
      setGain,
      enableLimiter,
      enableNormalizer,
    }
  ];
};