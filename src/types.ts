// ============================================================
// TypeScript interfaces for presentation.json (V2.5 Director Bible)
// ============================================================

export type SectionType =
  | 'intro'
  | 'summary'
  | 'content'
  | 'example'
  | 'quiz'
  | 'memory'
  | 'recap';

export type LayerVisibility = 'show' | 'hide';

export type VisualType = 'text' | 'bullet_list' | 'image' | 'video' | 'latex';

// ── Narration ──────────────────────────────────────────────

export interface DisplayDirectives {
  text_layer: LayerVisibility;
  visual_layer: LayerVisibility;
  avatar_layer: LayerVisibility;
}

export interface Segment {
  segment_id?: string;      // "seg_1", "seg_2", etc. (content/recap)
  start_time?: number;      // seconds (intro/summary/memory)
  end_time?: number;        // seconds
  text: string;
  duration_seconds: number;
  purpose?: string;         // "introduce" | "explain" | "conclude"
  display_directives?: DisplayDirectives;
  beat_videos?: string[];   // e.g. ["topic_3_seg_2_beat_1"]
}

export interface Narration {
  full_text: string;
  segments: Segment[];
  total_duration_seconds: number;
}

// ── Visual Beats ───────────────────────────────────────────

export interface MarkdownPointer {
  start_phrase: string;
  end_phrase: string;
}

export interface VisualBeat {
  beat_id: string;
  segment_id?: string;
  start_time?: number;
  end_time?: number;
  visual_type: VisualType;
  display_text: string;
  markdown_pointer?: MarkdownPointer;
  latex_content?: string | null;
  image_id?: string | null;
  answer_revealed?: boolean;
}

// ── Video Prompts ──────────────────────────────────────────

export interface VideoPrompt {
  beat_id: string;
  segment_id: string;
  prompt: string;
  duration_hint?: number;
  duration?: number;
}

// ── Flashcards (Memory section) ────────────────────────────

export interface Flashcard {
  front: string;
  back: string;
}

// ── Section ────────────────────────────────────────────────

export interface Section {
  section_id: number;
  section_type: SectionType;
  title: string;
  renderer: string;                      // "none" | "video"

  // Layer hints (intro/summary/recap)
  text_layer?: LayerVisibility;
  visual_layer?: LayerVisibility;
  avatar_layer?: LayerVisibility;
  visual_type?: VisualType;              // summary uses "bullet_list"

  narration: Narration;
  visual_beats?: VisualBeat[];
  video_prompts?: VideoPrompt[];
  flashcards?: Flashcard[];              // memory section only

  // Avatar
  avatar_video: string;                   // relative path
  avatar_status?: string;
  avatar_task_id?: string;

  // Content (markdown source)
  content?: string;
}

// ── Root ───────────────────────────────────────────────────

export interface AvatarGlobal {
  style: string;                         // "teacher"
  default_position: string;              // "right"
  default_width_percent: number;         // 52
  gesture_enabled: boolean;
}

export interface PresentationMetadata {
  generated_by: string;
  total_sections: number;
  total_duration_seconds: number;
  tts_provider: string;
  pipeline_mode?: string;
}

export interface PresentationJSON {
  presentation_title: string;
  sections: Section[];
  metadata: PresentationMetadata;
  avatar_global: AvatarGlobal;
}

// ── Computed timing (output of timing engine) ──────────────

export interface SegmentFrameRange {
  segmentId: string;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  // Original data
  text: string;
  purpose?: string;
  displayDirectives?: DisplayDirectives;
  beatVideos?: string[];
}
