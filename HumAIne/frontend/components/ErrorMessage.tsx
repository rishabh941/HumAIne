import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm text-red-500 mt-1">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;