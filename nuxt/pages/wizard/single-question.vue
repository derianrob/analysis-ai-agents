<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, X } from 'lucide-vue-next'
import { MOCK_ANALYSIS_RESULT, type ConceptMapping } from '@/types/concepts'
import { cn } from '@/utils/cn'

type WizardStep = 'spreadsheet' | 'confirmation' | 'analyzing' | 'editor' | 'frequency'

const STEP_LABELS: Record<WizardStep, string> = {
  spreadsheet: 'Ingresar datos',
  confirmation: 'Confirmar',
  analyzing: 'Análisis IA',
  editor: 'Editar conceptos',
  frequency: 'Resultados',
}

const STEPS: WizardStep[] = ['spreadsheet', 'confirmation', 'analyzing', 'editor', 'frequency']

const router = useRouter()
const currentStep = ref<WizardStep>('spreadsheet')
const question = ref("")
const answers = ref<string[]>([])
const concepts = ref<string[]>([])
const mapping = ref<ConceptMapping[]>([])

const handleSpreadsheetConfirm = (q: string, a: string[]) => {
  question.value = q
  answers.value = a
  currentStep.value = 'confirmation'
}

const handleStartAnalysis = () => {
  currentStep.value = 'analyzing'
}

const handleAnalysisComplete = () => {
  // Use mock data but with actual answers from user
  const mockConcepts = [...MOCK_ANALYSIS_RESULT.concepts]
  
  // Create mapping using user's answers
  const mockMapping: ConceptMapping[] = answers.value.map((answer, index) => {
    // Find matching mock or create random assignment
    const mockItem = MOCK_ANALYSIS_RESULT.mapping.find(m => m.answer_index === index + 1)
    return {
      answer_index: index + 1,
      answer,
      concepts: mockItem?.concepts || mockConcepts.slice(0, Math.floor(Math.random() * 3) + 1)
    }
  })

  concepts.value = mockConcepts
  mapping.value = mockMapping
  currentStep.value = 'editor'
}

const handleSaveConcepts = (newConcepts: string[], newMapping: ConceptMapping[]) => {
  concepts.value = newConcepts
  mapping.value = newMapping
  currentStep.value = 'frequency'
}

const handleGoHome = () => {
  router.push('/')
}

const currentStepIndex = computed(() => STEPS.indexOf(currentStep.value))
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header -->
    <header class="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-50">
      <Button
        variant="ghost"
        size="sm"
        @click="handleGoHome"
        class="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft class="w-4 h-4" />
        Volver al inicio
      </Button>

      <div class="flex-1 flex items-center justify-center gap-2">
        <div v-for="(step, index) in STEPS" :key="step" class="flex items-center">
          <div
            :class="cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
              index < currentStepIndex && 'text-emerald-600',
              index === currentStepIndex && 'bg-primary/10 text-primary font-medium',
              index > currentStepIndex && 'text-muted-foreground'
            )"
          >
            <span :class="cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium',
              index < currentStepIndex && 'bg-emerald-500 text-white',
              index === currentStepIndex && 'bg-primary text-primary-foreground',
              index > currentStepIndex && 'bg-muted text-muted-foreground'
            )">
              {{ index + 1 }}
            </span>
            <span class="hidden sm:inline">{{ STEP_LABELS[step] }}</span>
          </div>
          <div 
            v-if="index < STEPS.length - 1"
            :class="cn(
              'w-8 h-0.5 mx-1',
              index < currentStepIndex ? 'bg-emerald-500' : 'bg-border'
            )" 
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        @click="handleGoHome"
        class="text-muted-foreground hover:text-foreground"
      >
        <X class="w-5 h-5" />
      </Button>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-hidden">
      <SpreadsheetEditor 
        v-if="currentStep === 'spreadsheet'"
        :on-confirm="handleSpreadsheetConfirm" 
      />

      <ConfirmationStep
        v-if="currentStep === 'confirmation'"
        :question="question"
        :answers="answers"
        :on-confirm="handleStartAnalysis"
        :on-back="() => currentStep = 'spreadsheet'"
      />

      <AnalyzingStep
        v-if="currentStep === 'analyzing'"
        :total-answers="answers.length"
        :on-complete="handleAnalysisComplete"
      />

      <ConceptEditor
        v-if="currentStep === 'editor'"
        :concepts="concepts"
        :mapping="mapping"
        :on-save="handleSaveConcepts"
      />

      <FrequencyTable
        v-if="currentStep === 'frequency'"
        :question="question"
        :concepts="concepts"
        :mapping="mapping"
        :on-back="() => currentStep = 'editor'"
        :on-go-home="handleGoHome"
      />
    </main>
  </div>
</template>
