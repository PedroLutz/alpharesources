import React from 'react';
import Resumo from '../../../../components/financeiro/plano/Resumo';
import Navbar from '../../../../components/financeiro/plano/Navegador';


function ResumoPage({autenticacao}) {
  return (
    <div>
      <Navbar autenticacao={autenticacao}/>
      <Resumo />
    </div>
  );
}

export default ResumoPage;
