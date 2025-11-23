<script setup>
import { ref } from 'vue';

const focused = ref(false);

const props = defineProps(['discipline', 'grayScaleMode'])
const emits = defineEmits(['inFocus', 'outFocus'])

const focusDiscipline = (b) => {
    focused.value = b;
}

function handleFocus(signal) {
    emits(signal);
    if (signal === 'inFocus')
        focused.value = true;
    else
        focused.value = false;
}

defineExpose({
    focusDiscipline,
    getDiscipline: () => props.discipline
});
</script>

<template>
    <div
        @mouseenter="handleFocus('inFocus')"
        @mouseleave="handleFocus('outFocus')"
        :class="{ 
            discipline: !focused,
            'discipline-focused': focused, 
            'grayscale opacity-50': grayScaleMode && !focused 
        }">
        <h1>{{ discipline.apelido }}</h1>
        <p>CH: {{ discipline.carga_horaria }} horas</p>
    </div>
</template>
