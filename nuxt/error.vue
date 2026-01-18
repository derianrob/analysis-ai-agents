<script setup lang="ts">
import { Home as HomeIcon } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-foreground mb-2">Página no encontrada</h2>
      <p class="text-muted-foreground mb-8">
        Lo sentimos, la página que buscas no existe.
      </p>
      <Button @click="goHome" class="gap-2">
        <HomeIcon class="w-4 h-4" />
        Volver al inicio
      </Button>
    </div>
  </div>
</template>
