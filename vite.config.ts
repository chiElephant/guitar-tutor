import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { alphaTab } from '@coderline/alphatab-vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    svelte(),
    alphaTab(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Guitar Tutor',
        short_name: 'Guitar Tutor',
        description: 'Free, open-source guitar lessons, tabs, tuner and recorder.',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        // soundfont + Bravura font are what make offline playback work
        globPatterns: ['**/*.{js,css,html,svg,woff2,sf2,sf3,alphatex,musicxml}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
})
