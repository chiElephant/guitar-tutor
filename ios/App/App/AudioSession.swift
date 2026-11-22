import AVFoundation
import Capacitor
import UIKit

// Hypothesis: WKWebView's getUserMedia captures via the app's shared AVAudioSession, so setting a USB input here reaches the web audio graph; if a real device shows otherwise, fall back to a native PCM-streaming plugin.
@objc(AudioSessionPlugin)
public class AudioSessionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AudioSessionPlugin"
    public let jsName = "AudioSession"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "configure", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "inputs", returnType: CAPPluginReturnPromise)
    ]

    @objc func configure(_ call: CAPPluginCall) {
        let s = AVAudioSession.sharedInstance()
        do {
            try s.setCategory(.playAndRecord, mode: .measurement, options: [.allowBluetoothHFP, .defaultToSpeaker, .mixWithOthers])
            try s.setPreferredSampleRate(48000)
            try s.setPreferredIOBufferDuration(0.005)
            try s.setActive(true)
            if let usb = s.availableInputs?.first(where: { $0.portType == .usbAudio }) {
                try s.setPreferredInput(usb)
            }
        } catch {
            return call.reject(error.localizedDescription)
        }
        inputs(call)
    }

    @objc func inputs(_ call: CAPPluginCall) {
        let s = AVAudioSession.sharedInstance()
        call.resolve([
            "input": s.currentRoute.inputs.first?.portName ?? "",
            "inputs": (s.availableInputs ?? []).map { $0.portName }
        ])
    }
}

class AppViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AudioSessionPlugin())
    }
}
