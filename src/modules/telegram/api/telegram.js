import api from "../../../services/api";

export const linkGroupByCode = async ({ inviteCode, companyId }) => {
    const r = await api.post("/telegram/link/by-code", {
        invite_code: inviteCode,
        company_id: Number(companyId),
    });
    return r.data;
};

export const fetchPendingGroups = async (companyId) => {
    const r = await api.get(`/telegram/pending?company_id=${companyId}`);
    return r.data || [];
};

export const fetchGroups = async (companyId) => {
    const r = await api.get(`/telegram/groups?company_id=${companyId}`);
    return r.data || [];
};

export const fetchUsers = async (companyId) => {
    const r = await api.get(`/telegram/users?company_id=${companyId}`);
    const items = r.data?.items || r.data || [];
    return items;
};

export const updateUser = async (id, payload) => {
    const r = await api.put(`/telegram/users/${id}`, payload);
    return r.data;
};

export const refreshGroupAdmins = async (id) => {
    const r = await api.post(`/telegram/groups/${id}/refresh-admins`);
    return r.data;
};
