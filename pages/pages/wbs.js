import React from 'react';
import Cadastro from '../../components/wbs/Cadastro';
import Tabela from '../../components/wbs/Tabela';
import Navbar from '../../components/wbs/Navegador';

function Wbs() {
  return (
    <div>
      <Navbar/>
      <Cadastro/>
      <Tabela/>
    </div>
  );
}

export default Wbs;
