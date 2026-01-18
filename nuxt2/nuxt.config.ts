// https://nuxt.com/docs/api/configuration/nuxt-config
import i18nConfig from './i18n.config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  i18n: i18nConfig,
  css: ['~/assets/main.css'],
  build: {
    transpile: ['@alegradev/smile-ui-next'],
  },
  vite: {
    ssr: {
      noExternal: ['@alegradev/smile-ui-next'],
    },
  },
})
