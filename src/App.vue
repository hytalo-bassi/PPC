<script setup>
import SemestersScreen from './components/SemestersScreen.vue';
import { ref, onMounted } from 'vue'
import { getDisciplines } from './services/api.js';

const semesters = ref([]);

async function loadDisciplines(code) {
  return await getDisciplines(code);
}

onMounted(async () => {
  semesters.value = await loadDisciplines('1905');
});

</script>

<template>
  <div id="app" class="bg-linear-65 from-blue-400 to-rose-500 w-full h-full px-24 overflow-auto">
    <header class="text-center w-full pb-12">
        <div class="Header_Content"><h1 class="text-4xl font-semibold">Quadro de Semestralização e Pré-Requisitos</h1></div>
    </header>
    <div class="flex flex-row space-x-12 overflow-x-scroll">
        <SemestersScreen :semesters="semesters"/>
    </div>
    <div class="Line"></div>
  </div>
</template>
