/**
 * ChalkboardLayout — Shared layout for V2 chalkboard theme.
 *
 * The chalkboard fills the ENTIRE 16:9 frame (like a real classroom wall).
 * Avatar overlays on the right side, standing "in front of" the board.
 *
 * Modes:
 *   - intro: no board — classroom bg + centered avatar + text overlay
 *   - fullscreenOverride: no board — avatar behind + fullscreen content
 *   - default: full-frame board + avatar overlay on right + content on left
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ChromaKeyVideo } from './ChromaKeyVideo';
import { ChalkDust } from './ChalkText';
import { useDevConfig } from './DevConfig';

interface ChalkboardLayoutProps {
    avatarSrc: string;
    sectionType?: string;
    /** When true, board is hidden and only avatar+children render (for fullscreen video) */
    fullscreenOverride?: boolean;
    children: React.ReactNode;
}

export const ChalkboardLayout: React.FC<ChalkboardLayoutProps> = ({
    avatarSrc,
    sectionType = 'content',
    fullscreenOverride = false,
    children,
}) => {
    const { settings } = useDevConfig();

    // ── Avatar placement rules ───────────────────────────
    const isIntro = sectionType === 'intro';
    const defaultWidth = isIntro ? 60 : 40;
    const defaultHeight = isIntro ? 90 : 95;

    const avatarWidth = settings.avatarWidthPercent || defaultWidth;
    const avatarHeight = settings.avatarHeightPercent || defaultHeight;

    // Avatar always anchored at bottom-right, overlaid on the board
    const avatarStyle: React.CSSProperties = isIntro
        ? {
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: `${avatarWidth}%`,
            height: `${avatarHeight}%`,
            zIndex: 2,
        }
        : {
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: `${avatarWidth}%`,
            height: `${avatarHeight}%`,
            zIndex: 4,  // in front of board content
        };

    // ── FULLSCREEN OVERRIDE (video mode) ─────────────────
    if (fullscreenOverride) {
        return (
            <AbsoluteFill style={{ backgroundColor: '#111111', overflow: 'hidden' }}>
                <div style={{ ...avatarStyle, zIndex: 1 }}>
                    <ChromaKeyVideo src={avatarSrc} />
                </div>
                <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
                    {children}
                </div>
            </AbsoluteFill>
        );
    }

    // ── INTRO MODE (no board — avatar + text overlay) ────
    if (isIntro) {
        return (
            <AbsoluteFill style={{ backgroundColor: '#111111', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `
          radial-gradient(ellipse at 50% 60%, rgba(40, 28, 16, 0.5) 0%, transparent 60%),
          linear-gradient(180deg, #0e0e0e 0%, #1a1510 50%, #0e0e0e 100%)
        `,
                }} />
                <div style={avatarStyle}>
                    <ChromaKeyVideo src={avatarSrc} />
                </div>
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    zIndex: 5,
                }}>
                    {children}
                </div>
            </AbsoluteFill>
        );
    }

    // ── DEFAULT: Full-frame chalkboard + avatar overlay ──
    // Content area avoids the avatar zone on the right
    const contentRightMargin = `${avatarWidth - 5}%`;

    return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
            {/* ── CHALKBOARD fills entire frame ── */}
            <div style={{
                position: 'absolute', inset: 0,
                // Wood frame border
                border: '12px solid transparent',
                borderImage: 'linear-gradient(135deg, #5c3a1e, #8b6914, #6b4423, #5c3a1e) 1',
                boxShadow: '0 0 0 3px #3a2510',
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

                {/* Chalk smudge texture */}
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
                <ChalkDust count={60} />

                {/* Chalk tray at bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: 14,
                    background: 'linear-gradient(to bottom, #4a2e14, #5c3a1e, #6b4423)',
                    borderTop: '2px solid #7a5030',
                    zIndex: 5,
                }} />
            </div>

            {/* ── CONTENT ZONE (left side, clear of avatar) ── */}
            <div style={{
                position: 'absolute',
                top: 24, left: 28, bottom: 24,
                right: contentRightMargin,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 3,
            }}>
                {children}
            </div>

            {/* ── AVATAR (overlaid on right side of board) ── */}
            <div style={avatarStyle}>
                <ChromaKeyVideo src={avatarSrc} />
            </div>
        </AbsoluteFill>
    );
};
