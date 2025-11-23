export const TipoCurso = Object.freeze({
  Obrigatoria: 0,
  Optativa: 1,
});

export class Discipline {
  constructor(apelido, carga_horaria, id_curso, tipo, semestre, pre_requisitos, requisitoDe) {
    this.apelido = apelido.toLowerCase();
    this.carga_horaria = carga_horaria;

    this.id_curso = id_curso;
    if (!id_curso) this.id_curso = Math.floor(Math.random() * 10**6) + 1;

    this.tipo = tipo;
    if (!tipo) this.tipo = TipoCurso.Obrigatoria;
    
    this.semestre = semestre;

    this.pre_requisitos = pre_requisitos;    
    if (!pre_requisitos) this.pre_requisitos = [];

    this.requisitoDe = requisitoDe;
    if (!requisitoDe) this.requisitoDe = [];
  } 
}
