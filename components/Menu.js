import Link from 'next/link';
import styles from '../styles/modules/menu.module.css'
import { useEffect, useContext, useState } from 'react';
import {TituloContext} from '../contexts/TituloContext' 

const {containerMenu, menuGroup, logoItem, menuText, gradient_text} = styles;

const Menu = () => {
const { setTitulo } = useContext(TituloContext);
const [dado, setDado] = useState('')

// Parâmetros
const F = 1; // Força de propulsão inicial (N)
const Cd = 0.5; // Coeficiente de arrasto
const rho = 1.225; // Densidade do ar (kg/m^3)
const A =  0.0000020984; // Área frontal (m^2)
const m = 0.05; // Massa do carro (kg)
const mu_rolamentos = 0.01; // Coeficiente de atrito dos rolamentos
const g = 9.81; // Aceleração da gravidade (m/s^2)
const d = 20; // Distância da pista (m)
const r = 0.00281/2; // Raio das rodas (m)
const I = 144091; // Momento de inércia das rodas (kg·m^2)
const dt = 0.001; // Passo de tempo para integração numérica

// Função para calcular a aceleração
function acceleration(v) {
  const D = 0.5 * Cd * rho * A * v * v; // Força de arrasto
  const f_rolamentos = mu_rolamentos * m * g; // Força de atrito nos rolamentos
  const torque_angular = I * (v / (r * r)); // Torque necessário para acelerar as rodas
  return (F - D - f_rolamentos - torque_angular) / m; // Aceleração resultante
}

// Função para calcular o tempo de corrida usando o método de Euler
function calculateRaceTime() {
  let t = 0;
  let x = 0; // Posição inicial
  let v = 0; // Velocidade inicial

  while (x < d) {
    const a = acceleration(v);
    v += a * dt;
    x += v * dt;
    t += dt;
  }

  return t;
}

const raceTime = calculateRaceTime();

  useEffect(() => {
    setTitulo('');
  }, [setTitulo]);

  useEffect(() => {
    setDado(`Tempo de corrida: ${raceTime.toFixed(3)} segundos`);
  })

  return (
    <div className={containerMenu}>
        {/*Logo e nome*/}
        <div className={`${menuText} centered-container`}>
                <img src={'/images/logo.png'} alt="Logo" style={{width: '200px', margin: '-10px'}}/>
                <b className={gradient_text}>Alpha Management</b>
        </div>

        {/*Itens do Menu, linha 1*/}
        <div className={menuGroup}>
            {/*Item WBS*/}
            <span>
                <Link href="/pages/wbs">
                    <img src={'/images/wbs_logo.png'} alt="Planning Logo" className={logoItem}/><br/>
                    Work Breakdown Structure
                </Link>
            </span>
            {/*Item Cronograma*/}
            <span>
                <Link href="/pages/timeline/monitoring">
                    <img src={'/images/timeline_logo.png'} alt="Planning Logo" className={logoItem}/>
                    Timeline management
                </Link>
            </span>
            {/*Item finanças*/}
            <span>
                <Link href="/pages/financial/finances/table">
                    <img src={'/images/finance_logo.png'} alt="Planning Logo" className={logoItem}/>
                    Resource Management
                </Link>
            </span>
        </div>

        {/*Itens do Menu, linha 2*/}
        <div className={menuGroup}>
            {/*Item Responsabilidades*/}
            <span>
                <Link href="/pages/responsibilities/raci">
                    <div>
                        <img src={'/images/members_logo.png'} alt="Members Logo" className={logoItem}/>
                    </div>
                    Roles & Responsibilities
                </Link>
            </span>
            {/*Item Comunicação*/}
            <span>
                <Link href="/pages/communication">
                    <img src={'/images/communication_logo.png'} alt="Planning Logo" className={logoItem}/>
                    Communication management
                </Link>
            </span>
            {/*Item Risco*/}
            <span>
                <Link href="/pages/risk/risks">
                    <img src={'/images/risk_logo.png'} alt="Planning Logo" className={logoItem}/>
                    <br/>Risk<br/>Management
                </Link>
            </span>
            {/* Item Report */}
            <span>
                <Link href="/pages/report">
                    <img src={'/images/report_logo.png'} alt="Planning Logo" className={logoItem}/>
                    Report generator
                </Link>
            </span>
           {/* <label>{dado}</label> */}
        </div>
    </div>
  );
};

export default Menu;
