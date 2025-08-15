const getIsEditor = async (userId, token) => {
    try {
        const res = await fetch('/api/profiles/get/byId', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ user_id: userId })
        });
        if (!res.ok) throw new Error('erro ao buscar perfil');
        const data = await res.json();
        return data.is_editor;
    } catch (err) {
        console.error(err); 
        return false;
    }
}

export { getIsEditor };