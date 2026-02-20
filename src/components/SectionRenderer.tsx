/**
 * SectionRenderer — Routes section_type to the appropriate renderer.
 * In V2 mode, all sections go through ChalkboardSection.
 * In V1 mode, individual section components are used.
 */
import React from 'react';
import type { Section, AvatarGlobal, SegmentFrameRange } from '../types';
import { useDevConfig } from './DevConfig';
import { IntroSection } from '../sections/IntroSection';
import { SummarySection } from '../sections/SummarySection';
import { ContentSection } from '../sections/ContentSection';
import { MemorySection } from '../sections/MemorySection';
import { RecapSection } from '../sections/RecapSection';
import { ChalkboardSection } from '../sections/ChalkboardSection';

export interface SectionRendererProps {
    section: Section;
    avatarGlobal: AvatarGlobal;
    jobBasePath: string;
    segmentFrames: SegmentFrameRange[];
}

export const SectionRenderer: React.FC<SectionRendererProps> = (props) => {
    const { section, jobBasePath } = props;
    const { settings } = useDevConfig();

    // Build avatar video URL
    const avatarSrc = section.avatar_video
        ? `${jobBasePath}/${section.avatar_video}`
        : `${jobBasePath}/avatars/section_${section.section_id}_avatar.mp4`;

    const commonProps = { ...props, avatarSrc };

    // ── V2: All sections → ChalkboardSection ──
    if (settings.playerVersion === 'v2') {
        return <ChalkboardSection {...commonProps} />;
    }

    // ── V1: Individual section renderers ──
    switch (section.section_type) {
        case 'intro':
            return <IntroSection {...commonProps} />;
        case 'summary':
            return <SummarySection {...commonProps} />;
        case 'content':
        case 'example':
            return <ContentSection {...commonProps} />;
        case 'memory':
        case 'quiz':
            return <MemorySection {...commonProps} />;
        case 'recap':
            return <RecapSection {...commonProps} />;
        default:
            return <ContentSection {...commonProps} />;
    }
};
