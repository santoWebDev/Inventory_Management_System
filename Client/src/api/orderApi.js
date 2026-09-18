import api from "./axios";

export const createOrder = async (data) => {
  const response = await api.post("/orders", data);

  return response.data;
};

export const getOrders = async (params = {}) => {
  const response = await api.get("/orders", { params });

  return response.data;
};

export const getMyOrders = async (params = {}) => {
  const response = await api.get("/orders/my-orders", { params });

  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);

  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });

  return response.data;
};

export const cancelOrder = async (id, cancelReason) => {
  const response = await api.post(`/orders/${id}/cancel`, {
    reason: cancelReason,
  });

  return response.data;
};
