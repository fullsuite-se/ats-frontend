import DataTable from 'react-data-table-component';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const FirstTimeApplicantTable = ({ applicants, onSelectApplicant }) => {
    const [firstTimeApplicants, setFirstTimeApplicants] = useState(applicants || []);
    const navigate = useNavigate();

    useEffect(() => {
        setFirstTimeApplicants(applicants || []);
    }, [applicants]);

    const handleJobRowClick = (row) => {
        console.log('First-time job seeker clicked:', row);
        
        if (onSelectApplicant) {
            onSelectApplicant(row);
            return;
        }

        const applicantId = row.applicant_id || row.id;
        console.log('Navigating to applicant ID:', applicantId);
        
        if (applicantId) {
            navigate(`/applicants/${applicantId}`);
        } else {
            console.error('No valid applicant ID found');
        }
    };

    // Fixed columns using selector instead of cell for better compatibility
    const columns = [
        { 
            name: 'Name', 
            selector: row => `${row.first_name} ${row.last_name}`,
            cell: row => <NameCell row={row} />,
            sortable: true,
        },
        { 
            name: 'Email', 
            selector: row => row.email_1 || 'No email',
            cell: row => row.email_1 || 'No email',
            sortable: true,
        },
        { 
            name: 'Position', 
            selector: row => row.position_applied || row.position,
            cell: row => row.position_applied || row.position,
            sortable: true,
        },
        { 
            name: 'Status', 
            selector: row => row.status,
            cell: row => <StatusBadge status={row.status} />,
            sortable: true,
        },
        { 
            name: 'Applied Date', 
            selector: row => row.application_date || row.applied_date,
            cell: row => moment(row.application_date || row.applied_date).format("LLL"),
            sortable: true,
        },
    ];

    return (
        <>
            {firstTimeApplicants.length === 0 ? (
                <div className="text-center text-lg font-semibold text-gray-600 mt-8">
                    No first-time job seekers found.
                </div>
            ) : (
                <DataTable
                    pointerOnHover
                    highlightOnHover
                    fixedHeader
                    fixedHeaderScrollHeight="45vh"
                    responsive
                    columns={columns}
                    data={firstTimeApplicants}
                    progressPending={!firstTimeApplicants.length}
                    onRowClicked={handleJobRowClick}
                    progressComponent={<LoadingComponent />}
                    customStyles={dataTableStyles}
                    // Additional props to ensure clickability
                    noDataComponent={<div className="p-4 text-center">No data available</div>}
                />
            )}
        </>
    );
};

// Enhanced custom styles to ensure better click handling
const dataTableStyles = {
    rows: {
        style: {
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#f8fafc',
            },
            '&:not(:last-of-type)': {
                borderBottom: '1px solid #e2e8f0',
            },
        },
    },
    headCells: {
        style: {
            backgroundColor: '#f1f5f9',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#334155',
        },
    },
    cells: {
        style: {
            padding: '12px 8px',
            '&:first-of-type': {
                paddingLeft: '16px',
            },
            '&:last-of-type': {
                paddingRight: '16px',
            },
        },
    },
};

function LoadingComponent() {
    return (
        <div className="flex flex-col w-full space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-sm bg-gray-200"></div>
            ))}
        </div>
    );
}

const StatusBadge = ({ status }) => {
    if (!status) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                Unknown
            </span>
        );
    }

    let color = "bg-gray-100 text-gray-800";
    const statusText = status.replace(/_/g, " ");

    if (status.includes("PASSED") || status.includes("ACCEPTED") || status === "COMPLETED") {
        color = "bg-green-100 text-green-800";
    } else if (status.includes("FAILED") || status.includes("REJECTED")) {
        color = "bg-red-100 text-red-800";
    } else if (status.includes("INTERVIEW") || status.includes("SENT") || status === "SUBMITTED") {
        color = "bg-blue-100 text-blue-800";
    } else if (status.includes("PENDING")) {
        color = "bg-yellow-100 text-yellow-800";
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {statusText}
        </span>
    );
};

const NameCell = ({ row }) => {
    const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim();
    return (
        <span className="text-gray-800 font-medium">
            {fullName || 'Unknown Name'}
        </span>
    );
};

export default FirstTimeApplicantTable;