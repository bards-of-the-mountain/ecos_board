// src/components/Carta.tsx
import './Carta.css';

interface CartaProps {
  carta: {
    nombre: string;
    coste: number;
    ataque: number;
    vida: number;
  };
  seleccionada?: boolean;
  mini?: boolean;
  esRival?: boolean;
  onClick?: () => void;
}

const Carta = ({ carta, seleccionada = false, onClick, mini, esRival}: CartaProps) => {
  return (
    <div
    className={`carta ${seleccionada ? 'seleccionada' : ''} ${mini ? 'mini' : ''} ${esRival ? 'rival' : ''}`}
    onClick={onClick}
    >
      <strong>{carta.nombre}</strong>
      <div>Coste: {carta.coste}</div>
      <div>ATK: {carta.ataque} / VIDA: {carta.vida}</div>
    </div>
  );
};

export default Carta;
