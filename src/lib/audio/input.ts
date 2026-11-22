import { configureNativeAudio } from './native'

export type Input = { context: AudioContext; analyser: AnalyserNode; stream: MediaStream; label: string }

/** Enumerate audio inputs. Labels are empty until the user has granted mic permission once. */
export async function listInputs(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter((d) => d.kind === 'audioinput')
}

/**
 * Open a raw instrument input. Call from a user gesture (iOS needs it to start audio).
 * All voice processing is off: echo cancellation would eat a guitar signal, and AGC
 * would hide dynamics. On a native shell this first asks iOS to route a USB interface.
 */
export async function openInput(deviceId?: string): Promise<Input> {
  await configureNativeAudio()
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  })
  // Created after getUserMedia and without a sampleRate: iOS picks the rate it will actually use.
  const context = new AudioContext({ latencyHint: 'interactive' })
  await context.resume()
  const analyser = context.createAnalyser()
  analyser.fftSize = 4096 // ~85 ms at 48 kHz: at least 2 periods of low E (82 Hz)
  // Channel 0 only: a stereo interface's instrument jack is usually input 1 (left).
  const splitter = context.createChannelSplitter(2)
  context.createMediaStreamSource(stream).connect(splitter)
  splitter.connect(analyser, 0)
  const label = stream.getAudioTracks()[0]?.label ?? 'microphone'
  return { context, analyser, stream, label }
}

export function closeInput(input: Input) {
  input.stream.getTracks().forEach((t) => t.stop())
  void input.context.close()
}
