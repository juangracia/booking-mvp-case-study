interface AlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div className={`p-4 rounded-md border ${styles[type]}`}>
      {message}
    </div>
  );
}
