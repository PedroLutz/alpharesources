import React from 'react';
import Tabela from '../../../components/cronograma/Monitoramento';
import Navbar from '../../../components/cronograma/Navegador';

function CadastroPage({autenticacao}) {
  return (
    <div>
      <Navbar autenticacao={autenticacao}/>
      <Tabela autenticacao={autenticacao}/>
    </div>
  );
}

export default CadastroPage;
