import { useState } from 'react';
import ReactDOM from 'react-dom';
import CartaPreview from './CartaPreview';
import './Carta.css';

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
  previewOnClick?: boolean; 
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const Carta = ({
  carta,
  seleccionada = false,
  onClick,
  mini = false,
  esRival = false,
  previewOnClick = false,
  onContextMenu
}: CartaProps) => {
  const [hover, setHover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const portalRoot = document.getElementById('portal-root');

  // --- preview lógico ---
  const preview =
    mini &&
    ((previewOnClick && showPreview) || (!previewOnClick && hover)) &&
    portalRoot &&
    ReactDOM.createPortal(
      <div
        className="carta-preview"
        onClick={() => setShowPreview(false)}
        style={{ pointerEvents: previewOnClick ? 'auto' : 'none', cursor: 'pointer' }}
        title="Haz click para cerrar"
      >
        <div className="carta carta-grande">
          <div className="carta-nombre">{carta.nombre}</div>
          <div className="carta-coste">💧 {carta.coste}</div>
          <div className="carta-stats">⚔️ {carta.ataque} / 🛡️ {carta.vida}</div>
          {carta.descripcion && <div className="carta-desc">{carta.descripcion}</div>}
        </div>
      </div>,
      portalRoot
    );

  return (
    <>
      <div
        className={`carta${seleccionada ? ' seleccionada' : ''}${mini ? ' mini' : ''}${esRival ? ' rival' : ''}`}
        onClick={e => {
          onClick && onClick();
          if (previewOnClick) setShowPreview(true);
        }}
        onContextMenu={onContextMenu}
        onMouseEnter={() => !previewOnClick && setHover(true)}
        onMouseLeave={() => !previewOnClick && setHover(false)}
      >
        <div className="carta-nombre">{carta.nombre}</div>
        <div className="carta-coste">💧 {carta.coste}</div>
        <div className="carta-stats">⚔️ {carta.ataque} / 🛡️ {carta.vida}</div>
      </div>
      {preview}
    </>
  );
};

export default Carta;
