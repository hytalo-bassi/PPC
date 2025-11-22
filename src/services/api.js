import { Discipline, TipoCurso } from "../models/discipline.js";

async function load_json(code) {
  const res = await fetch(`/data/${code}.json`);
  const data = res.json();
  return data;
}

export function getDisciplines(codigo) {
    let semesters = [];
    let mapIdDisciplinas = {};

    return load_json(codigo)
      .then((data) => {
        for (const disciplina_obj of data) {
          const tipo = disciplina_obj.Tipo === "OBR" ? TipoCurso.Obrigatoria : TipoCurso.Optativa;
          const lista_pre_requisitos = disciplina_obj.ListaPrequisitos.map((sub_disciplina_obj) => {
            return sub_disciplina_obj.Id;
          });

          const disciplina = new Discipline(
            disciplina_obj.Apelido,
            disciplina_obj.CargaHorariaTeorico,
            disciplina_obj.Id,
            tipo,
            disciplina_obj.Semestre,
            lista_pre_requisitos
          );

          if (disciplina_obj.Semestre !== 99 && semesters.length < disciplina_obj.Semestre) {
            for (let i = 0; i < disciplina_obj.Semestre - semesters.length; i++) {
              semesters.push([]);
            }
          }

          if (disciplina_obj.Semestre !== 99)
            semesters[disciplina_obj.Semestre - 1].push(disciplina);
          mapIdDisciplinas[disciplina_obj.Id] = disciplina;
        }

        return semesters;
      })
      .catch((err) => console.error("Erro ao obter disciplinas!", err));
  }
