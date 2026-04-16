import { registerRoot, Composition } from 'remotion';
import { LessonVideo, QuizClip } from './compositions/LessonVideo';

const sections = [
  {
    "section_id": 1,
    "section_type": "intro",
    "title": "Introduction",
    "renderer": "none",
    "avatar_video": "avatars/section_1_avatar.mp4",
    "avatar_duration_seconds": 19.97,
    "total_duration_seconds": 22.0,
    "narration": {
      "segments": [
        {
          "segment_id": "seg_1",
          "text": "Namaste! If trigonometry feels like a huge jumble of formulas and weird names right now, you are completely normal.",
          "start_seconds": 0.0,
          "end_seconds": 10.0,
          "duration_seconds": 9.65
        },
        {
          "segment_id": "seg_2",
          "text": "But here is the secret. It is all just about the relationships in one simple shape, the right angled triangle.",
          "start_seconds": 10.0,
          "end_seconds": 19.0,
          "duration_seconds": 10.15
        },
        {
          "segment_id": "seg_3",
          "text": "Let us make this simple together. Let us begin.",
          "start_seconds": 19.0,
          "end_seconds": 22.0,
          "duration_seconds": 4.57
        }
      ],
      "total_duration_seconds": 24.37
    },
    "visual_beats": [
      { "beat_id": "vis_1", "display_text": "[Teacher Welcome]", "start_seconds": 0.0, "end_seconds": 22.0 }
    ]
  },
  {
    "section_id": 2,
    "section_type": "summary",
    "title": "Learning Objectives",
    "renderer": "none",
    "avatar_video": "avatars/section_2_avatar.mp4",
    "avatar_duration_seconds": 38.12,
    "total_duration_seconds": 26.0,
    "narration": {
      "segments": [
        {
          "segment_id": "seg_1",
          "text": "First, we will uncover the six core trigonometric ratios and see exactly how they connect the angles and sides of a right triangle to build a strong foundation.",
          "start_seconds": 0.0,
          "end_seconds": 13.0,
          "duration_seconds": 14.22
        },
        {
          "segment_id": "seg_2",
          "text": "Next, we will apply the famous Pythagoras theorem to perfectly find missing side lengths, proving that you have the power to solve complex geometric puzzles with complete ease.",
          "start_seconds": 13.0,
          "end_seconds": 26.0,
          "duration_seconds": 14.22
        }
      ],
      "total_duration_seconds": 28.44
    },
    "visual_beats": [
      { "beat_id": "sum_1", "display_text": "Understand the six core trigonometric ratios.", "start_seconds": 0.0, "end_seconds": 13.0 },
      { "beat_id": "sum_2", "display_text": "Apply the Pythagoras theorem to find missing side lengths.", "start_seconds": 13.0, "end_seconds": 26.0 }
    ]
  },
  {
    "section_id": 3,
    "section_type": "content",
    "title": "Introduction to Trigonometry",
    "renderer": "image_to_video",
    "avatar_video": "avatars/section_3_avatar.mp4",
    "avatar_duration_seconds": 103.37,
    "total_duration_seconds": 38.0,
    "beat_video_paths": [
      "videos/topic_3_beat_0.mp4",
      "videos/topic_3_beat_1.mp4",
      "videos/topic_3_beat_2.mp4"
    ],
    "narration": {
      "segments": [
        {
          "segment_id": "seg_1",
          "text": "Think of flying a kite during Makar Sankranti. If you know the length of your string and the angle you are looking up, you can find exactly how high the kite is flying.",
          "start_seconds": 0.0,
          "end_seconds": 15.0,
          "duration_seconds": 16.75
        },
        {
          "segment_id": "seg_2",
          "text": "This is the magic of trigonometry. It is the mathematical study of the exact relationships between the sides and the angles of a triangle.",
          "start_seconds": 15.0,
          "end_seconds": 26.0,
          "duration_seconds": 12.18
        },
        {
          "segment_id": "seg_3",
          "text": "Once you understand this connection, you can calculate distances you could never reach by hand. You are building the kind of understanding that stays with you.",
          "start_seconds": 26.0,
          "end_seconds": 38.0,
          "duration_seconds": 13.2
        }
      ],
      "total_duration_seconds": 42.13
    },
    "understanding_quiz": {
      "question": "What does trigonometry primarily study in a triangle?",
      "options": { "A": "The colors of the sides", "B": "Relationships between sides and angles", "C": "Only the lengths of the sides", "D": "The area and perimeter" },
      "correct": "B",
      "explanation": "Trigonometry specifically focuses on how the angles of a triangle relate to the lengths of its sides.",
      "avatar_clips": { "question": "avatars/en/quiz_intro_trig_1_q1_question.mp4", "correct": "avatars/en/quiz_intro_trig_1_q1_correct.mp4", "wrong": "avatars/en/quiz_intro_trig_1_q1_wrong.mp4", "explanation": "avatars/en/quiz_intro_trig_1_q1_explanation.mp4" },
      "explanation_visual": { "video_path": "videos/topic_3_eq_beat_1.mp4" }
    }
  },
  {
    "section_id": 4,
    "section_type": "content",
    "title": "The Six Trigonometric Ratios",
    "renderer": "image_to_video",
    "avatar_video": "avatars/section_4_avatar.mp4",
    "avatar_duration_seconds": 119.09,
    "total_duration_seconds": 58.0,
    "beat_video_paths": [
      "videos/topic_4_beat_0.mp4",
      "videos/topic_4_beat_1.mp4",
      "videos/topic_4_beat_2.mp4",
      "videos/topic_4_beat_3.mp4",
      "videos/topic_4_beat_4.mp4",
      "videos/topic_4_beat_5.mp4",
      "videos/topic_4_beat_6.mp4",
      "videos/topic_4_beat_7.mp4",
      "videos/topic_4_beat_8.mp4",
      "videos/topic_4_beat_9.mp4",
      "videos/topic_4_beat_10.mp4",
      "videos/topic_4_beat_11.mp4",
      "videos/topic_4_beat_12.mp4",
      "videos/topic_4_beat_13.mp4"
    ],
    "narration": {
      "segments": [],
      "total_duration_seconds": 0
    },
    "understanding_quiz": {
      "question": "What is the ratio of opposite side to hypotenuse called?",
      "options": { "A": "Cosine", "B": "Tangent", "C": "Secant", "D": "Sine" },
      "correct": "D",
      "explanation": "Sine is the ratio of the opposite side to the hypotenuse in a right triangle.",
      "avatar_clips": { "question": "avatars/en/quiz_4_q1_question.mp4", "correct": "avatars/en/quiz_4_q1_correct.mp4", "wrong": "avatars/en/quiz_4_q1_wrong.mp4", "explanation": "avatars/en/quiz_4_q1_explanation.mp4" },
      "explanation_visual": { "video_path": "videos/topic_4_eq_beat_1.mp4" }
    }
  },
  {
    "section_id": 5,
    "section_type": "memory",
    "title": "Key Concepts",
    "renderer": "none",
    "avatar_video": "avatars/section_5_avatar.mp4",
    "avatar_duration_seconds": 56.68,
    "total_duration_seconds": 42.0,
    "flashcards": [
      { "front": "What is Sine (sin)?", "back": "Ratio of Opposite side to Hypotenuse" },
      { "front": "What is Cosine (cos)?", "back": "Ratio of Adjacent side to Hypotenuse" },
      { "front": "What is Tangent (tan)?", "back": "Ratio of Opposite side to Adjacent side" },
      { "front": "What does SOH stand for?", "back": "Sine = Opposite / Hypotenuse" },
      { "front": "What does CAH stand for?", "back": "Cosine = Adjacent / Hypotenuse" },
      { "front": "What does TOA stand for?", "back": "Tangent = Opposite / Adjacent" }
    ],
    "narration": {
      "segments": [],
      "total_duration_seconds": 0
    }
  },
  {
    "section_id": 6,
    "section_type": "memory_infographic",
    "title": "Visual Concept Summary",
    "renderer": "infographic",
    "avatar_video": "avatars/section_6_avatar.mp4",
    "avatar_duration_seconds": 24.43,
    "total_duration_seconds": 15.0,
    "render_spec": {
      "infographic_beats": [
        { "beat_id": "inf_1", "image_source": "images/45_123_216_62_7ce71676_inf_1.jpg", "start_seconds": 0.0, "end_seconds": 15.0 }
      ]
    },
    "narration": {
      "segments": [],
      "total_duration_seconds": 0
    }
  },
  {
    "section_id": 7,
    "section_type": "recap",
    "title": "Lesson Recap",
    "renderer": "image_to_video",
    "avatar_video": "avatars/section_7_avatar.mp4",
    "avatar_duration_seconds": 64.42,
    "total_duration_seconds": 60.0,
    "beat_video_paths": [
      "videos/topic_7_recap_beat_1.mp4",
      "videos/topic_7_recap_beat_2.mp4",
      "videos/topic_7_recap_beat_3.mp4",
      "videos/topic_7_recap_beat_4.mp4"
    ],
    "narration": {
      "segments": [
        { "segment_id": "seg_1", "text": "We started by looking at the right angled triangle, the absolute foundation of all trigonometry.", "start_seconds": 0.0, "end_seconds": 15.0, "duration_seconds": 16.25 },
        { "segment_id": "seg_2", "text": "From there, we uncovered the six core ratios. Sine, cosine, and tangent became your primary mathematical tools.", "start_seconds": 15.0, "end_seconds": 30.0, "duration_seconds": 16.25 },
        { "segment_id": "seg_3", "text": "Then we brought in the famous Pythagoras theorem. By combining this ancient rule with our newly learned ratios, you discovered exactly how to find any missing piece of the triangle puzzle perfectly.", "start_seconds": 30.0, "end_seconds": 45.0, "duration_seconds": 16.25 },
        { "segment_id": "seg_4", "text": "Finally, we proved that these ratios hold completely true across different triangles with the exact same angles. You now understand how your mathematical universe connects beautifully today. That is not a small thing.", "start_seconds": 45.0, "end_seconds": 60.0, "duration_seconds": 16.75 }
      ],
      "total_duration_seconds": 65.5
    }
  }
];

const duration = sections
  .filter(s => s.section_type !== 'quiz')
  .reduce((sum, s) => sum + (s.avatar_duration_seconds || 0), 0);

export const RemotionRoot = () => (
  <>
    <Composition
      id="LessonVideo"
      component={LessonVideo}
      durationInFrames={Math.round(duration * 30)}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        jobId: "45_123_216_62_7ce71676",
        sections: sections,
      }}
    />
    <Composition
      id="QuizClip"
      component={QuizClip}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        jobId: "45_123_216_62_7ce71676",
        sectionId: 3,
        variant: "question",
        section: sections[2],
      }}
    />
  </>
);

registerRoot(RemotionRoot);