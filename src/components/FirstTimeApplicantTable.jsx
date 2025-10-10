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
        if (onSelectApplicant) {
            onSelectApplicant(row);
            return;
        }

        const applicantId = row.applicant_id || row.id;
        navigate(`/applicants/${applicantId}`);
    };

    const columns = [
        { name: 'Name', selector: row => <NameCell row={row} /> },
        { name: 'Email', selector: row => row.email_1 },
        { name: 'Position', selector: row => row.position_applied || row.position },
        { name: 'Status', selector: row => <StatusBadge status={row.status} /> },
        { name: 'Applied Date', selector: row => moment(row.application_date || row.applied_date).format("LLL") },
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
                />
            )}
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

const StatusBadge = ({ status }) => {
    let color = "bg-gray-light text-gray-800"

    if (status.includes("PASSED") || status.includes("ACCEPTED") || status === "COMPLETED") {
        color = "bg-teal-light text-white"
    } else if (status.includes("FAILED") || status.includes("REJECTED")) {
        color = "bg-gray-light text-gray-dark"
    } else if (status.includes("INTERVIEW") || status.includes("SENT") || status === "SUBMITTED") {
        color = "bg-teal-soft text-teal"
    } else if (status.includes("PENDING")) {
        color = "bg-orange-100 text-gray-dark"
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full body-tiny ${color}`}>
            {status.replace(/_/g, " ")}
        </span>
    )
}

const NameCell = ({ row }) => {
    const fullName = `${row.first_name} ${row.middle_name ? row.middle_name + ' ' : ''}${row.last_name}`;
    return (
        <span className="text-gray-dark body-regular">{fullName}</span>
    );
}

export default FirstTimeApplicantTable;