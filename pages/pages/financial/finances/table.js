import React from 'react';
import Tabela from '../../../../components/financeiro/financas/Tabela';
import Navbar from '../../../../components/financeiro/financas/Navegador';

function TabelaPage({autenticacao}) {
  return (
    <div>
      <Navbar autenticacao={autenticacao}/>
      <Tabela autenticacao={autenticacao}/>
    </div>
  );
}

export default TabelaPage;
