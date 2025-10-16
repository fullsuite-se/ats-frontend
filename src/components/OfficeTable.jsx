import DataTable from 'react-data-table-component';
import { useState, useEffect } from 'react';
import officesStore from '../context/officesStore';
import moment from 'moment';
import AddOfficeModal from './Modals/AddOfficeModal.jsx';

const OfficeTable = ({ onSelectOffice }) => {
    const { offices, setOffices, fetchOffices, loading } = officesStore();
    const [office, setOffice] = useState({});
    const [isEditOfficeModalOpen, setIsEditOfficeModalOpen] = useState(false);
    const [toasts, setToasts] = useState([]);

    // Fetch offices when component mounts
    useEffect(() => {
        fetchOffices();
    }, [fetchOffices]);

    const handleOfficeRowClick = (row) => {
        setOffice(row);
        setIsEditOfficeModalOpen(true);
    };

    const columns = [
        { name: 'Office Name', selector: row => row.officeName, sortable: true },
        { name: 'Office Address', selector: row => row.officeAddress, sortable: true },
        { name: 'Date Created', selector: row => moment(row.createdAt).format('LLL'), sortable: true },
        { name: 'Last Updated', selector: row => moment(row.updatedAt).format('LLL'), sortable: true },
    ];

    return (
        <>
            {offices.length === 0 ? (
                <div className="text-center text-lg font-semibold text-gray-600 mt-8">
                    No offices found.
                </div>
            ) : (
                <DataTable
                    pointerOnHover
                    highlightOnHover
                    fixedHeaderScrollHeight="60vh"
                    responsive
                    columns={columns}
                    data={offices}
                    onRowClicked={handleOfficeRowClick}
                    pagination
                    progressPending={!offices.length}
                    progressComponent={<LoadingComponent />}
                />
            )}

            {
                isEditOfficeModalOpen ? <AddOfficeModal onClose={() => setIsEditOfficeModalOpen(false)} office={office}/> : ""
            }

            {/* <div className="fixed top-4 right-4 space-y-2">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        toast={toast}
                        removeToast={() => setToasts(toasts.filter(t => t.id !== toast.id))}
                    />
                ))}
            </div> */}
        </>
    );
};

function LoadingComponent() {
    return (
        <div className="flex flex-col w-full space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-sm bg-gray-light"></div>
            ))}
        </div>
    );
}

export default OfficeTable;