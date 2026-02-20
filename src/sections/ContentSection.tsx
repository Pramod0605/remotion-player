/**
 * ContentSection — Teach→Show with AnimatedText and DevConfig avatar.
 */
import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Video,
    Img,
    spring,
} from 'remotion';
import { ChromaKeyVideo } from '../components/ChromaKeyVideo';
import { AnimatedText } from '../components/AnimatedText';
import { useDevConfig } from '../components/DevConfig';
import type { Section, AvatarGlobal, SegmentFrameRange } from '../types';

interface ContentSectionProps {
    section: Section;
    avatarGlobal: AvatarGlobal;
    avatarSrc: string;
    jobBasePath: string;
    segmentFrames: SegmentFrameRange[];
}

export const ContentSection: React.FC<ContentSectionProps> = ({
    section,
    avatarSrc,
    jobBasePath,
    segmentFrames,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { settings } = useDevConfig();

    // Find active segment
    const activeSegIdx = segmentFrames.findIndex(
        sf => frame >= sf.startFrame && frame < sf.endFrame,
    );
    const activeSeg = activeSegIdx >= 0 ? segmentFrames[activeSegIdx] : null;

    const showText = activeSeg?.displayDirectives?.text_layer === 'show';
    const showVisual = activeSeg?.displayDirectives?.visual_layer === 'show';

    // Beat video and image sources
    const activeVisualBeat = section.visual_beats?.find(
        vb => vb.segment_id === activeSeg?.segmentId,
    );
    const beatVideoFile = activeSeg?.beatVideos?.[0];
    const beatVideoSrc = beatVideoFile ? `${jobBasePath}/videos/${beatVideoFile}.mp4` : null;
    const imageId = activeVisualBeat?.image_id || '';
    const imageSrc = imageId ? `${jobBasePath}/images/${imageId}` : null;

    // Transition spring
    const transitionSpring = activeSeg
        ? spring({
            frame: frame - activeSeg.startFrame,
            fps,
            config: { damping: 15, stiffness: 80 },
        })
        : 1;

    const contentWidth = `${Math.max(20, 95 - settings.avatarWidthPercent)}%`;

    return (
        <AbsoluteFill style={{ backgroundColor: '#0d1117', overflow: 'hidden' }}>
            {/* ── VISUAL LAYER (full-screen behind avatar) ── */}
            {showVisual && (
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: transitionSpring, zIndex: 1,
                }}>
                    {beatVideoSrc && (
                        <Video
                            src={beatVideoSrc}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            startFrom={0}
                            volume={0}
                        />
                    )}

                    {!beatVideoSrc && imageSrc && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'radial-gradient(ellipse, #161b22, #0d1117)',
                            padding: 60,
                        }}>
                            <Img
                                src={imageSrc}
                                style={{
                                    maxWidth: '55%', maxHeight: '75%',
                                    objectFit: 'contain', borderRadius: 12,
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}
                            />
                        </div>
                    )}

                    {/* Gradient vignette */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `
              linear-gradient(to right, rgba(13,17,23,0.6) 0%, transparent 30%, transparent 50%, rgba(13,17,23,0.4) 100%),
              linear-gradient(to top, rgba(13,17,23,0.8) 0%, transparent 20%)
            `,
                    }} />

                    {/* Subtitle for visual segments */}
                    {activeSeg && (
                        <div style={{
                            position: 'absolute', bottom: 50, left: 40,
                            right: `${settings.avatarWidthPercent + 5}%`,
                            opacity: transitionSpring,
                            zIndex: 4,
                        }}>
                            <div style={{
                                background: 'rgba(0,0,0,0.75)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: 10, padding: '14px 22px',
                                border: '1px solid rgba(108, 99, 255, 0.2)',
                            }}>
                                <AnimatedText
                                    text={activeVisualBeat?.display_text || activeSeg.text}
                                    startFrame={activeSeg.startFrame}
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
                </div>
            )}

            {/* ── TEXT LAYER (left panel) ── */}
            {showText && activeSeg && (
                <div style={{
                    position: 'absolute', left: 0, top: 0,
                    width: contentWidth,
                    height: '100%', padding: '50px 30px 50px 50px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    zIndex: 2,
                }}>
                    {/* Segment label */}
                    <div style={{
                        opacity: transitionSpring,
                        transform: `translateX(${(1 - transitionSpring) * -20}px)`,
                        marginBottom: 8,
                    }}>
                        <span style={{
                            color: '#6c63ff', fontSize: 11, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: 2,
                            fontFamily: "'Inter', sans-serif",
                        }}>
                            {activeSeg.purpose || 'Teaching'} · Segment {activeSegIdx + 1}
                        </span>
                    </div>

                    {/* Section title */}
                    <div style={{
                        opacity: transitionSpring,
                        transform: `translateX(${(1 - transitionSpring) * -20}px)`,
                        marginBottom: 24,
                    }}>
                        <AnimatedText
                            text={section.title}
                            startFrame={activeSeg.startFrame}
                            mode={settings.textAnimation}
                            speed={settings.animationSpeed}
                            fontSize={Math.round(settings.fontSize * 1.6)}
                            fontWeight={700}
                            lineHeight={1.2}
                            color="#e6edf3"
                        />
                    </div>

                    {/* Animated divider */}
                    <div style={{
                        width: `${transitionSpring * 50}px`, height: 2,
                        background: 'linear-gradient(90deg, #6c63ff, transparent)',
                        marginBottom: 20, borderRadius: 1,
                    }} />

                    {/* Narration text */}
                    <div style={{
                        opacity: transitionSpring,
                        transform: `translateY(${(1 - transitionSpring) * 15}px)`,
                    }}>
                        <AnimatedText
                            text={activeVisualBeat?.display_text || activeSeg.text}
                            startFrame={activeSeg.startFrame + 5}
                            mode={settings.textAnimation}
                            speed={settings.animationSpeed}
                            fontSize={settings.fontSize}
                            fontWeight={settings.fontWeight}
                            lineHeight={settings.lineHeight}
                            color={settings.textColor}
                        />
                    </div>

                    {/* Image alongside text */}
                    {activeVisualBeat?.image_id && (
                        <div style={{
                            marginTop: 20,
                            opacity: interpolate(
                                frame,
                                [activeSeg.startFrame + 15, activeSeg.startFrame + 30],
                                [0, 1],
                                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                            ),
                            transform: `scale(${interpolate(
                                frame,
                                [activeSeg.startFrame + 15, activeSeg.startFrame + 30],
                                [0.9, 1],
                                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                            )})`,
                        }}>
                            <Img
                                src={`${jobBasePath}/images/${activeVisualBeat.image_id}`}
                                style={{
                                    maxWidth: '100%', maxHeight: 180,
                                    objectFit: 'contain', borderRadius: 10,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* ── AVATAR — DevConfig positioning ── */}
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
