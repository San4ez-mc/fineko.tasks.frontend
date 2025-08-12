import api from "../api";

export const createDailyTask = async (data) =>
    (await api.post("/tasks/daily", data)).data;

export const getTaskTemplates = async () =>
    (await api.get("/tasks/templates")).data;

