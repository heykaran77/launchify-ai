import { cn } from '@/lib/utils';

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('max-w-4xl mx-auto container px-4', className)}>
      {children}
    </div>
  );
}
