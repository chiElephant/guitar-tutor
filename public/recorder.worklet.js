// Copies channel 0 to the main thread in ~85 ms chunks. Plain JS in public/ so no bundling is needed.
class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = new Float32Array(4096)
    this.filled = 0
  }
  process(inputs) {
    const input = inputs[0]?.[0]
    if (!input) return true
    this.buffer.set(input, this.filled)
    this.filled += input.length
    if (this.filled >= this.buffer.length - 128) {
      this.port.postMessage(this.buffer.slice(0, this.filled))
      this.filled = 0
    }
    return true
  }
}
registerProcessor('recorder', RecorderProcessor)
