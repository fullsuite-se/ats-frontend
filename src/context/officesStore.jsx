import { create } from 'zustand';
import { officeService } from '../services/officeService';

const officesStore = create((set, get) => ({
    offices: [],
    loading: false,
    error: null,

    // Set offices directly
    setOffices: (offices) => set({ offices }),

    // Fetch all offices for current company
    fetchOffices: async () => {
        set({ loading: true, error: null });
        try {
            const response = await officeService.getCurrentCompanyOffices(); // Use new method
            if (response.success) {
                set({ offices: response.data, loading: false });
            } else {
                set({ error: response.message, loading: false });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Add new office
    addOffice: async (officeData) => {
        try {
            const response = await officeService.createOffice(officeData);
            if (response.success) {
                const newOffice = response.data;
                set((state) => ({ 
                    offices: [...state.offices, newOffice],
                    error: null 
                }));
                return { success: true, data: newOffice };
            } else {
                set({ error: response.message });
                return { success: false, error: response.message };
            }
        } catch (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Update office
    updateOffice: async (officeId, officeData) => {
        try {
            const response = await officeService.updateOffice(officeId, officeData);
            if (response.success) {
                set((state) => ({
                    offices: state.offices.map(office =>
                        office.officeId === officeId 
                            ? { ...office, ...response.data } // Use response data which includes updated timestamps
                            : office
                    ),
                    error: null
                }));
                return { success: true, data: response.data };
            } else {
                set({ error: response.message });
                return { success: false, error: response.message };
            }
        } catch (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Delete office
    deleteOffice: async (officeId) => {
        try {
            const response = await officeService.deleteOffice(officeId);
            if (response.success) {
                set((state) => ({
                    offices: state.offices.filter(office => office.officeId !== officeId),
                    error: null
                }));
                return { success: true };
            } else {
                set({ error: response.message });
                return { success: false, error: response.message };
            }
        } catch (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default officesStore;