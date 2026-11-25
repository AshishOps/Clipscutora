"use client";

import React, { useRef, useState } from "react";
import { UploadCloud01, Film01 } from "@untitledui/icons";
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !uploading && fileInputRef.current?.click()}
      className={cn(
        "relative group flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none",
        isDragOver
          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-4 ring-brand-500/10"
          : "border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/60 shadow-xs",
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

      {/* Untitled UI Layered Icon Badge with Double Ring */}
      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 ring-8 ring-gray-100 dark:bg-zinc-900 dark:border-zinc-700/60 dark:ring-8 dark:ring-zinc-900/40 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-4">
        <UploadCloud01 className="w-7 h-7 text-brand-600 dark:text-brand-400 stroke-[1.75]" />
      </div>

      <div className="text-center space-y-1.5 max-w-sm">
        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-200">
          <span className="text-brand-600 dark:text-brand-400 font-bold underline underline-offset-2">Click to upload</span>{" "}
          or drag and drop your video file
        </p>
        <p className="text-xs text-gray-500 dark:text-zinc-500 font-normal">
          Supports MP4, MOV, MKV, WebM, and screen recordings (up to 4 GB)
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] font-mono text-gray-600 dark:text-zinc-400">
          MP4 / MOV / MKV
        </span>
        <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] font-mono text-gray-600 dark:text-zinc-400">
          4K / 1080p
        </span>
      </div>

      {uploading && uploadPct !== null && (
        <div className="w-full max-w-xs mt-6 space-y-2">
          <div className="flex justify-between text-xs text-gray-700 dark:text-zinc-300">
            <span className="font-medium">Uploading video...</span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-300">{uploadPct}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-zinc-900 h-2 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-300"
              style={{ width: `${uploadPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
