import { configureNativeAudio } from './native'

export type Input = { context: AudioContext; analyser: AnalyserNode; splitter: ChannelSplitterNode; stream: MediaStream; label: string }

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
  const native = await configureNativeAudio()
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
  // iOS: WebKit labels the track "iPhone Microphone" whatever the route, so show the port iOS actually chose.
  const track = stream.getAudioTracks()[0]?.label ?? 'microphone'
  const label = native?.input ? `${native.input} via ${track}` : track
  return { context, analyser, splitter, stream, label }
}

export function closeInput(input: Input) {
  input.stream.getTracks().forEach((t) => t.stop())
  void input.context.close()
}
