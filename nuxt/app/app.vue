<script setup lang="ts">
import { TooltipProvider } from 'radix-vue'
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <TooltipProvider>
      <NuxtPage />
    </TooltipProvider>
  </div>
</template>
