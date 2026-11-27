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
          ? "border-[#3b86ff] bg-[#eef4ff] dark:bg-[#111e3e]/40 ring-4 ring-[#3b86ff]/15"
          : "border-[#dae7ff] hover:border-[#3b86ff]/60 bg-[#f5f8ff] hover:bg-[#eef4ff] dark:border-[#2a2d33] dark:hover:border-[#3b86ff]/50 dark:bg-[#1c1e22]/60 dark:hover:bg-[#1c1e22] shadow-xs",
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

      <div className="w-14 h-14 rounded-2xl bg-white border border-[#dae7ff] ring-8 ring-[#eef4ff] dark:bg-[#141518] dark:border-[#2a2d33] dark:ring-[#1c1e22] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-4">
        <UploadCloud01 className="w-7 h-7 text-[#3b86ff] stroke-[1.75]" />
      </div>

      <div className="text-center space-y-1.5 max-w-sm">
        <p className="text-sm font-semibold text-[#0c1836] dark:text-[#f1f4f9]">
          <span className="text-[#3b86ff] font-bold underline underline-offset-2">Click to upload</span>{" "}
          or drag and drop your video file
        </p>
        <p className="text-xs text-[#4d5b85] dark:text-[#9da4b0] font-normal">
          Supports MP4, MOV, MKV, WebM, and screen recordings (up to 4 GB)
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#141518] border border-[#dae7ff] dark:border-[#2a2d33] text-[11px] font-mono text-[#4d5b85] dark:text-[#9da4b0]">
          MP4 / MOV / MKV
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#141518] border border-[#dae7ff] dark:border-[#2a2d33] text-[11px] font-mono text-[#4d5b85] dark:text-[#9da4b0]">
          4K / 1080p
        </span>
      </div>

      {uploading && uploadPct !== null && (
        <div className="w-full max-w-xs mt-6 space-y-2">
          <div className="flex justify-between text-xs text-[#0c1836] dark:text-[#f1f4f9]">
            <span className="font-medium">Uploading video...</span>
            <span className="font-mono font-bold text-[#3b86ff]">{uploadPct}%</span>
          </div>
          <div className="w-full bg-[#dae7ff] dark:bg-[#0b0c0e] h-2 rounded-full overflow-hidden border border-[#b5d2ff] dark:border-[#2a2d33]">
            <div
              className="h-full bg-gradient-to-r from-[#2563eb] to-[#3b86ff] transition-all duration-300"
              style={{ width: `${uploadPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
