import api from "./axios";

export const getSalesReport = async (params = {}) => {
  const response = await api.get("/reports/sales", { params });

  return response.data;
};

export const getInventoryReport = async (params = {}) => {
  const response = await api.get("/reports/inventory", { params });

  return response.data;
};
