/**
 * SummarySection — Progressive bullet reveal with DevConfig animations.
 */
import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    spring,
} from 'remotion';
import { ChromaKeyVideo } from '../components/ChromaKeyVideo';
import { AnimatedText } from '../components/AnimatedText';
import { useDevConfig } from '../components/DevConfig';
import type { Section, AvatarGlobal, SegmentFrameRange } from '../types';

interface SummarySectionProps {
    section: Section;
    avatarGlobal: AvatarGlobal;
    avatarSrc: string;
    jobBasePath: string;
    segmentFrames: SegmentFrameRange[];
}

export const SummarySection: React.FC<SummarySectionProps> = ({
    section,
    avatarSrc,
    segmentFrames,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { settings } = useDevConfig();

    // Title spring animation
    const titleSpring = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    // Build bullet items from visual_beats
    const bullets = section.visual_beats?.filter(b => b.visual_type === 'bullet_list') || [];

    const contentWidth = `${Math.max(20, 95 - settings.avatarWidthPercent)}%`;

    return (
        <AbsoluteFill style={{ backgroundColor: '#0d1117', overflow: 'hidden' }}>
            {/* Subtle grid pattern */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
          linear-gradient(rgba(108, 99, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108, 99, 255, 0.03) 1px, transparent 1px)
        `,
                backgroundSize: '40px 40px',
            }} />

            {/* Left panel — bullets */}
            <div style={{
                position: 'absolute', left: 0, top: 0,
                width: contentWidth,
                height: '100%', padding: '50px 30px 50px 50px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                zIndex: 2,
            }}>
                {/* Section label */}
                <div style={{
                    opacity: titleSpring,
                    transform: `translateX(${(1 - titleSpring) * -30}px)`,
                    marginBottom: 8,
                }}>
                    <span style={{
                        color: '#6c63ff', fontSize: 12, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: 2,
                        fontFamily: "'Inter', sans-serif",
                    }}>
                        Learning Objectives
                    </span>
                </div>

                {/* Title */}
                <div style={{
                    opacity: titleSpring,
                    transform: `translateX(${(1 - titleSpring) * -30}px)`,
                    marginBottom: 28,
                }}>
                    <AnimatedText
                        text={section.title}
                        startFrame={0}
                        mode={settings.textAnimation}
                        speed={settings.animationSpeed}
                        fontSize={Math.round(settings.fontSize * 1.7)}
                        fontWeight={700}
                        lineHeight={1.2}
                        color="#e6edf3"
                    />
                </div>

                {/* Bullet list */}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {bullets.map((bullet, idx) => {
                        const matchingSegFrame = segmentFrames[idx] || segmentFrames[segmentFrames.length - 1];
                        const revealFrame = matchingSegFrame ? matchingSegFrame.startFrame : idx * 30;

                        const bulletSpring = spring({
                            frame: frame - revealFrame,
                            fps,
                            config: { damping: 12, stiffness: 60 },
                        });

                        const isActive = matchingSegFrame &&
                            frame >= matchingSegFrame.startFrame &&
                            frame < matchingSegFrame.endFrame;

                        const glowIntensity = isActive
                            ? interpolate(
                                Math.sin((frame - matchingSegFrame.startFrame) * 0.1),
                                [-1, 1], [0.3, 0.6],
                            )
                            : 0;

                        return (
                            <li key={bullet.beat_id} style={{
                                opacity: bulletSpring,
                                transform: `translateX(${(1 - bulletSpring) * -40}px)`,
                                marginBottom: 12,
                                padding: '12px 16px',
                                borderRadius: 10,
                                backgroundColor: isActive
                                    ? 'rgba(108, 99, 255, 0.12)'
                                    : 'rgba(255, 255, 255, 0.02)',
                                borderLeft: isActive
                                    ? '3px solid #6c63ff'
                                    : '3px solid rgba(255,255,255,0.05)',
                                boxShadow: isActive
                                    ? `0 0 20px rgba(108, 99, 255, ${glowIntensity})`
                                    : 'none',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <span style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: 24, height: 24, borderRadius: 6,
                                        backgroundColor: isActive ? '#6c63ff' : 'rgba(108, 99, 255, 0.2)',
                                        color: '#fff', fontSize: 12, fontWeight: 700,
                                        flexShrink: 0, marginTop: 2,
                                    }}>
                                        {idx + 1}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <AnimatedText
                                            text={bullet.display_text}
                                            startFrame={revealFrame + 3}
                                            mode={settings.textAnimation}
                                            speed={settings.animationSpeed}
                                            fontSize={settings.fontSize}
                                            fontWeight={settings.fontWeight}
                                            lineHeight={settings.lineHeight}
                                            color={isActive ? '#f0f0ff' : settings.textColor}
                                        />
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Avatar — DevConfig positioning */}
            <div style={{
                position: 'absolute',
                right: settings.avatarRight,
                bottom: settings.avatarBottom,
                width: `${settings.avatarWidthPercent}%`,
                height: `${settings.avatarHeightPercent}%`,
                zIndex: 3,
            }}>
                <ChromaKeyVideo src={avatarSrc} />
            </div>
        </AbsoluteFill>
    );
};
