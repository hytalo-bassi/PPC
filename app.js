import { ref } from 'vue'
import Discipline from './discipline.js';

export default {
  setup() {
    const numero_semestres = ref(9);
    const semesters = [[
      new Discipline("Prog1", 108),
      new Discipline("VGA", 64)
    ],[
      new Discipline("FTC", 64)
    ]]

    const getDisciplinesBySemester = function (semester) {
      if (semester < semesters.length)
        return semesters[semester];
      return [];
    }

    return { numero_semestres, getDisciplinesBySemester };
  }
}
