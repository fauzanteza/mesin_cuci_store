import api from './api';

export interface Brand {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    country?: string;
    foundedYear?: number;
    isActive: boolean;
    productCount: number;
    createdAt: string;
}

export const brandService = {
    getAllBrands: async (): Promise<Brand[]> => {
        const response = await api.get('/brands');
        return response.data; // Assuming API returns array or { data: array } - adjust if needed
    },

    getBrand: async (id: string): Promise<Brand> => {
        const response = await api.get(`/brands/${id}`);
        return response.data;
    },

    createBrand: async (data: FormData): Promise<Brand> => {
        const response = await api.post('/brands', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateBrand: async (id: string, data: FormData): Promise<Brand> => {
        const response = await api.put(`/brands/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteBrand: async (id: string): Promise<void> => {
        await api.delete(`/brands/${id}`);
    },

    toggleBrandStatus: async (id: string, isActive: boolean): Promise<Brand> => {
        const response = await api.patch(`/brands/${id}/status`, { isActive });
        return response.data;
    },
};
