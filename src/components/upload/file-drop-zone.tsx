'use client';

import { useCallback, useState } from 'react';
import { Upload, FileCheck, AlertCircle, Loader2, Database, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVesdiStore } from '@/lib/store';
import type { DetectedFile } from '@/lib/types';
import { useRouter } from 'next/navigation';

const STATUS_STYLES = {
  valid: 'bg-dmi-green/10 text-dmi-green border-dmi-green/30',
  warning: 'bg-dmi-gold/10 text-dmi-gold border-dmi-gold/30',
  error: 'bg-dmi-red/10 text-dmi-red border-dmi-red/30',
} as const;

const STATUS_BADGE = {
  valid: 'bg-dmi-green text-white',
  warning: 'bg-dmi-gold text-white',
  error: 'bg-dmi-red text-white',
} as const;

export function FileDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const processFiles = useVesdiStore((s) => s.processFiles);
  const detectedFiles = useVesdiStore((s) => s.detectedFiles);
  const isProcessing = useVesdiStore((s) => s.isProcessing);
  const processingStatus = useVesdiStore((s) => s.processingStatus);
  const municipality = useVesdiStore((s) => s.municipality);
  const years = useVesdiStore((s) => s.years);
  const clear = useVesdiStore((s) => s.clear);
  const hydrated = useVesdiStore((s) => s._hydrated);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await processFiles(files);
      }
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await processFiles(files);
      }
    },
    [processFiles]
  );

  const hasData = years.length > 0;
  const hasNewFiles = detectedFiles.some(
    (f) => f.type === 'ZENDINGEN' || f.type === 'DEELRITTEN'
  );

  // Show loading skeleton while hydrating from IndexedDB
  if (!hydrated) {
    return (
      <div className="space-y-6">
        <div className="border-2 border-dashed rounded-xl p-12 text-center border-dmi-primary/10">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-dmi-primary/30 animate-spin" />
          <p className="text-sm text-dmi-text/40">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Persisted data indicator */}
      {hasData && detectedFiles.length === 0 && (
        <Card className="p-4 border-dmi-primary/20 bg-dmi-primary/5">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-dmi-primary" />
            <div className="flex-1">
              <p className="font-semibold text-dmi-text">
                {municipality?.name || 'Gemeente'} &mdash; {years.join(', ')}
              </p>
              <p className="text-sm text-dmi-text/60">
                Data uit vorige sessie geladen
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-dmi-red hover:text-dmi-red/80 hover:bg-dmi-red/10"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Wissen
            </Button>
          </div>
        </Card>
      )}

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-dmi-orange bg-dmi-orange/5'
            : 'border-dmi-primary/20 hover:border-dmi-primary/40'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          accept=".csv,.xlsx,.xls,.docx,.png,.jpg,.jpeg"
          onChange={handleFileInput}
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-dmi-primary/40" />
        <h3 className="text-lg font-semibold text-dmi-text mb-2">
          {hasData ? 'Extra bestanden toevoegen' : 'Sleep CBS-bestanden hierheen'}
        </h3>
        <p className="text-sm text-dmi-text/60">
          of klik om bestanden te selecteren
        </p>
        <p className="text-xs text-dmi-text/40 mt-2">
          CSV, XLSX, DOCX, PNG/JPG
        </p>
      </div>

      {/* Processing status */}
      {isProcessing && (
        <div className="flex items-center gap-3 p-4 bg-dmi-primary/5 rounded-lg">
          <Loader2 className="w-5 h-5 text-dmi-primary animate-spin" />
          <span className="text-sm text-dmi-text">{processingStatus}</span>
        </div>
      )}

      {/* Detected files list */}
      {detectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-dmi-text">
            Gedetecteerde bestanden
          </h4>
          {detectedFiles.map((df, i) => (
            <FileResultCard key={i} detected={df} />
          ))}
        </div>
      )}

      {/* Municipality and years info */}
      {municipality && detectedFiles.length > 0 && (
        <Card className="p-4 border-dmi-green/30 bg-dmi-green/5">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-dmi-green" />
            <div>
              <p className="font-semibold text-dmi-text">
                Gemeente: {municipality.name} ({municipality.code})
              </p>
              <p className="text-sm text-dmi-text/60">
                Jaren: {years.join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Generate dashboard button */}
      {(hasData || hasNewFiles) && !isProcessing && (
        <div className="space-y-2">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full h-12 text-lg bg-dmi-orange hover:bg-dmi-orange/90 text-white"
          >
            Dashboard genereren
          </Button>
          {hasData && detectedFiles.length > 0 && (
            <Button
              variant="outline"
              onClick={clear}
              className="w-full text-dmi-red border-dmi-red/30 hover:bg-dmi-red/5"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Alle data wissen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function FileResultCard({ detected }: { detected: DetectedFile }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${STATUS_STYLES[detected.status]}`}
    >
      {detected.status === 'error' ? (
        <AlertCircle className="w-4 h-4 shrink-0" />
      ) : (
        <FileCheck className="w-4 h-4 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{detected.file.name}</p>
        <p className="text-xs opacity-70">{detected.message}</p>
      </div>
      <Badge className={`shrink-0 text-xs ${STATUS_BADGE[detected.status]}`}>
        {detected.type.replace(/_/g, ' ')}
      </Badge>
    </div>
  );
}
