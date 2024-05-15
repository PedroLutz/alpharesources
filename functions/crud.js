const handleSubmit = async (o) => {
    if (!o.route) {
        console.error(`Requisição de submit feita sem uma rota!`);
        return;
    }

    if (!o.dados) {
        console.error(`Requisição de submit feita sem dados!`);
        return;
    }

    try {
        const response = await fetch(`/api/${o.route}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(o.dados),
        });

        if (response.ok) {
            console.log(`${o.route} registrado(a) com sucesso!`);
            if(o.registroSucesso) o.registroSucesso(true);
            return true;
        } else {
            console.error(`Erro ao registrar ${o.route}`);
            return false;
        }
    } catch (error) {
        console.error(`Erro ao registrar ${o.route}`, error);
        return false;
    }
};



const handleDelete = async (o) => {
    if (!o.route) {
        console.error(`Requisição de delete feita sem uma rota!`);
        return;
    }

    if (!o.item) {
        console.error(`Requisição de delete feita sem um item!`);
        return;
    }

    try {
        const response = await fetch(`/api/${o.route}/delete?id=${o.item._id}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        console.log(data.message);

        if (o.fetchDados) o.fetchDados();
        return true;
    } catch (error) {
        console.error(`Erro ao excluir ${o.route}`, error);
        return false;
    }
};



const fetchData = async (route) => {
    if (!route) {
        console.error(`Requisição de fetch feita sem rota!`);
        return;
    }

    try {
        const response = await fetch(`/api/${route}`, {
            method: 'GET',
        });

        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            console.error(`Erro ao buscar por dados de ${route}`);
        }
    } catch (error) {
        console.error(`Erro ao buscar por dados de ${route}`, error);
    }
};



const handleUpdate = async (o) => {
    if (!o.item) {
        console.error(`Requisição de update feita sem um item!`);
        return;
    }

    if (!o.route) {
        console.error(`Requisição de update feita sem uma rota!`);
        return;
    }

    if (!o.dados) {
        console.error(`Requisição de update feita sem dados!`);
        return;
    }

    try {
        const response = await fetch(`/api/${o.route}/update?id=${String(o.item._id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(o.dados),
        });

        if (response.status === 200) {
            console.log(`${o.route} atualizado com sucesso!`);
        } else {
            console.error(`Erro ao atualizar ${o.route}`);
        }
    } catch (error) {
        console.error(`Erro ao atualizar ${o.route}, error`);
    }
};

export { handleSubmit, handleDelete, fetchData, handleUpdate };