import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import officesStore from "../../context/officesStore";

const AddOfficeModal = ({ onClose, office }) => {
    const { addOffice, updateOffice } = officesStore();
    const [officeData, setOfficeData] = useState({
        officeName: "",
        officeAddress: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (office) {
            setOfficeData({
                officeName: office.officeName || "",
                officeAddress: office.officeAddress || ""
            });
        }
    }, [office]);

    const handleChange = (e) => {
        setOfficeData({ ...officeData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (office) {
                await updateOffice(office.officeId, officeData);
            } else {
                await addOffice(officeData);
            }
            onClose();
        } catch (error) {
            console.error("Error saving office:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="rounded-3xl bg-white mx-10 p-6 body-regular border border-gray-light w-[400px]">
                {/* Header */}
                <div className="flex items-center justify-between pb-1 border-b-2 border-gray-light">
                    <h1 className="headline font-semibold text-gray-dark">
                        {office ? "Edit Office" : "Add New Office"}
                    </h1>
                    <button
                        onClick={onClose}
                        className="rounded-md bg-white text-teal hover:text-teal/50 cursor-pointer"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Office Name */}
                    <div>
                        <label className="block text-gray-700">Office Name</label>
                        <input
                            type="text"
                            name="officeName"
                            value={officeData.officeName}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter office name"
                            maxLength={50}
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500 text-right">
                            {officeData.officeName.length}/50
                        </p>
                    </div>

                    {/* Office Address */}
                    <div>
                        <label className="block text-gray-700">Office Address</label>
                        <textarea
                            name="officeAddress"
                            value={officeData.officeAddress}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter office address"
                            maxLength={255}
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500 text-right">
                            {officeData.officeAddress.length}/255
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-teal text-teal rounded-md hover:bg-teal-soft cursor-pointer"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-teal text-white rounded-md hover:bg-teal/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    {office ? 'Updating...' : 'Creating...'}
                                </div>
                            ) : (
                                office ? 'Update' : 'Save'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddOfficeModal;