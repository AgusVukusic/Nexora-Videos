// Biblioteca de escenas: el "tipo" del plan → componente. Ver references/escenas.md para usarlas.
import type { DefEscena } from "../tipos";
import { registrarEscenas, registrarPropia, ESCENAS, PROBLEMAS, EFECTOS, PLAN, definicion, repartir } from "../motor/linea";
import { PROPIAS as PROPIAS_USUARIO } from "../propias";
import { chat, editor, movil } from "./apps";
import { cta } from "./cta";
import { galeria, imagen } from "./fotos";
import { barras, cifras, comparacion, contador, ficha, lista, objecion, pasos, pregunta, tachado } from "./tarjetas";
import { titular } from "./titular";

export const BIBLIOTECA: Record<string, DefEscena> = {
  titular,
  chat,
  tachado,
  contador,
  galeria,
  imagen,
  cifras,
  ficha,
  lista,
  comparacion,
  objecion,
  pasos,
  pregunta,
  barras,
  movil,
  editor,
  cta,
};

// Registrar las escenas visuales en el motor de línea de tiempo
registrarEscenas(BIBLIOTECA);

// Registrar escenas personalizadas del usuario
for (const [nombre, def] of Object.entries(PROPIAS_USUARIO)) {
  registrarPropia(nombre, def);
}

// Reconciliar escenas propias si fueron evaluadas antes del registro
for (const esc of ESCENAS) {
  const tipo = PLAN.frases[esc.i]?.escena?.tipo;
  if (tipo === "propia" && !esc.def) {
    const def = definicion(esc.i);
    if (def) {
      esc.def = def;
      const n = typeof def.momentos === "function" ? def.momentos(esc.p) : def.momentos;
      if (typeof n === "number" && n >= 0) {
        esc.b = repartir(esc.b.slice(0, n), n, esc.dur);
      }
      if (def.sonidos) {
        def.sonidos(esc.p, esc.b).forEach(([k, s, vol]) => {
          const t = esc.b[k];
          if (t !== undefined) EFECTOS.push({ en: esc.ini + t, s, vol });
        });
        EFECTOS.sort((x, y) => x.en - y.en);
      }
      const nombrePropia = String(PLAN.frases[esc.i]?.escena?.nombre);
      const msgErr = `Frase ${esc.i + 1}: no existe la escena propia «${nombrePropia}».`;
      const idxErr = PROBLEMAS.indexOf(msgErr);
      if (idxErr >= 0) {
        PROBLEMAS.splice(idxErr, 1);
      }
    }
  }
}
