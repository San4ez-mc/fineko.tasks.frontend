import api from "../api";

export const createPosition = (data) => api.post("/org/position", data).then(r => r.data);
export const createDepartment = (data) => api.post("/org/department", data).then(r => r.data);
export const updatePosition = (id, patch) => api.patch(`/org/position/${id}`, patch).then(r => r.data);

export default { createPosition, createDepartment, updatePosition };
