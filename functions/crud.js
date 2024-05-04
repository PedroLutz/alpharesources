const handleSubmit = async (route, dados) => {
    if (!route) {
        console.error(`Requisição de submit feita sem uma rota!`);
        return;
    }

    if (!dados) {
        console.error(`Requisição de submit feita sem dados!`);
        return;
    }

    try {
        const response = await fetch(`/api/${route}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        });

        if (response.ok) {
            console.log(`${route} registrado(a) com sucesso!`);
            alert(`${route} registrado(a) com sucesso!`);
            return true;
        } else {
            console.error(`Erro ao registrar ${route}`);
            return false;
        }
    } catch (error) {
        console.error(`Erro ao registrar ${route}`, error);
        return false;
    }
};



const handleDelete = async (route, item, fetchDados) => {
    if (!route) {
        console.error(`Requisição de submit feita sem uma rota!`);
        return;
    }

    if (!item) {
        console.error(`Requisição de submit feita sem um item!`);
        return;
    }

    try {
        const response = await fetch(`/api/${route}/delete?id=${item._id}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        console.log(data.message);

        if (fetchDados) {
            fetchDados();
        }

        return true;
    } catch (error) {
        console.error(`Erro ao excluir ${route}`, error);
        return false;
    }
};



const fetchData = async (route) => {
    if (!route) {
        console.error(`Requisição de fetch feita sem rota!`);
        return;
    }

    try {
        const response = await fetch(`/api/${route}/get`, {
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



const handleUpdate = async (item, route, dados, fetchDados) => {
    if (!item) {
        console.error(`Requisição de update feita sem um item!`);
        return;
    }

    if (!route) {
        console.error(`Requisição de update feita sem uma rota!`);
        return;
    }

    if (!dados) {
        console.error(`Requisição de update feita sem dados!`);
        return;
    }

    try {
        const response = await fetch(`/api/${route}/update?id=${String(item._id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dados }),
        });

        if (response.status === 200) {
            console.log(`${route} atualizado com sucesso!`);
            if (fetchDados) fetchDados();
        } else {
            console.error(`Erro ao atualizar ${route}`);
        }
    } catch (error) {
        console.error(`Erro ao atualizar ${route}, error`);
    }
    return null;
};

export { handleSubmit, handleDelete, fetchData, handleUpdate };