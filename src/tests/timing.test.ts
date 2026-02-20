import { describe, it, expect } from 'vitest';
import { computeSegmentFrames, secondsToFrames, totalFrames, FPS } from '../utils/timing';
import type { Segment } from '../types';

describe('timing engine', () => {
    describe('computeSegmentFrames', () => {
        it('should proportionally scale segments to match avatar duration', () => {
            const segments: Segment[] = [
                { text: 'Seg 1', duration_seconds: 10, segment_id: 'seg_1', purpose: 'introduce' },
                { text: 'Seg 2', duration_seconds: 20, segment_id: 'seg_2', purpose: 'explain' },
            ];
            const avatarDuration = 30; // Total should be 30s, same as sum
            const result = computeSegmentFrames(segments, avatarDuration, 30);

            expect(result).toHaveLength(2);
            expect(result[0].segmentId).toBe('seg_1');
            expect(result[0].startFrame).toBe(0);
            expect(result[0].durationFrames).toBe(300);  // 10s * 30fps
            expect(result[1].startFrame).toBe(300);
            expect(result[1].durationFrames).toBe(600);   // 20s * 30fps
            // Total frames should equal avatar duration
            expect(result[0].durationFrames + result[1].durationFrames).toBe(900);
        });

        it('should scale durations when avatar is longer than estimated', () => {
            const segments: Segment[] = [
                { text: 'Seg 1', duration_seconds: 10, segment_id: 'seg_1' },
                { text: 'Seg 2', duration_seconds: 10, segment_id: 'seg_2' },
            ];
            // Avatar is 40s but estimated total was only 20s → 2x scale
            const avatarDuration = 40;
            const result = computeSegmentFrames(segments, avatarDuration, 30);

            expect(result).toHaveLength(2);
            // Each should be scaled to ~20s
            expect(result[0].durationFrames).toBe(600); // 20s * 30fps
            expect(result[1].durationFrames).toBe(600);
            expect(result[0].durationFrames + result[1].durationFrames).toBe(1200);
        });

        it('should scale durations when avatar is shorter than estimated', () => {
            const segments: Segment[] = [
                { text: 'Seg 1', duration_seconds: 20, segment_id: 'seg_1' },
                { text: 'Seg 2', duration_seconds: 20, segment_id: 'seg_2' },
            ];
            // Avatar is only 20s but estimated was 40s → 0.5x scale
            const avatarDuration = 20;
            const result = computeSegmentFrames(segments, avatarDuration, 30);

            const totalDur = result.reduce((sum, s) => sum + s.durationFrames, 0);
            expect(totalDur).toBe(600); // 20s * 30fps
        });

        it('should handle empty segments', () => {
            const result = computeSegmentFrames([], 30, 30);
            expect(result).toHaveLength(0);
        });

        it('should handle single segment', () => {
            const segments: Segment[] = [
                { text: 'Only segment', duration_seconds: 15, segment_id: 'seg_1' },
            ];
            const result = computeSegmentFrames(segments, 30, 30);

            expect(result).toHaveLength(1);
            expect(result[0].startFrame).toBe(0);
            expect(result[0].durationFrames).toBe(900); // Fills entire 30s
        });

        it('should preserve segment metadata', () => {
            const segments: Segment[] = [
                {
                    text: 'Teaching segment',
                    duration_seconds: 10,
                    segment_id: 'seg_1',
                    purpose: 'introduce',
                    display_directives: { text_layer: 'show', visual_layer: 'hide', avatar_layer: 'show' },
                    beat_videos: ['topic_3_seg_1_beat_1'],
                },
            ];
            const result = computeSegmentFrames(segments, 10, 30);

            expect(result[0].text).toBe('Teaching segment');
            expect(result[0].purpose).toBe('introduce');
            expect(result[0].displayDirectives?.text_layer).toBe('show');
            expect(result[0].beatVideos).toEqual(['topic_3_seg_1_beat_1']);
        });

        it('last segment should fill exactly to total frames (no rounding gaps)', () => {
            const segments: Segment[] = [
                { text: 'S1', duration_seconds: 7.3, segment_id: 'seg_1' },
                { text: 'S2', duration_seconds: 11.7, segment_id: 'seg_2' },
                { text: 'S3', duration_seconds: 3.5, segment_id: 'seg_3' },
            ];
            const avatarDuration = 25;
            const result = computeSegmentFrames(segments, avatarDuration, 30);

            const totalDur = result.reduce((sum, s) => sum + s.durationFrames, 0);
            expect(totalDur).toBe(750); // 25s * 30fps exactly
        });
    });

    describe('secondsToFrames', () => {
        it('should convert seconds to frames at default 30fps', () => {
            expect(secondsToFrames(10)).toBe(300);
            expect(secondsToFrames(0)).toBe(0);
            expect(secondsToFrames(1.5)).toBe(45);
        });
    });

    describe('totalFrames', () => {
        it('should compute total frames', () => {
            expect(totalFrames(30)).toBe(900);
            expect(totalFrames(121.33)).toBe(3640);
        });
    });

    describe('FPS constant', () => {
        it('should be 30', () => {
            expect(FPS).toBe(30);
        });
    });
});
