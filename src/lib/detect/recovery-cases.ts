import type { CharsetPresetId } from '../charset'

export type RecoveryCase = {
  plain: string
  preset: CharsetPresetId
} & ({ method: 'caesar'; shift: number } | { method: 'atbash' })

export const RECOVERY_CASES: RecoveryCase[] = [
  // spanish-upper (size 27): uppercase, enye, no accents
  { plain: 'EL TREN SALE DE LA ESTACION CENTRAL A LAS OCHO EN PUNTO', preset: 'spanish-upper', method: 'caesar', shift: 7 },
  { plain: 'MAÑANA VISITAREMOS EL MUSEO DE ARTE MODERNO CON LOS NIÑOS', preset: 'spanish-upper', method: 'caesar', shift: 3 },
  { plain: 'LA REUNION FUE CANCELADA POR FALTA DE QUORUM SUFICIENTE', preset: 'spanish-upper', method: 'atbash' },
  { plain: 'TODOS LOS CAMINOS CONDUCEN TARDE O TEMPRANO HASTA ROMA', preset: 'spanish-upper', method: 'caesar', shift: 15 },
  { plain: 'EL PERRO DEL VECINO LADRA TODA LA NOCHE SIN PARAR NUNCA', preset: 'spanish-upper', method: 'caesar', shift: 22 },
  { plain: 'NECESITAMOS COMPRAR PAN LECHE HUEVOS Y CAFE PARA EL DESAYUNO', preset: 'spanish-upper', method: 'atbash' },
  { plain: 'LA TORMENTA DEJO VARIOS ARBOLES CAIDOS SOBRE LA CARRETERA', preset: 'spanish-upper', method: 'caesar', shift: 11 },
  { plain: 'MI ABUELA PREPARA LA MEJOR SOPA DE TODA LA REGION', preset: 'spanish-upper', method: 'caesar', shift: 5 },
  { plain: 'EL EQUIPO GANO EL PARTIDO EN EL ULTIMO MINUTO DEL ENCUENTRO', preset: 'spanish-upper', method: 'atbash' },
  { plain: 'LEER UN BUEN LIBRO ES VIAJAR SIN MOVERSE DEL SILLON', preset: 'spanish-upper', method: 'caesar', shift: 19 },
  { plain: 'EL CIELO SE CUBRIO DE NUBES GRISES POCO ANTES DEL MEDIODIA', preset: 'spanish-upper', method: 'caesar', shift: 13 },
  { plain: 'CADA VERANO REGRESAMOS AL MISMO PUEBLO JUNTO AL MAR', preset: 'spanish-upper', method: 'atbash' },
  { plain: 'EL BARCO ZARPO DEL PUERTO CON LA PRIMERA LUZ DEL DIA', preset: 'spanish-upper', method: 'caesar', shift: 24 },
  { plain: 'LA CARTA LLEGO TRES SEMANAS DESPUES DE HABER SIDO ENVIADA', preset: 'spanish-upper', method: 'atbash' },
  { plain: 'DOBLAMOS LA ROPA LIMPIA Y LA GUARDAMOS EN EL ARMARIO', preset: 'spanish-upper', method: 'caesar', shift: 3 },
  { plain: 'EL RELOJ DE LA TORRE DEJO DE FUNCIONAR HACE VARIOS MESES', preset: 'spanish-upper', method: 'caesar', shift: 20 },

  // spanish-mixed (size 53): any case, enye, no accents
  { plain: 'el cartero pasa siempre a media manana por nuestra calle', preset: 'spanish-mixed', method: 'caesar', shift: 8 },
  { plain: 'Los estudiantes presentaron sus proyectos ante el jurado', preset: 'spanish-mixed', method: 'caesar', shift: 2 },
  { plain: 'una bandada de pajaros cruzo el cielo justo al atardecer', preset: 'spanish-mixed', method: 'atbash' },
  { plain: 'el mecanico dijo que la reparacion tardaria varios dias', preset: 'spanish-mixed', method: 'caesar', shift: 14 },
  { plain: 'Prefiero caminar hasta la oficina cuando hace buen tiempo', preset: 'spanish-mixed', method: 'caesar', shift: 25 },
  { plain: 'la niña guardo aquel secreto durante todo el verano pasado', preset: 'spanish-mixed', method: 'atbash' },
  { plain: 'compramos entradas para el concierto de la semana proxima', preset: 'spanish-mixed', method: 'caesar', shift: 9 },
  { plain: 'El rio baja crecido despues de las lluvias de septiembre', preset: 'spanish-mixed', method: 'caesar', shift: 31 },
  { plain: 'nadie respondio el telefono aunque llamamos muchas veces', preset: 'spanish-mixed', method: 'atbash' },
  { plain: 'el jardin florecio antes de lo que todos esperabamos ver', preset: 'spanish-mixed', method: 'caesar', shift: 6 },
  { plain: 'guardar silencio dentro de la biblioteca es una regla basica', preset: 'spanish-mixed', method: 'caesar', shift: 40 },
  { plain: 'la fabrica cerrara sus puertas al final de este mismo mes', preset: 'spanish-mixed', method: 'atbash' },
  { plain: 'el profesor explico el teorema con un ejemplo muy sencillo', preset: 'spanish-mixed', method: 'caesar', shift: 16 },
  { plain: 'la cosecha de este año resulto mucho mejor que la anterior', preset: 'spanish-mixed', method: 'atbash' },
  { plain: 'todos aplaudieron cuando el telon finalmente bajo del todo', preset: 'spanish-mixed', method: 'caesar', shift: 7 },
  { plain: 'el ascensor esta averiado asi que subiremos por la escalera', preset: 'spanish-mixed', method: 'caesar', shift: 19 },
  { plain: 'manejar de noche por la sierra requiere mucha concentracion', preset: 'spanish-mixed', method: 'atbash' },
  { plain: 'encontramos un buen sitio para acampar cerca del arroyo seco', preset: 'spanish-mixed', method: 'caesar', shift: 11 },

  // spanish-accents (size 33): uppercase with accents
  { plain: 'LA CANCIÓN QUE SONÓ EN LA RADIO ME TRAJO VIEJOS RECUERDOS', preset: 'spanish-accents', method: 'caesar', shift: 12 },
  { plain: 'EL AVIÓN ATERRIZÓ SIN NINGÚN PROBLEMA PESE A LA NIEBLA ESPESA', preset: 'spanish-accents', method: 'atbash' },
  { plain: 'NUNCA IMAGINÉ QUE APRENDER ALEMÁN FUERA UNA TAREA TAN DIFÍCIL', preset: 'spanish-accents', method: 'caesar', shift: 4 },
  { plain: 'EL MÉDICO RECOMENDÓ DESCANSO Y UNA ALIMENTACIÓN EQUILIBRADA', preset: 'spanish-accents', method: 'caesar', shift: 17 },
  { plain: 'MI HERMANO ESTUDIÓ INGENIERÍA EN UNA UNIVERSIDAD DEL NORTE', preset: 'spanish-accents', method: 'atbash' },
  { plain: 'LA EXPOSICIÓN REÚNE OBRAS DE VARIOS PINTORES DEL SIGLO PASADO', preset: 'spanish-accents', method: 'caesar', shift: 21 },
  { plain: 'TERMINÓ EL CAFÉ Y PIDIÓ OTRO MIENTRAS LEÍA TRANQUILO EL DIARIO', preset: 'spanish-accents', method: 'caesar', shift: 8 },
  { plain: 'EL ÚLTIMO CAPÍTULO DE LA NOVELA ME DEJÓ COMPLETAMENTE SIN PALABRAS', preset: 'spanish-accents', method: 'atbash' },

  // ascii-printable (size 95): lowercase, digits and punctuation allowed
  { plain: 'la cita con el dentista es el martes 12 a las 4 de la tarde.', preset: 'ascii-printable', method: 'caesar', shift: 33 },
  { plain: 'el paquete llego esta manana pero faltaba una de las piezas', preset: 'ascii-printable', method: 'caesar', shift: 50 },
  { plain: 'recuerda apagar las luces antes de salir de la oficina, por favor', preset: 'ascii-printable', method: 'atbash' },
  { plain: 'el precio subio de 20 a 35 pesos en menos de un solo ano', preset: 'ascii-printable', method: 'caesar', shift: 70 },
  { plain: 'la contrasena debe tener al menos ocho caracteres y un numero', preset: 'ascii-printable', method: 'caesar', shift: 12 },
  { plain: 'nos reunimos en la esquina de siempre a las nueve en punto', preset: 'ascii-printable', method: 'atbash' },
  { plain: 'el informe tiene 15 paginas y hay que entregarlo antes del viernes', preset: 'ascii-printable', method: 'caesar', shift: 88 },
  { plain: 'camino casi tres kilometros cada dia para llegar hasta el trabajo', preset: 'ascii-printable', method: 'caesar', shift: 45 },
  { plain: 'el gato se escondio debajo de la cama durante toda la tormenta', preset: 'ascii-printable', method: 'atbash' },
  { plain: 'apunta la direccion: calle del sol numero 8, en el segundo piso', preset: 'ascii-printable', method: 'caesar', shift: 60 },
]
