import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame, spring, interpolate } from 'remotion';

export const compositionConfig = {
    id: 'APSumExplanation',
    durationInFrames: 2286, // 76.2 seconds at 30fps
    fps: 30,
    width: 1080,
    height: 1920,
};

const AnimatedText: React.FC<{ children: React.ReactNode, size?: number, delay?: number }> = ({ children, size = 80, delay = 0 }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const y = interpolate(frame - delay, [0, 15], [50, 0], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            fontSize: size,
            fontFamily: 'Arial',
            color: 'white',
            opacity,
            transform: `translateY(${y}px)`,
            textAlign: 'center',
        }}>
            {children}
        </div>
    );
};

const APTerms: React.FC<{ startDelay?: number }> = ({ startDelay = 0 }) => {
    const frame = useCurrentFrame();
    const terms = [1, 4, 7, 10, 13, 16];

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
            {terms.map((term, i) => {
                const delay = startDelay + i * 10;
                const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
                const scale = spring({
                    frame: frame - delay,
                    fps: 30,
                    config: {
                        damping: 12,
                    }
                });

                return (
                    <React.Fragment key={i}>
                        <span style={{
                            fontSize: 60,
                            color: '#4ade80',
                            opacity,
                            transform: `scale(${scale})`,
                        }}>
                            {term}
                        </span>
                        {i < terms.length - 1 && (
                            <span style={{
                                fontSize: 60,
                                color: 'white',
                                opacity: interpolate(frame - (delay + 5), [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
                            }}>
                                +
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
            <span style={{
                fontSize: 60,
                color: 'white',
                opacity: interpolate(frame - (startDelay + 60), [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
            }}>
                ...
            </span>
        </div>
    );
};

const Formula: React.FC<{ formula: string, delay?: number, scale?: number }> = ({ formula, delay = 0, scale = 1 }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const y = interpolate(frame - delay, [0, 20], [30, 0], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            fontSize: 80 * scale,
            fontFamily: 'serif',
            color: '#60a5fa',
            opacity,
            transform: `translateY(${y}px)`,
            textAlign: 'center',
        }}>
            {formula}
        </div>
    );
};

const Label: React.FC<{ children: React.ReactNode, delay?: number }> = ({ children, delay = 0 }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const x = interpolate(frame - delay, [0, 15], [-30, 0], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            fontSize: 40,
            color: '#94a3b8',
            opacity,
            transform: `translateX(${x}px)`,
            marginBottom: 15,
        }}>
            {children}
        </div>
    );
};

const Arrow: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
    const frame = useCurrentFrame();
    const progress = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <svg width="100" height="100" style={{ opacity: progress }}>
            <line
                x1="50"
                y1="0"
                x2="50"
                y2={100 * progress}
                stroke="#94a3b8"
                strokeWidth="4"
                markerEnd="url(#arrowhead)"
            />
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#94a3b8"
                    />
                </marker>
            </defs>
        </svg>
    );
};

const MyVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const angle = interpolate(frame, [0, compositionConfig.durationInFrames], [0, 360]);

    return (
        <AbsoluteFill style={{
            background: `linear-gradient(${angle}deg, #0f172a, #1e293b)`,
            padding: 40,
        }}>
            <Series>
                {/* Segment 1 */}
                <Series.Sequence durationInFrames={702}>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 40 }}>
                        <AnimatedText>Sum of First n Terms of an AP</AnimatedText>
                        <AnimatedText size={60} delay={90}>How do we add these numbers?</AnimatedText>
                        <div style={{ marginTop: 40 }}>
                            <APTerms startDelay={150} />
                        </div>
                    </div>
                </Series.Sequence>

                {/* Segment 2 */}
                <Series.Sequence durationInFrames={531}>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 60, alignItems: 'center' }}>
                        <Formula formula="Sn = n/2[2a + (n-1)d]" />
                        <div>
                            <Label delay={90}>n = number of terms</Label>
                            <Label delay={120}>a = first term</Label>
                            <Label delay={150}>d = common difference</Label>
                        </div>
                    </div>
                </Series.Sequence>

                {/* Segment 3 */}
                <Series.Sequence durationInFrames={609}>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 60, alignItems: 'center' }}>
                        <Formula formula="Sn = n/2(a + l)" />
                        <Label delay={90}>l = last term</Label>
                    </div>
                </Series.Sequence>

                {/* Segment 4 */}
                <Series.Sequence durationInFrames={444}>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center' }}>
                        <Formula formula="Sn = n/2[2a + (n-1)d]" />
                        <Arrow delay={90} />
                        <Formula formula="Sn = n/2(a + l)" delay={90} />
                        <Label delay={120}>Simplified form</Label>
                    </div>
                </Series.Sequence>
            </Series>
        </AbsoluteFill>
    );
};

export default MyVideo;
