/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module 'signalsmith-stretch' {
  // shortcut: the package ships no types; add what we use, extend when more of the API is needed
  type Stretch = AudioNode & {
    start(): void
    stop(): void
    schedule(o: Partial<{ active: boolean; input: number; rate: number; semitones: number; loopStart: number; loopEnd: number }>): void
    addBuffers(channels: Float32Array[]): Promise<number>
    dropBuffers(): void
    setUpdateInterval(seconds: number, cb?: () => void): void
    inputTime: number
  }
  export default function SignalsmithStretch(ctx: AudioContext): Promise<Stretch>
}
