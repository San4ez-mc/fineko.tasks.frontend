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

export const toggleResultComplete = async (id, isCompleted) =>
    (await api.patch(`/results/${id}`, { is_completed: isCompleted })).data;

export const getResultTasks = async (id) =>
    (await api.get(`/results/${id}/tasks`)).data;

export const replyToComment = async (resultId, commentId, text) =>
    (await api.post(`/results/${resultId}/comments/${commentId}/reply`, { text })).data;
