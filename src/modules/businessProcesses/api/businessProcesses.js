import api from "../../../services/api";

// необов'язково: тут можна тримати окремі функції, але сторінка вже б'є напряму.
export const getProcess = (id) => api.get(`/business-processes/${id}`);
export const createProcess = (payload) => api.post(`/business-processes`, payload);
export const updateProcess = (id, payload) => api.patch(`/business-processes/${id}`, payload);

export const getPositions = () => api.get(`/positions`);
export const createPosition = (title) => api.post(`/positions`, { title });

export const getUsers = () => api.get(`/users?active=1`);

export const getNodeComments = (pid, nodeId) => api.get(`/business-processes/${pid}/nodes/${nodeId}/comments`);
export const addNodeComment = (pid, nodeId, text, parent_id=null) =>
  api.post(`/business-processes/${pid}/nodes/${nodeId}/comments`, { text, parent_id });

export const createTaskFromNode = (title, assignee_id, process_id, node_id, description="") =>
  api.post(`/tasks`, { title, assignee_id, source: "process", process_id, node_id, description });
