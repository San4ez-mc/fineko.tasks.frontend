import api from "../../../services/api";

export const getPendingGroups = async () => (await api.get("/telegram/pending")).data;

export const getCompanyGroups = async (companyId) => (
    await api.get("/telegram/groups", { params: { company_id: companyId } })
).data;

export const searchCompanyUsers = async (companyId, q = "") => (
    await api.get("/telegram/users", { params: { company_id: companyId, q } })
).data;

export default {
    getPendingGroups,
    getCompanyGroups,
    searchCompanyUsers,
};
