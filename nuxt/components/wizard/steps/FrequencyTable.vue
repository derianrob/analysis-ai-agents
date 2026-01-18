<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Download, Home, BarChart3 } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import type { ConceptMapping } from '@/types/concepts'

interface Props {
  question: string
  concepts: string[]
  mapping: ConceptMapping[]
  onBack: () => void
  onGoHome: () => void
}

const props = defineProps<Props>()

// Calculate frequency for each concept
const frequencyData = computed(() => {
  const freq: Record<string, number> = {}
  
  // Initialize all concepts with 0
  props.concepts.forEach(c => freq[c] = 0)
  
  // Count occurrences in mapping
  props.mapping.forEach(m => {
    m.concepts.forEach(c => {
      freq[c] = (freq[c] || 0) + 1
    })
  })
  
  // Convert to array and sort by frequency
  return Object.entries(freq)
    .map(([concept, count]) => ({
      concept,
      count,
      percentage: ((count / props.mapping.length) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count)
})

// Top 10 for chart
const chartData = computed(() => frequencyData.value.slice(0, 10))

// Download as CSV
const handleDownload = () => {
  const headers = ["Concepto", "Frecuencia", "Porcentaje"]
  const rows = frequencyData.value.map(d => [d.concept, d.count.toString(), `${d.percentage}%`])
  const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "frecuencia_conceptos.csv"
  a.click()
  URL.revokeObjectURL(url)
}

const getBarColor = (index: number) => {
  const opacity = 1 - (index * 0.075)
  return `hsl(var(--primary) / ${opacity})`
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-6 border-b border-border bg-muted/30">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-semibold mb-1">Tabla de frecuencias</h2>
          <p class="text-muted-foreground text-sm max-w-2xl">
            {{ question }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" @click="handleDownload" class="gap-2">
            <Download class="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-6 mt-4 text-sm">
        <div class="flex items-center gap-2">
          <BarChart3 class="w-4 h-4 text-primary" />
          <span class="text-muted-foreground">Total conceptos:</span>
          <span class="font-semibold">{{ concepts.length }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground">Respuestas analizadas:</span>
          <span class="font-semibold">{{ mapping.length }}</span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden flex">
      <!-- Chart -->
      <div class="w-1/2 p-6 border-r border-border">
        <h3 class="text-sm font-medium mb-4">Top 10 conceptos más frecuentes</h3>
        <div class="space-y-2">
          <div 
            v-for="(item, index) in chartData" 
            :key="item.concept"
            class="flex items-center gap-3"
          >
            <div class="w-32 text-xs truncate text-muted-foreground">
              {{ item.concept }}
            </div>
            <div class="flex-1 h-8 bg-muted rounded-md overflow-hidden relative">
              <div 
                class="h-full transition-all duration-500 ease-out rounded-md flex items-center justify-end pr-2"
                :style="{ 
                  width: `${(item.count / chartData[0].count) * 100}%`, 
                  backgroundColor: getBarColor(index)
                }"
              >
                <span class="text-xs font-medium text-white">{{ item.count }}</span>
              </div>
            </div>
            <div class="w-12 text-xs text-right text-muted-foreground">
              {{ item.percentage }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="w-1/2 flex flex-col">
        <div class="p-4 border-b border-border bg-muted/30">
          <h3 class="text-sm font-medium">Tabla completa de frecuencias</h3>
        </div>
        <ScrollArea class="flex-1">
          <table class="w-full">
            <thead class="sticky top-0 bg-muted/50">
              <tr class="border-b border-border">
                <th class="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Concepto
                </th>
                <th class="text-center p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">
                  Frec.
                </th>
                <th class="text-center p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in frequencyData"
                :key="item.concept"
                :class="cn(
                  'border-b border-border/50 hover:bg-muted/30 transition-colors',
                  index < 3 && 'bg-primary/5'
                )"
              >
                <td class="p-3 text-sm">
                  <div class="flex items-center gap-2">
                    <span 
                      v-if="index < 3"
                      :class="cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white',
                        index === 0 && 'bg-amber-500',
                        index === 1 && 'bg-slate-400',
                        index === 2 && 'bg-amber-700'
                      )"
                    >
                      {{ index + 1 }}
                    </span>
                    <span :class="cn(index < 3 && 'font-medium')">
                      {{ item.concept }}
                    </span>
                  </div>
                </td>
                <td class="p-3 text-sm text-center font-mono">
                  {{ item.count }}
                </td>
                <td class="p-3 text-sm text-center">
                  <span :class="cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    parseFloat(item.percentage) >= 20
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : parseFloat(item.percentage) >= 10
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )">
                    {{ item.percentage }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-border bg-background flex items-center justify-between">
      <Button variant="outline" @click="onBack" class="gap-2">
        <ArrowLeft class="w-4 h-4" />
        Volver a editar
      </Button>
      <Button @click="onGoHome" class="gap-2">
        <Home class="w-4 h-4" />
        Ir al inicio
      </Button>
    </div>
  </div>
</template>
