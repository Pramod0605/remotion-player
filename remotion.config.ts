import { Config } from "@remotion/cli/config";

/**
 * Remotion Configuration for Transparent Video Rendering
 * 
 * These settings ensure the alpha channel is preserved when rendering
 * videos with transparent backgrounds (e.g., avatar webm files)
 */

// Use VP9 codec which supports alpha channel
Config.setCodec("vp9");

// CRITICAL: Use yuva420p to include alpha channel
// Without the 'a', transparency will be lost during render
Config.setPixelFormat("yuva420p");

// Render frames as PNG to preserve transparency
Config.setVideoImageFormat("png");

// Optional: Set output location
Config.setOutputLocation("./out/video.webm");
