<template>
  <header class="flex items-center py-4 bg-white/10 px-2">
    <h1
      class="flex flex-row items-center gap-x-2 text-sm font-medium text-primary"
    >
      <svg
        class="logo-icon"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          d="M216.5 362.5c-66-8-112.5-55.5-112.5-117 0-25 9-52 24-70-6.5-16.5-5.5-51.5 2-66 20-2.5 47 8 63 22.5 19-6 39-9 63.5-9s44.5 3 62.5 8.5c15.5-14 43-24.5 63-22 7 13.5 8 48.5 1.5 65.5 16 19 24.5 44.5 24.5 70.5 0 61.5-46.5 108-113.5 116.5 17 11 28.5 35 28.5 62.5l0 52C323 491.5 335.5 500 350.5 494 441 459.5 512 369 512 257 512 115.5 397 0 255.5 0S0 115.5 0 257c0 111 70.5 203 165.5 237.5 13.5 5 26.5-4 26.5-17.5l0-40c-7 3-16 5-24 5-33 0-52.5-18-66.5-51.5-5.5-13.5-11.5-21.5-23-23-6-.5-8-3-8-6 0-6 10-10.5 20-10.5 14.5 0 27 9 40 27.5 10 14.5 20.5 21 33 21s20.5-4.5 32-16c8.5-8.5 15-16 21-21z"
        />
      </svg>
      <a
        class="underline"
        href="https://github.com/hytalo-bassi/PPC"
        target="_blank"
        rel="noopener noreferrer"
      >
        hytalo-bassi/PPC
      </a>
    </h1>
    <div
      class="ml-auto flex items-center gap-2 bg-black/20 border border-primary/80 rounded-lg px-3 h-[34px]"
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
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
  carregando?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

const carregando = computed(() => props.carregando ?? false);
</script>
