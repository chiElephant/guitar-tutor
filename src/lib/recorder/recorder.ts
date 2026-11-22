import type { Input } from '../audio/input'

/** Captures the instrument channel of an open Input through an AudioWorklet. */
export class Recorder {
  private chunks: Float32Array[] = []
  private node: AudioWorkletNode | null = null

  async start(input: Input) {
    await input.context.audioWorklet.addModule('/recorder.worklet.js')
    this.node = new AudioWorkletNode(input.context, 'recorder', { numberOfOutputs: 0 })
    this.node.port.onmessage = (e) => this.chunks.push(e.data as Float32Array)
    input.splitter.connect(this.node, 0)
  }

  /** Returns the samples plus the estimated delay between the backing track and this capture. */
  stop(input: Input) {
    this.node?.disconnect()
    this.node = null
    const chunks = this.chunks
    this.chunks = []
    // Player audio reaches the ear outputLatency late, and the mic path adds roughly baseLatency.
    const latency = (input.context.outputLatency || 0) + (input.context.baseLatency || 0)
    return { chunks, sampleRate: input.context.sampleRate, latency }
  }
}
