<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { Loader2, Brain, Sparkles, CheckCircle2 } from 'lucide-vue-next'
  import { cn } from '../../../utils/cn'

  interface Props {
    totalAnswers: number
    onComplete: () => void
  }

  const props = defineProps<Props>()

  const ANALYSIS_STEPS = [
    { id: 1, label: 'Procesando respuestas', duration: 800 },
    { id: 2, label: 'Extrayendo conceptos clave', duration: 1200 },
    { id: 3, label: 'Mapeando verbatims', duration: 1000 },
    { id: 4, label: 'Generando resumen', duration: 800 },
  ]

  const currentStep = ref(0)
  const completedSteps = ref<number[]>([])

  onMounted(() => {
    let timeout: NodeJS.Timeout

    const runStep = (stepIndex: number) => {
      if (stepIndex >= ANALYSIS_STEPS.length) {
        setTimeout(props.onComplete, 500)
        return
      }

      currentStep.value = stepIndex

      timeout = setTimeout(() => {
        completedSteps.value.push(stepIndex)
        runStep(stepIndex + 1)
      }, ANALYSIS_STEPS[stepIndex].duration)
    }

    runStep(0)

    onUnmounted(() => {
      clearTimeout(timeout)
    })
  })
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full p-8">
    <div class="max-w-md w-full text-center">
      <!-- Animated icon -->
      <div class="relative w-24 h-24 mx-auto mb-8">
        <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        <div
          class="absolute inset-2 bg-primary/30 rounded-full animate-pulse"
        />
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25"
          >
            <Brain class="w-10 h-10 text-primary-foreground animate-pulse" />
          </div>
        </div>
        <!-- Sparkles -->
        <Sparkles
          class="absolute -top-2 -right-2 w-6 h-6 text-primary animate-bounce"
        />
        <Sparkles
          class="absolute -bottom-1 -left-3 w-5 h-5 text-primary/60 animate-bounce"
          style="animation-delay: 100ms"
        />
      </div>

      <h2 class="text-2xl font-semibold text-foreground mb-2">
        Analizando con IA
      </h2>
      <p class="text-muted-foreground mb-8">
        Procesando {{ totalAnswers }} respuestas...
      </p>

      <!-- Progress steps -->
      <div class="space-y-3 text-left">
        <div
          v-for="(step, index) in ANALYSIS_STEPS"
          :key="step.id"
          :class="
            cn(
              'flex items-center gap-3 p-3 rounded-lg transition-all duration-300',
              completedSteps.includes(index) && 'bg-emerald-500/10',
              currentStep === index &&
                !completedSteps.includes(index) &&
                'bg-primary/10'
            )
          "
        >
          <div class="flex-shrink-0">
            <CheckCircle2
              v-if="completedSteps.includes(index)"
              class="w-5 h-5 text-emerald-500"
            />
            <Loader2
              v-else-if="
                currentStep === index && !completedSteps.includes(index)
              "
              class="w-5 h-5 text-primary animate-spin"
            />
            <div
              v-else
              class="w-5 h-5 rounded-full border-2 border-muted-foreground/30"
            />
          </div>
          <span
            :class="
              cn(
                'text-sm transition-colors',
                completedSteps.includes(index) &&
                  'text-emerald-600 font-medium',
                currentStep === index &&
                  !completedSteps.includes(index) &&
                  'text-foreground font-medium',
                !completedSteps.includes(index) &&
                  currentStep !== index &&
                  'text-muted-foreground'
              )
            "
          >
            {{ step.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
