import api from "../api";

export const getUsers = async () => (await api.get("/users")).data;
