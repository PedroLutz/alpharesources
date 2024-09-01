import Link from 'next/link';
import styles from '../styles/modules/menu.module.css'
import { useEffect, useContext, useState } from 'react';
import {TituloContext} from '../contexts/TituloContext' 

const {containerMenu, menuGroup, logoItem, menuText, gradient_text} = styles;

const Menu = () => {
const { setTitulo } = useContext(TituloContext);

  useEffect(() => {
    setTitulo('');
  }, [setTitulo]);

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
                <Link href="/pages/finances/table">
                    <img src={'/images/finance_logo.png'} alt="Planning Logo" className={logoItem}/>
                    Budget & Resource Management
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
                <Link href="/pages/communication/stakeholders">
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
        </div>
    </div>
  );
};

export default Menu;
