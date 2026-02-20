/**
 * Timing Engine
 * 
 * The avatar MP4 is the SINGLE SOURCE OF TRUTH for section duration.
 * We proportionally scale all segment durations from the JSON to fit
 * within the actual avatar video duration.
 */
import type { Segment, SegmentFrameRange } from '../types';

export const FPS = 30;

/**
 * Given the segments array from a section's narration and the actual
 * avatar video duration (in seconds), compute frame ranges for each segment
 * that are proportionally scaled to fill the avatar duration exactly.
 */
export function computeSegmentFrames(
    segments: Segment[],
    avatarDurationSeconds: number,
    fps: number = FPS,
): SegmentFrameRange[] {
    if (!segments.length) return [];

    const totalEstimated = segments.reduce((sum, s) => sum + s.duration_seconds, 0);

    // If no estimated duration, distribute evenly
    if (totalEstimated <= 0) {
        const framePer = Math.floor((avatarDurationSeconds * fps) / segments.length);
        return segments.map((s, i) => ({
            segmentId: s.segment_id || `seg_${i + 1}`,
            startFrame: i * framePer,
            endFrame: (i + 1) * framePer,
            durationFrames: framePer,
            text: s.text,
            purpose: s.purpose,
            displayDirectives: s.display_directives,
            beatVideos: s.beat_videos,
        }));
    }

    const scale = avatarDurationSeconds / totalEstimated;
    const totalFrames = Math.round(avatarDurationSeconds * fps);
    const results: SegmentFrameRange[] = [];
    let currentFrame = 0;

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const scaledDuration = seg.duration_seconds * scale;
        let durationFrames: number;

        if (i === segments.length - 1) {
            // Last segment gets remaining frames to avoid rounding gaps
            durationFrames = totalFrames - currentFrame;
        } else {
            durationFrames = Math.round(scaledDuration * fps);
        }

        results.push({
            segmentId: seg.segment_id || `seg_${i + 1}`,
            startFrame: currentFrame,
            endFrame: currentFrame + durationFrames,
            durationFrames,
            text: seg.text,
            purpose: seg.purpose,
            displayDirectives: seg.display_directives,
            beatVideos: seg.beat_videos,
        });

        currentFrame += durationFrames;
    }

    return results;
}

/**
 * Convert seconds to frames.
 */
export function secondsToFrames(seconds: number, fps: number = FPS): number {
    return Math.round(seconds * fps);
}

/**
 * Get total duration in frames for a given avatar duration.
 */
export function totalFrames(avatarDurationSeconds: number, fps: number = FPS): number {
    return Math.round(avatarDurationSeconds * fps);
}
