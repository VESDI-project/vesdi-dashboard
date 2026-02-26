'use client';

import dynamic from 'next/dynamic';
import { DMI_COLORS } from '@/lib/colors';
import { ExternalLink } from 'lucide-react';

const RedocStandalone = dynamic(
  () => import('redoc').then((m) => m.RedocStandalone),
  { ssr: false, loading: () => <RedocSkeleton /> }
);

function RedocSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-dmi-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-dmi-text/50">API-documentatie laden...</p>
      </div>
    </div>
  );
}

export default function ApiPage() {
  return (
    <div className="h-full flex flex-col -m-6">
      {/* Compact header bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ backgroundColor: DMI_COLORS.purple + '08' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-dmi-text">REST API</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-dmi-purple/10 text-dmi-purple font-medium">
            OpenAPI 3.0.3
          </span>
        </div>
        <a
          href="/api/v1/openapi.json"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: DMI_COLORS.purple }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          openapi.json
        </a>
      </div>

      {/* Redoc fills remaining space */}
      <div className="flex-1 min-h-0 overflow-auto">
        <RedocStandalone
          specUrl="/api/v1/openapi.json"
          options={{
            scrollYOffset: 0,
            hideDownloadButton: false,
            expandResponses: '200',
            pathInMiddlePanel: true,
            sortTagsAlphabetically: false,
            theme: {
              colors: {
                primary: { main: DMI_COLORS.purple },
                success: { main: '#4CAF50' },
                warning: { main: DMI_COLORS.orange },
                error: { main: DMI_COLORS.red },
                text: {
                  primary: DMI_COLORS.text,
                  secondary: '#6b7280',
                },
                responses: {
                  success: { color: '#4CAF50', backgroundColor: '#f0fdf4' },
                  error: { color: DMI_COLORS.red, backgroundColor: '#fef2f2' },
                },
                http: {
                  get: '#4CAF50',
                  post: DMI_COLORS.orange,
                  put: DMI_COLORS.primary,
                  delete: DMI_COLORS.red,
                },
              },
              typography: {
                fontSize: '14px',
                fontFamily: 'inherit',
                headings: {
                  fontFamily: 'inherit',
                  fontWeight: '600',
                },
                code: {
                  fontSize: '13px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                },
              },
              sidebar: {
                backgroundColor: '#f9fafb',
                textColor: DMI_COLORS.text,
                activeTextColor: DMI_COLORS.purple,
                width: '260px',
              },
              rightPanel: {
                backgroundColor: '#1e293b',
                textColor: '#e2e8f0',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
