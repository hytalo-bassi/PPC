import { describe, it, expect } from "vitest";
import { Discipline, TipoCurso } from "../discipline";

describe("Modelo Discipline", () => {
  const discipline = new Discipline(
    "ALGORITMOS E PROGRAMAÇÃO I",
    60,
    12345,
    TipoCurso.Obrigatoria,
    1,
    [],
  );

  it("deve criar uma disciplina com todos os parâmetros", () => {
    expect(discipline.apelido).toBe("algoritmos e programação i");
    expect(discipline.carga_horaria).toBe(60);
    expect(discipline.id_curso).toBe(12345);
    expect(discipline.tipo).toBe(TipoCurso.Obrigatoria);
    expect(discipline.semestre).toBe(1);
  });

  it("deve converter apelido para minúsculo", () => {
    expect(discipline.pegaApelido()).toBe("algoritmos e programação i");
  });

  it("deve pegar o ID corretamente com getter", () => {
    expect(discipline.pegaId()).toBe(12345);
  });

  it("deve pegar a carga horária corretamente com getter", () => {
    expect(discipline.pegaCarga()).toBe(60);
  });

  it("deve pegar a tipo corretamente com getter", () => {
    expect(discipline.pegaTipo()).toBe(TipoCurso.Obrigatoria);
  });

  it("deve pegar os pré-requisitos corretamente com getter", () => {
    expect(discipline.pegaPreRequisitos()).toHaveLength(0);
  });
});
