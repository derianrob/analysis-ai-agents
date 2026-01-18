<script setup lang="ts">
import { cn } from '../../utils/cn'
import { computed, type HTMLAttributes } from 'vue'

interface Props {
  class?: HTMLAttributes['class']
  type?: string
  disabled?: boolean
  placeholder?: string
  modelValue?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emits = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClass = computed(() =>
  cn(
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    props.class
  )
)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emits('update:modelValue', target.value)
}
</script>

<template>
  <input
    :class="inputClass"
    :type="type"
    :disabled="disabled"
    :placeholder="placeholder"
    :value="modelValue"
    @input="handleInput"
  />
</template>
