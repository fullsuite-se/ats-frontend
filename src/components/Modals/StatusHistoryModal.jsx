import React from "react";
import { formatDate } from "../../utils/formatDate";
import { formatStatusForDisplay } from "../../utils/formatStatus";
import { FaTimes } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { PiWarningFill } from "react-icons/pi";
import { MdEdit } from "react-icons/md";

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
            <div className="status-history-modal bg-white p-6 rounded-lg shadow-lg min-w-[2vw] max-w-[90vw] max-h-[60vh] flex flex-col ">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium text-teal">Status History</h3>
                    <button
                        onClick={toggle}
                        className="p-1 rounded-full hover:bg-gray-200 cursor-pointer items-center flex justify-center"
                    >
                        <FaTimes className="text-gray-600" size={20} />
                    </button>
                </div>

                <div className="relative overflow-y-auto p-2">
                    {statusHistory.map((record, index) => (
                        <div
                            key={index}
                            className="mb-3 relative group"
                            onMouseEnter={(e) => handleRowMouseEnter(index, e)}
                            onMouseLeave={handleRowMouseLeave}
                        >
                            <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                                <div className="text-sm text-gray-500 mb-1 flex items-center justify-between">
                                    <div className="flex items-center">
                                        {record.change_date === "N/A"
                                            ? "N/A"
                                            : record.changed_at
                                                ? formatDate(record.changed_at)
                                                : "N/A"}

                                        {skippedStatusesByHistory[index] && (
                                            <span className="ml-1  text-amber-500 flex items-center">
                                                <PiWarningFill className="inline-block mr-1 size-4" />
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => console.log("Delete clicked")}
                                        className="p-1 rounded-full hover:bg-gray-200 cursor-pointer items-center flex justify-center"
                                    >
                                        <MdEdit className="text-gray-600" size={15} />
                                    </button>
                                </div>
                                <div className="flex text-sm">
                                    <span className="font-semibold text-gray-700">
                                        {record.previous_status
                                            ? formatStatusForDisplay(record.previous_status)
                                            : "Initial Status"}
                                    </span>
                                    <FaArrowRight className="mx-2 mt-1 items-center text-gray-400" />
                                    <span className="font-semibold text-gray-700 flex items-center">
                                        {formatStatusForDisplay(record.new_status)}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                                    <div>Changed by: <span className=" text-gray-700">{record.user_name || record.changed_by}</span></div>
                                    <div className="">(edited)</div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {
                hoverIndex !== null && currentSkippedStatuses.length > 0 && (
                    <div
                        className="fixed bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-60"
                        style={{
                            left: `${skippedStatusPosition.left}px`,
                            maxWidth: "300px"
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
                )
            }
        </div >
    );
}
