import * as alphaTab from '@coderline/alphatab'
import { Capacitor } from '@capacitor/core'

/** One place for alphaTab settings shared by the player, lessons and demos. */
export function createApi(el: HTMLElement, settings: alphaTab.json.SettingsJson = {}) {
  return new alphaTab.AlphaTabApi(el, {
    core: {
      // alphaTab guesses the font path from its script chunk (/assets/font/); the Vite plugin puts it at /font/.
      fontDirectory: '/font/',
      // WKWebView cannot start Web Workers from Capacitor's custom scheme; render on the main thread there.
      useWorkers: !Capacitor.isNativePlatform(),
    },
    player: { playerMode: alphaTab.PlayerMode.EnabledAutomatic, soundFont: '/soundfont/sonivox.sf3', scrollElement: 'html' },
    ...settings,
  })
}
