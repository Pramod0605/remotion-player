/**
 * DevPanel — Floating configuration panel for tuning text animations,
 * avatar positioning, and font settings in real-time.
 * Toggle with the ⚙️ button or pressing "D" key.
 */
import React, { useState, useEffect } from 'react';
import {
    useDevConfig,
    TEXT_ANIMATION_LABELS,
    type TextAnimationMode,
} from './DevConfig';

export const DevPanel: React.FC = () => {
    const { settings, updateSetting, resetSettings } = useDevConfig();
    const [isOpen, setIsOpen] = useState(settings.devMode);
    const [saved, setSaved] = useState(false);

    // "D" key toggle
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Sync devMode
    useEffect(() => {
        updateSetting('devMode', isOpen);
    }, [isOpen, updateSetting]);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const allModes = Object.keys(TEXT_ANIMATION_LABELS) as TextAnimationMode[];

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                style={{
                    position: 'fixed', top: 12, right: 12, zIndex: 9999,
                    width: 36, height: 36, borderRadius: 8,
                    border: '1px solid rgba(108, 99, 255, 0.3)',
                    backgroundColor: isOpen ? '#6c63ff' : 'rgba(22, 27, 34, 0.9)',
                    color: '#fff', fontSize: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                    boxShadow: isOpen ? '0 0 16px rgba(108, 99, 255, 0.4)' : 'none',
                }}
                title="Toggle Dev Panel (D)"
            >
                ⚙️
            </button>

            {/* Panel */}
            {isOpen && (
                <div style={{
                    position: 'fixed', top: 56, right: 12, zIndex: 9998,
                    width: 320, maxHeight: 'calc(100vh - 80px)',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(22, 27, 34, 0.95)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: 14,
                    border: '1px solid rgba(108, 99, 255, 0.2)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                    padding: '18px',
                    fontFamily: "'Inter', sans-serif",
                    color: '#c9d1d9',
                    fontSize: 13,
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 16,
                    }}>
                        <h3 style={{
                            color: '#e6edf3', fontSize: 15, fontWeight: 700, margin: 0,
                        }}>
                            🛠️ Dev Mode
                        </h3>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={resetSettings} style={smallBtnStyle('#f56565')}>Reset</button>
                            <button onClick={handleSave} style={smallBtnStyle(saved ? '#48bb78' : '#6c63ff')}>
                                {saved ? '✓ Saved' : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* ── PLAYER THEME ── */}
                    <SectionLabel label="Player Theme" />
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                        <button
                            onClick={() => updateSetting('playerVersion', 'v1')}
                            style={{
                                flex: 1, padding: '8px 12px', border: 'none', borderRadius: 8,
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                backgroundColor: settings.playerVersion === 'v1' ? 'rgba(108, 99, 255, 0.3)' : 'rgba(255,255,255,0.04)',
                                color: settings.playerVersion === 'v1' ? '#e6edf3' : '#8b949e',
                                borderWidth: 1, borderStyle: 'solid',
                                borderColor: settings.playerVersion === 'v1' ? 'rgba(108, 99, 255, 0.5)' : 'transparent',
                            }}
                        >
                            🎨 V1 Modern
                        </button>
                        <button
                            onClick={() => updateSetting('playerVersion', 'v2')}
                            style={{
                                flex: 1, padding: '8px 12px', border: 'none', borderRadius: 8,
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                backgroundColor: settings.playerVersion === 'v2' ? 'rgba(74, 124, 89, 0.3)' : 'rgba(255,255,255,0.04)',
                                color: settings.playerVersion === 'v2' ? '#aaddaa' : '#8b949e',
                                borderWidth: 1, borderStyle: 'solid',
                                borderColor: settings.playerVersion === 'v2' ? 'rgba(74, 124, 89, 0.5)' : 'transparent',
                            }}
                        >
                            📝 V2 Chalkboard
                        </button>
                    </div>

                    {/* ── V2: CHALKBOARD CONTROLS ── */}
                    {settings.playerVersion === 'v2' && (
                        <>
                            <SectionLabel label="Chalkboard" />
                            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                                <button
                                    onClick={() => updateSetting('chalkboardExpanded', false)}
                                    style={{
                                        flex: 1, padding: '6px 10px', border: 'none', borderRadius: 6,
                                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                        backgroundColor: !settings.chalkboardExpanded ? 'rgba(74, 124, 89, 0.3)' : 'rgba(255,255,255,0.04)',
                                        color: !settings.chalkboardExpanded ? '#aaddaa' : '#8b949e',
                                        borderWidth: 1, borderStyle: 'solid',
                                        borderColor: !settings.chalkboardExpanded ? 'rgba(74, 124, 89, 0.5)' : 'transparent',
                                    }}
                                >
                                    🔲 Split View
                                </button>
                                <button
                                    onClick={() => updateSetting('chalkboardExpanded', true)}
                                    style={{
                                        flex: 1, padding: '6px 10px', border: 'none', borderRadius: 6,
                                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                        backgroundColor: settings.chalkboardExpanded ? 'rgba(74, 124, 89, 0.3)' : 'rgba(255,255,255,0.04)',
                                        color: settings.chalkboardExpanded ? '#aaddaa' : '#8b949e',
                                        borderWidth: 1, borderStyle: 'solid',
                                        borderColor: settings.chalkboardExpanded ? 'rgba(74, 124, 89, 0.5)' : 'transparent',
                                    }}
                                >
                                    📐 Expand Board
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                                <button
                                    onClick={() => updateSetting('avatarPosition', 'center')}
                                    style={{
                                        flex: 1, padding: '6px 10px', border: 'none', borderRadius: 6,
                                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                        backgroundColor: settings.avatarPosition === 'center' ? 'rgba(74, 124, 89, 0.3)' : 'rgba(255,255,255,0.04)',
                                        color: settings.avatarPosition === 'center' ? '#aaddaa' : '#8b949e',
                                        borderWidth: 1, borderStyle: 'solid',
                                        borderColor: settings.avatarPosition === 'center' ? 'rgba(74, 124, 89, 0.5)' : 'transparent',
                                    }}
                                >
                                    🧑‍🏫 Avatar Center
                                </button>
                                <button
                                    onClick={() => updateSetting('avatarPosition', 'right')}
                                    style={{
                                        flex: 1, padding: '6px 10px', border: 'none', borderRadius: 6,
                                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                        backgroundColor: settings.avatarPosition === 'right' ? 'rgba(74, 124, 89, 0.3)' : 'rgba(255,255,255,0.04)',
                                        color: settings.avatarPosition === 'right' ? '#aaddaa' : '#8b949e',
                                        borderWidth: 1, borderStyle: 'solid',
                                        borderColor: settings.avatarPosition === 'right' ? 'rgba(74, 124, 89, 0.5)' : 'transparent',
                                    }}
                                >
                                    ➡️ Avatar Right
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── TEXT ANIMATION (V1 only) ── */}
                    <SectionLabel label="Text Animation" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
                        {allModes.map(mode => (
                            <button
                                key={mode}
                                onClick={() => updateSetting('textAnimation', mode)}
                                style={{
                                    padding: '6px 8px', border: 'none', borderRadius: 6,
                                    fontSize: 11, cursor: 'pointer', textAlign: 'left',
                                    backgroundColor: settings.textAnimation === mode
                                        ? 'rgba(108, 99, 255, 0.3)'
                                        : 'rgba(255,255,255,0.04)',
                                    color: settings.textAnimation === mode ? '#e6edf3' : '#8b949e',
                                    borderWidth: 1, borderStyle: 'solid',
                                    borderColor: settings.textAnimation === mode
                                        ? 'rgba(108, 99, 255, 0.5)'
                                        : 'transparent',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {TEXT_ANIMATION_LABELS[mode]}
                            </button>
                        ))}
                    </div>

                    {/* Animation speed */}
                    <SliderControl
                        label="Animation Speed"
                        value={settings.animationSpeed}
                        min={0.3} max={3.0} step={0.1}
                        onChange={v => updateSetting('animationSpeed', v)}
                        format={v => `${v.toFixed(1)}x`}
                    />

                    {/* ── FONT SETTINGS ── */}
                    <SectionLabel label="Font Settings" />

                    <SliderControl
                        label="Font Size"
                        value={settings.fontSize}
                        min={12} max={40} step={1}
                        onChange={v => updateSetting('fontSize', v)}
                        format={v => `${v}px`}
                    />

                    <SliderControl
                        label="Font Weight"
                        value={settings.fontWeight}
                        min={300} max={800} step={100}
                        onChange={v => updateSetting('fontWeight', v)}
                        format={v => `${v}`}
                    />

                    <SliderControl
                        label="Line Height"
                        value={settings.lineHeight}
                        min={1.2} max={2.5} step={0.1}
                        onChange={v => updateSetting('lineHeight', v)}
                        format={v => v.toFixed(1)}
                    />

                    {/* Text color */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ color: '#8b949e', fontSize: 11, flex: 1 }}>Text Color</span>
                        <input
                            type="color"
                            value={settings.textColor}
                            onChange={e => updateSetting('textColor', e.target.value)}
                            style={{
                                width: 32, height: 24, border: '1px solid #30363d',
                                borderRadius: 4, cursor: 'pointer', backgroundColor: 'transparent',
                            }}
                        />
                        <code style={{
                            fontSize: 10, color: '#8b949e', backgroundColor: '#0d1117',
                            padding: '2px 6px', borderRadius: 3,
                        }}>
                            {settings.textColor}
                        </code>
                    </div>

                    {/* ── AVATAR SETTINGS ── */}
                    <SectionLabel label="Avatar Position & Size" />

                    <SliderControl
                        label="Width"
                        value={settings.avatarWidthPercent}
                        min={25} max={75} step={1}
                        onChange={v => updateSetting('avatarWidthPercent', v)}
                        format={v => `${v}%`}
                    />

                    <SliderControl
                        label="Height"
                        value={settings.avatarHeightPercent}
                        min={40} max={100} step={1}
                        onChange={v => updateSetting('avatarHeightPercent', v)}
                        format={v => `${v}%`}
                    />

                    <SliderControl
                        label="Right Offset"
                        value={settings.avatarRight}
                        min={-100} max={100} step={5}
                        onChange={v => updateSetting('avatarRight', v)}
                        format={v => `${v}px`}
                    />

                    <SliderControl
                        label="Bottom Offset"
                        value={settings.avatarBottom}
                        min={-50} max={50} step={5}
                        onChange={v => updateSetting('avatarBottom', v)}
                        format={v => `${v}px`}
                    />

                    {/* Keyboard hint */}
                    <div style={{
                        marginTop: 12, padding: '8px 10px',
                        backgroundColor: 'rgba(108, 99, 255, 0.06)',
                        borderRadius: 6, fontSize: 11, color: '#8b949e',
                        textAlign: 'center',
                    }}>
                        Press <kbd style={kbdStyle}>D</kbd> to toggle this panel
                    </div>
                </div>
            )}
        </>
    );
};

// ── Helper Components ───────────────────────────────────

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
    <div style={{
        fontSize: 10, fontWeight: 700, color: '#6c63ff',
        textTransform: 'uppercase', letterSpacing: 1.5,
        marginBottom: 8, marginTop: 14,
        paddingBottom: 4, borderBottom: '1px solid rgba(108, 99, 255, 0.15)',
    }}>
        {label}
    </div>
);

const SliderControl: React.FC<{
    label: string; value: number;
    min: number; max: number; step: number;
    onChange: (v: number) => void;
    format?: (v: number) => string;
}> = ({ label, value, min, max, step, onChange, format }) => (
    <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ color: '#8b949e', fontSize: 11 }}>{label}</span>
            <span style={{
                color: '#e6edf3', fontSize: 11, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
            }}>
                {format ? format(value) : value}
            </span>
        </div>
        <input
            type="range"
            min={min} max={max} step={step} value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
            style={{
                width: '100%', height: 4, appearance: 'none',
                background: `linear-gradient(to right, #6c63ff ${((value - min) / (max - min)) * 100}%, #30363d ${((value - min) / (max - min)) * 100}%)`,
                borderRadius: 2, outline: 'none', cursor: 'pointer',
            }}
        />
    </div>
);

const smallBtnStyle = (color: string): React.CSSProperties => ({
    padding: '4px 10px', border: 'none', borderRadius: 5,
    backgroundColor: color, color: '#fff',
    fontSize: 11, fontWeight: 600, cursor: 'pointer',
});

const kbdStyle: React.CSSProperties = {
    display: 'inline-block', padding: '1px 5px',
    border: '1px solid #30363d', borderRadius: 3,
    backgroundColor: '#0d1117', fontSize: 11,
    fontFamily: 'monospace',
};
