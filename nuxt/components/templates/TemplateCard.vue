<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import type { Template } from '../../types/concepts'
import { cn } from '../../utils/cn'

interface Props {
  template: Template
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <button
    @click="handleClick"
    :class="cn(
      'group relative w-full text-left p-6 rounded-2xl border border-border/50',
      'bg-card hover:bg-accent/5 transition-all duration-300',
      'hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30',
      'focus:outline-none focus:ring-2 focus:ring-primary/50'
    )"
  >
    <!-- Icon with gradient background -->
    <div :class="cn(
      'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
      'bg-gradient-to-br shadow-lg',
      template.color
    )">
      <Icon :name="`lucide:${template.icon === 'MessageSquareText' ? 'message-square-text' : template.icon.toLowerCase()}`" class="w-7 h-7 text-white" />
    </div>

    <!-- Content -->
    <h3 class="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
      {{ template.name }}
    </h3>
    <p class="text-sm text-muted-foreground leading-relaxed mb-4">
      {{ template.description }}
    </p>

    <!-- Arrow indicator -->
    <div class="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
      <span>Comenzar</span>
      <ArrowRight class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
    </div>

    <!-- Decorative gradient -->
    <div :class="cn(
      'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity',
      'bg-gradient-to-br pointer-events-none',
      template.color
    )" />
  </button>
</template>
