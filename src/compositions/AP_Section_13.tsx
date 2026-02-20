import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Circle, Rect } from '@remotion/shapes';

export const compositionConfig = {
    id: 'PriyasStory',
    durationInFrames: 1800, // 60 seconds
    fps: 30,
    width: 1080,
    height: 1920,
};

const Scene1: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const bookStacks = [
        { height: 10, color: '#f97316' },
        { height: 8, color: '#fb923c' },
        { height: 6, color: '#fdba74' }
    ];

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(to bottom, #7c2d12, #431407)',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <div style={{
                display: 'flex',
                gap: 100,
                alignItems: 'flex-end'
            }}>
                {bookStacks.map((stack, i) => {
                    const delay = i * 10;
                    const rise = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 100 }
                    });

                    return (
                        <div key={i} style={{ position: 'relative' }}>
                            {/* Stack of books */}
                            {Array.from({ length: stack.height }).map((_, j) => {
                                const bookDelay = delay + j * 5;
                                const bookSpring = spring({
                                    frame: frame - bookDelay,
                                    fps,
                                    config: { damping: 200 }
                                });

                                return (
                                    <Rect
                                        key={j}
                                        x={0}
                                        y={-j * 40 * rise}
                                        width={200}
                                        height={35}
                                        fill={stack.color}
                                        opacity={bookSpring}
                                    />
                                );
                            })}

                            {/* Floating number */}
                            <h1 style={{
                                position: 'absolute',
                                top: -stack.height * 40 * rise - 80,
                                width: '100%',
                                textAlign: 'center',
                                color: 'white',
                                fontSize: 80,
                                opacity: rise,
                                transform: `translateY(${(1 - rise) * 50}px)`
                            }}>
                                {stack.height}
                            </h1>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};

const Scene2 = () => {
    const frame = useCurrentFrame();

    const days = [
        { day: 1, time: '10:00' },
        { day: 2, time: '15:00' },
        { day: 3, time: '20:00' }
    ];

    const progress = interpolate(frame, [0, 360], [0, 1], {
        extrapolateRight: 'clamp'
    });

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(to bottom, #fde047, #facc15)',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {days.map((day, i) => {
                const delay = i * 120;
                const visible = frame > delay && frame < delay + 120;
                const opacity = visible ? 1 : 0;

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            opacity,
                            transition: 'opacity 0.5s'
                        }}
                    >
                        <h2 style={{
                            color: '#1e293b',
                            fontSize: 100,
                            textAlign: 'center'
                        }}>
                            Day {day.day}
                        </h2>
                        <h1 style={{
                            color: '#1e293b',
                            fontSize: 150,
                            textAlign: 'center'
                        }}>
                            {day.time}
                        </h1>
                    </div>
                );
            })}

            {/* Progress bar */}
            <Rect
                x={200}
                y={1600}
                width={680 * progress}
                height={20}
                fill="#1e293b"
            />
        </AbsoluteFill>
    );
};

const Scene3 = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const stacks = [5, 10, 15];

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(to bottom, #e2e8f0, #cbd5e1)',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <div style={{
                display: 'flex',
                gap: 150,
                alignItems: 'flex-end'
            }}>
                {stacks.map((count: number, i: number) => {

                    const delay = i * 15;
                    const stackSpring = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 100 }
                    });

                    return (
                        <div key={i} style={{ position: 'relative' }}>
                            {Array.from({ length: count }).map((_, j) => {
                                const cupDelay = delay + j * 3;
                                const cupSpring = spring({
                                    frame: frame - cupDelay,
                                    fps,
                                    config: { damping: 200 }
                                });

                                return (
                                    <Circle
                                        key={j}
                                        x={0}
                                        y={-j * 30 * stackSpring}
                                        radius={50}
                                        fill="#ffffff"
                                        opacity={cupSpring}
                                    />

                                );
                            })}

                            <h1 style={{
                                position: 'absolute',
                                top: -count * 30 * stackSpring - 60,
                                width: '100%',
                                textAlign: 'center',
                                color: '#1e293b',
                                fontSize: 80,
                                opacity: stackSpring
                            }}>
                                {count}
                            </h1>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};

const Scene4 = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const floors = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {floors.map((floor, i) => {
                const delay = i * 10;
                const floorSpring = spring({
                    frame: frame - delay,
                    fps,
                    config: { damping: 200 }
                });

                return (
                    <Rect
                        key={i}
                        x={300}
                        y={1600 - (i * 150)}
                        width={480}
                        height={120}
                        fill="#475569"
                        opacity={floorSpring}
                    >
                        <h1 style={{
                            color: '#f8fafc',
                            fontSize: 60,
                            textAlign: 'center',
                            opacity: floorSpring
                        }}>
                            Floor {floor}
                        </h1>
                    </Rect>
                );
            })}
        </AbsoluteFill>
    );
};

const Scene5 = () => {
    const frame = useCurrentFrame();
    const weeks = [
        { week: 1, amount: 500 },
        { week: 2, amount: 600 },
        { week: 3, amount: 700 }
    ];

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(to bottom, #fef3c7, #fde68a)',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {weeks.map((week, i) => {
                const delay = i * 120;
                const visible = frame > delay && frame < delay + 120;
                const opacity = visible ? 1 : 0;

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            opacity,
                            transition: 'opacity 0.5s'
                        }}
                    >
                        <h2 style={{
                            color: '#78350f',
                            fontSize: 80,
                            textAlign: 'center'
                        }}>
                            Week {week.week}
                        </h2>
                        <h1 style={{
                            color: '#92400e',
                            fontSize: 120,
                            textAlign: 'center'
                        }}>
                            ₹{week.amount}
                        </h1>
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};

const MyVideo = () => {
    return (
        <Series>
            <Series.Sequence durationInFrames={360}>
                <Scene1 />
            </Series.Sequence>
            <Series.Sequence durationInFrames={360}>
                <Scene2 />
            </Series.Sequence>
            <Series.Sequence durationInFrames={360}>
                <Scene3 />
            </Series.Sequence>
            <Series.Sequence durationInFrames={360}>
                <Scene4 />
            </Series.Sequence>
            <Series.Sequence durationInFrames={360}>
                <Scene5 />
            </Series.Sequence>
        </Series>
    );
};

export default MyVideo;