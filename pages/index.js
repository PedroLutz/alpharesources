import React from 'react';
import Verdadeiro from './_app'; // Importe o componente Home a partir do arquivo index.js

function index() {
  return (
    <div>
      <h1>Página Verdadeiro</h1>
      <Verdadeiro /> {/* Renderize o componente Home aqui */}
    </div>
  );
}

export default index;