const Modal = ({ objeto }) => {
  return (
    <div className="overlay">
      <div className="modal">
        <p>{objeto.titulo}</p>
        {objeto.alerta && (
          <div>
            <p style={{color:'red'}}><b>WARNING! This action can't be undone.</b></p>
          </div>
        )}
        <div>
          <div className={objeto.botao3 && 'mesma-linha'}>
            <button className="botao-padrao" onClick={objeto.botao1.funcao}>
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