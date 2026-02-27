import { Card } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface KPICardProps {
  label: string;
  value: string;
  color?: string;
  tooltip?: string;
}

export function KPICard({ label, value, color = '#1d3b64', tooltip }: KPICardProps) {
  return (
    <Card className="p-4 bg-white">
      <div className="flex items-center gap-1 mb-1">
        <p className="text-xs text-dmi-text/60">{label}</p>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3 h-3 text-dmi-text/40 cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px]">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </Card>
  );
}
