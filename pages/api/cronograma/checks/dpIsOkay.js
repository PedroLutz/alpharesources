import connectToDatabase from '../../../../lib/db';
import GanttModel from '../../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'POST') {
            const {dp_area, dp_item, inicio} = req.body;
            const gantt = await Gantt.findOne({ area: dp_area, item: dp_item, plano: true });

            function formatDate(dateString) {
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            function isOneBiggerThanOther(data1, data2){
                const days = [data1.split('-')[2], data2.split('-')[2]]
                const months = [data1.split('-')[1], data2.split('-')[1]]
                const years = [data1.split('-')[0], data2.split('-')[0]]
                if(years[0] > years[1]){
                    return true
                };
                if(months[0] > months[1]){
                    return true;
                }
                if(days[0] > days[1]){
                    return true;
                }
            }

            if(gantt != null){
                if(isOneBiggerThanOther(inicio, formatDate(gantt.termino))){
                    res.json({ found: true });
                } else {
                    res.json({ found: false });
                }
            } else {
                res.json({ found: false });
            }

        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Planos', error);
        res.status(500).json({ error: 'Erro ao buscar os Planos' });
    }
};