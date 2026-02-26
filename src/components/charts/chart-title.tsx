'use client';

import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChartTitleProps {
  title: string;
  tooltip?: string;
}

export function ChartTitle({ title, tooltip }: ChartTitleProps) {
  if (!title) return null;
  return (
    <div className="flex items-center gap-1 mb-3">
      <h3 className="text-sm font-semibold text-dmi-text">{title}</h3>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="w-3.5 h-3.5 text-dmi-text/40 cursor-help shrink-0" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
