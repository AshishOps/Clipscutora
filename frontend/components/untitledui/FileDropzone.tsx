"use client";

import React, { useRef, useState } from "react";
import { UploadCloud01 } from "@untitledui/icons";
import { cn } from "@/lib/utils";

export interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  uploadPct?: number | null;
  className?: string;
  accept?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  uploading = false,
  uploadPct = null,
  className,
  accept = "video/mp4,video/quicktime,video/webm,video/x-matroska,.mkv",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
      }}
      onClick={() => !uploading && fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !uploading) {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      className={cn(
        "p-8 border border-dashed text-center cursor-pointer transition-colors duration-150 select-none",
        isDragOver
          ? "border-[var(--color-accent)] bg-[var(--color-paper-3)]"
          : "border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)]",
        uploading && "opacity-75 cursor-wait",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />
      <div className="inline-flex items-center justify-center w-10 h-10 border border-[var(--color-rule-2)] bg-[var(--color-paper-2)] text-[var(--color-accent)] mb-3">
        <UploadCloud01 className="w-5 h-5 stroke-[1.75]" />
      </div>
      <p className="text-sm font-medium text-[var(--color-ink)]">
        Choose a video file or drop it here
      </p>
      <p className="text-xs text-[var(--color-muted)] mt-1">
        MP4, MOV, MKV, or WebM up to 4 GB
      </p>
      {uploading && uploadPct !== null && (
        <div className="mt-4 max-w-xs mx-auto space-y-1.5">
          <div className="flex justify-between text-xs text-[var(--color-ink-2)]">
            <span>Uploading video…</span>
            <span className="num">{uploadPct}%</span>
          </div>
          <div className="h-[2px] w-full bg-[var(--color-rule-2)]">
            <div
              className="h-full bg-[var(--color-accent)] transition-opacity duration-150"
              style={{ width: `${uploadPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
