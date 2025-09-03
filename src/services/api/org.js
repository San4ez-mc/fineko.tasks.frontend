import api from "../api";

export const getDivisions = () => api.get("/org/divisions").then(r => r.data);
export const seed7Divisions = () => api.post("/org/seed-7div").then(r => r.data);
export const getTree = () => api.get("/org/tree").then(r => r.data);

export const createPosition = (data) => api.post("/org/position", data).then(r => r.data);
export const createDepartment = (data) => api.post("/org/department", data).then(r => r.data);
export const updatePosition = (id, patch) => api.patch(`/org/position/${id}`, patch).then(r => r.data);

export default { getDivisions, seed7Divisions, getTree, createPosition, createDepartment, updatePosition };
