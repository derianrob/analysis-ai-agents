<script setup lang="ts">
import { CheckCircle2, MessageSquare, List, ArrowRight, ArrowLeft } from 'lucide-vue-next'
import { cn } from '@/utils/cn'

interface Props {
  question: string
  answers: string[]
  onConfirm: () => void
  onBack: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-6 border-b border-border bg-muted/30">
      <h2 class="text-xl font-semibold mb-1">Confirmar datos</h2>
      <p class="text-muted-foreground">
        Revisa la información antes de continuar con el análisis de IA
      </p>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-3xl mx-auto space-y-6">
        <!-- Question Card -->
        <div class="rounded-xl border border-border bg-card p-5">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Pregunta detectada
              </span>
              <p class="mt-1 text-lg font-medium text-foreground">
                {{ question }}
              </p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-xl border border-border bg-card p-5 text-center">
            <div class="text-3xl font-bold text-primary mb-1">
              {{ answers.length }}
            </div>
            <div class="text-sm text-muted-foreground">
              Respuestas a analizar
            </div>
          </div>
          <div class="rounded-xl border border-border bg-card p-5 text-center">
            <div class="text-3xl font-bold text-emerald-500 mb-1">
              ≈ {{ Math.ceil(answers.length / 3) }}s
            </div>
            <div class="text-sm text-muted-foreground">
              Tiempo estimado
            </div>
          </div>
        </div>

        <!-- Answers Preview -->
        <div class="rounded-xl border border-border bg-card overflow-hidden">
          <div class="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <List class="w-4 h-4 text-muted-foreground" />
            <span class="font-medium text-sm">Vista previa de respuestas</span>
          </div>
          <div class="max-h-64 overflow-auto">
            <div
              v-for="(answer, index) in answers"
              :key="index"
              :class="cn(
                'px-4 py-3 flex gap-3 text-sm',
                index !== answers.length - 1 && 'border-b border-border'
              )"
            >
              <span class="text-muted-foreground font-mono text-xs w-6 flex-shrink-0">
                {{ index + 1 }}.
              </span>
              <span class="text-foreground">{{ answer }}</span>
            </div>
          </div>
        </div>

        <!-- Analysis Info -->
        <div class="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-5">
          <div class="flex items-start gap-3">
            <CheckCircle2 class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 class="font-medium text-foreground mb-1">
                El análisis de IA extraerá:
              </h4>
              <ul class="text-sm text-muted-foreground space-y-1">
                <li>• Lista global de conceptos (verbatims) mencionados</li>
                <li>• Mapeo de conceptos por cada respuesta</li>
                <li>• Resumen ejecutivo de hallazgos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-border bg-background flex items-center justify-between">
      <Button variant="outline" @click="onBack" class="gap-2">
        <ArrowLeft class="w-4 h-4" />
        Volver a editar
      </Button>
      <Button @click="onConfirm" class="gap-2">
        Iniciar análisis de IA
        <ArrowRight class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>
