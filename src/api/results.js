import client from './client';

export const getResults = async (params = {}) => {
    const res = await client.get('/results', { params });
    return res.data;
};

export const getResult = async (id) => {
    const res = await client.get(`/results/${id}`);
    return res.data;
};

export const createResult = async (data) => {
    const res = await client.post('/results', data);
    return res.data;
};

export const updateResult = async (id, data) => {
    const res = await client.patch(`/results/${id}`, data);
    return res.data;
};

export const deleteResult = async (id) => {
    const res = await client.delete(`/results/${id}`);
    return res.data;
};

export const toggleResultComplete = async (id, isCompleted) => {
    const res = await client.post(`/results/${id}/complete`, { is_completed: isCompleted });
    return res.data;
};
