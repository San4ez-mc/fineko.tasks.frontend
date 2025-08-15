import api from "../api";

export const searchUsers = async (companyId, query) => {
    const params = new URLSearchParams();
    if (companyId) params.append("company_id", companyId);
    if (query) params.append("q", query);
    const { data } = await api.get(`/telegram/users?${params.toString()}`);
    return data;
};

export default { searchUsers };
