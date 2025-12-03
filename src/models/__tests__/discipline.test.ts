import { describe, it, expect } from "vitest";
import { Discipline, TipoCurso } from "../discipline";

describe("Modelo Discipline", () => {
  it("deve criar uma disciplina com todos os parâmetros", () => {
    const discipline = new Discipline(
      "ALGORITMOS E PROGRAMAÇÃO I",
      60,
      12345,
      TipoCurso.Obrigatoria,
      1,
      [],
    );

    expect(discipline.apelido).toBe("algoritmos e programação i");
    expect(discipline.carga_horaria).toBe(60);
    expect(discipline.id_curso).toBe(12345);
    expect(discipline.tipo).toBe(TipoCurso.Obrigatoria);
    expect(discipline.semestre).toBe(1);
  });

  it("deve converter apelido para minúsculo", () => {
    const discipline = new Discipline(
      "ALGORITMOS E PROGRAMAÇÃO II",
      60,
      22345,
      TipoCurso.Obrigatoria,
      2,
      [12345],
    );
    expect(discipline.apelido).toBe("algoritmos e programação ii");
  });
});
