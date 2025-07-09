import Link from 'next/link';
import styles from '../../styles/modules/menu.module.css'
import { useEffect, useContext } from 'react';
import { TituloContext } from '../../contexts/TituloContext'

const { containerMenu, menuGroup, logoItem, menuText, gradient_text } = styles;

const Menu = () => {
    const { setTitulo } = useContext(TituloContext);

    useEffect(() => {
        setTitulo('');
    }, [setTitulo]);

    return (
        <div className={containerMenu} style={{marginTop: '-4rem'}}>
            {/*Logo e nome*/}
            <div className={`${menuText} centered-container`}>
                <img src={'/images/logo.png'} alt="Logo" style={{ width: '200px', margin: '-10px' }} />
                <b className={gradient_text}>Alpha Management</b>
            </div>

            {/*Itens do Menu, linha 1*/}
            <div className={menuGroup}>
                {/*Item DOCS*/}
                {/* <span>
                <Link href="/pages/documents/projectcharter">
                    <img src={'/images/docs_logo.png'} alt="Planning Logo" className={logoItem}/><br/>
                    Documents
                </Link>
            </span> */}
                {/*Item WBS*/}
                <span>
                    <Link href="/pags/wbs/wbs">
                        <div>
                            <img src={'/images/wbs_logo.png'} alt="Planning Logo" className={logoItem} /><br />
                        </div>

                        Work Breakdown Structure
                    </Link>
                </span>
                {/*Item Cronograma*/}
                <span>
                    <Link href="/pags/timeline/monitoring">
                        <div>
                            <img src={'/images/timeline_logo.png'} alt="Planning Logo" className={logoItem} />
                        </div>

                        Timeline management
                    </Link>
                </span>
                {/*Item finanças*/}
                <span style={{ fontSize: '0.9rem' }}>
                    <Link href="/pags/finances/finances/table">
                        <div>
                            <img src={'/images/finance_logo.png'} alt="Planning Logo" className={logoItem} />
                        </div>
                        Budget & Resource Management
                    </Link>
                </span>
            </div>

            {/*Itens do Menu, linha 2*/}
            <div className={menuGroup}>
                {/*Item Responsabilidades*/}
                <span>
                    <Link href="/pags/responsibilities/raci">
                        <div>
                            <img src={'/images/members_logo.png'} alt="Members Logo" className={logoItem} />
                        </div>
                        Roles & Responsibilities
                    </Link>
                </span>
                {/*Item Comunicação*/}
                <span>
                    <Link href="/pags/communication/stakeholders">
                        <div>
                            <img src={'/images/communication_logo.png'} alt="Planning Logo" className={logoItem} />
                        </div>
                        Communication management
                    </Link>
                </span>
                {/*Item Risco*/}
                <span>
                    <Link href="/pags/risk/risks">
                        <img src={'/images/risk_logo.png'} alt="Planning Logo" className={logoItem} />
                        <br />Risk<br />Management
                    </Link>
                </span>
                {/* Item Report */}
                <span>
                    <Link href="/pags/report">
                    <div>
                    <img src={'/images/monitoring_logo.png'} alt="Planning Logo" className={logoItem} />
                    </div>
                        Monitoring
                    </Link>
                </span>
            </div>
        </div>
    );
};

export default Menu;
