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


export const fetchUsers = async (companyId, params = {}) => {
    const searchParams = new URLSearchParams();
    if (companyId) searchParams.append("company_id", companyId);
    if (params.q) searchParams.append("q", params.q);
    if (params.group_id) searchParams.append("group_id", params.group_id);
    const r = await api.get(`/telegram/users?${searchParams.toString()}`);

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

export const updateGroupMembers = async (groupId, payload) => {
    const r = await api.put(`/telegram/groups/${groupId}/members`, payload);
    return r.data;
};
