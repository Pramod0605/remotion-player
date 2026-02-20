import { AbsoluteFill, Series, useCurrentFrame, spring, interpolate } from 'remotion';

export const compositionConfig = {
    id: 'APTermExplanation',
    durationInFrames: 2100, // 70 seconds at 30fps
    fps: 30,
    width: 1080,
    height: 1920,
};

const Title = () => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
    const y = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: 'clamp' });

    return (
        <h1 style={{
            fontSize: 80,
            fontFamily: 'Arial',
            color: 'white',
            opacity,
            transform: `translateY(${y}px)`,
            textAlign: 'center',
            marginTop: 100
        }}>
            Finding the nth Term of an AP
        </h1>
    );
};

const Question = () => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' });
    const y = interpolate(frame, [30, 60], [50, 0], { extrapolateRight: 'clamp' });

    return (
        <h2 style={{
            fontSize: 64,
            fontFamily: 'Arial',
            color: '#e2e8f0',
            opacity,
            transform: `translateY(${y}px)`,
            textAlign: 'center',
            maxWidth: '80%',
            margin: '40px auto'
        }}>
            How to find the 50th term without listing all numbers?
        </h2>
    );
};

const Dots = () => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 80,
            opacity,
            fontSize: 120,
            color: 'white',
            marginTop: 60
        }}>
            <span>...</span>
            <span>...</span>
            <span>...</span>
        </div>
    );
};

const QuestionMark = () => {
    const frame = useCurrentFrame();
    const scale = spring({
        frame: frame - 90,
        fps: 30,
        config: {
            damping: 12,
            stiffness: 200,
        }
    });

    return (
        <div style={{
            fontSize: 144,
            color: '#facc15',
            transform: `scale(${scale})`,
            textAlign: 'center',
            marginTop: -60
        }}>
            ?
        </div>
    );
};

const Formula = () => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
    const y = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            fontSize: 96,
            fontFamily: 'serif',
            color: 'white',
            opacity,
            transform: `translateY(${y}px)`,
            textAlign: 'center',
            marginTop: 80
        }}>
            a<sub>n</sub> = a + (n-1)d
        </div>
    );
};

const Label = ({ text, delay }: { text: string, delay: number }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [delay, delay + 30], [0, 1], { extrapolateRight: 'clamp' });
    const x = interpolate(frame, [delay, delay + 30], [-50, 0], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            fontSize: 64,
            color: '#e2e8f0',
            opacity,
            transform: `translateX(${x}px)`,
            marginTop: 20
        }}>
            {text}
        </div>
    );
};

const JumpExplanation = () => {
    const frame = useCurrentFrame();
    const progress = spring({
        frame,
        fps: 30,
        config: {
            damping: 20,
            stiffness: 200,
        }
    });

    const arrowWidth = interpolate(progress, [0, 1], [0, 600]);

    return (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
            <svg width="600" height="100" style={{ margin: '0 auto' }}>
                <line
                    x1={300 - arrowWidth / 2}
                    y1={50}
                    x2={300 + arrowWidth / 2}
                    y2={50}
                    stroke="#facc15"
                    strokeWidth={4}
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
                            fill="#facc15"
                        />
                    </marker>
                </defs>
            </svg>
            <div style={{
                color: '#facc15',
                fontSize: 48,
                opacity: progress,
                marginTop: 20
            }}>
                (n-1) jumps of size d
            </div>
        </div>
    );
};

const LastFormula = () => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
    const y = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            fontSize: 96,
            fontFamily: 'serif',
            color: 'white',
            opacity,
            transform: `translateY(${y}px)`,
            textAlign: 'center',
            marginTop: 80
        }}>
            a<sub>n</sub> = l - (n-1)d
        </div>
    );
};

const MyVideo = () => {
    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)',
            padding: 40
        }}>
            <Series>
                {/* Segment 1: 0-14.7s (441 frames) */}
                <Series.Sequence durationInFrames={441}>
                    <Title />
                    <Question />
                    <Dots />
                    <QuestionMark />
                </Series.Sequence>

                {/* Segment 2: 14.7-39.6s (747 frames) */}
                <Series.Sequence durationInFrames={747}>
                    <Formula />
                    <div style={{ marginTop: 80, paddingLeft: 200 }}>
                        <Label text="a: first term" delay={0} />
                        <Label text="d: common difference" delay={60} />
                        <Label text="n: position of term" delay={120} />
                    </div>
                </Series.Sequence>

                {/* Segment 3: 39.6-53.3s (411 frames) */}
                <Series.Sequence durationInFrames={411}>
                    <JumpExplanation />
                </Series.Sequence>

                {/* Segment 4: 53.3-69.6s (486 frames) */}
                <Series.Sequence durationInFrames={486}>
                    <LastFormula />
                    <Label text="l: last term" delay={0} />
                </Series.Sequence>
            </Series>
        </AbsoluteFill>
    );
};

export default MyVideo;