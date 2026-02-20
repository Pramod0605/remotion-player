/**
 * DevConfig — Shared configuration state for Dev Mode.
 * Persisted to localStorage so settings survive page reloads.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Text Animation Modes ────────────────────────────────
export type TextAnimationMode =
    | 'typewriter'
    | 'word_bounce'
    | 'word_fade'
    | 'karaoke'
    | 'slide_up'
    | 'slide_left'
    | 'scale_pop'
    | 'letter_cascade';

export const TEXT_ANIMATION_LABELS: Record<TextAnimationMode, string> = {
    typewriter: '⌨️  Typewriter',
    word_bounce: '🏀 Word Bounce (Spring)',
    word_fade: '✨ Word Fade-In',
    karaoke: '🎤 Karaoke Highlight',
    slide_up: '⬆️  Slide Up',
    slide_left: '⬅️  Slide From Left',
    scale_pop: '💥 Scale Pop',
    letter_cascade: '🌊 Letter Cascade',
};

// ── Player Version ──────────────────────────────────────
export type PlayerVersion = 'v1' | 'v2';

// ── Configuration Shape ─────────────────────────────────
export interface DevSettings {
    // Dev mode toggle
    devMode: boolean;

    // Player theme
    playerVersion: PlayerVersion;

    // Text
    textAnimation: TextAnimationMode;
    fontSize: number;         // px (14-40)
    fontWeight: number;       // 300-800
    lineHeight: number;       // 1.2 - 2.5
    textColor: string;        // hex color

    // Avatar
    avatarWidthPercent: number;   // 30-70
    avatarHeightPercent: number;  // 50-100
    avatarRight: number;          // px offset (-100 to 100)
    avatarBottom: number;         // px offset (-50 to 50)

    // Animation speed
    animationSpeed: number;  // 0.5 to 3.0 multiplier
}

const DEFAULT_SETTINGS: DevSettings = {
    devMode: false,
    playerVersion: 'v2',
    textAnimation: 'word_bounce',
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.7,
    textColor: '#e2e8f0',
    avatarWidthPercent: 55,
    avatarHeightPercent: 95,
    avatarRight: -20,
    avatarBottom: 0,
    animationSpeed: 1.0,
};

const STORAGE_KEY = 'remotion-player-dev-settings';

// ── Context ─────────────────────────────────────────────
interface DevConfigContextType {
    settings: DevSettings;
    updateSetting: <K extends keyof DevSettings>(key: K, value: DevSettings[K]) => void;
    resetSettings: () => void;
    saveSettings: () => void;
}

const DevConfigContext = createContext<DevConfigContextType>({
    settings: DEFAULT_SETTINGS,
    updateSetting: () => { },
    resetSettings: () => { },
    saveSettings: () => { },
});

export const useDevConfig = () => useContext(DevConfigContext);

// ── Provider ────────────────────────────────────────────
export const DevConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<DevSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch { }
        return DEFAULT_SETTINGS;
    });

    const updateSetting = useCallback(<K extends keyof DevSettings>(key: K, value: DevSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const saveSettings = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    // Auto-save on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    return (
        <DevConfigContext.Provider value={{ settings, updateSetting, resetSettings, saveSettings }}>
            {children}
        </DevConfigContext.Provider>
    );
};
