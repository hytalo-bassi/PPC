<script setup>
import { ref } from 'vue';
import DisciplineCard from './DisciplineCard.vue';
defineProps(['semesters'])

const elementRefsById = ref({});

function focusPreRequisites(pre_requisites_id, b = true, full = true) {
    for (const id of pre_requisites_id) {
        const el = elementRefsById.value[id];
        const subPreRequisites = el.getDiscipline().pre_requisitos;

        el.focusDiscipline(b);
        if (full && subPreRequisites.length > 0)
            focusPreRequisites(subPreRequisites, b, full);
    }
}
</script>

<template>
    <div class="flex-1 py-6" v-for="i in semesters.length">
        <div class="rounded-full text-center border border-white/50 bg-black/20 h-6 mb-2">
            <span class="text-sm">{{ i }}</span>
        </div>
        <div class="flex justify-around flex-col h-full">
            <DisciplineCard
             v-for="discipline in semesters[i -1]"
             @inFocus="focusPreRequisites(discipline.pre_requisitos)"
             @outFocus="focusPreRequisites(discipline.pre_requisitos, false)"
             :key="discipline.id"
             :ref="el => elementRefsById[discipline.id_curso] = el"
             :discipline="discipline"
            />
        </div>
    </div>
</template>
