const handleReq = async (o) => {
  if (!o.table) throw new Error('Request done without a table!');
  if (!o.route) throw new Error('Request done without a route!');
  
  const routeToMethod = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'get': 'GET',
  };
  
  const method = routeToMethod[o.route];
  if (!method) throw new Error(`Invalid route: ${o.route}`);

  let url = `/api/${o.table}/${o.route}`;
  let options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (method === 'GET') {
    if (o.data && Object.keys(o.data).length > 0) {
      const params = new URLSearchParams(o.data).toString();
      url += `?${params}`;
    }
  } else {
    if (!o.data) throw new Error('Request done without data!');
    options.body = JSON.stringify(o.data);
  }

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
