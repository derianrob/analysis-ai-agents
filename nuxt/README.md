# QP Research - Análisis de Insights con IA

Aplicación Nuxt 3 para análisis de respuestas abiertas con IA. Migrada desde React + Vite.

## 🚀 Características

- ✨ Análisis de respuestas abiertas con IA
- 📊 Extracción de conceptos clave (verbatims)
- 📈 Visualización de frecuencias
- 🎨 UI moderna con Tailwind CSS
- 🔧 Componentes basados en Radix Vue
- 📱 Diseño responsive

## 🛠️ Stack Tecnológico

- **Framework**: Nuxt 3
- **UI**: Tailwind CSS + Radix Vue
- **Icons**: Lucide Vue Next
- **Gestión de Estado**: Pinia
- **Utilidades**: VueUse

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
nuxt/
├── app/
│   └── app.vue
├── assets/
│   └── css/
│       └── main.css
├── components/
│   ├── ui/              # Componentes UI base
│   ├── templates/       # Componentes de plantillas
│   ├── spreadsheet/     # Editor de datos
│   └── wizard/          # Pasos del wizard
├── pages/
│   ├── index.vue        # Página principal
│   └── wizard/
│       └── single-question.vue
├── types/
│   └── concepts.ts      # Tipos TypeScript
├── utils/
│   └── cn.ts           # Utilidades
├── nuxt.config.ts
├── tailwind.config.ts
└── package.json
```

## 🎯 Flujo de Trabajo

1. **Ingresar Datos**: Editor tipo spreadsheet para pegar pregunta y respuestas
2. **Confirmar**: Vista previa de los datos a analizar
3. **Análisis IA**: Simulación de análisis con IA
4. **Editar Conceptos**: Editor drag & drop para ajustar conceptos
5. **Resultados**: Tabla de frecuencias y gráfico de barras

## 🔑 Componentes Principales

### UI Components
- `Button.vue` - Botones con variantes
- `Input.vue` - Campos de entrada
- `Badge.vue` - Etiquetas
- `Tooltip.vue` - Tooltips
- `ScrollArea.vue` - Área de scroll personalizada

### Wizard Components
- `SpreadsheetEditor.vue` - Editor de datos
- `ConfirmationStep.vue` - Confirmación de datos
- `AnalyzingStep.vue` - Animación de análisis
- `ConceptEditor.vue` - Editor de conceptos
- `FrequencyTable.vue` - Tabla de resultados

## 🎨 Personalización

Los colores y estilos se pueden personalizar en:
- `assets/css/main.css` - Variables CSS
- `tailwind.config.ts` - Configuración de Tailwind

## 📝 Notas de Migración

Esta aplicación fue migrada desde React + Vite a Nuxt 3:

### Cambios principales:
- `React Router` → `Vue Router` (integrado en Nuxt)
- `@tanstack/react-query` → Composables de Nuxt
- `shadcn/ui (React)` → `Radix Vue`
- `lucide-react` → `lucide-vue-next`
- `recharts` → Gráficos CSS personalizados
- `sonner` → `vue-sonner`

## 📄 Licencia

© 2024 QP Research. Todos los derechos reservados.
