/**
 * ChalkboardLayout — Shared layout for V2 chalkboard theme.
 *
 * Avatar is ALWAYS visible (transparent chroma key).
 * Board expands/collapses based on DevConfig.chalkboardExpanded.
 * Avatar position/size follows section-type rules:
 *   - intro: center, 75%
 *   - others: right, 55%
 * Dev Mode overrides take priority.
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
    // Defaults based on section type
    const isIntro = sectionType === 'intro';
    const defaultPosition = isIntro ? 'center' : 'right';
    const defaultWidth = isIntro ? 75 : 55;
    const defaultHeight = isIntro ? 85 : 90;

    // Dev Mode overrides (if user has changed from default)
    const avatarPosition = settings.avatarPosition || defaultPosition;
    const avatarWidth = settings.avatarWidthPercent || defaultWidth;
    const avatarHeight = settings.avatarHeightPercent || defaultHeight;

    const expanded = settings.chalkboardExpanded;

    // ── Board sizing ─────────────────────────────────────
    // Expanded: board fills display. Collapsed: board on left.
    const boardWidth = expanded
        ? 'calc(100% - 20px)'
        : `calc(${Math.max(30, 100 - avatarWidth)}% - 40px)`;

    // ── Avatar positioning ───────────────────────────────
    const avatarStyle: React.CSSProperties = avatarPosition === 'center'
        ? {
            position: 'absolute',
            left: '50%',
            bottom: settings.avatarBottom,
            transform: 'translateX(-50%)',
            width: `${avatarWidth}%`,
            height: `${avatarHeight}%`,
            zIndex: 1,  // behind content
        }
        : {
            position: 'absolute',
            right: settings.avatarRight,
            bottom: settings.avatarBottom,
            width: `${avatarWidth}%`,
            height: `${avatarHeight}%`,
            zIndex: 1,  // behind content
        };

    // ── FULLSCREEN OVERRIDE (video mode) ─────────────────
    if (fullscreenOverride) {
        return (
            <AbsoluteFill style={{ backgroundColor: '#111111', overflow: 'hidden' }}>
                {/* Avatar always visible behind */}
                <div style={avatarStyle}>
                    <ChromaKeyVideo src={avatarSrc} />
                </div>
                {/* Fullscreen content on top */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
                    {children}
                </div>
            </AbsoluteFill>
        );
    }

    // ── INTRO MODE (no board — avatar + text overlay) ────
    if (sectionType === 'intro') {
        return (
            <AbsoluteFill style={{ backgroundColor: '#111111', overflow: 'hidden' }}>
                {/* Classroom ambient background */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `
          radial-gradient(ellipse at 50% 60%, rgba(40, 28, 16, 0.5) 0%, transparent 60%),
          linear-gradient(180deg, #0e0e0e 0%, #1a1510 50%, #0e0e0e 100%)
        `,
                }} />

                {/* Avatar centered and large */}
                <div style={avatarStyle}>
                    <ChromaKeyVideo src={avatarSrc} />
                </div>

                {/* Text overlay on top of avatar */}
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

            {/* ── AVATAR (always visible, behind board) ── */}
            <div style={avatarStyle}>
                <ChromaKeyVideo src={avatarSrc} />
            </div>

            {/* ── CHALKBOARD ── */}
            <div style={{
                position: 'absolute',
                left: expanded ? 10 : 20,
                top: expanded ? 10 : 20,
                width: boardWidth,
                bottom: expanded ? 10 : 20,
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
        </AbsoluteFill>
    );
};
