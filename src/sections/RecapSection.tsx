/**
 * RecapSection — Cinematic beat videos with animated subtitles (DevConfig).
 */
import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Video,
    spring,
} from 'remotion';
import { ChromaKeyVideo } from '../components/ChromaKeyVideo';
import { AnimatedText } from '../components/AnimatedText';
import { useDevConfig } from '../components/DevConfig';
import type { Section, AvatarGlobal, SegmentFrameRange } from '../types';

interface RecapSectionProps {
    section: Section;
    avatarGlobal: AvatarGlobal;
    avatarSrc: string;
    jobBasePath: string;
    segmentFrames: SegmentFrameRange[];
}

export const RecapSection: React.FC<RecapSectionProps> = ({
    section,
    avatarSrc,
    jobBasePath,
    segmentFrames,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { settings } = useDevConfig();

    // Find active segment
    const activeSeg = segmentFrames.find(
        sf => frame >= sf.startFrame && frame < sf.endFrame,
    );

    const beatVideoFile = activeSeg?.beatVideos?.[0];
    const beatVideoSrc = beatVideoFile ? `${jobBasePath}/videos/${beatVideoFile}.mp4` : null;

    const transitionSpring = activeSeg
        ? spring({
            frame: frame - activeSeg.startFrame,
            fps,
            config: { damping: 15, stiffness: 80 },
        })
        : 1;

    // Title entrance
    const titleOpacity = interpolate(frame, [0, 20, 50, 70], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    const titleY = interpolate(frame, [0, 20], [30, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            {/* Full-screen beat video */}
            {beatVideoSrc && (
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: transitionSpring, zIndex: 1,
                }}>
                    <Video
                        src={beatVideoSrc}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        startFrom={0}
                        volume={0}
                    />
                    {/* Cinematic letterbox */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0,
                        height: '7%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '18%', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                    }} />
                    {/* Side vignette */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to right, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.5) 100%)',
                    }} />
                </div>
            )}

            {/* Fallback gradient */}
            {!beatVideoSrc && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `
            radial-gradient(ellipse at 30% 40%, rgba(108, 99, 255, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at center, #1a1a3e, #0a0a1a)
          `,
                    zIndex: 1,
                }} />
            )}

            {/* Title — brief appearance */}
            <div style={{
                position: 'absolute', top: 50, left: 50,
                opacity: titleOpacity,
                transform: `translateY(${titleY}px)`,
                zIndex: 4,
            }}>
                <span style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: 12,
                    textTransform: 'uppercase', letterSpacing: 3,
                    fontFamily: "'Inter', sans-serif", fontWeight: 600,
                }}>
                    Lesson Recap
                </span>
                <h2 style={{
                    color: '#fff', fontSize: Math.round(settings.fontSize * 2), fontWeight: 700,
                    fontFamily: "'Inter', sans-serif", margin: '8px 0 0',
                    textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                }}>
                    {section.title}
                </h2>
            </div>

            {/* Animated subtitle */}
            {activeSeg && (
                <div style={{
                    position: 'absolute', bottom: 55, left: 50,
                    right: `${settings.avatarWidthPercent + 5}%`,
                    zIndex: 4,
                }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 10, padding: '16px 22px',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <AnimatedText
                            text={activeSeg.text}
                            startFrame={activeSeg.startFrame + 5}
                            mode={settings.textAnimation}
                            speed={settings.animationSpeed * 1.5}
                            fontSize={settings.fontSize}
                            fontWeight={settings.fontWeight}
                            lineHeight={settings.lineHeight}
                            color={settings.textColor}
                        />
                    </div>
                </div>
            )}

            {/* Avatar — DevConfig positioning */}
            <div style={{
                position: 'absolute',
                right: settings.avatarRight,
                bottom: settings.avatarBottom,
                width: `${settings.avatarWidthPercent}%`,
                height: `${settings.avatarHeightPercent}%`,
                zIndex: 5,
            }}>
                <ChromaKeyVideo src={avatarSrc} />
            </div>
        </AbsoluteFill>
    );
};
