import React from 'react';
import Tabela from '../../../components/responsabilidades/raci/Tabela';
import Navbar from '../../../components/responsabilidades/Nav';

function CadastroPage({autenticacao}) {
  return (
    <div>
        <Navbar autenticacao={autenticacao}/>
        <Tabela autenticacao={autenticacao}/>
    </div>
  );
}

export default CadastroPage;
