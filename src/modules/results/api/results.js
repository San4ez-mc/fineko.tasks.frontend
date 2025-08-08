import client from '../../../shared/api/client';

export const getResults = async (params = {}) => (await client.get('/results', { params })).data;
export const getResult = async (id) => (await client.get(`/results/${id}`)).data;
export const createResult = async (data) => (await client.post('/results', data)).data;
export const updateResult = async (id, data) => (await client.patch(`/results/${id}`, data)).data;
export const deleteResult = async (id) => (await client.delete(`/results/${id}`)).data;
export const toggleResultComplete = async (id, isCompleted) =>
    (await client.post(`/results/${id}/complete`, { is_completed: isCompleted })).data;
