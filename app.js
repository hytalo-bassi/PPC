import { ref } from 'vue'
import { Discipline } from './discipline.js';

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

// Observacao: para conseguir os dados do curso, troque codigo pelo seu codigo do curso:
// curl 'https://graduacao.ufms.br/portal/matriz/get-pre-requisitos/<codigo>' \
//   -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0' \
//   -H 'Accept: application/json' \
//   -H 'Accept-Language: en-US,en;q=0.5' \
//   -H 'Accept-Encoding: gzip, deflate, br, zstd' \
//   -H 'X-Requested-With: XMLHttpRequest' \
//   -H 'Sec-GPC: 1' \
//   -H 'Connection: keep-alive' \
//   -H 'Referer: https://graduacao.ufms.br/cursos/<codigo>/matriz' \
//   -H 'Sec-Fetch-Dest: empty' \
//   -H 'Sec-Fetch-Mode: cors' \
//   -H 'Sec-Fetch-Site: same-origin' \
//   -H 'Pragma: no-cache' \
//   -H 'Cache-Control: no-cache'
