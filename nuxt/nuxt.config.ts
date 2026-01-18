// https://nuxt.com/docs/api/configuration/nuxt-config


export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  alias: {
    '~': '<rootDir>',
    '@': '<rootDir>',
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon'
  ],
  // css: ['~/assets/css/main.css'],
})