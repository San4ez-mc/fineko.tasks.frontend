import api from "../api";

export const getOrgTree = () => api.get("/org/tree").then(r => r.data);
export const getOrgPositions = () => api.get("/org/flat", { params: { view: "positions" } }).then(r => r.data);
export const createPosition = (data) => api.post("/org/position", data).then(r => r.data);
export const createDepartment = (data) => api.post("/org/department", data).then(r => r.data);
export const updatePosition = (id, patch) => api.patch(`/org/position/${id}`, patch).then(r => r.data);
export const getFlat = (params = {}) => api.get("/org/flat", { params }).then(r => r.data);


const orgApi = { createPosition, createDepartment, updatePosition, getFlat };

export default orgApi;

