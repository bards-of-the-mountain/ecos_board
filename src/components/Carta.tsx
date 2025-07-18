import { useState } from 'react';
import './Carta.css';
import ReactDOM from 'react-dom';
import CartaPreview from './CartaPreview';

interface CartaProps {
  carta: {
    nombre: string;
    coste: number;
    ataque: number;
    vida: number;
    descripcion?: string;
  };
  seleccionada?: boolean;
  mini?: boolean;
  esRival?: boolean;
  onClick?: () => void;
}

const Carta = ({ carta, seleccionada = false, onClick, mini = false, esRival = false }: CartaProps) => {
  const [hover, setHover] = useState(false);

  return (
    <>
      <div
        className={`carta ${seleccionada ? 'seleccionada' : ''} ${mini ? 'mini' : ''} ${esRival ? 'rival' : ''}`}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="carta-nombre">{carta.nombre}</div>
        <div className="carta-coste">💧 {carta.coste}</div>
        <div className="carta-stats">⚔️ {carta.ataque} / 🛡️ {carta.vida}</div>
      </div>

      {mini && hover &&        
       ReactDOM.createPortal(
          <CartaPreview carta={carta} />,
          document.getElementById('portal-root') as Element
        )}
    </>
  );
};

export default Carta;
