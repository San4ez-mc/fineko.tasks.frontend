import api from "../api";

export const getTree = () => api.get("/org/tree").then(r => r.data);
export const getFlat = () => api.get("/org/positions").then(r => r.data);

export const createPosition = (data) => api.post("/org/position", data).then(r => r.data);
export const createDepartment = (data) => api.post("/org/department", data).then(r => r.data);
export const updatePosition = (id, patch) => api.patch(`/org/position/${id}`, patch).then(r => r.data);
export const updateUnit = (id, patch) => api.patch(`/org/unit/${id}`, patch).then(r => r.data);
export const moveEntity = (data) => api.patch("/org/move", data).then(r => r.data);
export const deleteEntity = (entity, id) => api.delete(`/org/${entity}/${id}`).then(r => r.data);
export const replaceUser = (id, data) => api.patch(`/org/position/${id}/replaceUser`, data).then(r => r.data);

export default {
  getTree,
  getFlat,
  createPosition,
  createDepartment,
  updatePosition,
  updateUnit,
  moveEntity,
  deleteEntity,
  replaceUser,
};
