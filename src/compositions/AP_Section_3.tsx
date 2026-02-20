import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const compositionConfig = {
    id: 'ArithmeticProgression',
    durationInSeconds: 74.1,
    fps: 30,
    width: 1080,
    height: 1920,
};

const AnimatedText: React.FC<{ children: React.ReactNode, delay?: number, fontSize?: number, color?: string }> = ({ children, delay = 0, fontSize = 80, color = 'white' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = spring({
        frame: frame - delay,
        fps,
        config: {
            damping: 200,
        }
    });

    const y = interpolate(opacity, [0, 1], [50, 0]);

    return (
        <div style={{
            fontSize,
            fontFamily: 'Arial, sans-serif',
            color,
            opacity,
            transform: `translateY(${y}px)`,
            textAlign: 'center'
        }}>
            {children}
        </div>
    );
};

const MathExpression: React.FC<{ children: React.ReactNode, delay?: number, color?: string, scale?: number }> = ({ children, delay = 0, color = 'white', scale = 1 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = spring({
        frame: frame - delay,
        fps,
        config: {
            damping: 200,
        }
    });

    return (
        <div style={{
            fontSize: 80 * scale,
            fontFamily: 'serif',
            color,
            opacity,
            textAlign: 'center',
            margin: '20px 0'
        }}>
            {children}
        </div>
    );
};


const Segment1 = () => {
    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(to bottom, #1a2a6c, #b21f1f, #fdbb2d)',
            padding: 40,
            justifyContent: 'flex-start',
            alignItems: 'center'
        }}>
            <AnimatedText fontSize={100}>Arithmetic Progression (AP)</AnimatedText>
            <AnimatedText delay={60} fontSize={60}>
                A sequence where each term is obtained by
            </AnimatedText>
            <AnimatedText delay={120} fontSize={60}>
                adding a fixed number to the previous term
            </AnimatedText>
            <MathExpression delay={180} scale={1.2}>
                2, 5, 8, 11, 14, ...
            </MathExpression>
        </AbsoluteFill>
    );
};

const Segment2 = () => {
    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(to bottom, #1a2a6c, #b21f1f, #fdbb2d)',
            padding: 40,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <AnimatedText fontSize={70} color="#ffd700">Common Difference (d)</AnimatedText>
            <MathExpression delay={60} color="#ffd700">
                d = aₙ₊₁ - aₙ
            </MathExpression>

            <div style={{ marginTop: 40 }}>
                <MathExpression delay={120} color="#4ade80">
                    2, 5, 8, 11, 14, ... d = +3
                </MathExpression>
                <MathExpression delay={180} color="#ef4444">
                    10, 7, 4, 1, -2, ... d = -3
                </MathExpression>
                <MathExpression delay={240} color="#60a5fa">
                    4, 4, 4, 4, 4, ... d = 0
                </MathExpression>
            </div>
        </AbsoluteFill>
    );
};

const Segment3 = () => {
    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(to bottom, #1a2a6c, #b21f1f, #fdbb2d)',
            padding: 40,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <MathExpression delay={0}>
                a
            </MathExpression>
            <MathExpression delay={60}>
                a + d
            </MathExpression>
            <MathExpression delay={120}>
                a + 2d
            </MathExpression>
            <MathExpression delay={180}>
                a + 3d
            </MathExpression>
            <MathExpression delay={240}>
                a + 4d, ...
            </MathExpression>
        </AbsoluteFill>
    );
};

const Segment4 = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const boxProgress = spring({
        frame: frame - 90,
        fps,
        config: {
            damping: 200,
        }
    });

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(to bottom, #1a2a6c, #b21f1f, #fdbb2d)',
            padding: 40,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{ position: 'relative' }}>
                <MathExpression>
                    d = (a+d) - a
                </MathExpression>
                <MathExpression delay={30}>
                    or
                </MathExpression>
                <MathExpression delay={60}>
                    d = (a+2d) - (a+d)
                </MathExpression>

                <div style={{
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    right: -20,
                    bottom: -20,
                    border: '4px solid #ffd700',
                    borderRadius: 10,
                    opacity: boxProgress,
                    transform: `scale(${boxProgress})`
                }} />
            </div>
        </AbsoluteFill>
    );
};

const MyVideo = () => {
    return (
        <AbsoluteFill>
            <Series>
                <Series.Sequence durationInFrames={504}>
                    <Segment1 />
                </Series.Sequence>
                <Series.Sequence durationInFrames={684}>
                    <Segment2 />
                </Series.Sequence>
                <Series.Sequence durationInFrames={579}>
                    <Segment3 />
                </Series.Sequence>
                <Series.Sequence durationInFrames={456}>
                    <Segment4 />
                </Series.Sequence>
            </Series>
        </AbsoluteFill>
    );
};

export default MyVideo;