import { isoDateToEuDate } from '../../../../functions/general';
import { format } from 'date-fns';

export const generatePDF = async (container: HTMLElement) => {
    const html2pdf = (await import('html2pdf.js')).default;

    const innerReport = container.querySelector<HTMLElement>('#innerReport');
    if(innerReport) {
        innerReport.style.width = '54rem';
    }
    if (!innerReport) {
        return;
    }

    innerReport.style.width = '54rem';

    container.querySelectorAll<HTMLTableCellElement>('td').forEach((td) => {
        td.style.fontSize = 'small';
    });

    container.querySelectorAll<HTMLTableCellElement>('th').forEach((th) => {
        th.style.fontSize = 'small';
    });

    container.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        img.style.width = '200px';
        img.style.margin = '-10px';
    });

    container.querySelectorAll<HTMLElement>('.alphaLogo').forEach((a) => {
        a.style.width = '90%';
    });

    container.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((textarea) => {
        const div = document.createElement('div');
        div.innerText = textarea.value;
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordBreak = 'break-word';
        div.style.minHeight = '20px';
        div.style.border = 'none';
        div.style.paddingLeft = '2px';
        div.style.paddingRight = '2px';
        div.style.fontFamily = 'inherit';
        div.style.textAlign = 'left';
        div.style.fontSize = 'small';
        div.style.width = `100%`;

        textarea.style.display = 'none';
        textarea.parentNode?.insertBefore(div, textarea.nextSibling);
    });

    container.querySelectorAll<HTMLSelectElement>('select').forEach((select) => {
        const div = document.createElement('div');
        div.innerText = select.value;
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordBreak = 'break-word';
        div.style.border = 'none';
        div.style.fontFamily = 'inherit';
        div.style.fontSize = 'small';
        div.style.color = 'black';
        div.style.height = `20px`;
        div.style.textAlign = 'center';
        div.style.lineHeight = '20px';

        select.style.display = 'none';
        select.parentNode?.insertBefore(div, select.nextSibling);
    });

    const inputManager = container.querySelector<HTMLInputElement>("#manager");
    const inputDateCompletion = container.querySelector<HTMLInputElement>("#dateCompletion");

    const inputs = [inputManager, inputDateCompletion];

    inputs.forEach(input => {
        if (!input || !input.parentNode) {
            return;
        };

        const div = document.createElement('div');
        div.innerText = input.value;

        if (input.id === 'dateCompletion') {
            div.innerText = isoDateToEuDate(input.value) || "";
        }

        div.style.whiteSpace = 'pre-wrap';
        div.style.wordBreak = 'break-word';
        div.style.border = 'none';
        div.style.fontFamily = 'inherit';
        div.style.fontSize = 'small';
        div.style.color = 'black';
        div.style.height = `25px`;
        div.style.textAlign = 'left';
        div.style.lineHeight = '25px';

        input.style.display = 'none';
        input.parentNode.insertBefore(div, input.nextSibling);
    });

    const opt = {
        margin: 1,
        filename: `report-${format(new Date(), 'dd-MM-yyyy')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
            unit: 'px',
            format: [container.offsetWidth, container.offsetHeight + 5],
            orientation: 'portrait'
        }
    };

    await html2pdf().set(opt).from(container).save();
    window.location.reload();
};