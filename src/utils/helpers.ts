export const getDuration = (cfg: any) => {
    if (cfg.durationInFrames) return cfg.durationInFrames;
    if (cfg.durationInSeconds) return Math.round(cfg.durationInSeconds * (cfg.fps || 30));
    return 300; // Default
};
