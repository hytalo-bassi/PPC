import { ref, onMounted, computed } from 'vue'
import { getDisciplines } from './api.js';

export default {
  setup() {
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
    
    return { 
      numero_semestres,
      setDisciplineRef, 
      getDisciplinesBySemester,
      semesters
    };
  }
}
