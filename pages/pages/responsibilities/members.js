import React from 'react';
import Lista from '../../../components/responsabilidades/membros/Lista';
import Navbar from '../../../components/responsabilidades/Nav';

function CadastroPage({autenticacao}) {
  return (
    <div>
        <Navbar autenticacao={autenticacao}/>
      <Lista autenticacao={autenticacao}/>
    </div>
  );
}

export default CadastroPage;
