import { User, RefreshCw, CalendarDays } from "lucide-react";

export default function Header({ user, loading, onRefresh, onAuth }) {
  return (
    <>
    </>
    // <header className="border-b border-gray-200 bg-white px-6 py-4">
    //   <div className="flex items-center justify-between">
    //     <div>
    //       <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
    //       <p className="mt-1 text-sm text-gray-500">Track and manage your calendar events</p>
    //     </div>
    //     <div className="flex items-center space-x-4">
    //       {user ? (
    //         <button
    //           onClick={onRefresh}
    //           disabled={loading}
    //           className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    //         >
    //           <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
    //           Refresh
    //         </button>
    //       ) : (
    //         <button
    //           onClick={onAuth}
    //           disabled={loading}
    //           className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    //         >
    //           <User size={16} className="mr-2" />
    //           {loading ? "Connecting..." : "Sign in with Google"}
    //         </button>
    //       )}
    //     </div>
    //   </div>
    // </header>
  );
}