# iPhone + USB interface test

The one launch requirement nobody has verified on hardware. Safari on iOS ignores USB
audio interfaces (WebKit bug 211192); the native shell asks iOS for the USB input through
`ios/App/App/AudioSession.swift` before the web page opens the microphone. This test says
whether that hypothesis holds. Budget: 20 minutes.

## You need

- A Mac with Xcode and this repo (`npm install` done).
- An iPhone, its cable, and Developer Mode on (Settings → Privacy & Security → Developer Mode, then reboot).
- A class-compliant USB audio interface (Scarlett, UM2, iRig HD…), the Lightning or USB-C adapter for it, and a guitar.
  A bus-powered interface may need a powered hub or an adapter with a charging port.

## Build and run

1. In the repo:
   ```bash
   npm run cap:sync
   ```
   ```bash
   npx cap open ios
   ```
2. In Xcode: select the **App** target → **Signing & Capabilities** → tick *Automatically manage signing* → pick your team.
   If Xcode says the bundle id `app.guitartutor` is taken, change it to `app.guitartutor.<yourname>` for this test only.
3. Plug the iPhone in, trust the Mac on the phone, choose the phone as the run destination, press **Run**.
   If the phone says *Untrusted Developer*, allow it under Settings → General → VPN & Device Management.

## Tests, in order

Write down the **Listening on** line the tuner shows each time. It reads
`<port iOS chose> via <WebKit track name> at <rate> kHz`; the first part is the truth.

**A. Built-in mic (baseline).** No interface connected. Tuner → Start tuner → allow the microphone → pluck low E.
Expect `E2` near 82 Hz and a port named *iPhone Microphone*.

**B. USB input.** Kill the app. Connect the interface, plug the guitar into **input 1**, set its gain to a third.
Open the app → Tuner → Start tuner → pluck low E.

- Pass: the port names the interface, the needle moves when you pluck, and tapping the phone's own mic does *nothing*.
- Fail: the port still says *iPhone Microphone*, or tapping the phone registers. Note which.

**C. Output route.** With B running, is the app's sound (press Play on a tab) coming from the phone speaker or the
interface's headphone out? Either is fine; say which.

**D. Record along.** Tabs → Ode to Joy → **Record with playback** → play along for 20 s → Stop → play the take back.
Does your playing sit on the beat, early, or late? Guess by how much. The *Sync nudge* field moves the take; note the
value that lines it up.

**E. Hot-plug.** With the tuner running, unplug the interface. Does the tuner keep going on the built-in mic, stop, or
show a red error? Then plug it back in and press Stop → Start tuner: does it return to the interface?

## Report

Paste the five Listening-on lines, pass/fail for B, your answers to C, D, E, any red error text, and the Xcode console
lines that mention `AVAudioSession` or `AudioSessionPlugin` (filter the console by that word).

If B fails, the fallback is a native PCM capture plugin that streams samples into the web page; the Swift file's
header comment says the same. That is a day of work, not a redesign.
