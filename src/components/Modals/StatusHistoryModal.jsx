import React from "react";
import { formatDate } from "../../utils/formatDate";
import { formatStatusForDisplay } from "../../utils/formatStatus";

export default function StatusHistoryModal({
    show,
    toggle,
    statusHistory,
    skippedStatusesByHistory,
    hoverIndex,
    handleRowMouseEnter,
    handleRowMouseLeave,
    currentSkippedStatuses,
    skippedStatusPosition
}) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="status-history-modal bg-white p-6 rounded-lg shadow-lg w-[600px] max-w-[90vw] max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium text-teal">Status History</h3>
                    <button
                        onClick={toggle}
                        className="p-1 rounded-full hover:bg-gray-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Changed From</th>
                                <th className="px-4 py-2 text-left">Changed To</th>
                                <th className="px-4 py-2 text-left">Changed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statusHistory.map((record, index) => (
                                <tr
                                    key={index}
                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${skippedStatusesByHistory[index] ? 'cursor-pointer' : ''}`}
                                    onMouseEnter={(e) => handleRowMouseEnter(index, e)}
                                    onMouseLeave={handleRowMouseLeave}
                                >
                                    <td className="px-4 py-2">
                                        {record.change_date === "N/A"
                                            ? 'N/A'
                                            : record.changed_at
                                                ? formatDate(record.changed_at)
                                                : 'N/A'}
                                    </td>
                                    <td className="px-4 py-2">{record.previous_status ? formatStatusForDisplay(record.previous_status) : 'Initial Status'}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center">
                                            {formatStatusForDisplay(record.new_status)}
                                            {skippedStatusesByHistory[index] && (
                                                <span className="ml-2 text-amber-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">{record.user_name || record.changed_by}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {hoverIndex !== null && currentSkippedStatuses.length > 0 && (
                <div
                    className="fixed bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-60"
                    style={{
                        left: `${skippedStatusPosition.left}px`,
                        maxWidth: '300px'
                    }}
                >
                    <div className="font-medium text-amber-600 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Skipped Statuses
                    </div>
                    <ul className="list-disc pl-5 text-gray-700">
                        {currentSkippedStatuses.map((status, i) => (
                            <li key={i} className="py-1">{formatStatusForDisplay(status)}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
