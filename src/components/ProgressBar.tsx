import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  if (value === 0) return null;
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <Progress value={value} className="h-1 rounded-none" />
    </div>
  );
}