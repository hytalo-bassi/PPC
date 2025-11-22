<script setup>
defineProps(['discipline'])
</script>

<template>
    <div class="discipline">
        <h1 class="font-semibold text-[12px]/[12px] first-letter:uppercase">{{ discipline.apelido }}</h1>
        <p class="hidden">CH: {{ discipline.carga_horaria }} horas</p>
    </div>
</template>
