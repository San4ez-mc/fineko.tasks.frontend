import api from "../../../services/api";

export const linkByCode = async (code) =>
    (await api.post("/telegram/link/by-code", { code })).data;

export const getPending = async () =>
    (await api.get("/telegram/pending")).data;

export const getGroups = async () =>
    (await api.get("/telegram/groups")).data;

export const getUsers = async () =>
    (await api.get("/telegram/users")).data;
