const handleReq = async (o) => {
  if (!o.table) throw new Error('Request done without a table!');
  if (!o.route) throw new Error('Request done without a route!');
  
  const routeToMethod = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
  };
  
  const method = routeToMethod[o.route];
  if (!method) throw new Error(`Invalid route: ${o.route}`);

  let url = `/api/${o.table}/${o.route}`;
  let options = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${o.token}` },
  };

    if (!o.data) throw new Error('Request done without data!');
    options.body = JSON.stringify(o.data);

  try {
    const response = await fetch(url, options);
    const json = await response.json();

    if (!response.ok) {
      return { success: false, error: json.error || 'Unknown error' };
    }

    if (o.fetchData) await o.fetchData();

    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err.message || 'Request error' };
  }
};

const handleFetch = async (o) => {
  if (!o.table) throw new Error('Request done without a table!');

  let url = `/api/${o.table}/get/${o.query}`;
  let options = {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${o.token}` },
  };

  try {
    const response = await fetch(url, options);
    const json = await response.json();

    if (!response.ok) {
      return { success: false, error: json.error || 'Unknown error' };
    }

    if (o.fetchData) await o.fetchData();

    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err.message || 'Request error' };
  }
}

export {handleReq, handleFetch};