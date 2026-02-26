'use client';

import { FileDropZone } from '@/components/upload/file-drop-zone';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-dmi-bg flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dmi-primary mb-2">
            VESDI Dashboard
          </h1>
          <p className="text-dmi-text/60">
            Upload de CBS-bestanden om het gemeentelijk VESDI-dashboard te genereren
          </p>
        </div>

        {/* Upload card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <FileDropZone />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-dmi-text/40 mt-6">
          DMI Ecosysteem &mdash; Visualisatie Stedelijke Distributie &amp; Logistiek
        </p>
      </div>
    </div>
  );
}
