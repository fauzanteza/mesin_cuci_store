import api from './api';

export const uploadService = {
    uploadImage: async (file: File, type: 'product' | 'avatar' | 'brand' = 'product') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
