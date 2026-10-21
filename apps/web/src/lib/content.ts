import glossaryData from '../../../../content/glossary.json';
import exploreData from '../../../../content/explore-cards.json';
import b1Data from '../../../../content/lessons/basic/B1.json';
import b2Data from '../../../../content/lessons/basic/B2.json';
import b3Data from '../../../../content/lessons/basic/B3.json';
import b4Data from '../../../../content/lessons/basic/B4.json';
import b5Data from '../../../../content/lessons/basic/B5.json';
import b6Data from '../../../../content/lessons/basic/B6.json';
import b7Data from '../../../../content/lessons/basic/B7.json';
import b8Data from '../../../../content/lessons/basic/B8.json';
import b9Data from '../../../../content/lessons/basic/B9.json';
import b10Data from '../../../../content/lessons/basic/B10.json';
import i1Data from '../../../../content/lessons/intermediate/I1.json';
import i2Data from '../../../../content/lessons/intermediate/I2.json';
import i3Data from '../../../../content/lessons/intermediate/I3.json';
import i4Data from '../../../../content/lessons/intermediate/I4.json';
import i5Data from '../../../../content/lessons/intermediate/I5.json';
import i6Data from '../../../../content/lessons/intermediate/I6.json';
import i7Data from '../../../../content/lessons/intermediate/I7.json';
import i8Data from '../../../../content/lessons/intermediate/I8.json';
import i9Data from '../../../../content/lessons/intermediate/I9.json';
import i10Data from '../../../../content/lessons/intermediate/I10.json';
import i11Data from '../../../../content/lessons/intermediate/I11.json';
import i12Data from '../../../../content/lessons/intermediate/I12.json';
import i13Data from '../../../../content/lessons/intermediate/I13.json';
import i14Data from '../../../../content/lessons/intermediate/I14.json';
import p1Data from '../../../../content/lessons/pro/P1.json';
import p2Data from '../../../../content/lessons/pro/P2.json';
import p3Data from '../../../../content/lessons/pro/P3.json';
import p4Data from '../../../../content/lessons/pro/P4.json';
import p5Data from '../../../../content/lessons/pro/P5.json';
import p6Data from '../../../../content/lessons/pro/P6.json';
import p7Data from '../../../../content/lessons/pro/P7.json';
import p8Data from '../../../../content/lessons/pro/P8.json';
import p9Data from '../../../../content/lessons/pro/P9.json';
import p10Data from '../../../../content/lessons/pro/P10.json';
import p11Data from '../../../../content/lessons/pro/P11.json';
import p12Data from '../../../../content/lessons/pro/P12.json';
import { Lesson, GlossaryTerm, ExploreCard } from '@defi-mommy/content-schema';

export const GLOSSARY_MAP: Record<string, GlossaryTerm> = {};
(glossaryData as GlossaryTerm[]).forEach((term) => {
  GLOSSARY_MAP[term.id] = term;
});

export const EXPLORE_MAP: Record<string, ExploreCard> = {};
(exploreData as ExploreCard[]).forEach((card) => {
  EXPLORE_MAP[card.id] = card;
});

export const LESSONS_MAP: Record<string, Lesson> = {
  B1: b1Data as unknown as Lesson,
  B2: b2Data as unknown as Lesson,
  B3: b3Data as unknown as Lesson,
  B4: b4Data as unknown as Lesson,
  B5: b5Data as unknown as Lesson,
  B6: b6Data as unknown as Lesson,
  B7: b7Data as unknown as Lesson,
  B8: b8Data as unknown as Lesson,
  B9: b9Data as unknown as Lesson,
  B10: b10Data as unknown as Lesson,
  I1: i1Data as unknown as Lesson,
  I2: i2Data as unknown as Lesson,
  I3: i3Data as unknown as Lesson,
  I4: i4Data as unknown as Lesson,
  I5: i5Data as unknown as Lesson,
  I6: i6Data as unknown as Lesson,
  I7: i7Data as unknown as Lesson,
  I8: i8Data as unknown as Lesson,
  I9: i9Data as unknown as Lesson,
  I10: i10Data as unknown as Lesson,
  I11: i11Data as unknown as Lesson,
  I12: i12Data as unknown as Lesson,
  I13: i13Data as unknown as Lesson,
  I14: i14Data as unknown as Lesson,
  P1: p1Data as unknown as Lesson,
  P2: p2Data as unknown as Lesson,
  P3: p3Data as unknown as Lesson,
  P4: p4Data as unknown as Lesson,
  P5: p5Data as unknown as Lesson,
  P6: p6Data as unknown as Lesson,
  P7: p7Data as unknown as Lesson,
  P8: p8Data as unknown as Lesson,
  P9: p9Data as unknown as Lesson,
  P10: p10Data as unknown as Lesson,
  P11: p11Data as unknown as Lesson,
  P12: p12Data as unknown as Lesson,
};

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY_MAP[id];
}

export function getExploreCard(id: string): ExploreCard | undefined {
  return EXPLORE_MAP[id];
}

export function getLesson(id: string): Lesson | undefined {
  const normalized = id.toUpperCase();
  return LESSONS_MAP[normalized];
}

export function getAllLessons(): Lesson[] {
  return Object.values(LESSONS_MAP);
}
