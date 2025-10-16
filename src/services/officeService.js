import api from "./api";

export const officeService = {
    getAllOffices: async () => {
        try {
            const response = await api.get('/offices');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getCurrentCompanyOffices: async () => { // Add this method
        try {
            const response = await api.get('/offices/current-company');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getOfficeById: async (officeId) => {
        try {
            const response = await api.get(`/offices/${officeId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getOfficesByCompanyId: async (companyId) => {
        try {
            const response = await api.get(`/offices/company/${companyId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createOffice: async (officeData) => {
        try {
            const response = await api.post('/offices', officeData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateOffice: async (officeId, officeData) => {
        try {
            const response = await api.put(`/offices/${officeId}`, officeData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteOffice: async (officeId) => {
        try {
            const response = await api.delete(`/offices/${officeId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    searchOffices: async (searchQuery) => {
        try {
            const response = await api.get(`/offices/search?search=${encodeURIComponent(searchQuery)}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};