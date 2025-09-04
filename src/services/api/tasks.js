import api from "../api";

export const createTask = async (data) =>
    (await api.post("/tasks", data)).data;

export const getTaskTemplates = async () =>
    (await api.get("/tasks/templates")).data;

