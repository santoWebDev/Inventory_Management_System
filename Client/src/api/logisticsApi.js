import api from "./axios";

export const getLogistics = async (params = {}) => {
  const response = await api.get("/logistics", { params });
  return response.data;
};

export const getLogisticsById = async (id) => {
  const response = await api.get(`/logistics/${id}`);
  return response.data;
};

export const createLogistics = async (data) => {
  const response = await api.post("/logistics", data);
  return response.data;
};

export const updateLogistics = async (id, data) => {
  const response = await api.put(`/logistics/${id}`, data);
  return response.data;
};
