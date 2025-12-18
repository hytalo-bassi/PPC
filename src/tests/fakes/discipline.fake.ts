import { faker } from "@faker-js/faker";
import { TipoCurso, Discipline } from "@/models/discipline";

/**
 * Opções de configuração para geração de disciplinas fake.
 *
 * @property {number} [qtdPalavrasApelido=3] - Número de palavras no apelido da disciplina
 * @property {Object} [cargaHoraria] - Limites para carga horária
 * @property {number} [cargaHoraria.min=15] - Carga horária mínima
 * @property {number} [cargaHoraria.max=102] - Carga horária máxima
 * @property {Object} [idCurso] - Limites para ID do curso
 * @property {number} [idCurso.min=1] - ID mínimo do curso
 * @property {number} [idCurso.max=999999] - ID máximo do curso
 * @property {Object} [semestre] - Limites para semestre
 * @property {number} [semestre.min=1] - Semestre mínimo
 * @property {number} [semestre.max=16] - Semestre máximo (8 anos)
 * @property {Object} [override] - Valores fixos que substituem a geração aleatória
 * @property {number} [override.semestre] - Força um valor específico para o semestre
 * @property {number} [override.idCurso] - Força um valor específico para o ID do curso
 * @property {number} [override.cargaHoraria] - Força um valor específico para a carga horária
 * @property {TipoCurso} [override.tipoCurso] - Força um tipo específico de curso
 */
export type OpcoesFakeDisciplineT = {
  qtdPalavrasApelido?: number;
  cargaHoraria?: {
    min?: number;
    max?: number;
  };
  idCurso?: {
    min?: number;
    max?: number;
  };
  semestre?: {
    min?: number;
    max?: number;
  };
  override?: {
    semestre?: number;
    idCurso?: number;
    cargaHoraria?: number;
    tipoCurso?: TipoCurso;
  };
};

/**
 * Configuração padrão para geração de disciplinas fake.
 */
const DEFAULT_OPTIONS = {
  qtdPalavrasApelido: 3,
  cargaHoraria: {
    min: 15,
    max: 102,
  },
  idCurso: {
    min: 1,
    max: 999999,
  },
  semestre: {
    min: 1,
    max: 16,
  },
} as const;

/**
 * Gera disciplinas fake para testes usando Faker.js.
 *
 * @param qtd - Quantidade de disciplinas a gerar. Padrão: 1
 * @param options - Opções personalizadas para geração dos dados
 * @returns Array de disciplinas com dados aleatórios
 *
 * @example
 * // Gera 5 disciplinas com configurações padrão
 * const disciplines = fakeDiscipline(5);
 *
 * @example
 * // Gera 3 disciplinas com carga horária customizada
 * const disciplines = fakeDiscipline(3, {
 *   cargaHoraria: { min: 30, max: 60 }
 * });
 *
 * @example
 * // Gera disciplinas com valores fixos
 * const disciplines = fakeDiscipline(10, {
 *   override: {
 *     semestre: 3,
 *     idCurso: 1221,
 *   }
 * });
 *
 * @example
 * // Combina ranges customizados com overrides
 * const disciplines = fakeDiscipline(5, {
 *   cargaHoraria: { min: 60, max: 90 },
 *   override: {
 *     semestre: 1,
 *     tipoCurso: TipoCurso.OBRIGATORIA
 *   }
 * });
 */
export function fakeDiscipline(
  qtd: number = 1,
  options?: OpcoesFakeDisciplineT,
): Discipline[] {
  const config = {
    qtdPalavrasApelido:
      options?.qtdPalavrasApelido ?? DEFAULT_OPTIONS.qtdPalavrasApelido,
    cargaHoraria: {
      min: options?.cargaHoraria?.min ?? DEFAULT_OPTIONS.cargaHoraria.min,
      max: options?.cargaHoraria?.max ?? DEFAULT_OPTIONS.cargaHoraria.max,
    },
    idCurso: {
      min: options?.idCurso?.min ?? DEFAULT_OPTIONS.idCurso.min,
      max: options?.idCurso?.max ?? DEFAULT_OPTIONS.idCurso.max,
    },
    semestre: {
      min: options?.semestre?.min ?? DEFAULT_OPTIONS.semestre.min,
      max: options?.semestre?.max ?? DEFAULT_OPTIONS.semestre.max,
    },
  };

  const override = options?.override;

  return Array.from({ length: qtd }, () => {
    const apelido = faker.word.words(config.qtdPalavrasApelido);
    const cargaHoraria =
      override?.cargaHoraria ?? faker.number.int(config.cargaHoraria);
    const idCurso = override?.idCurso ?? faker.number.int(config.idCurso);
    const tipoCurso = override?.tipoCurso ?? faker.helpers.enumValue(TipoCurso);
    const semestre = override?.semestre ?? faker.number.int(config.semestre);

    return new Discipline(
      apelido,
      cargaHoraria,
      idCurso,
      tipoCurso,
      semestre,
      [],
    );
  });
}
