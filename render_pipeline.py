"""
render_pipeline.py — V3 Lesson Video Render Pipeline
======================================================
Orchestrates the full render of a lesson job:

  1. Read presentation.json
  2. Calculate total duration and quiz sections
  3. Render full_lesson.mp4 via Remotion (all non-quiz sections)
  4. Render quiz clip MP4s for each content section's quiz
  5. Report output paths

Usage:
  python render_pipeline.py --job_id 103_162_120_230_0669c71f
  python render_pipeline.py --job_id abc123 --jobs_root /data/jobs
  python render_pipeline.py --job_id abc123 --remotion_dir /path/to/remotion-player

Prerequisites:
  - Node.js v18+ (you have v20.19.6 ✓)
  - npm install done in remotion_dir
  - presentation.json in jobs/{job_id}/
  - avatars/, videos/, images/ in jobs/{job_id}/

No compositor.py. No FFmpeg. No AI per job. Remotion handles everything.
"""

import argparse
import json
import logging
import subprocess
import sys
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("render_pipeline")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def run_node(cmd: list, cwd: Path, label: str) -> None:
    """Run a Node.js / npx command. Raises on failure."""
    log.debug("[%s]: %s", label, " ".join(str(c) for c in cmd))
    result = subprocess.run(
        [str(c) for c in cmd],
        cwd=str(cwd),
        capture_output=False,   # stream output to terminal so you can see progress
    )
    if result.returncode != 0:
        raise RuntimeError(f"Command failed [{label}] — see output above")


def calculate_total_duration(sections: list) -> float:
    """Sum avatar_duration_seconds for all non-quiz sections."""
    return sum(
        s.get("avatar_duration_seconds", 0)
        for s in sections
        if s.get("section_type") != "quiz"
        and s.get("avatar_duration_seconds", 0) > 0
    )


def calculate_quiz_timestamps(sections: list) -> list:
    """
    Calculate the timestamp in full_lesson.mp4 where each quiz fires.
    Returns list of { time, section_id, quiz } dicts.

    Quiz fires AFTER its parent content section finishes.
    Timestamps are cumulative sums of avatar_duration_seconds.
    """
    timestamps = []
    cumulative = 0.0

    for section in sections:
        if section.get("section_type") == "quiz":
            continue
        dur = section.get("avatar_duration_seconds", 0)
        if dur <= 0:
            continue
        cumulative += dur
        uq = section.get("understanding_quiz")
        if uq:
            timestamps.append({
                "time":       cumulative,
                "section_id": section["section_id"],
                "quiz":       uq,
            })

    return timestamps


def get_quiz_clip_duration(variant: str, quiz: dict) -> float:
    """
    Estimate clip duration for quiz variants.
    In production this would read the actual MP4 duration.
    Using generous defaults here — Remotion will use the actual avatar clip length.
    """
    defaults = {
        "question":    20.0,
        "correct":     10.0,
        "wrong":       10.0,
        "explain":     float(quiz.get("explanation_visual", {}).get("duration_seconds", 15.0)),
    }
    return defaults.get(variant, 15.0)


# ─── Remotion render wrappers ─────────────────────────────────────────────────

def render_composition(
    composition_id: str,
    props: dict,
    output_path: Path,
    remotion_dir: Path,
    entry_point: str = "src/index.tsx",
) -> None:
    """
    Call Remotion CLI to render one composition to an MP4 file.

    Skips render if output file already exists (caching).
    """
    if output_path.exists():
        log.info("  cached: %s", output_path.name)
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    props_json = json.dumps(props)

    log.info("  rendering: %s → %s", composition_id, output_path.name)

    run_node([
        "npx", "remotion", "render",
        entry_point,
        composition_id,
        str(output_path),
        "--props", props_json,
        "--codec", "h264",
        "--crf", "18",
        "--overwrite",
    ], cwd=remotion_dir, label=f"render:{composition_id}")


# ─── Pipeline steps ───────────────────────────────────────────────────────────

def step_render_lesson(
    job_id: str,
    sections: list,
    output_dir: Path,
    remotion_dir: Path,
) -> Path:
    """
    Render the full linear lesson (all non-quiz sections) to one MP4.

    Remotion uses LessonVideo composition with <Series> to sequence sections.
    Duration is calculated from sum of avatar_duration_seconds.
    """
    log.info("=== Rendering full_lesson.mp4 ===")
    total_duration = calculate_total_duration(sections)
    log.info("  Total duration: %.1fs across %d sections",
             total_duration, len([s for s in sections if s.get("section_type") != "quiz"]))

    output_path = output_dir / "full_lesson.mp4"

    render_composition(
        composition_id = "LessonVideo",
        props          = {
            "jobId":    job_id,
            "sections": sections,
        },
        output_path    = output_path,
        remotion_dir   = remotion_dir,
    )

    return output_path


def step_render_quiz_clips(
    job_id: str,
    sections: list,
    output_dir: Path,
    remotion_dir: Path,
) -> list:
    """
    Render quiz clips for each content section that has an understanding_quiz.

    Produces 4 clips per quiz: question / correct / wrong / explain
    These are loaded by LessonPlayer.tsx at quiz interaction time.
    """
    log.info("=== Rendering quiz clips ===")
    quiz_dir = output_dir / "quiz"
    quiz_dir.mkdir(parents=True, exist_ok=True)

    rendered = []

    for section in sections:
        if section.get("section_type") == "quiz":
            continue

        uq = section.get("understanding_quiz")
        if not uq:
            continue

        section_id = section["section_id"]
        log.info("  Section %s — rendering 4 quiz clips", section_id)

        for variant in ("question", "correct", "wrong", "explain"):
            output_path = quiz_dir / f"quiz_{section_id}_{variant}.mp4"
            duration    = get_quiz_clip_duration(variant, uq)

            render_composition(
                composition_id = "QuizClip",
                props          = {
                    "jobId":     job_id,
                    "sectionId": section_id,
                    "variant":   variant,
                    "section":   section,
                    "duration":  duration,
                },
                output_path  = output_path,
                remotion_dir = remotion_dir,
            )

            rendered.append({
                "section_id": section_id,
                "variant":    variant,
                "path":       str(output_path),
            })

    return rendered


def step_write_manifest(
    job_id: str,
    sections: list,
    output_dir: Path,
    lesson_mp4: Path,
    quiz_clips: list,
) -> Path:
    """
    Write a render_manifest.json alongside the outputs.

    This tells the player:
    - Where full_lesson.mp4 is
    - What timestamps to fire each quiz at
    - Where each quiz clip is
    """
    quiz_timestamps = calculate_quiz_timestamps(sections)

    # Build quiz map: section_id → { timestamp, clips }
    quiz_map = {}
    for qt in quiz_timestamps:
        sid = qt["section_id"]
        quiz_map[str(sid)] = {
            "timestamp": qt["time"],
            "question":  str(output_dir / "quiz" / f"quiz_{sid}_question.mp4"),
            "correct":   str(output_dir / "quiz" / f"quiz_{sid}_correct.mp4"),
            "wrong":     str(output_dir / "quiz" / f"quiz_{sid}_wrong.mp4"),
            "explain":   str(output_dir / "quiz" / f"quiz_{sid}_explain.mp4"),
        }

    manifest = {
        "job_id":          job_id,
        "full_lesson_mp4": str(lesson_mp4),
        "quiz_timestamps": [qt["time"] for qt in quiz_timestamps],
        "quizzes":         quiz_map,
    }

    manifest_path = output_dir / "render_manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2))
    log.info("  manifest: %s", manifest_path)
    return manifest_path


# ─── Main pipeline ────────────────────────────────────────────────────────────

class RenderPipeline:

    def __init__(
        self,
        job_id: str,
        jobs_root: str = "jobs",
        remotion_dir: str = ".",
    ):
        self.job_id       = job_id
        self.job_dir      = Path(jobs_root) / job_id
        self.output_dir   = self.job_dir / "output"
        self.remotion_dir = Path(remotion_dir)

        # Load presentation.json
        json_path = self.job_dir / "presentation.json"
        if not json_path.exists():
            raise FileNotFoundError(f"presentation.json not found: {json_path}")

        with open(json_path) as f:
            data = json.load(f)

        self.sections = data.get("sections", [])
        log.info("Loaded %d sections from %s", len(self.sections), json_path)

    def verify_assets(self) -> None:
        """Check that expected asset folders exist."""
        for folder in ("avatars", "videos"):
            p = self.job_dir / folder
            if not p.exists():
                log.warning("Asset folder not found: %s", p)

        # Check each section's avatar exists
        missing = []
        for section in self.sections:
            av = section.get("avatar_video")
            if av and not (self.job_dir / av).exists():
                missing.append(av)
        if missing:
            log.warning("Missing avatar files: %s", missing)

    def run(self) -> dict:
        self.output_dir.mkdir(parents=True, exist_ok=True)

        log.info("=== V3 Render Pipeline ===")
        log.info("Job:     %s", self.job_id)
        log.info("Output:  %s", self.output_dir)
        log.info("Remotion: %s", self.remotion_dir)

        # Verify assets
        self.verify_assets()

        # Step 1: Render full lesson
        lesson_mp4 = step_render_lesson(
            job_id       = self.job_id,
            sections     = self.sections,
            output_dir   = self.output_dir,
            remotion_dir = self.remotion_dir,
        )

        # Step 2: Render quiz clips
        quiz_clips = step_render_quiz_clips(
            job_id       = self.job_id,
            sections     = self.sections,
            output_dir   = self.output_dir,
            remotion_dir = self.remotion_dir,
        )

        # Step 3: Write manifest for player
        manifest = step_write_manifest(
            job_id      = self.job_id,
            sections    = self.sections,
            output_dir  = self.output_dir,
            lesson_mp4  = lesson_mp4,
            quiz_clips  = quiz_clips,
        )

        # Report
        log.info("=== Done ===")
        log.info("full_lesson.mp4 : %s", lesson_mp4)
        log.info("quiz clips      : %d files in %s/quiz/",
                 len(quiz_clips), self.output_dir)
        log.info("manifest        : %s", manifest)

        return {
            "full_lesson_mp4": str(lesson_mp4),
            "quiz_clips":      quiz_clips,
            "manifest":        str(manifest),
        }


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="V3 render pipeline — Remotion renders lesson + quiz clips"
    )
    parser.add_argument("--job_id",      required=True,
                        help="Job ID (folder name under jobs_root)")
    parser.add_argument("--jobs_root",   default="jobs",
                        help="Root folder containing job folders (default: ./jobs)")
    parser.add_argument("--remotion_dir", default=".",
                        help="Path to remotion-player repo (default: current dir)")
    parser.add_argument("--verbose",     action="store_true")
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    pipeline = RenderPipeline(
        job_id       = args.job_id,
        jobs_root    = args.jobs_root,
        remotion_dir = args.remotion_dir,
    )

    try:
        result = pipeline.run()
        print(f"\n✓ Render complete")
        print(f"  full_lesson.mp4 : {result['full_lesson_mp4']}")
        print(f"  quiz clips      : {len(result['quiz_clips'])} files")
        print(f"  manifest        : {result['manifest']}")
        sys.exit(0)
    except Exception as e:
        log.error("Pipeline failed: %s", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
