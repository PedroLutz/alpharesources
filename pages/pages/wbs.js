import React from 'react';
import Cadastro from '../../components/wbs/Cadastro';
import Tabela from '../../components/wbs/Tabela';
import Navbar from '../../components/wbs/Navegador';

function Wbs({autenticacao}) {
  return (
    <div>
      <Navbar autenticacao={autenticacao}/>
      <Cadastro autenticacao={autenticacao}/>
      <Tabela autenticacao={autenticacao}/>
    </div>
  );
}

export default Wbs;
