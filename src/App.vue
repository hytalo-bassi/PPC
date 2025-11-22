<template>
  <div id="app" class="bg-linear-65 from-blue-400 to-rose-500 w-full h-full px-24 overflow-auto">
    <header class="text-center w-full pb-12">
        <div class="Header_Content"><h1 class="text-4xl font-semibold">Quadro de Semestralização e Pré-Requisitos</h1></div>
    </header>
    <div class="flex flex-row space-x-12 overflow-x-scroll">
        <div class="flex-1" v-for="i in numero_semestres">
            <div class="rounded-full text-center border border-white/50 bg-black/20 h-6 mb-2">
                <span class="text-sm">{{ i }}</span>
            </div>
            <div class="flex justify-around flex-col h-full">
                <div 
                    class="discipline"
                    v-for="(discipline) in getDisciplinesBySemester(i - 1)"
                    :ref="el => setDisciplineRef(el, discipline.id_curso)"
                    :key="discipline.id_curso">
                    <h1 class="font-semibold text-[12px]/[12px] first-letter:uppercase">{{ discipline.apelido }}</h1>
                    <p class="hidden">CH: {{ discipline.carga_horaria }} horas</p>
                </div>
            </div>
        </div>
    </div>
    <div class="Line"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDisciplines } from './services/api.js';

const semesters = ref([]);
const disciplinesRefs = ref({});

async function loadDisciplines(code) {
  return await getDisciplines(code);
}

const getDisciplinesBySemester = function (semester) {
  if (semester < semesters.value.length)
    return semesters.value[semester];
  return [];
}
const setDisciplineRef = function (el, key) {
  if (el)
    disciplinesRefs.value[key] = el;
}

function getElement(id) {
  return disciplinesRefs.value[id];  
}
const focusDiscipline = function(discipline) {
  const el = getElement(discipline.id);
}
onMounted(async () => {
  semesters.value = await loadDisciplines('1905');
});

const numero_semestres = computed(() => semesters.value.length);
</script>
