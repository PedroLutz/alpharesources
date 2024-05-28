import React from 'react';

const Modal = ({ objeto }) => {
  return (
    <div className="overlay">
      <div className="modal">
        <p>{objeto.titulo}</p>
        <div>
          <button className="botao-cadastro" onClick={objeto.botao1.funcao}>
            {objeto.botao1.texto}
          </button>
          {objeto.botao2 && (
            <button className="botao-cadastro" onClick={objeto.botao2.funcao}>
              {objeto.botao2.texto}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default Modal;