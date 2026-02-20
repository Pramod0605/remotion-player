import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Circle } from '@remotion/shapes';

export const compositionConfig = {
    id: 'ArithmeticProgression',
    durationInFrames: 300,
    fps: 30,
    width: 1080,
    height: 1920,
};

const Student = ({ height, index }: { height: number, index: number }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        frame: frame - index * 10,
        fps,
        config: { damping: 20 }
    });

    return (
        <div style={{
            position: 'absolute',
            bottom: 200,
            left: index * 120 + 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${scale})`,
        }}>
            <div style={{
                fontSize: 40,
                color: '#2563eb',
                marginBottom: 10,
                fontWeight: 'bold'
            }}>
                {height}
            </div>
            {/* Head */}
            <Circle
                radius={30}
                fill="#fcd34d"
                stroke="#d97706"
                strokeWidth={2}
                style={{ marginBottom: -10 }}
            />
            {/* Body */}

            <div style={{
                width: 80,
                height: 300 + (height - 147) * 20,
                backgroundColor: '#3b82f6',
                borderRadius: '40px 40px 0 0',
                border: '2px solid #1d4ed8'
            }} />
        </div>
    );
};

const ArithmeticProgressionVideo = () => {
    const frame = useCurrentFrame();

    const students = [147, 148, 149, 150, 151, 152, 153, 154, 155];

    // Camera pan logic
    const panX = interpolate(
        frame,
        [0, 300],
        [0, -800],
        { extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(to bottom, #7dd3fc, #0ea5e9)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Sun */}
            <div style={{
                position: 'absolute',
                top: 50,
                right: 50,
                width: 150,
                height: 150,
                background: 'radial-gradient(circle, #fef08a, #facc15)',
                borderRadius: '50%',
                boxShadow: '0 0 50px #facc15'
            }} />

            <h1 style={{
                textAlign: 'center',
                marginTop: 100,
                fontSize: 80,
                color: 'white',
                textShadow: '0 4px 10px rgba(0,0,0,0.2)',
                zIndex: 10
            }}>
                Morning Assembly Queue
            </h1>

            <div style={{
                position: 'relative',
                height: '100%',
                transform: `translateX(${panX}px)`,
                transition: 'transform 0.1s linear'
            }}>
                {students.map((height, i) => (
                    <Student key={i} index={i} height={height} />
                ))}
            </div>

            {/* School Ground */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                width: '200%', // Wide for panning
                height: 250,
                backgroundColor: '#166534',
                borderTop: '10px solid #15803d'
            }} />
        </AbsoluteFill>
    );
};

export default ArithmeticProgressionVideo;