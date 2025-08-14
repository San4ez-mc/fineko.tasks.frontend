import api from "../../../services/api";

export const getInstructions = async () => (await api.get("/instructions")).data;
