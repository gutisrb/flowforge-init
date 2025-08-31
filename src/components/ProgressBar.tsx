interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  if (value === 0) return null;
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div className="h-1 w-full bg-gray-200/50 dark:bg-gray-800/50">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500 ease-out shadow-glow"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}