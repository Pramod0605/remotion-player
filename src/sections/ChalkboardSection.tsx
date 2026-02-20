/**
 * ChalkboardSection — Unified V2 renderer for all section types.
 *
 * Everything renders inside the ChalkboardLayout:
 * - Intro: chalk title only
 * - Summary: chalk bullet points progressively revealed
 * - Content/Example (teach): chalk text on board
 * - Content/Example (show): video/image inside the board + chalk caption
 * - Memory/Quiz: chalk flashcard question → answer
 * - Recap: video inside board with chalk subtitle
 */
import React from 'react';
import {
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Video,
    Img,
} from 'remotion';
import { ChalkboardLayout } from '../components/ChalkboardLayout';
import { ChalkText } from '../components/ChalkText';
import { useDevConfig } from '../components/DevConfig';
import type { Section, AvatarGlobal, SegmentFrameRange } from '../types';

interface ChalkboardSectionProps {
    section: Section;
    avatarGlobal: AvatarGlobal;
    avatarSrc: string;
    jobBasePath: string;
    segmentFrames: SegmentFrameRange[];
}

export const ChalkboardSection: React.FC<ChalkboardSectionProps> = ({
    section,
    avatarSrc,
    jobBasePath,
    segmentFrames,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const { settings } = useDevConfig();

    const chalkSize = Math.round(settings.fontSize * 1.8);

    switch (section.section_type) {
        case 'intro':
            return (
                <ChalkboardLayout avatarSrc={avatarSrc}>
                    <IntroContent
                        section={section}
                        frame={frame}
                        durationInFrames={durationInFrames}
                        chalkSize={chalkSize}
                    />
                </ChalkboardLayout>
            );

        case 'summary':
            return (
                <ChalkboardLayout avatarSrc={avatarSrc}>
                    <SummaryContent
                        section={section}
                        frame={frame}
                        segmentFrames={segmentFrames}
                        chalkSize={chalkSize}
                    />
                </ChalkboardLayout>
            );

        case 'memory':
        case 'quiz':
            return (
                <ChalkboardLayout avatarSrc={avatarSrc}>
                    <MemoryContent
                        section={section}
                        frame={frame}
                        segmentFrames={segmentFrames}
                        chalkSize={chalkSize}
                    />
                </ChalkboardLayout>
            );

        case 'recap':
            return (
                <ChalkboardLayout avatarSrc={avatarSrc}>
                    <RecapContent
                        section={section}
                        frame={frame}
                        segmentFrames={segmentFrames}
                        chalkSize={chalkSize}
                        jobBasePath={jobBasePath}
                    />
                </ChalkboardLayout>
            );

        case 'content':
        case 'example':
        default:
            return (
                <ChalkboardLayout avatarSrc={avatarSrc}>
                    <ContentContent
                        section={section}
                        frame={frame}
                        segmentFrames={segmentFrames}
                        chalkSize={chalkSize}
                        jobBasePath={jobBasePath}
                    />
                </ChalkboardLayout>
            );
    }
};

// ═══════════════════════════════════════════════════════════
// ── INTRO ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const IntroContent: React.FC<{
    section: Section; frame: number;
    durationInFrames: number; chalkSize: number;
}> = ({ section, frame, durationInFrames, chalkSize }) => {
    // Fade out at end
    const fadeOut = interpolate(
        frame,
        [durationInFrames - 30, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp' },
    );

    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            opacity: fadeOut, padding: 20,
        }}>
            {/* Decorative chalk line above */}
            <div style={{
                width: `${interpolate(frame, [0, 20], [0, 80], { extrapolateRight: 'clamp' })}%`,
                height: 2,
                backgroundColor: 'rgba(255,255,250,0.2)',
                marginBottom: 30, borderRadius: 1,
            }} />

            {/* Title in chalk */}
            <ChalkText
                text={section.title}
                startFrame={5}
                charDelay={4}
                drawDuration={15}
                fontSize={Math.round(chalkSize * 1.5)}
                color="#fffefa"
                style={{ justifyContent: 'center', textAlign: 'center' }}
            />

            {/* Subheading */}
            <div style={{ marginTop: 30 }}>
                <ChalkText
                    text={`Section ${section.section_id}`}
                    startFrame={35}
                    charDelay={5}
                    drawDuration={12}
                    fontSize={Math.round(chalkSize * 0.7)}
                    color="#aaddaa"
                />
            </div>

            {/* Decorative chalk line below */}
            <div style={{
                width: `${interpolate(frame, [25, 45], [0, 60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`,
                height: 2,
                backgroundColor: 'rgba(255,255,250,0.15)',
                marginTop: 30, borderRadius: 1,
            }} />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// ── SUMMARY ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const SummaryContent: React.FC<{
    section: Section; frame: number;
    segmentFrames: SegmentFrameRange[]; chalkSize: number;
}> = ({ section, frame, segmentFrames, chalkSize }) => {
    const bullets = section.visual_beats?.filter(b => b.visual_type === 'bullet_list') || [];

    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            padding: 16, gap: 8, overflow: 'hidden',
        }}>
            {/* Title */}
            <ChalkText
                text={section.title}
                startFrame={0}
                charDelay={3}
                drawDuration={12}
                fontSize={Math.round(chalkSize * 1.1)}
                color="#fffefa"
            />

            {/* Underline */}
            <div style={{
                width: `${interpolate(frame, [10, 30], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`,
                height: 1.5,
                backgroundColor: 'rgba(255,255,250,0.2)',
                marginBottom: 12,
            }} />

            {/* Bullet list */}
            {bullets.map((bullet, idx) => {
                const matchingSeg = segmentFrames[idx];
                const revealFrame = matchingSeg ? matchingSeg.startFrame : idx * 45;
                const isActive = matchingSeg &&
                    frame >= matchingSeg.startFrame &&
                    frame < matchingSeg.endFrame;

                if (frame < revealFrame - 5) return null;

                return (
                    <div key={bullet.beat_id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        marginBottom: 4,
                        opacity: isActive ? 1 : 0.6,
                    }}>
                        {/* Chalk bullet marker */}
                        <ChalkText
                            text={`${idx + 1}.`}
                            startFrame={revealFrame}
                            charDelay={4}
                            drawDuration={10}
                            fontSize={Math.round(chalkSize * 0.65)}
                            color={isActive ? '#FFD700' : '#aaddaa'}
                        />
                        <ChalkText
                            text={bullet.display_text.slice(0, 50)}
                            startFrame={revealFrame + 8}
                            charDelay={2}
                            drawDuration={10}
                            fontSize={Math.round(chalkSize * 0.55)}
                            color={isActive ? '#fffefa' : '#ccddcc'}
                        />
                    </div>
                );
            })}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// ── CONTENT / EXAMPLE ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const ContentContent: React.FC<{
    section: Section; frame: number;
    segmentFrames: SegmentFrameRange[]; chalkSize: number;
    jobBasePath: string;
}> = ({ section, frame, segmentFrames, chalkSize, jobBasePath }) => {
    // Find active segment
    const activeSegIdx = segmentFrames.findIndex(
        sf => frame >= sf.startFrame && frame < sf.endFrame,
    );
    const activeSeg = activeSegIdx >= 0 ? segmentFrames[activeSegIdx] : null;

    const showText = activeSeg?.displayDirectives?.text_layer === 'show';
    const showVisual = activeSeg?.displayDirectives?.visual_layer === 'show';

    // Visual content
    const activeVisualBeat = section.visual_beats?.find(
        vb => vb.segment_id === activeSeg?.segmentId,
    );
    const beatVideoFile = activeSeg?.beatVideos?.[0];
    const beatVideoSrc = beatVideoFile ? `${jobBasePath}/videos/${beatVideoFile}.mp4` : null;
    const imageId = activeVisualBeat?.image_id || '';
    const imageSrc = imageId ? `${jobBasePath}/images/${imageId}` : null;

    // Transition
    const transitionOpacity = activeSeg
        ? interpolate(
            frame,
            [activeSeg.startFrame, activeSeg.startFrame + 10],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        )
        : 1;

    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            padding: 16, overflow: 'hidden',
        }}>
            {/* Section title (always) */}
            <ChalkText
                text={section.title}
                startFrame={0}
                charDelay={3}
                drawDuration={12}
                fontSize={Math.round(chalkSize * 0.9)}
                color="#fffefa"
            />
            <div style={{
                width: '60%', height: 1.5,
                backgroundColor: 'rgba(255,255,250,0.15)',
                marginTop: 8, marginBottom: 16,
            }} />

            {/* ── SHOW mode: video/image inside the board ── */}
            {showVisual && activeSeg && (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    gap: 12, opacity: transitionOpacity,
                }}>
                    {/* Video inside chalkboard */}
                    {beatVideoSrc && (
                        <div style={{
                            flex: 1, borderRadius: 8, overflow: 'hidden',
                            border: '2px solid rgba(255,255,250,0.1)',
                            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)',
                            position: 'relative',
                        }}>
                            <Video
                                src={beatVideoSrc}
                                style={{
                                    width: '100%', height: '100%',
                                    objectFit: 'cover',
                                }}
                                startFrom={0}
                                volume={0}
                            />
                            {/* Chalkboard overlay tint on video */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to bottom, rgba(26,77,50,0.1) 0%, rgba(26,77,50,0.05) 100%)',
                                pointerEvents: 'none',
                            }} />
                        </div>
                    )}

                    {/* Image inside chalkboard */}
                    {!beatVideoSrc && imageSrc && (
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Img
                                src={imageSrc}
                                style={{
                                    maxWidth: '90%', maxHeight: '70%',
                                    objectFit: 'contain', borderRadius: 6,
                                    border: '2px solid rgba(255,255,250,0.1)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                }}
                            />
                        </div>
                    )}

                    {/* Chalk caption below media */}
                    <ChalkText
                        text={(activeVisualBeat?.display_text || activeSeg.text).slice(0, 80)}
                        startFrame={activeSeg.startFrame + 10}
                        charDelay={2}
                        drawDuration={8}
                        fontSize={Math.round(chalkSize * 0.5)}
                        color="#ccddcc"
                    />
                </div>
            )}

            {/* ── TEACH mode: chalk text ── */}
            {showText && activeSeg && (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', gap: 16,
                    opacity: transitionOpacity,
                }}>
                    <ChalkText
                        text={(activeVisualBeat?.display_text || activeSeg.text).slice(0, 120)}
                        startFrame={activeSeg.startFrame + 5}
                        charDelay={2}
                        drawDuration={10}
                        fontSize={Math.round(chalkSize * 0.6)}
                        color="#fffefa"
                    />

                    {/* Image alongside text if available */}
                    {activeVisualBeat?.image_id && (
                        <div style={{
                            opacity: interpolate(
                                frame,
                                [activeSeg.startFrame + 20, activeSeg.startFrame + 35],
                                [0, 1],
                                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                            ),
                            display: 'flex', justifyContent: 'center',
                        }}>
                            <Img
                                src={`${jobBasePath}/images/${activeVisualBeat.image_id}`}
                                style={{
                                    maxWidth: '80%', maxHeight: 200,
                                    objectFit: 'contain', borderRadius: 6,
                                    border: '2px solid rgba(255,255,250,0.1)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Default: when nothing is active */}
            {!activeSeg && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChalkText
                        text={section.title}
                        startFrame={0}
                        charDelay={4}
                        drawDuration={15}
                        fontSize={Math.round(chalkSize * 0.8)}
                        color="#aaddaa"
                    />
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// ── MEMORY / QUIZ ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const MemoryContent: React.FC<{
    section: Section; frame: number;
    segmentFrames: SegmentFrameRange[]; chalkSize: number;
}> = ({ section, frame, segmentFrames, chalkSize }) => {
    const cards = section.flashcards || [];
    const cardFrameRanges = cards.map((_, idx) => segmentFrames[idx + 1] || null);
    const activeCardIdx = cardFrameRanges.findIndex(
        range => range && frame >= range.startFrame && frame < range.endFrame,
    );

    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            padding: 16, overflow: 'hidden',
        }}>
            {/* Title */}
            <ChalkText
                text={section.title}
                startFrame={0}
                charDelay={3}
                drawDuration={12}
                fontSize={Math.round(chalkSize * 0.9)}
                color="#fffefa"
            />

            {/* Progress indicator */}
            <div style={{
                display: 'flex', gap: 8, marginTop: 12, marginBottom: 16,
            }}>
                {cards.map((_, idx) => (
                    <div key={idx} style={{
                        width: idx === activeCardIdx ? 28 : 12,
                        height: 4, borderRadius: 2,
                        backgroundColor: idx < activeCardIdx
                            ? 'rgba(170,221,170,0.6)'
                            : idx === activeCardIdx
                                ? 'rgba(255,254,250,0.8)'
                                : 'rgba(255,255,255,0.15)',
                    }} />
                ))}
            </div>

            {/* Active card */}
            {cards.map((card, idx) => {
                const range = cardFrameRanges[idx];
                if (!range || idx !== activeCardIdx) return null;

                // Flip timing
                const midFrame = range.startFrame + Math.floor(range.durationFrames * 0.45);
                const showAnswer = frame >= midFrame;

                const flipOpacity = interpolate(
                    frame,
                    [midFrame - 8, midFrame, midFrame + 8],
                    [1, 0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                );

                return (
                    <div key={idx} style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center',
                        gap: 20, opacity: flipOpacity,
                    }}>
                        {/* Label */}
                        <ChalkText
                            text={showAnswer ? 'Answer:' : `Question ${idx + 1}:`}
                            startFrame={showAnswer ? midFrame + 2 : range.startFrame}
                            charDelay={3}
                            drawDuration={10}
                            fontSize={Math.round(chalkSize * 0.6)}
                            color={showAnswer ? '#aaddaa' : '#FFD700'}
                        />

                        {/* Decorative line */}
                        <div style={{
                            width: 120, height: 1.5,
                            backgroundColor: 'rgba(255,255,250,0.15)',
                        }} />

                        {/* Card text */}
                        <ChalkText
                            text={(showAnswer ? card.back : card.front).slice(0, 100)}
                            startFrame={showAnswer ? midFrame + 8 : range.startFrame + 8}
                            charDelay={2}
                            drawDuration={10}
                            fontSize={Math.round(chalkSize * 0.55)}
                            color="#fffefa"
                            style={{ justifyContent: 'center', textAlign: 'center', maxWidth: '90%' }}
                        />
                    </div>
                );
            })}

            {/* No active card */}
            {activeCardIdx < 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChalkText
                        text="Flashcards"
                        startFrame={5}
                        charDelay={4}
                        drawDuration={12}
                        fontSize={chalkSize}
                        color="#aaddaa"
                    />
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// ── RECAP ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const RecapContent: React.FC<{
    section: Section; frame: number;
    segmentFrames: SegmentFrameRange[]; chalkSize: number;
    jobBasePath: string;
}> = ({ section, frame, segmentFrames, chalkSize, jobBasePath }) => {
    const activeSeg = segmentFrames.find(
        sf => frame >= sf.startFrame && frame < sf.endFrame,
    );
    const beatVideoFile = activeSeg?.beatVideos?.[0];
    const beatVideoSrc = beatVideoFile ? `${jobBasePath}/videos/${beatVideoFile}.mp4` : null;

    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            padding: 16, overflow: 'hidden',
        }}>
            {/* Title */}
            <ChalkText
                text={section.title}
                startFrame={0}
                charDelay={3}
                drawDuration={12}
                fontSize={Math.round(chalkSize * 0.9)}
                color="#fffefa"
            />
            <div style={{
                width: '60%', height: 1.5,
                backgroundColor: 'rgba(255,255,250,0.15)',
                marginTop: 8, marginBottom: 12,
            }} />

            {/* Video inside chalkboard */}
            {beatVideoSrc && (
                <div style={{
                    flex: 1, borderRadius: 8, overflow: 'hidden',
                    border: '2px solid rgba(255,255,250,0.1)',
                    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)',
                    position: 'relative',
                }}>
                    <Video
                        src={beatVideoSrc}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        startFrom={0}
                        volume={0}
                    />
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(26,77,50,0.08) 0%, rgba(26,77,50,0.04) 100%)',
                        pointerEvents: 'none',
                    }} />
                </div>
            )}

            {/* Chalk subtitle */}
            {activeSeg && (
                <div style={{ marginTop: 12 }}>
                    <ChalkText
                        text={activeSeg.text.slice(0, 90)}
                        startFrame={activeSeg.startFrame + 5}
                        charDelay={2}
                        drawDuration={8}
                        fontSize={Math.round(chalkSize * 0.45)}
                        color="#ccddcc"
                    />
                </div>
            )}

            {/* Fallback when no video */}
            {!beatVideoSrc && !activeSeg && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChalkText
                        text="Lesson Recap"
                        startFrame={5}
                        charDelay={5}
                        drawDuration={15}
                        fontSize={chalkSize}
                        color="#aaddaa"
                    />
                </div>
            )}
        </div>
    );
};
