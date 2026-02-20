import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame, spring, interpolate, interpolateColors } from 'remotion';

export const compositionConfig = {
	id: 'APSummation',
	durationInSeconds: 58,
	fps: 30,
	width: 1080,
	height: 1920,
};

const Title: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
	const y = interpolate(frame, [0, 30], [-50, 0], { extrapolateRight: 'clamp' });

	return (
		<h1
			style={{
				fontSize: 80,
				fontFamily: 'Arial',
				color: 'white',
				textAlign: 'center',
				opacity,
				transform: `translateY(${y}px)`,
				marginTop: 100,
			}}
		>
			Sum of First 22 Terms of an AP
		</h1>
	);
};

const MathExpression: React.FC<{ children: React.ReactNode, delay?: number, color?: string, size?: number }> = ({ children, delay = 0, color = 'white', size = 64 }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame - delay,
		[0, 20],
		[0, 1],
		{ extrapolateRight: 'clamp' }
	);
	const y = interpolate(
		frame - delay,
		[0, 20],
		[30, 0],
		{ extrapolateRight: 'clamp' }
	);

	return (
		<div
			style={{
				fontSize: size,
				fontFamily: 'Arial',
				color,
				opacity,
				transform: `translateY(${y}px)`,
				marginBottom: 40,
				fontWeight: 'bold',
			}}
		>
			{children}
		</div>
	);
};

const Segment1: React.FC = () => {
	const frame = useCurrentFrame();
	const highlight = interpolate(
		frame - 120,
		[0, 15],
		[0, 1],
		{ extrapolateRight: 'clamp' }
	);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'flex-start',
				alignItems: 'center',
				background: 'linear-gradient(180deg, #1a365d 0%, #0f172a 100%)',
				padding: 40,
			}}
		>
			<Title />
			<div style={{ marginTop: 100 }}>
				<MathExpression delay={60}>8, 3, -2, ...</MathExpression>
				<MathExpression
					delay={120}
					color={interpolateColors(highlight, [0, 1], ['white', '#facc15'])}
				>
					a = 8
				</MathExpression>
			</div>
		</AbsoluteFill>
	);
};

const Segment2: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				background: 'linear-gradient(180deg, #1a365d 0%, #0f172a 100%)',
			}}
		>
			<MathExpression>d = 3 - 8 = -5</MathExpression>
			<MathExpression delay={60}>n = 22</MathExpression>
			<MathExpression delay={120} size={56}>
				Sₙ = n/2[2a + (n-1)d]
			</MathExpression>
		</AbsoluteFill>
	);
};

const Segment3: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				background: 'linear-gradient(180deg, #1a365d 0%, #0f172a 100%)',
			}}
		>
			<MathExpression size={56}>
				S₂₂ = 22/2[2(8) + (22-1)(-5)]
			</MathExpression>
			<MathExpression delay={60} size={56}>
				= 11[16 + 21(-5)]
			</MathExpression>
			<MathExpression delay={120} size={56}>
				= 11[16 - 105]
			</MathExpression>
		</AbsoluteFill>
	);
};

const Segment4: React.FC = () => {
	const frame = useCurrentFrame();
	const boxScale = spring({
		frame: frame - 30,
		fps: 30,
		config: {
			damping: 12,
		},
	});

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				background: 'linear-gradient(180deg, #1a365d 0%, #0f172a 100%)',
			}}
		>
			<div
				style={{
					position: 'relative',
					padding: '40px 80px',
					transform: `scale(${boxScale})`,
				}}
			>
				<MathExpression color="#facc15" size={72}>
					= 11(-89) = -979
				</MathExpression>
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						border: '4px solid #facc15',
						borderRadius: 20,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

const MyVideo: React.FC = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={180}>
				<Segment1 />
			</Series.Sequence>
			<Series.Sequence durationInFrames={150}>
				<Segment2 />
			</Series.Sequence>
			<Series.Sequence durationInFrames={150}>
				<Segment3 />
			</Series.Sequence>
			<Series.Sequence durationInFrames={90}>
				<Segment4 />
			</Series.Sequence>
		</Series>
	);
};

export default MyVideo;