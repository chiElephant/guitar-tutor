import { PitchDetector } from 'pitchy'

const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

export type Note = { name: string; octave: number; midi: number; cents: number; hz: number }

/** Nearest equal-tempered note (A4 = 440) and the deviation from it in cents. */
export function noteFromFrequency(hz: number): Note {
  const midiFloat = 69 + 12 * Math.log2(hz / 440)
  const midi = Math.round(midiFloat)
  return {
    name: NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    midi,
    cents: Math.round((midiFloat - midi) * 100),
    hz,
  }
}

/** Reads an AnalyserNode and returns a stable pitch, or null while nothing clear is sounding. */
export class PitchReader {
  private detector: PitchDetector<Float32Array>
  private buffer: Float32Array<ArrayBuffer>
  private recent: number[] = []

  constructor(private analyser: AnalyserNode, private sampleRate: number) {
    this.detector = PitchDetector.forFloat32Array(analyser.fftSize)
    this.detector.clarityThreshold = 0.9
    this.detector.minVolumeDecibels = -40
    this.buffer = new Float32Array(analyser.fftSize)
  }

  read(): Note | null {
    this.analyser.getFloatTimeDomainData(this.buffer)
    const [hz, clarity] = this.detector.findPitch(this.buffer, this.sampleRate)
    if (clarity < 0.9 || hz < 60 || hz > 1500) {
      this.recent.length = 0
      return null
    }
    // Median of the last few frames rejects single-frame octave errors.
    this.recent.push(hz)
    if (this.recent.length > 5) this.recent.shift()
    const sorted = [...this.recent].sort((a, b) => a - b)
    return noteFromFrequency(sorted[sorted.length >> 1])
  }
}
