<script setup>
import SemestersScreen from './components/SemestersScreen.vue';
import { useDisciplines } from './composables/useDisciplies.js';
import { ref } from 'vue';

const { courseCode, semesters, loading, error } = useDisciplines('1905');
const inputValue = ref('1905');

const handleInput = () => {
  if (/^\d{4}$/.test(inputValue.value)) {
    courseCode.value = inputValue.value;
  }
};


</script>

<template>
  <div id="app" class="bg-linear-65 from-blue-400 to-rose-500 w-full h-full px-24 overflow-auto pb-8">
    <header class="flex flex-col text-center justify-center w-full py-12">
      <div class="Header_Content">
        <h1 class="text-4xl font-semibold pb-2">Quadro de Semestralização e Pré-Requisitos</h1>
      </div>
      <div class="mx-auto flex flex-row border bg-[rgb(0,0,0,0.2)] w-min p-2 rounded-lg border-[rgb(255,255,255,0.5)] items-center gap-2">
        <span>Buscar</span>
        <input 
          v-model="inputValue"
          class="text-right focus:outline-none bg-transparent text-white placeholder-white/70"
          placeholder="Código do curso"
          type="text"
          inputmode="numeric"
          pattern="\d{4}"
          maxlength="4"
          autocomplete="one-time-code"
          aria-describedby="hint codeError"
          required
          @input="handleInput"
        />
        <div v-if="loading" class="ml-1">
          <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        </div>
        <div v-else-if="/^\d{4}$/.test(inputValue)" class="ml-1 text-green-300">
          ✓
        </div>
      </div>
    </header>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mb-4"></div>
      <p class="text-white text-xl font-semibold">Carregando disciplinas...</p>
    </div>
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
      <div class="bg-red-500/20 border-2 border-red-300 rounded-lg p-8 max-w-md">
        <div class="text-6xl mb-4">⚠️</div>
        <h2 class="text-white text-2xl font-bold mb-2">Erro ao carregar dados</h2>
        <p class="text-red-100 mb-4">{{ error.message || 'Não foi possível carregar as disciplinas do curso.' }}</p>
        <button 
          @click="inputValue = '1905'; handleInput()"
          class="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
        >
          Tentar novamente com código padrão
        </button>
      </div>
    </div>

    <template v-else>
      <SemestersScreen :semesters="semesters"/>
      <div class="Line"></div>
    </template>
  </div>
</template>
