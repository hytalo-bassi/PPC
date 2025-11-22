<script setup>
import DisciplineCard from './DisciplineCard.vue';
defineProps(['semesters'])
</script>

<template>
    <div class="flex-1" v-for="i in semesters.length">
        <div class="rounded-full text-center border border-white/50 bg-black/20 h-6 mb-2">
            <span class="text-sm">{{ i }}</span>
        </div>
        <div class="flex justify-around flex-col h-full">
            <DisciplineCard
             v-for="discipline in semesters[i -1]"
             :key="discipline.id"
             :discipline="discipline"
            />
        </div>
    </div>
</template>
