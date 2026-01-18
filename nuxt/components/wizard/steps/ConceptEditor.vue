<script setup lang="ts">
import { ref } from 'vue'
import { Save, Plus, X, GripVertical, Edit2, Check, Trash2, Search } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import type { ConceptMapping } from '@/types/concepts'

interface Props {
  concepts: string[]
  mapping: ConceptMapping[]
  onSave: (concepts: string[], mapping: ConceptMapping[]) => void
}

const props = defineProps<Props>()

const concepts = ref<string[]>([...props.concepts])
const mapping = ref<ConceptMapping[]>([...props.mapping])
const searchQuery = ref('')
const editingConcept = ref<{ index: number; value: string } | null>(null)
const newConceptName = ref('')
const draggedConcept = ref<string | null>(null)

// Filter concepts based on search
const filteredConcepts = computed(() => 
  concepts.value.filter(c =>
    c.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

// Update concept globally
const updateConceptGlobally = (oldName: string, newName: string) => {
  if (!newName.trim() || newName === oldName) {
    editingConcept.value = null
    return
  }

  concepts.value = concepts.value.map(c => c === oldName ? newName : c)
  mapping.value = mapping.value.map(m => ({
    ...m,
    concepts: m.concepts.map(c => c === oldName ? newName : c)
  }))

  editingConcept.value = null
}

// Delete concept globally
const deleteConceptGlobally = (conceptName: string) => {
  concepts.value = concepts.value.filter(c => c !== conceptName)
  mapping.value = mapping.value.map(m => ({
    ...m,
    concepts: m.concepts.filter(c => c !== conceptName)
  }))
}

// Remove concept from specific answer only
const removeConceptFromAnswer = (answerIndex: number, conceptName: string) => {
  mapping.value = mapping.value.map(m =>
    m.answer_index === answerIndex
      ? { ...m, concepts: m.concepts.filter(c => c !== conceptName) }
      : m
  )
}

// Add new concept
const addNewConcept = () => {
  if (!newConceptName.value.trim() || concepts.value.includes(newConceptName.value.trim())) {
    return
  }
  concepts.value.push(newConceptName.value.trim())
  newConceptName.value = ''
}

// Add concept to answer via drag & drop
const handleDrop = (e: DragEvent, answerIndex: number) => {
  e.preventDefault()
  if (!draggedConcept.value) return

  mapping.value = mapping.value.map(m => {
    if (m.answer_index === answerIndex && !m.concepts.includes(draggedConcept.value!)) {
      return { ...m, concepts: [...m.concepts, draggedConcept.value!] }
    }
    return m
  })
  draggedConcept.value = null
}

// Add concept to answer via click
const addConceptToAnswer = (answerIndex: number, conceptName: string) => {
  mapping.value = mapping.value.map(m => {
    if (m.answer_index === answerIndex && !m.concepts.includes(conceptName)) {
      return { ...m, concepts: [...m.concepts, conceptName] }
    }
    return m
  })
}

const handleSave = () => {
  props.onSave(concepts.value, mapping.value)
}
</script>

<template>
  <div class="flex h-full">
    <!-- Left column - Concepts list -->
    <div class="w-80 border-r border-border flex flex-col bg-muted/20">
      <div class="p-4 border-b border-border">
        <h3 class="font-semibold text-sm mb-3">Conceptos globales</h3>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Buscar conceptos..."
            class="pl-9 h-9"
          />
        </div>
      </div>

      <!-- Add new concept -->
      <div class="p-3 border-b border-border">
        <div class="flex gap-2">
          <Input
            v-model="newConceptName"
            @keydown.enter="addNewConcept"
            placeholder="Nuevo concepto..."
            class="h-8 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            @click="addNewConcept"
            :disabled="!newConceptName.trim()"
            class="h-8 px-2"
          >
            <Plus class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Concepts list -->
      <ScrollArea class="flex-1">
        <div class="p-2 space-y-1">
          <div
            v-for="(concept, index) in filteredConcepts"
            :key="`${concept}-${index}`"
            draggable="true"
            @dragstart="draggedConcept = concept"
            @dragend="draggedConcept = null"
            :class="cn(
              'group flex items-center gap-2 p-2 rounded-lg cursor-grab',
              'hover:bg-accent/50 transition-colors',
              draggedConcept === concept && 'opacity-50'
            )"
          >
            <GripVertical class="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            
            <div v-if="editingConcept?.index === index" class="flex-1 flex items-center gap-1">
              <Input
                v-model="editingConcept.value"
                @keydown.enter="updateConceptGlobally(concept, editingConcept.value)"
                @keydown.escape="editingConcept = null"
                class="h-7 text-sm"
                autofocus
              />
              <button
                @click="updateConceptGlobally(concept, editingConcept.value)"
                class="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
              >
                <Check class="w-4 h-4" />
              </button>
            </div>
            <template v-else>
              <span class="flex-1 text-sm truncate">{{ concept }}</span>
              <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="editingConcept = { index, value: concept }"
                  class="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                >
                  <Edit2 class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="deleteConceptGlobally(concept)"
                  class="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </template>
          </div>
        </div>
      </ScrollArea>

      <div class="p-3 border-t border-border text-xs text-muted-foreground text-center">
        {{ concepts.length }} conceptos • Arrastra para asignar
      </div>
    </div>

    <!-- Right column - Answers with concepts -->
    <div class="flex-1 flex flex-col">
      <div class="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-sm">Respuestas y conceptos asignados</h3>
          <p class="text-xs text-muted-foreground mt-0.5">
            Arrastra conceptos de la izquierda o haz clic en + para asignarlos
          </p>
        </div>
        <Button @click="handleSave" class="gap-2">
          <Save class="w-4 h-4" />
          Guardar y continuar
        </Button>
      </div>

      <ScrollArea class="flex-1">
        <div class="p-4 space-y-3">
          <div
            v-for="item in mapping"
            :key="item.answer_index"
            @dragover.prevent
            @drop="(e) => handleDrop(e, item.answer_index)"
            :class="cn(
              'rounded-xl border border-border bg-card p-4 transition-all',
              draggedConcept && 'border-dashed border-primary/50 bg-primary/5'
            )"
          >
            <div class="flex items-start gap-3 mb-3">
              <span class="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0">
                #{{ item.answer_index }}
              </span>
              <p class="text-sm text-foreground leading-relaxed">
                {{ item.answer }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2 min-h-[32px]">
              <Badge
                v-for="concept in item.concepts"
                :key="concept"
                variant="secondary"
                class="gap-1 pr-1 bg-primary/10 text-primary hover:bg-primary/20"
              >
                {{ concept }}
                <button
                  @click="removeConceptFromAnswer(item.answer_index, concept)"
                  class="ml-1 p-0.5 rounded hover:bg-primary/20"
                >
                  <X class="w-3 h-3" />
                </button>
              </Badge>
              
              <!-- Add concept dropdown trigger -->
              <div class="relative group">
                <button class="h-6 px-2 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center gap-1">
                  <Plus class="w-3 h-3" />
                  Agregar
                </button>
                
                <!-- Quick add dropdown -->
                <div class="absolute left-0 top-full mt-1 z-20 hidden group-hover:block">
                  <div class="bg-popover border border-border rounded-lg shadow-lg p-2 max-h-48 overflow-auto w-48">
                    <button
                      v-for="concept in concepts.filter(c => !item.concepts.includes(c)).slice(0, 10)"
                      :key="concept"
                      @click="addConceptToAnswer(item.answer_index, concept)"
                      class="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent truncate"
                    >
                      {{ concept }}
                    </button>
                    <span v-if="concepts.filter(c => !item.concepts.includes(c)).length === 0" class="text-xs text-muted-foreground px-2 py-1">
                      Todos asignados
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  </div>
</template>
