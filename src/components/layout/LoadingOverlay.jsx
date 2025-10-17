export default function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
          <span className="text-gray-700">{message}</span>
        </div>
      </div>
    </div>
  );
}