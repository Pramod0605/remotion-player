import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, spring } from 'remotion';

export const compositionConfig = {
    id: 'MathVisualization',
    durationInFrames: 2223, // 74.1 seconds at 30fps
    fps: 30,
    width: 1080,
    height: 1920,
};

const SpiralSegment: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Create array of 13 semicircle configs
    const semicircles = Array.from({ length: 13 }, (_, i) => ({
        radius: 100 * (i + 1),
        center: i % 2 === 0 ? [-200, 0] : [200, 0],
        startAngle: i % 2 === 0 ? 0 : Math.PI,
        progress: spring({
            frame: frame - (i * 15),
            fps,
            config: { damping: 50 }
        })
    }));

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#111',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {/* Coordinate System */}
            <svg width="1000" height="1000" style={{ overflow: 'visible' }}>
                {/* X and Y axes */}
                <line
                    x1="-400"
                    y1="0"
                    x2="400"
                    y2="0"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={2}
                />
                <line
                    x1="0"
                    y1="-400"
                    x2="0"
                    y2="400"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={2}
                />

                {/* Points A and B */}
                <circle
                    cx={-200}
                    cy={0}
                    r={10}
                    fill="#ef4444"
                />
                <circle
                    cx={200}
                    cy={0}
                    r={10}
                    fill="#3b82f6"
                />

                {/* Labels */}
                <text
                    x={-200}
                    y={40}
                    fill="white"
                    fontSize={24}
                    textAnchor="middle"
                >
                    A
                </text>
                <text
                    x={200}
                    y={40}
                    fill="white"
                    fontSize={24}
                    textAnchor="middle"
                >
                    B
                </text>

                {/* Semicircles */}
                {semicircles.map((config, i) => {
                    const endAngle = config.startAngle + (Math.PI * config.progress);

                    const x1 = config.center[0] + config.radius * Math.cos(config.startAngle);
                    const y1 = config.center[1] + config.radius * Math.sin(config.startAngle);
                    const x2 = config.center[0] + config.radius * Math.cos(endAngle);
                    const y2 = config.center[1] + config.radius * Math.sin(endAngle);
                    // For a proper spiral, we need to carefully define the arc
                    // A radius radius arc from (x1,y1) to (x2,y2)

                    const d = `M ${x1} ${y1} A ${config.radius} ${config.radius} 0 0 1 ${x2} ${y2}`;

                    return (
                        <path
                            key={i}
                            d={d}
                            stroke="#facc15"
                            strokeWidth={4}
                            fill="none"
                        />
                    );
                })}
            </svg>

            {/* Formula */}
            <div style={{
                position: 'absolute',
                top: 100,
                fontFamily: 'serif',
                fontSize: 48,
                color: 'white',
                opacity: spring({ frame: frame - 450, fps })
            }}>
                Lengths: π/2, π, 3π/2, ...
            </div>
        </AbsoluteFill>
    );
};

const LogStackSegment: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Generate 20 rows of decreasing width
    const rows = Array.from({ length: 20 }, (_, i) => ({
        count: 20 - i,
        y: i * 35,
        progress: spring({
            frame: frame - (i * 5),
            fps,
            config: { damping: 50 }
        })
    }));

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#111',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <div style={{ transform: 'translateY(200px)' }}>
                {rows.map((row, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 5,
                            transform: `translateY(${row.y}px) scale(${row.progress})`,
                            opacity: row.progress
                        }}
                    >
                        {Array.from({ length: row.count }).map((_, j) => (
                            <div
                                key={j}
                                style={{
                                    width: 30,
                                    height: 20,
                                    backgroundColor: '#92400e',
                                    borderRadius: 2
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Formula */}
            <div style={{
                position: 'absolute',
                top: 100,
                fontFamily: 'serif',
                fontSize: 48,
                color: 'white',
                opacity: spring({ frame: frame - 360, fps })
            }}>
                a=20, d=-1
            </div>
        </AbsoluteFill>
    );
};

const PotatoRaceSegment: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const potatoes = Array.from({ length: 10 }, (_, i) => ({
        x: -300 + (i * 60),
        y: -50
    }));

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#111',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <svg width="1000" height="400" style={{ overflow: 'visible' }}>
                {/* Track */}
                <line
                    x1="-400"
                    y1="0"
                    x2="400"
                    y2="0"
                    stroke="white"
                    strokeWidth={4}
                />

                {/* Bucket */}
                <rect
                    x={-425}
                    y={-25}
                    width={50}
                    height={50}
                    fill="#3b82f6"
                />

                {/* Potatoes */}
                {potatoes.map((potato, i) => (
                    <circle
                        key={i}
                        cx={potato.x}
                        cy={potato.y}
                        r={10}
                        fill="#92400e"
                    />
                ))}

                {/* Paths */}
                {potatoes.map((potato, i) => {
                    const pathProgress = spring({
                        frame: frame - (i * 30),
                        fps,
                        config: { damping: 50 }
                    });

                    return (
                        <g key={i}>
                            <line
                                x1="-400"
                                y1="0"
                                x2={potato.x}
                                y2={potato.y}
                                stroke="#ef4444"
                                strokeWidth={2}
                                opacity={pathProgress * 0.5}
                            />
                            <line
                                x1={potato.x}
                                y1={potato.y}
                                x2="-400"
                                y2="0"
                                stroke="#ef4444"
                                strokeWidth={2}
                                opacity={pathProgress * 0.5}
                                strokeDasharray="5,5"
                            />
                        </g>
                    );
                })}
            </svg>
        </AbsoluteFill>
    );
};

const MyVideo: React.FC = () => {
    return (
        <Series>
            <Series.Sequence durationInFrames={897}>
                <SpiralSegment />
            </Series.Sequence>
            <Series.Sequence durationInFrames={642}>
                <LogStackSegment />
            </Series.Sequence>
            <Series.Sequence durationInFrames={684}>
                <PotatoRaceSegment />
            </Series.Sequence>
        </Series>
    );
};

export default MyVideo;