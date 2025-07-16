import React, { useState } from 'react';
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
  const [mazo, setMazo] = useState<null | 'bosque' | 'torre'>(null);
  const [turno, setTurno] = useState<'A' | 'B'>('A');
  const columnas = ZONAS.length;
  const [casillas, setCasillas] = useState<(null | '🌿' | '🔥')[]>(Array(2 * columnas).fill(null));

  const handleClick = (index: number) => {
    if (casillas[index]) return;
    const nuevas = [...casillas];
    nuevas[index] = turno === 'A' ? '🌿' : '🔥';
    setCasillas(nuevas);
    setTurno(turno === 'A' ? 'B' : 'A');
  };

  if (!mazo) {
    return (
      <div className="mazo-select">
        <h2>Elige tu mazo</h2>
        <button onClick={() => setMazo('bosque')}>🌿 Bosque Vivo</button>
        <button onClick={() => setMazo('torre')}>🏰 Torre Arcana</button>
      </div>
    );
  }

  const cartasJugador = MAZOS[mazo];

  return (
    <div className="tablero-container">
      <p className="turno">Turno de: <strong>{turno === 'A' ? 'Jugador A (🌿)' : 'Jugador B (🔥)'}</strong></p>
      <div className="tablero-horizontal">
        {ZONAS.map((zona, i) => (
          <div key={i} className={`zona-horizontal ${zona.clase}`}>
            <div className="casilla" onClick={() => handleClick(i)}>
              {casillas[i] || ''}
            </div>
            <div className="zona-nombre">{zona.nombre}</div>
            <div className="casilla" onClick={() => handleClick(i + columnas)}>
              {casillas[i + columnas] || ''}
            </div>
          </div>
        ))}
      </div>
      <div className="mazo-jugador">
        {cartasJugador.map((carta, idx) => (
          <div key={idx} className="carta">
            <strong>{carta.nombre}</strong>
            <div>Coste: {carta.coste}</div>
            <div>ATK: {carta.ataque} / VIDA: {carta.vida}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;