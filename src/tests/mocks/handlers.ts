/**
 * Este arquivo contém alguns mocks que servem para teste. Os mocks servem para testar
 * a API sem de fato se comunicar com a API, invés disso, dados fabricados são passados
 * como se fossem os originais, para que não seja consumida a API, dando mais controle
 * ao desenvolvedor.
 */
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/data/1905.json", () => {
    return HttpResponse.json([
      {
        Id: 45398,
        Codigo: "1919.000.402-9",
        Tipo: "OBR",
        Descricao: "ALGORITMOS E PROGRAMAÇÃO I",
        Semestre: 1,
        Apelido: "ALGORITMOS E PROGRAMAÇÃO I",
        CargaHorariaTeorico: 102,
        CargaHorariaPratica: null,
        ListaPrequisitos: [],
      },
      {
        Id: 48016,
        Codigo: "2201.000.197-0",
        Tipo: "OBR",
        Descricao: "CÁLCULO I",
        Semestre: 1,
        Apelido: "CÁLCULO I",
        CargaHorariaTeorico: 68,
        CargaHorariaPratica: null,
        ListaPrequisitos: [],
      },
    ]);
  }),

  // o curso de codigo 9999 é especial. Por isso o seu anterior é utilizado.
  http.get("/data/9998.json", () => {
    return HttpResponse.json([], { status: 404 });
  }),
];
