import React from 'react';

const Modal = ({ objeto }) => {
  return (
    <div className="overlay">
      <div className="modal" style={objeto.botao3 && {width: '250px'}}>
        <p>{objeto.titulo}</p>
        <div>
          <div className={objeto.botao3 && 'mesma-linha'}>
            <button className="botao-padrao" style={objeto.botao3 && {width: '110px'}} onClick={objeto.botao1.funcao}>
              {objeto.botao1.texto}
            </button>
            {objeto.botao2 && (
              <button className="botao-padrao" onClick={objeto.botao2.funcao}>
                {objeto.botao2.texto}
              </button>
            )}
          </div>
          {objeto.botao3 && (
            <button className="botao-padrao" onClick={objeto.botao3.funcao}>
              {objeto.botao3.texto}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;