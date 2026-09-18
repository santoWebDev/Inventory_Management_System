import api from "./axios";

export const stockIn = async (data) => {
  const response = await api.post("/inventory/stock-in", data);

  return response.data;
};

export const stockOut = async (data) => {
  const response = await api.post("/inventory/stock-out", data);

  return response.data;
};

export const stockAdjustment = async (data) => {
  const response = await api.post("/inventory/adjustment", data);

  return response.data;
};

export const getInventoryHistory = async (productId, params = {}) => {
  const response = await api.get(`/inventory/${productId}/history`, { params });

  return response.data;
};
