import { useState, useEffect } from 'react';
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

  const [jugador, setJugador] = useState<'A' | 'B' | null>(null);
  const [mazo, setMazo] = useState<null | 'bosque' | 'torre'>(null);
  const [turno, setTurno] = useState<'A' | 'B'>('A');
  const columnas = ZONAS.length;
  const [cartaSeleccionada, setCartaSeleccionada] = useState<number | null>(null);
  const [casillas, setCasillas] = useState<CartaColocada[][]>(
    Array(2 * columnas).fill(null).map(() => [])
  );

  const handleClick = async (index: number) => {
    const esCasillaInferior = index >= columnas; // las de abajo

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
        carta: {
          jugador,
          carta
        }
      })
    });

    // Eliminar carta del mazo
    const nuevasCartas = [...cartasJugador];
    nuevasCartas.splice(cartaSeleccionada, 1);
    MAZOS[mazo!] = nuevasCartas;

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
      .then(data => setJugador(data.jugador))
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
    const pusher = new Pusher('b50eb8000bd0cb796352', {
      cluster: 'eu'
    });

    const canal = pusher.subscribe('eco-board');

    canal.bind('move', (data: { index: number; carta: CartaColocada }) => {
      setCasillas(prev => {
        const nuevas = [...prev];
        nuevas[data.index] = [...nuevas[data.index], data.carta];
        return nuevas;
      });
    });

    return () => {
      pusher.unsubscribe('eco-board');
    };
  }, []);

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

  const cartasJugador = MAZOS[mazo];

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
              {casillas[i].map((c, idx) => (
                <Carta
                  key={idx}
                  carta={c.carta}
                  mini
                  esRival={c.jugador !== jugador}
                />
              ))}
            </div>
            <div className="zona-nombre">{zona.nombre}</div>
            <div className="casilla" onClick={() => handleClick(i + columnas)}>
              {casillas[i + columnas].map((c, idx) => (
                <Carta
                  key={idx}
                  carta={c.carta}
                  mini
                  esRival={c.jugador !== jugador}
                />
              ))}
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
          />
        ))}
      </div>

      {jugador === turno && (
        <button className="btn-turno" onClick={finalizarTurno}>
          Finalizar turno
        </button>
      )}

      {jugador && (
        <button
          className="btn-turno"
          style={{ bottom: '4.5rem', background: '#822' }}
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
  );
}

export default App;