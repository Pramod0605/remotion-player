/**
 * ChalkboardLayout — Shared layout for V2 chalkboard theme.
 *
 * Left: Realistic chalkboard panel (green board, wood frame, dust, tray)
 * Right: Avatar with chroma key
 * Content (text, videos, images) renders inside the chalkboard zone.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ChromaKeyVideo } from './ChromaKeyVideo';
import { ChalkDust } from './ChalkText';
import { useDevConfig } from './DevConfig';

interface ChalkboardLayoutProps {
    avatarSrc: string;
    children: React.ReactNode;
}

export const ChalkboardLayout: React.FC<ChalkboardLayoutProps> = ({
    avatarSrc,
    children,
}) => {
    const { settings } = useDevConfig();

    // Chalkboard takes the left, avatar takes the right
    const boardWidth = Math.max(30, 100 - settings.avatarWidthPercent);

    return (
        <AbsoluteFill style={{ backgroundColor: '#111111', overflow: 'hidden' }}>
            {/* Classroom ambient background */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
          radial-gradient(ellipse at 30% 50%, rgba(40, 28, 16, 0.5) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 80%, rgba(20, 15, 10, 0.3) 0%, transparent 50%),
          linear-gradient(180deg, #0e0e0e 0%, #1a1510 50%, #0e0e0e 100%)
        `,
            }} />

            {/* ── CHALKBOARD (left side) ── */}
            <div style={{
                position: 'absolute',
                left: 20, top: 20,
                width: `calc(${boardWidth}% - 40px)`,
                bottom: 20,
                borderRadius: 6,
                overflow: 'hidden',
                // Wood frame
                border: '14px solid transparent',
                borderImage: 'linear-gradient(135deg, #5c3a1e, #8b6914, #6b4423, #5c3a1e) 1',
                boxShadow: `
          0 4px 20px rgba(0,0,0,0.6),
          inset 0 0 80px rgba(0,0,0,0.25),
          0 0 0 3px #3a2510
        `,
                zIndex: 2,
            }}>
                {/* Green board surface */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `
            radial-gradient(ellipse at 30% 40%, #2e6b45 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, #1f5c3a 0%, transparent 50%),
            linear-gradient(135deg, #1a4d32 0%, #2a5a3e 25%, #1e5035 50%, #264f38 75%, #1a4a30 100%)
          `,
                }} />

                {/* Chalk smudge texture overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `
            radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.1) 0%, transparent 70%)
          `,
                    pointerEvents: 'none',
                }} />

                {/* Chalk dust particles */}
                <ChalkDust count={50} />

                {/* Chalk tray */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: 18,
                    background: 'linear-gradient(to bottom, #4a2e14, #5c3a1e, #6b4423)',
                    borderTop: '2px solid #7a5030',
                    zIndex: 5,
                }} />

                {/* ── CONTENT ZONE (inside the board) ── */}
                <div style={{
                    position: 'absolute',
                    top: 20, left: 24, right: 24,
                    bottom: 28,  // above chalk tray
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 3,
                }}>
                    {children}
                </div>
            </div>

            {/* ── AVATAR (right side) ── */}
            <div style={{
                position: 'absolute',
                right: settings.avatarRight,
                bottom: settings.avatarBottom,
                width: `${settings.avatarWidthPercent}%`,
                height: `${settings.avatarHeightPercent}%`,
                zIndex: 4,
            }}>
                <ChromaKeyVideo src={avatarSrc} />
            </div>
        </AbsoluteFill>
    );
};
