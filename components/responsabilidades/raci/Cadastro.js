import React, { useState, Suspense, useEffect } from 'react';
import { handleSubmit, fetchData } from '../../../functions/crud'
import { cleanForm } from '../../../functions/general'
import Modal from '../../Modal';

const Cadastro = () => {
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [nomesMembros, setNomesMembros] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [itensPorArea, setItensPorArea] = useState([]);
  const [formData, setFormData] = useState({
    area: "",
    item: "",
    responsabilidades: ""
  });

  const handleAreaChange = (e) => {
    const areaSelecionada = e.target.value;
    const itensDaArea = elementos.filter(item => item.area === areaSelecionada).map(item => item.item);
    setItensPorArea(itensDaArea);
    setFormData({
      ...formData,
      area: areaSelecionada,
      item: '',
    });
  };

  const handleChange = (e) => {
    setFormData(({
      ...formData,
      [e.target.name]: e.target.value,
    }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      responsabilidades: inputNames.map(inputName => formData["input" + getCleanName(inputName)]).join(', ')
    };

    handleSubmit({
      route: 'responsabilidades/raci',
      dados: updatedFormData,
      registroSucesso: setRegisterSuccess
    });
    cleanForm(formData, setFormData);
  };

  const fetchElementos = async () => {
    const data = await fetchData('wbs/get');
    setElementos(data.elementos);
  };

  const fetchNomesMembros = async () => {
    const data = await fetchData('responsabilidades/membros/get');
    setNomesMembros(data.nomes);
  };

  const generateInputNames = () => {
    const firstNames = new Map();
    const fullNames = [];
    const inputNames = [];

    nomesMembros.forEach((membro) => {
      const nomeCompleto = membro.nome;
      const firstName = nomeCompleto.split(' ')[0];
      const lastName = nomeCompleto.split(' ')[1];
      const corrigirNomeCompleto = () => {
        let index = fullNames.findIndex(x => x.includes(firstName));
        let otherLastName = fullNames[index].split(' ')[1];
        inputNames[index] = `${firstName} ${otherLastName}`;
      };

      if (firstNames.has(firstName)) {
        const existingHeader = firstNames.get(firstName);
        inputNames.push(`${existingHeader} ${lastName}`);
        fullNames.push(`${firstName} ${lastName}`);
        corrigirNomeCompleto();
      } else {
        firstNames.set(firstName, nomeCompleto.split(' ')[0]);
        inputNames.push(firstName);
        fullNames.push(`${firstName} ${lastName}`);
      };
    });
    return inputNames;
  };
  const inputNames = generateInputNames();

  const generateFormData = () => {
    inputNames.forEach((membro) => {
      setFormData(({
        ...formData,
        [`input${getCleanName(membro)}`]: ''
      }));
    });
  };

  const getCleanName = (str) => {
    const removeAccents = (str) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    return removeAccents(str.split(" ").join(""));
  };


  useEffect(() => {
    fetchNomesMembros();
    fetchElementos();
    generateFormData();
  }, []);

  return (
    <div className="centered-container financeiro">
      <h2>Register RACI item</h2>
      <form onSubmit={enviar}>
        <div className="centered-container">
          {inputNames.map((membro, index) => (
            <div key={index} className="mini-input column">
              <label htmlFor={"input" + getCleanName(membro)}>{membro}</label>
              <select
                type="text"
                id={"input" + getCleanName(membro)}
                name={"input" + getCleanName(membro)}
                placeholder=""
                onChange={handleChange}
                defaultValue={""}
                value={formData["input" + getCleanName(membro)]}
                required
              >
                <option value="" disabled>Select responsibility</option>
                <option value="R">Responsible</option>
                <option value="A">Accountable</option>
                <option value="C">Consulted</option>
                <option value="I">Informed</option>
              </select>
            </div>
          ))}
          <div className="mini-input" style={{ marginTop: "30px" }}>
            <label htmlFor="area">Area</label>
            <select
              name="area"
              onChange={handleAreaChange}
              value={formData.area}
              required
            >
              <option value="" disabled>Select an area</option>
              {[...new Set(elementos.map(item => item.area))].map((area, index) => (
                <option key={index} value={area}>{area}</option>
              ))};
            </select>

            <label htmlFor="item">Item</label>
            <select
              name="item"
              onChange={handleChange}
              value={formData.item}
              required
            >
              <option value="" disabled>Select an item</option>
              {itensPorArea.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))};
            </select>
          </div>
        </div>

        <div>
          <button className="botao-cadastro" type="submit">Register RACI item</button>
        </div>
      </form>

      <Suspense fallback={<div>Loading...</div>}>
        {registerSuccess &&
          <Modal objeto={{
            titulo: registerSuccess ? 'Register successful!' : 'Register failed.',
            botao1: {
              funcao: () => setRegisterSuccess(false), texto: 'Close'
            }
          }} />}
      </Suspense>
    </div>
  );
};

export default Cadastro;