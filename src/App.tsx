import { useState, useEffect, useRef } from 'react';
import Carta from './components/Carta';
import Pusher from 'pusher-js';
import './App.css';

const MAZOS = {
  bosque: [
    { nombre: 'Semilla Espinosa', coste: 1, ataque: 2, vida: 2 },
    { nombre: 'Espíritu del Roble', coste: 2, ataque: 3, vida: 4 },
  ],
  torre: [
    { nombre: 'Aprendiz de Runa', coste: 1, ataque: 1, vida: 3 },
    { nombre: 'Elemental de Fuego', coste: 3, ataque: 5, vida: 2 },
  ]
};

const ZONAS = [
  { nombre: '☠️ Ruinas', clase: 'zona-ruinas' },
  { nombre: '🏰 Torre Arcana', clase: 'zona-torre' },
  { nombre: '🌿 Bosque Vivo', clase: 'zona-bosque' }
];



function App() {
  type CartaColocada = {
    jugador: 'A' | 'B';
    carta: {
      nombre: string;
      coste: number;
      ataque: number;
      vida: number;
    };
  };

  const [cartasJugador, setCartasJugador] = useState<typeof MAZOS['bosque']>([]);
  const [jugador, setJugador] = useState<'A' | 'B' | null>(null);
  const jugadorRef = useRef<'A' | 'B' | null>(null);
  const [mazo, setMazo] = useState<null | 'bosque' | 'torre'>(null);
  const [turno, setTurno] = useState<'A' | 'B'>('A');
  const columnas = ZONAS.length;
  const [cartaSeleccionada, setCartaSeleccionada] = useState<number | null>(null);
  const [casillas, setCasillas] = useState<CartaColocada[][]>(
    Array(2 * columnas).fill(null).map(() => [])
  );
  
  // Cálculo fuera del onClick, antes del return
  const mazoOriginal = mazo ? MAZOS[mazo] : [];
  const nombresEnMesa = casillas.flat()
    .filter(c => c?.jugador === jugador)
    .map(c => c.carta.nombre);

  const nombresEnMano = cartasJugador.map(c => c.nombre);

  const disponibles = mazoOriginal.filter(
    c => !nombresEnMano.includes(c.nombre) && !nombresEnMesa.includes(c.nombre)
  );
  const cartasRestantes = disponibles.length;

  useEffect(() => {
    if (mazo) {
      setCartasJugador([]); 
    }
  }, [mazo]);


  const handleClick = async (index: number) => {
    console.log("Click en casilla con carta seleccionada: ", cartaSeleccionada)
    const esCasillaInferior = index >= columnas;

    if (jugador !== turno) return;
    if (cartaSeleccionada === null) return;
    if ((jugador === 'A' && !esCasillaInferior) || (jugador === 'B' && esCasillaInferior)) return;

    const nuevas = [...casillas];
    const carta = cartasJugador[cartaSeleccionada];

    nuevas[index] = [...nuevas[index], { jugador, carta }];
    setCasillas(nuevas);

    await fetch('https://ecos-board-backend.onrender.com/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        index,
        jugador,
        carta
      })
    });

    // Eliminar carta del mazo del jugador
    const nuevasCartas = [...cartasJugador];
    nuevasCartas.splice(cartaSeleccionada!, 1); 
    setCartasJugador(nuevasCartas);

    setCartaSeleccionada(null);
  };


  const finalizarTurno = async () => {
    const nuevo = turno === 'A' ? 'B' : 'A';
    await fetch('https://ecos-board-backend.onrender.com/turno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevoTurno: nuevo })
    });
  };

  useEffect(() => {
    fetch('https://ecos-board-backend.onrender.com/jugador')
      .then(res => res.json())
      .then(data => {
        setJugador(data.jugador);
        jugadorRef.current = data.jugador;
      })
      .catch(err => {
        console.error('Error al obtener jugador:', err);
        alert('No se puede entrar a la partida. Está completa.');
      });
  }, []);

  useEffect(() => {
    const pusher = new Pusher('b50eb8000bd0cb796352', {
      cluster: 'eu'
    });

    const canal = pusher.subscribe('partida');

    canal.bind('cambio-turno', (data: { turno: 'A' | 'B' }) => {
      setTurno(data.turno);
    });

    return () => {
      pusher.unsubscribe('partida');
    };
  }, []);

  useEffect(() => {
    if (!jugador) return; // no te suscribas hasta que tengas un jugador válido

    jugadorRef.current = jugador;

    const pusher = new Pusher('b50eb8000bd0cb796352', {
      cluster: 'eu'
    });

    const canal = pusher.subscribe('eco-board');

    canal.bind('move', (data: { index: number; carta: any }) => {
      const { jugador: jugadorRemoto, ...carta } = data.carta;

      console.log("Jugador actual: ", jugadorRef.current);
      console.log("Jugador que ha movido la carta: ", jugadorRemoto);

      if (jugadorRemoto === jugadorRef.current) return;

      setCasillas(prev => {
        const nuevas = [...prev];
        nuevas[data.index] = [...nuevas[data.index], { jugador: jugadorRemoto, carta }];
        return nuevas;
      });
    });

    return () => {
      pusher.unsubscribe('eco-board');
    };
  }, [jugador]);

  if (!mazo) {
    return (
      <div className="mazo-select">
        <h2>Elige tu mazo</h2>
        <button onClick={() => {
          setMazo('bosque');
          setJugador(jugador === null ? 'A' : 'B');
        }}>
          🌿 Bosque Vivo
        </button>

        <button onClick={() => {
          setMazo('torre');
          setJugador(jugador === null ? 'A' : 'B');
        }}>
          🏰 Torre Arcana
        </button>
      </div>
    );
  }

  return (
    <div className="tablero-container">
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', color: '#aaa', fontWeight: 'bold' }}>
        Eres: Jugador {jugador}
      </div>
      <p className="turno">Turno de: <strong>{turno === 'A' ? 'Jugador A (🌿)' : 'Jugador B (🔥)'}</strong></p>
      <div className="tablero-horizontal">
        {ZONAS.map((zona, i) => (
          <div key={i} className={`zona-horizontal ${zona.clase}`}>
            <div className="casilla" onClick={() => handleClick(i)}>
              {Array.isArray(casillas[i]) && casillas[i].map((c, idx) =>
                c?.carta ? (
                  <Carta
                    key={idx}
                    carta={c.carta}
                    mini
                    esRival={c.jugador !== jugador}
                  />
                ) : null
              )}
            </div>
            <div className="zona-nombre">{zona.nombre}</div>
            <div className="casilla" onClick={() => handleClick(i + columnas)}>
              {Array.isArray(casillas[i + columnas]) && casillas[i + columnas].map((c, idx) =>
                c?.carta ? (
                  <Carta
                    key={idx}
                    carta={c.carta}
                    mini
                    esRival={c.jugador !== jugador}
                  />
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mazo-jugador">
        {cartasJugador.map((carta, idx) => (
          <Carta
            key={idx}
            carta={carta}
            seleccionada={cartaSeleccionada === idx}
            onClick={() => setCartaSeleccionada(idx)}
            mini
          />
        ))}
      </div>

      <div className="zona-controles">
        <button
          className="btn-turno"
          style={{ background: '#446' }}
          onClick={() => {
            if (!mazo) return;
            const cantidad = parseInt(window.prompt('¿Cuántas cartas quieres robar?', '1') || '0');
            if (isNaN(cantidad) || cantidad <= 0) return;

            // Calcula cuáles cartas quedan en el mazo (no están en la mano NI en la mesa)
            const mazoOriginal = MAZOS[mazo];

            // Cartas jugadas en la mesa (solo las propias)
            const nombresEnMesa = casillas.flat()
              .filter(c => c?.jugador === jugador)
              .map(c => c.carta.nombre);

            // Cartas en la mano
            const nombresEnMano = cartasJugador.map(c => c.nombre);

            // Cartas disponibles para robar (ni en mano ni en mesa)
            const disponibles = mazoOriginal.filter(
              c => !nombresEnMano.includes(c.nombre) && !nombresEnMesa.includes(c.nombre)
            );

            // Solo roba las que queden
            const robadas = disponibles.slice(0, cantidad);
            setCartasJugador(prev => [...prev, ...robadas]);
          }}
        >
          Robar cartas
          <span style={{
            marginLeft: 8,
            background: '#222',
            borderRadius: '999px',
            padding: '2px 8px',
            fontWeight: 'bold',
            fontSize: '0.95em'
          }}>
            {cartasRestantes}
          </span>
        </button>

        <button
          className="btn-turno"
          style={{ background: '#553' }}
          onClick={() => {
            if (mazo) {
              setCartasJugador([...MAZOS[mazo]]);
              setCartaSeleccionada(null);
            }
          }}
        >
          Reiniciar mazo
        </button>

        {jugador === turno && (
          <button className="btn-turno" style={{ background: '#2a5' }} onClick={finalizarTurno}>
            Finalizar turno
          </button>
        )}

        <button
          className="btn-turno"
          style={{ background: '#444' }}
          onClick={() => {
            setCasillas(Array(2 * columnas).fill(null).map(() => []));
          }}
        >
          🧹 Limpiar tablero
        </button>

        {jugador && (
          <button
            className="btn-turno"
            style={{ background: '#822' }}
            onClick={async () => {
              await fetch('https://ecos-board-backend.onrender.com/salir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jugador })
              });

              setJugador(null);
              setMazo(null);
            }}
          >
            Salir de la partida
          </button>
        )}
      </div>
    </div>
  );
}

export default App;