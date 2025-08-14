import api from "../../../services/api";

const BASE = "/templates";

export const listTemplates = async () => {
  const r = await api.get(BASE);
  return r.data || [];
};

export const createTemplate = async (payload) => {
  const r = await api.post(BASE, payload);
  return r.data;
};

export const updateTemplate = async (id, payload) => {
  const r = await api.put(`${BASE}/${id}`, payload);
  return r.data;
};

export const deleteTemplate = async (id) => {
  const r = await api.delete(`${BASE}/${id}`);
  return r.data;
};

