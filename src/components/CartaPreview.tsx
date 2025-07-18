// src/components/CartaPreview.tsx
import './CartaPreview.css';

interface CartaPreviewProps {
  carta: {
    nombre: string;
    coste: number;
    ataque: number;
    vida: number;
    descripcion?: string;
  };
}

const CartaPreview = ({ carta }: CartaPreviewProps) => (
  <div className="carta-grande-preview">
    <div className="carta-grande-marco">
      <div className="carta-coste-circulo">{carta.coste}</div>
      <div className="carta-grande-nombre">{carta.nombre}</div>
      <div className="carta-grande-stats">
        <span className="atk">🗡️ {carta.ataque}</span>
        <span className="vida">🛡️ {carta.vida}</span>
      </div>
      <div className="carta-grande-desc">
        {carta.descripcion}
      </div>
    </div>
  </div>
);

export default CartaPreview;
