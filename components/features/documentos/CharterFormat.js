import { useState, useEffect } from "react";
import styles from '../../styles/modules/documentos.module.css'

const CharterFormat = () => {
    return (
        <div className={`centered containter ${styles.charterContainer}`}>

            {/* Project Overview */}
            <table className="charterContainer">
                <tr>
                    <th>Project Overview</th>
                </tr>
            </table>
            <table>
                <tr>
                    <th>Project Title</th>
                    <th>Sponsor</th>
                </tr>
                <tr>
                    <td>
                        Alpha Scuderia - STEM Racing
                    </td>
                    <td>
                        Sesi Senai
                    </td>
                </tr>
            </table>
            <table>
                <tr>
                    <th>Project Manager</th>
                    <th>Document Date</th>
                    <th>Update Date</th>
                </tr>
                <tr>
                    <td>
                        Sofia Scarsi
                    </td>
                    <td>
                        24/03/2025
                    </td>
                    <td>
                        -
                    </td>
                </tr>
            </table>

            {/* Purpose */}
            <table>
                <tr>
                    <th>Purpose</th>
                </tr>
                <tr>
                    <td>The purpose of Alpha is to provide students with professional and personal development by engaging them in real-life job-market experiences and exposing them to professional standards. Additionally, the project aims to inspire young people globally by becoming a role model in the competition, thus encouraging thousands of aspiring students to participate and benefit from similar opportunities.</td>
                </tr>
            </table>

            {/* Reasoning */}
            <table>
                <tr>
                    <th>Reasoning</th>
                </tr>
                <tr>
                    <td>There is a need to create and engage in new experiences that foster both personal and professional growth. The project seeks to develop new skills, with a particular focus on 3D modeling and expertise in specific fields. Additionally, there is a need to serve as a role model for future members by excelling in the competition. Exploring and understanding different areas of the competition will further enhance individual capabilities, contributing to overall professional development.</td>
                </tr>
            </table>

            {/* Objectives */}
            <table>
                <tr>
                    <th>Objectives</th>
                </tr>
                <tr>
                    <td>
                        <ul>
                            <li>Achieve one of the top 5 placements in the competition.</li>
                            <li>Reach an overall score of more than 820 points.</li>
                            <li>Ensure 100% adherence to all scrutineering rules.</li>
                            <li>Qualify for the Semifinals in Knockout Racing.</li>
                            <li>Secure one of the top 5 best car times.</li>
                            <li>Develop and present a sustainable project in line with competition standards.</li>
                        </ul>
                    </td>
                </tr>
            </table>

            {/* Premises */}
            <table>
                <tr>
                    <th colSpan={2}>Premises</th>
                </tr>
                <tr>
                    <td>
                        <ul>
                            <li>Chassis machining will be made with Total Moldes;</li>
                            <li>Wheel machining will be done using PEEK, with ISI support;</li>
                            <li>Prototypes and 3D parts will be produced with Fastparts;</li>
                            <li>Painting and finishing will be done with MakeUp;</li>
                            <li>Pit Display will be produced by Adecore;</li>
                        </ul>
                    </td>
                    <td>
                        <ul>
                            <li>Portfolio and document printing will be managed by Bazzar;</li>
                            <li>Uniforms will be produced with Spillere;</li>
                            <li>Bearings will be sourced with AliExpress;</li>
                            <li>Lodging and signing for the event will be bought by Sesi;</li>
                            <li>Extra material can be requested from Sesi;</li>
                            <li>Portfolio and documents delivery date should be 2 weeks before the tournament.</li>
                        </ul>
                    </td>
                </tr>
            </table>

            {/* Restrictions */}
            <table>
                <tr>
                    <th colSpan={2}>Restrictions</th>
                </tr>
                <tr>
                    <td>
                        <ul>
                            <li>High cost of car production, travel and competition fees;</li>
                            <li>Potential variability in the quality and timing of outsourced services and products;</li>
                            <li>Strict delivery deadlines that my impact production and preparation phases;</li>
                        </ul>
                    </td>
                    <td>
                        <ul>
                            <li>Limited access to necessary equipment at the school, potentially slowing down the development process;</li>
                            <li>Dependence on Sesi for the timely purchase of plane tickets and travel arrangements.</li>
                            <li>Need to limit visibility benefits.</li>
                        </ul>
                    </td>
                </tr>
            </table>

            {/* Scope */}
            <table>
                <tr>
                    <th>Scope</th>
                </tr>
                <tr>
                    <td>
                        <ul>
                            <li>Car Construction: Building and assembling the competition car, ensuring adherence to technical specifications.</li>
                            <li>Documentation: Preparing and submitting all required portfolios, reports, and documents for the competition.</li>
                            <li>Pit Display: Designing and constructing a pit display that showcases the team's work and achievements.</li>
                            <li>Presentation: Developing and rehearsing the presentations for the judges.</li>
                            <li>Marketing and ROI: Implementing marketing strategies and ROI (Return on Investment) actions to promote the project and secure sponsorships.</li>
                            <li>Fundraising: Acquiring monetary funds necessary for the project’s expenses.</li>
                            <li>Digital Media Management: Managing accounts on digital media platforms to engage with the audience and promote the team’s progress.</li>
                            <li>Sustainability: Developing a sustainable project, inside the team with marketing materials and engineering parts, and with the community. </li>
                        </ul>
                    </td>
                </tr>
            </table>

            {/* Deliverables */}
            <table>
                <tr>
                    <th>Deliverables</th>
                </tr>
                <tr>
                    <ul>
                        <li>Car Construction: 3 completely assembled cars; 1 machined chassis, extra parts.</li>
                        <li>Documentation: 3 portfolios in A3 format (Enterprise, Engineering and Project Management); 3 portfolios in A4 format (Pit Display, Social Project, Alpha Management); Renderings and Engineering Drawings.</li>
                        <li>Pit display: Fully constructed pit display.</li>
                        <li>Presentation: Verbal presentation at the competition.</li>
                        <li>Marketing and ROI: At least 5 marketing actions; At least one ROI action per sponsor.</li>
                        <li>Digital Media: Digital media accounts in Instagram, LinkedIn, TikTok, X.</li>
                        <li>Sustainability: At least 3 sustainable actions per dimension. </li>
                    </ul>
                </tr>
            </table>

            {/* Cost Estimate */}
            <table>
                <tr>
                    <th colSpan={2}>Cost Estimate</th>
                </tr>
                <tr>
                    <th>Area</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>TOTAL</td>
                    <td>R$23000</td>
                </tr>
            </table>

            {/* Main Milestones */}
            <table>
                <tr>
                    <th colSpan={2}>Main Milestones</th>
                </tr>
                <tr>
                    <th>Milestone</th>
                    <th>Deadline</th>
                </tr>
                <tr>
                    <td>Start of sponsor searching</td>
                    <td>24/03/25</td>
                </tr>
            </table>

            {/* Stakeholders */}
            <table>
                <tr>
                    <th colSpan={2}>Stakeholders</th>
                </tr>
                <tr>
                    <th>Internal</th>
                    <th>External</th>
                </tr>
                <tr>
                    <td>Coach: provides guidance and support.</td>
                    <td>Sponsors: provide financial support and resourcesz</td>
                </tr>
            </table>

            {/* Preliminary Risks */}
            <table>
                <tr>
                    <th>Preliminary Risks</th>
                </tr>
                <tr>
                    <td>
                        <ul>
                            <li>Machining Failure: Issues with the precision or functionality of machined parts.</li>
                        </ul>
                    </td>
                </tr>
            </table>

            {/* Signatures */}
            <div>
                <h4>Signatures</h4>
                <div>
                    <h1>________</h1>
                    <h4>Sofia Scarsi</h4>
                    <h4>Project Manager</h4>
                </div>
            </div>
        </div>
    )
}

export default CharterFormat;