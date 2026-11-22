import { Capacitor, registerPlugin } from '@capacitor/core';

type AudioSessionPlugin = { configure(): Promise<{ input: string; inputs: string[] }> };
const AudioSession = registerPlugin<AudioSessionPlugin>('AudioSession');

/** iOS: routes a plugged-in USB interface to the shared AVAudioSession. Null on web or if the native call fails. */
export async function configureNativeAudio(): Promise<{ input: string; inputs: string[] } | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    return await AudioSession.configure();
  } catch {
    return null;
  }
}
