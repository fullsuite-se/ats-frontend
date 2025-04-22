import React from "react";
import { formatStatusForDisplay } from "../../utils/formatStatus";

export default function SkipStatusWarningModal({
    skippedStatuses = [],
    onCancel,
    onProceed
}) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-md">
                <div className="flex items-center justify-center mb-4 text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">Warning: Skipping Status Steps</h3>
                <p className="mb-4 text-gray-600">
                    You are about to skip the following status steps:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-600">
                    {skippedStatuses.map((status, index) => (
                        <li key={index}>{formatStatusForDisplay(status)}</li>
                    ))}
                </ul>
                <p className="mb-4 text-gray-600">
                    Are you sure you want to proceed with this status change?
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onProceed}
                        className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                    >
                        Proceed Anyway
                    </button>
                </div>
            </div>
        </div>
    );
}
