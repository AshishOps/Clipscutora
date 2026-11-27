"use client";

export const runtime = "edge";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download01,
  CheckCircle,
  AlertCircle,
  Stars01,
  Copy01,
  Check,
  Film01,
  Lightning01,
  Loading01,
} from "@untitledui/icons";
import { getJobStatus, ClipResult } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import {
  Button,
  Badge,
  Card,
  ProgressBar,
} from "@/components/untitledui";

const PIPELINE_STEPS = [
  { id: "download", label: "1. Download & Audio", threshold: 15 },
  { id: "transcribe", label: "2. Speech Recognition", threshold: 35 },
  { id: "virality", label: "3. Virality & Hook Scoring", threshold: 70 },
  { id: "render", label: "4. 9:16 Crop & Subtitles", threshold: 85 },
];

export default function JobStatusPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params?.id as string) || "";
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["jobStatus", jobId],
    queryFn: () => getJobStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") {
        return false;
      }
      return 2500;
    },
  });

  if (isLoading && !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#dae7ff] ring-8 ring-[#eef4ff] dark:bg-[#141518] dark:border-[#2a2d33] dark:ring-[#1c1e22] flex items-center justify-center shadow-xs">
          <Loading01 className="w-6 h-6 text-[#3b86ff] animate-spin stroke-[2]" />
        </div>
        <p className="text-sm font-semibold text-[#0c1836] dark:text-[#f1f4f9]">
          Loading clipping job status...
        </p>
      </div>
    );
  }

  if (error || job?.status === "failed") {
    return (
      <div className="max-w-md mx-auto pt-6">
        <Card className="p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 ring-8 ring-rose-50/60 dark:bg-rose-950/60 dark:border-rose-800/60 dark:ring-rose-950/30 mx-auto flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs">
            <AlertCircle className="w-7 h-7 stroke-[2]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-100">
              Processing Pipeline Failed
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              {job?.error || (error as any)?.message || "An unexpected error occurred during clipping."}
            </p>
          </div>
          <Button
            variant="secondary-gray"
            size="md"
            onClick={() => router.push("/")}
            leftIcon={<ArrowLeft className="w-4 h-4 stroke-[2]" />}
          >
            Back to Workspace
          </Button>
        </Card>
      </div>
    );
  }

  const isCompleted = job?.status === "completed";
  const clips = job?.clips || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dae7ff] dark:border-[#2a2d33] pb-6">
        <div className="space-y-2">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4d5b85] hover:text-[#0c1836] dark:text-[#9da4b0] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" /> New Clipping Job
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#0c1836] dark:text-white flex items-center gap-2">
              Job <span className="font-mono text-[#3b86ff] text-xl font-normal">#{jobId}</span>
            </h1>
            {isCompleted ? (
              <Badge variant="success" size="md" dot leftIcon={<CheckCircle className="w-3.5 h-3.5 stroke-[2]" />}>
                Completed
              </Badge>
            ) : (
              <Badge variant="warning" size="md" dot leftIcon={<Loading01 className="w-3.5 h-3.5 animate-spin stroke-[2]" />}>
                Processing
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary-gray"
            size="sm"
            onClick={handleCopyLink}
            leftIcon={
              copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
              ) : (
                <Copy01 className="w-3.5 h-3.5 stroke-[2]" />
              )
            }
          >
            {copied ? "Link Copied" : "Share Job Link"}
          </Button>

          {isCompleted && clips.length > 0 && (
            <Badge variant="brand" size="md">
              {clips.length} {clips.length === 1 ? "Clip" : "Clips"} Ready
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Card when running */}
      {!isCompleted && (
        <Card className="p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#0c1836] dark:text-white flex items-center gap-2">
              <Stars01 className="w-4 h-4 text-[#3b86ff] stroke-[2]" />
              Generating Viral Shorts Pipeline
            </h2>
            <p className="text-xs text-[#4d5b85] dark:text-[#9da4b0] leading-relaxed">
              Extracting speech, scoring virality, detecting speaker framing, and rendering dynamic 9:16 portrait video.
            </p>
          </div>

          <ProgressBar
            progress={job?.progress || 15}
            stage={job?.stage || "Processing video pipeline..."}
            steps={PIPELINE_STEPS}
          />

          <p className="text-[11px] text-[#4d5b85] dark:text-[#9da4b0] text-center pt-2 border-t border-[#eef4ff] dark:border-[#2a2d33]">
            This page automatically updates in real-time. You can safely keep this tab open or return using the job link.
          </p>
        </Card>
      )}

      {/* Completed Clips Grid */}
      {isCompleted && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#0c1836] dark:text-white">
                Generated Viral Clips
              </h2>
              <p className="text-xs text-[#4d5b85] dark:text-[#9da4b0]">
                Rendered with 9:16 portrait aspect ratio, styled animated captions, and optimized virality hooks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map((clip) => {
              const scoreBadgeVariant =
                clip.score >= 80 ? "success" : clip.score >= 60 ? "amber" : "rose";

              return (
                <Card
                  key={clip.id}
                  className="overflow-hidden flex flex-col justify-between group hover:border-[#3b86ff]/50 transition-all"
                >
                  {/* 9:16 Video Player Container */}
                  <div className="relative aspect-[9/16] bg-[#07080a] flex items-center justify-center border-b border-[#dae7ff] dark:border-[#2a2d33]">
                    <video
                      src={clip.url || clip.path}
                      controls
                      className="w-full h-full object-cover"
                      playsInline
                      preload="metadata"
                    />

                    {/* Floating Virality Score Badge */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <Badge variant={scoreBadgeVariant} size="sm">
                        ★ {clip.score} Viral Score
                      </Badge>
                    </div>

                    {/* Floating Duration & Layout Badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-medium text-white border border-white/10 shadow-xs">
                        {clip.layout === "split_cam"
                          ? "🎮 Split-Cam"
                          : clip.layout === "single_speaker"
                          ? "🎙️ Solo Speaker"
                          : "✨ 9:16 Fit"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-mono font-medium text-white border border-white/10 shadow-xs">
                        {formatDuration(clip.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Clip Details Card Content */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm text-[#0c1836] dark:text-white line-clamp-1 group-hover:text-[#3b86ff] transition-colors">
                        {clip.title}
                      </h3>
                      <p className="text-xs italic text-[#4d5b85] dark:text-[#9da4b0] line-clamp-2 leading-relaxed">
                        &ldquo;{clip.hook_line}&rdquo;
                      </p>
                    </div>

                    {/* Viral Factor Tags */}
                    {clip.viral_factors && clip.viral_factors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {clip.viral_factors.map((factor) => (
                          <Badge key={factor} variant="gray" size="sm">
                            #{factor}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Download Action Button */}
                    <div className="pt-3 border-t border-[#eef4ff] dark:border-[#2a2d33]">
                      <a
                        href={clip.url || clip.path}
                        download={`${clip.filename || `clip_${clip.id}.mp4`}`}
                        className="w-full block"
                      >
                        <Button
                          variant="primary"
                          size="md"
                          fullWidth
                          leftIcon={<Download01 className="w-4 h-4 stroke-[2]" />}
                        >
                          Download 9:16 Video
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
