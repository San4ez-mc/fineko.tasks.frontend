import api from "../../../services/api";

export const getCompany = async () => (await api.get("/company")).data;
export const updateCompany = async (data) => (await api.patch("/company", data)).data;
export const getEmployees = async () => (await api.get("/employees")).data;
export const createEmployee = async (data) => (await api.post("/employees", data)).data;

const companyApi = { getCompany, updateCompany, getEmployees, createEmployee };

export default companyApi;
