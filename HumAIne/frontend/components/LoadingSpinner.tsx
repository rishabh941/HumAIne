const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="mt-4 text-center text-gray-600">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;