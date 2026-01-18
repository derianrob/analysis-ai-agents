// export default defineNuxtPlugin(async (nuxtApp) => {
//   if (import.meta.client) {
//     const components = await import('@alegradev/smile-ui-next')

//     for (const key in components) {
//       const component = components[key]

//       // Validación para asegurarse de que sea un componente de Vue
//       if (component && (component.setup || component.render)) {
//         // Registra el componente globalmente
//         nuxtApp.vueApp.component(key, component)
//       }
//     }
//   }
// })
