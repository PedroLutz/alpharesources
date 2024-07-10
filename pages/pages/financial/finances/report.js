import React from 'react';
import Resumo from '../../../../components/financeiro/financas/Resumo';
import Navbar from '../../../../components/financeiro/financas/Navegador';


function ResumoPage({autenticacao}) {
  return (
    <div>
      <Navbar autenticacao={autenticacao}/>
      <Resumo />
    </div>
  );
}

export default ResumoPage;
