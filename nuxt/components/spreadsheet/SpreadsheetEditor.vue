<script setup lang="ts">
import { ref, computed } from 'vue'
import { HelpCircle, Check, Trash2, Plus } from 'lucide-vue-next'
import { EXAMPLE_DATA } from '../../types/concepts'
import { cn } from '../../utils/cn'

interface Props {
  onConfirm: (question: string, answers: string[]) => void
}

defineProps<Props>()

// Initialize with example data
const cells = ref<string[]>([
  EXAMPLE_DATA.question,
  ...EXAMPLE_DATA.answers,
])

const questionRow = ref<number | null>(0)
const answerRows = ref<Set<number>>(
  new Set(EXAMPLE_DATA.answers.map((_, i) => i + 1))
)
const activeCell = ref<number | null>(null)
const inputRefs = ref<(HTMLTextAreaElement | null)[]>([])

const handleCellChange = (index: number, value: string) => {
  cells.value[index] = value
}

const handleKeyDown = (e: KeyboardEvent, index: number) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (index < cells.value.length - 1) {
      activeCell.value = index + 1
      inputRefs.value[index + 1]?.focus()
    }
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (index < cells.value.length - 1) {
      activeCell.value = index + 1
      inputRefs.value[index + 1]?.focus()
    }
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (index > 0) {
      activeCell.value = index - 1
      inputRefs.value[index - 1]?.focus()
    }
  }
}

const toggleQuestionSelection = (index: number) => {
  if (questionRow.value === index) {
    questionRow.value = null
  } else {
    questionRow.value = index
    answerRows.value.delete(index)
  }
}

const toggleAnswerSelection = (index: number) => {
  if (index === questionRow.value) return
  
  if (answerRows.value.has(index)) {
    answerRows.value.delete(index)
  } else {
    answerRows.value.add(index)
  }
}

const addRow = () => {
  cells.value.push('')
}

const deleteRow = (index: number) => {
  if (cells.value.length <= 2) return
  
  cells.value.splice(index, 1)
  
  if (questionRow.value === index) {
    questionRow.value = null
  } else if (questionRow.value !== null && questionRow.value > index) {
    questionRow.value--
  }
  
  const newAnswerRows = new Set<number>()
  answerRows.value.forEach(row => {
    if (row !== index) {
      newAnswerRows.add(row > index ? row - 1 : row)
    }
  })
  answerRows.value = newAnswerRows
}

const handleConfirm = (confirmFn: (question: string, answers: string[]) => void) => {
  if (questionRow.value === null || answerRows.value.size === 0) return
  
  const question = cells.value[questionRow.value]
  const answers = Array.from(answerRows.value)
    .sort((a, b) => a - b)
    .map(i => cells.value[i])
    .filter(a => a.trim() !== '')
  
  if (question.trim() && answers.length > 0) {
    confirmFn(question, answers)
  }
}

const isValid = computed(() => 
  questionRow.value !== null && 
  answerRows.value.size > 0 && 
  cells.value[questionRow.value]?.trim() !== '' &&
  Array.from(answerRows.value).some(i => cells.value[i]?.trim() !== '')
)

const autoResize = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = target.scrollHeight + 'px'
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-border bg-muted/30">
      <div class="flex items-center gap-3">
        <h2 class="text-lg font-semibold">Editor de datos</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <button class="text-muted-foreground hover:text-foreground">
                <HelpCircle class="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent class="max-w-xs">
              <p>Pega o edita tus datos. Usa los botones de la izquierda para marcar cuál es la pregunta (P) y cuáles son las respuestas (R).</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="flex items-center gap-1">
            <span class="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">P</span>
            Pregunta
          </span>
          <span class="flex items-center gap-1">
            <span class="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs font-medium">R</span>
            Respuestas
          </span>
        </div>
      </div>
    </div>

    <!-- Spreadsheet -->
    <div class="flex-1 overflow-auto">
      <div class="min-w-[600px]">
        <!-- Column headers -->
        <div class="flex items-center border-b border-border bg-muted/50 sticky top-0 z-10">
          <div class="w-12 p-2 text-center text-xs font-medium text-muted-foreground border-r border-border">#</div>
          <div class="w-14 p-2 text-center text-xs font-medium text-muted-foreground border-r border-border">Tipo</div>
          <div class="flex-1 p-2 text-xs font-medium text-muted-foreground">Contenido</div>
          <div class="w-12 p-2 text-center text-xs font-medium text-muted-foreground"></div>
        </div>

        <!-- Rows -->
        <div
          v-for="(cell, index) in cells"
          :key="index"
          :class="cn(
            'flex items-stretch border-b border-border transition-colors',
            questionRow === index && 'bg-primary/5',
            answerRows.has(index) && 'bg-emerald-500/5',
            activeCell === index && 'ring-2 ring-inset ring-primary/50'
          )"
        >
          <!-- Row number -->
          <div class="w-12 p-2 text-center text-xs text-muted-foreground border-r border-border flex items-center justify-center">
            {{ index + 1 }}
          </div>
          
          <!-- Type toggles -->
          <div class="w-14 p-1 border-r border-border flex items-center justify-center gap-1">
            <button
              @click="toggleQuestionSelection(index)"
              :class="cn(
                'w-6 h-6 rounded text-xs font-medium transition-all',
                questionRow === index
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'
              )"
            >
              P
            </button>
            <button
              @click="toggleAnswerSelection(index)"
              :disabled="questionRow === index"
              :class="cn(
                'w-6 h-6 rounded text-xs font-medium transition-all',
                answerRows.has(index)
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-emerald-500/20 hover:text-emerald-600',
                questionRow === index && 'opacity-50 cursor-not-allowed'
              )"
            >
              R
            </button>
          </div>
          
          <!-- Content -->
          <div class="flex-1 p-0">
            <textarea
              :ref="el => inputRefs[index] = el as HTMLTextAreaElement | null"
              :value="cell"
              @input="(e) => handleCellChange(index, (e.target as HTMLTextAreaElement).value)"
              @focus="activeCell = index"
              @blur="activeCell = null"
              @keydown="(e) => handleKeyDown(e as KeyboardEvent, index)"
              :class="cn(
                'w-full h-full min-h-[44px] px-3 py-2 bg-transparent resize-none',
                'focus:outline-none text-sm leading-relaxed',
                'placeholder:text-muted-foreground/50'
              )"
              :placeholder="index === 0 ? 'Escribe la pregunta aquí...' : 'Escribe una respuesta...'"
              rows="1"
              @input.self="autoResize"
            />
          </div>
          
          <!-- Delete button -->
          <div class="w-12 p-1 flex items-center justify-center">
            <button
              @click="deleteRow(index)"
              :disabled="cells.length <= 2"
              :class="cn(
                'p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors',
                cells.length <= 2 && 'opacity-30 cursor-not-allowed'
              )"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Add row button -->
        <button
          @click="addRow"
          class="w-full p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Plus class="w-4 h-4" />
          Agregar fila
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-border bg-background flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        <span v-if="questionRow !== null" class="text-foreground">1 pregunta seleccionada</span>
        <span v-else class="text-amber-500">Selecciona una pregunta (P)</span>
        <span class="mx-2">•</span>
        <span v-if="answerRows.size > 0" class="text-foreground">{{ answerRows.size }} respuestas seleccionadas</span>
        <span v-else class="text-amber-500">Selecciona las respuestas (R)</span>
      </div>
      <Button
        @click="handleConfirm(onConfirm)"
        :disabled="!isValid"
        class="gap-2"
      >
        <Check class="w-4 h-4" />
        Confirmar selección
      </Button>
    </div>
  </div>
</template>
