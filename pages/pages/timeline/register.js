import React from 'react';
import Cadastro from '../../../components/cronograma/Cadastro';
import Navbar from '../../../components/cronograma/Navegador';

function CadastroPage({autenticacao}) {
  return (
    <div>
      <Navbar autenticacao={autenticacao}/>
      <Cadastro autenticacao={autenticacao}/>
    </div>
  );
}

export default CadastroPage;
