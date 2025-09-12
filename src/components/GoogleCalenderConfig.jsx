// src/components/GoogleCalendarConfig.jsx
import React from "react";

export default function GoogleCalendarConfig() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Google Calendar Configuration</h2>
      <p className="text-gray-600 mb-4">
        Connect your Google Calendar to enable <strong>Interview Scheduling</strong>. 
        Once connected, applicants will be able to book interviews based on your 
        availability and events will be added directly to your calendar.
      </p>

      <ol className="list-decimal list-inside text-sm text-gray-700 mb-6 space-y-2">
        <li>Click <strong>Connect Google Calendar</strong> below.</li>
        <li>You’ll be redirected to Google’s sign-in & consent screen.</li>
        <li>Grant access to read your availability and create events.</li>
        <li>You’ll be redirected back here once setup is complete.</li>
      </ol>

      <div className="text-sm text-gray-500 mb-6">
        <p>
          <strong>Note:</strong> We only request access to:
        </p>
        <ul className="list-disc list-inside mt-1">
          <li>View your free/busy schedule</li>
          <li>Create interview events on your behalf</li>
        </ul>
        Your email contents and other personal data will not be accessed.
      </div>

      <button
        onClick={() => {
          // Redirect to your backend endpoint that starts OAuth flow
          window.location.href = `${import.meta.env.VITE_API_BASE_URL}/calendar`;
        }}
        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
      >
        Connect Google Calendar
      </button>
    </div>
  );
}
