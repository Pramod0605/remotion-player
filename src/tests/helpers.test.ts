import { describe, it, expect } from 'vitest';
import { getDuration } from '../utils/helpers';

describe('getDuration', () => {
    it('should return durationInFrames if present', () => {
        const cfg = { durationInFrames: 100 };
        expect(getDuration(cfg)).toBe(100);
    });

    it('should calculate duration from durationInSeconds and fps', () => {
        const cfg = { durationInSeconds: 10, fps: 30 };
        expect(getDuration(cfg)).toBe(300);
    });

    it('should use default fps of 30 if missing', () => {
        const cfg = { durationInSeconds: 5 };
        expect(getDuration(cfg)).toBe(150);
    });

    it('should return 300 if both are missing', () => {
        const cfg = {};
        expect(getDuration(cfg)).toBe(300);
    });
});
