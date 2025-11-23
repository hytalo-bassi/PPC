import { ref, watch } from 'vue';
import { getDisciplines } from '../services/api.js';

export function useDisciplines(initialCode = '1905') {
  const courseCode = ref(initialCode);
  const semesters = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const load = async (code) => {
    loading.value = true;
    error.value = null;
    try {
      semesters.value = await getDisciplines(code);
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  watch(courseCode, (newCode) => {
    if (/^\d{4}$/.test(newCode)) {
      load(newCode);
    }
  }, { immediate: true });

  return { courseCode, semesters, loading, error };
}
