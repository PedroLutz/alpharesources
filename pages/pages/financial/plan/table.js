import React from 'react';
import Tabela from '../../../../components/financeiro/plano/Tabela';
import Navbar from '../../../../components/financeiro/plano/Navegador';

function TabelaPage({autenticacao}) {
  return (
    <div>
      <Navbar autenticacao={autenticacao}/>
      <Tabela autenticacao={autenticacao}/>
    </div>
  );
}

export default TabelaPage;
