const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Cost-Benefit Analysis</b> is used for helping to define whether or not an acquisition should happen  .<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Identification</b>: a short description of the item to be acquired.</li>
                        <li><b>Description, cost</b>: self explanatory.</li>
                        <li><b>Cost Ranking</b>: in a scale of 1 to 5, how much the purchase affects the team's finances.</li>
                        <li><b>Impact</b>: in a scale of 1 to 5, how much the item impacts the project.</li>
                        <li><b>Urgency</b>: in a scale of 1 to 5, how urgent is the decision to purchase.</li>
                        <li><b>Competitive edge</b>: in a scale of 1 to 5, how much the item increases the team's performance in the competition.</li>
                        <li><b>Affected areas</b>: in a scale of 1 to 5, how many of the areas are affected by the purchase.</li>
                        <li><b>Explanation</b>: a short paragraph explaining the necessity of the purchase and the final decision.</li>
                    </ul>
                    </div>
                    The table also automatically calculates 2 KPIs: the <b>benefit average</b> (average between impact, urgency, competitive edge and affected areas) and the <b>Cost-Benefit index</b> (benefit average divided by cost ranking). 
                    <br/><b>The closer to 0</b> the Cost-Benefit Index is, the <b>less benefitial</b> a purchase is. However, it's up to the team to decide what each specific interval of the cost-benefit index represents.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;