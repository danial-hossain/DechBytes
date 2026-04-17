const BASE = "http://localhost:5001/api/dashboard";

export const getStats = () =>
  fetch(BASE, { credentials: "include" }).then(res => res.json());

export const getUsers = () =>
  fetch(`${BASE}/users`, { credentials: "include" }).then(res => res.json());

export const getProducts = () =>
  fetch(`${BASE}/products`, { credentials: "include" }).then(res => res.json());

export const getOrders = () =>
  fetch(`${BASE}/orders`, { credentials: "include" }).then(res => res.json());

export const getReports = () =>
  fetch(`${BASE}/reports`, { credentials: "include" }).then(res => res.json());

export const getHelps = () =>
  fetch(`${BASE}/helps`, { credentials: "include" }).then(res => res.json());

export const getDiscounts = () =>
  fetch(`${BASE}/discounts`, { credentials: "include" }).then(res => res.json());