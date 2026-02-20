import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const compositionConfig = {
    id: 'ArithmeticProgression',
    durationInSeconds: 54,
    fps: 30,
    width: 1080,
    height: 1920,
};

const Title: React.FC = () => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
    const y = interpolate(frame, [0, 30], [-50, 0], { extrapolateRight: 'clamp' });

    return (
        <h1 style={{
            fontSize: 80,
            fontFamily: 'Arial',
            color: 'white',
            textAlign: 'center',
            opacity,
            transform: `translateY(${y}px)`,
            margin: 0,
            padding: '40px 20px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        }}>
            Finding the 10th Term of an AP
        </h1>
    );
};

const SequenceDisplay: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = spring({
        frame: frame - 60,
        fps,
        config: { damping: 200 }
    });

    const scale = spring({
        frame: frame - 60,
        fps,
        config: { damping: 200 }
    });

    return (
        <div style={{
            fontSize: 100,
            fontFamily: 'Arial',
            color: 'white',
            opacity,
            transform: `scale(${scale})`,
            textAlign: 'center',
            marginTop: 40
        }}>
            2, 7, 12, ...
        </div>
    );
};

const Variables: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const aOpacity = spring({
        frame: frame - 120,
        fps,
        config: { damping: 200 }
    });

    const dOpacity = spring({
        frame: frame - 470,
        fps,
        config: { damping: 200 }
    });

    const nOpacity = spring({
        frame: frame - 120,
        fps,
        config: { damping: 200 }
    });

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            marginTop: 40,
            fontSize: 70
        }}>
            <span style={{ color: '#60a5fa', opacity: aOpacity }}>a = 2</span>
            <span style={{ color: '#ef4444', opacity: dOpacity }}>d = 5</span>
            <span style={{ color: '#4ade80', opacity: nOpacity }}>n = 10</span>
        </div>
    );
};

const DifferenceCalculation: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = spring({
        frame,
        fps,
        config: { damping: 200 }
    });

    return (
        <div style={{
            fontSize: 80,
            color: '#ef4444',
            textAlign: 'center',
            marginTop: 40,
            opacity
        }}>
            d = 7 - 2 = 5
        </div>
    );
};

const Formula: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = spring({
        frame,
        fps,
        config: { damping: 200 }
    });

    const finalScale = spring({
        frame: frame - 120,
        fps,
        config: { damping: 200 }
    });

    return (
        <div style={{
            fontSize: 90,
            color: '#facc15',
            textAlign: 'center',
            marginTop: 60,
            transform: `scale(${1 + finalScale * 0.2})`,
            opacity: progress
        }}>
            a₁₀ = 2 + (10 - 1) × 5 = 47
        </div>
    );
};

const MyVideo: React.FC = () => {
    const frame = useCurrentFrame();

    // Animated background
    const bgAngle = interpolate(frame, [0, compositionConfig.durationInSeconds * 30], [45, 225]);

    return (
        <AbsoluteFill style={{
            background: `linear-gradient(${bgAngle}deg, #0f2027, #203a43, #2c5364)`,
            padding: 40
        }}>
            <Series>
                {/* Segment 1: 0-15.7s */}
                <Series.Sequence durationInFrames={471}>
                    <Title />
                    <SequenceDisplay />
                    <Variables />
                </Series.Sequence>

                {/* Segment 2: 15.7-31.5s */}
                <Series.Sequence durationInFrames={474}>
                    <Title />
                    <SequenceDisplay />
                    <Variables />
                    <DifferenceCalculation />
                </Series.Sequence>

                {/* Segment 3: 31.5-53.8s */}
                <Series.Sequence durationInFrames={669}>
                    <Title />
                    <SequenceDisplay />
                    <Variables />
                    <DifferenceCalculation />
                    <Formula />
                </Series.Sequence>
            </Series>
        </AbsoluteFill>
    );
};

export default MyVideo;
