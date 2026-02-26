import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  color: string;
  textColor?: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, color, textColor = '#ffffff', description, children }: PageHeaderProps) {
  return (
    <div
      className={cn('px-6 py-4 rounded-xl mb-6 flex items-center justify-between')}
      style={{ backgroundColor: color, color: textColor }}
    >
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm opacity-80 mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
