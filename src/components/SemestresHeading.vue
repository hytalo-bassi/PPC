<template>
  <header class="flex items-center py-2">
    <h1 class="text-sm font-medium text-white whitespace-nowrap">
      Semestralização e pré-requisitos
    </h1>
    <div
      class="ml-auto flex items-center gap-2 bg-black/20 border border-white/30 rounded-lg px-3 h-[34px]"
    >
      <span class="text-xs text-white/70">Curso</span>
      <input
        :value="inputValue"
        class="w-16 text-right text-sm bg-transparent focus:outline-none text-white placeholder-white/50"
        placeholder="0000"
        required
        aria-describedby="hint codeError"
        type="text"
        inputmode="numeric"
        pattern="\d{4}"
        maxlength="4"
        @input="inputValue = ($event.target as HTMLInputElement).value"
      />
      <div
        v-if="carregando"
        class="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin"
      />
      <span
        v-else-if="/^\d{4}$/.test(inputValue)"
        class="text-green-300 text-xs"
        >✓</span
      >
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  carregando?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const carregando = computed(() => props.carregando ?? false)
</script>
