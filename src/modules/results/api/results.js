import api from "../../../services/api";

export const getResults = async (params = {}) =>
    (await api.get("/results", { params })).data;

export const getResult = async (id) =>
    (await api.get(`/results/${id}`)).data;

export const createResult = async (data) =>
    (await api.post("/results", data)).data;

export const createSubresult = async (parentId, data) =>
    (await api.post(`/results/${parentId}/children`, data)).data;

export const updateResult = async (id, data) =>
    (await api.patch(`/results/${id}`, data)).data;

export const deleteResult = async (id) =>
    (await api.delete(`/results/${id}`)).data;

export const toggleResultComplete = async (id, done) =>
    (await api.patch(`/results/${id}`, { done })).data;
