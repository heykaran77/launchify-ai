import { cn } from '@/lib/utils';

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('container mx-auto max-w-4xl px-4', className)}>
      {children}
    </div>
  );
}
