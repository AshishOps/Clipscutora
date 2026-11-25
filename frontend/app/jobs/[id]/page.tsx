"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download01,
  CheckCircle,
  AlertCircle,
  Copy01,
  Check,
  Loading01,
} from "@untitledui/icons";
import { getJobStatus } from "@/lib/api";
import { formatDuration } from "@/lib/utils";

const PIPELINE_STEPS = [
  { id: "download", label: "Download source and extract audio", threshold: 15 },
  { id: "transcribe", label: "Speech recognition and word timing", threshold: 35 },
  { id: "virality", label: "Score engagement and hooks", threshold: 70 },
  { id: "render", label: "9:16 framing and burned captions", threshold: 85 },
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-12 h-12 border border-[var(--color-rule-2)] bg-[var(--color-paper-2)] flex items-center justify-center">
          <Loading01 className="w-5 h-5 text-[var(--color-accent)] animate-spin stroke-[1.75]" />
        </div>
        <p className="text-sm text-[var(--color-muted)]">Loading job status…</p>
      </div>
    );
  }

  if (error || job?.status === "failed") {
    return (
      <div className="max-w-md mx-auto pt-8">
        <div className="hm-surface p-8 space-y-5">
          <div className="w-10 h-10 border border-[var(--color-error)] bg-[var(--color-paper)] flex items-center justify-center text-[var(--color-error)]">
            <AlertCircle className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="space-y-1.5">
            <h1 className="hm-display text-xl">Processing failed</h1>
            <p className="text-sm text-[var(--color-muted)]">
              {job?.error || (error as any)?.message || "An unexpected error occurred during clipping."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="hm-btn-secondary px-4 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
            <span>Back to workspace</span>
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = job?.status === "completed";
  const clips = job?.clips || [];
  const progress = Math.min(100, Math.max(0, Math.round(job?.progress || 15)));

  return (
    <div className="space-y-8">
      {/* Top Job Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[var(--color-rule)]">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>New clipping job</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="hm-display text-2xl sm:text-3xl">
              Job <span className="num text-[var(--color-accent)]">#{jobId}</span>
            </h1>
            <span
              role="status"
              className={`px-2.5 py-1 text-xs font-medium border inline-flex items-center gap-1.5 ${
                isCompleted
                  ? "border-[var(--color-success)] text-[var(--color-success)]"
                  : "border-[var(--color-warning)] text-[var(--color-warning)]"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-3.5 h-3.5 stroke-[1.75]" />
              ) : (
                <Loading01 className="w-3.5 h-3.5 animate-spin stroke-[1.75]" />
              )}
              <span>{isCompleted ? "Completed" : "Processing"}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="hm-btn-secondary px-4 inline-flex items-center gap-2 text-xs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[var(--color-success)] stroke-[2]" />
            ) : (
              <Copy01 className="w-3.5 h-3.5 stroke-[1.75]" />
            )}
            <span>{copied ? "Link copied" : "Share job link"}</span>
          </button>

          {isCompleted && clips.length > 0 && (
            <span className="px-3 h-10 inline-flex items-center border border-[var(--color-rule-2)] bg-[var(--color-paper-2)] text-xs font-medium text-[var(--color-ink)] num">
              {clips.length} {clips.length === 1 ? "clip" : "clips"} ready
            </span>
          )}
        </div>
      </div>

      {/* Night Log & 2px Meter when running */}
      {!isCompleted && (
        <section className="hm-surface p-6 sm:p-8 max-w-2xl space-y-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-base font-medium text-[var(--color-ink)]">
                {job?.stage || "Processing video pipeline…"}
              </h2>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                This page updates automatically until all 9:16 renders finish.
              </p>
            </div>
            <span className="hm-display text-2xl num text-[var(--color-accent)]">{progress}%</span>
          </div>

          {/* Midnight 2px meter */}
          <div className="h-[2px] w-full bg-[var(--color-rule-2)]">
            <div
              className="h-full bg-[var(--color-accent)] transition-opacity duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ol className="divide-y divide-[var(--color-rule)] border-t border-[var(--color-rule)]">
            {PIPELINE_STEPS.map((s, index) => {
              const isDone = progress >= s.threshold;
              const prevThreshold = index > 0 ? PIPELINE_STEPS[index - 1].threshold : 0;
              const isCurrent = progress < s.threshold && progress >= prevThreshold;

              return (
                <li
                  key={s.id}
                  className="py-3 flex items-center justify-between gap-4 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs num text-[var(--color-muted)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={isDone || isCurrent ? "text-[var(--color-ink)] font-medium" : "text-[var(--color-muted)]"}>
                      {s.label}
                    </span>
                  </div>
                  <span className="text-xs">
                    {isDone ? (
                      <span className="text-[var(--color-success)]">Done</span>
                    ) : isCurrent ? (
                      <span className="text-[var(--color-accent)]">Running</span>
                    ) : (
                      <span className="text-[var(--color-muted)]">Queued</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Completed 9:16 Contact Sheet */}
      {isCompleted && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-lg font-medium text-[var(--color-ink)]">Generated portrait clips</h2>
            <p className="text-xs text-[var(--color-muted)]">
              9:16 portrait renders with timed captions and virality score
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map((clip) => {
              const layoutLabel =
                clip.layout === "split_cam"
                  ? "Split-cam"
                  : clip.layout === "single_speaker"
                  ? "Solo speaker"
                  : "9:16 fit";

              return (
                <article
                  key={clip.id}
                  className="hm-surface flex flex-col justify-between"
                >
                  {/* 9:16 Video Frame */}
                  <div className="aspect-[9/16] bg-[var(--color-paper)] border-b border-[var(--color-rule)]">
                    <video
                      src={clip.url || clip.path}
                      controls
                      className="w-full h-full object-cover"
                      playsInline
                      preload="metadata"
                    />
                  </div>

                  {/* Clip Metadata & Actions */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-[var(--color-accent)] num">
                          Score {clip.score}
                        </span>
                        <span className="text-[var(--color-muted)] num">
                          {layoutLabel} / {formatDuration(clip.duration)}
                        </span>
                      </div>

                      <h3 className="text-sm font-medium text-[var(--color-ink)] line-clamp-2">
                        {clip.title}
                      </h3>

                      <p className="text-xs text-[var(--color-muted)] line-clamp-2">
                        &ldquo;{clip.hook_line}&rdquo;
                      </p>

                      {clip.viral_factors && clip.viral_factors.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {clip.viral_factors.map((factor) => (
                            <span
                              key={factor}
                              className="px-2 py-0.5 text-xs border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink-2)]"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[var(--color-rule)]">
                      <a
                        href={clip.url || clip.path}
                        download={`${clip.filename || `clip_${clip.id}.mp4`}`}
                        className="hm-btn-primary w-full px-4 text-sm inline-flex items-center justify-center gap-2"
                      >
                        <Download01 className="w-4 h-4 stroke-[1.75]" />
                        <span>Download 9:16 video</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
