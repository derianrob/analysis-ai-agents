import type { NuxtI18nOptions } from '@nuxtjs/i18n'

const i18nConfig: NuxtI18nOptions = {
  locales: [
    {
      code: 'es-co',
      iso: 'es-CO',
      name: 'Español (Colombia)',
      files: ['es/common.json', 'es/locale/es_co.json'],
    },
    {
      code: 'en-co',
      iso: 'en-CO',
      name: 'English (Colombia)',
      files: ['en/common.json', 'en/locale/en_co.json'],
    },
    {
      code: 'es-mx',
      iso: 'es-MX',
      name: 'Español (México)',
      files: ['es/common.json', 'es/locale/es_mx.json'],
    },
    {
      code: 'en-mx',
      iso: 'en-MX',
      name: 'English (México)',
      files: ['en/common.json', 'en/locale/en_mx.json'],
    },
  ],
  defaultLocale: 'es-co',
  lazy: true,
  langDir: './',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    fallbackLocale: 'en-co',
  },
}

export default i18nConfig
