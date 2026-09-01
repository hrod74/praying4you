import type { Verse } from '../models/types';

/**
 * Seed "verse of the day" data for the local prototype.
 *
 * Local/mock only — accessed exclusively through `src/services/verseService.ts`, never
 * imported directly by screens. No external Bible API, no network, no API keys.
 *
 * Scripture text uses the **King James Version (public domain)** to keep the prototype
 * free of translation-licensing concerns. The `reflection` on each entry is **app-written
 * copy** (a gentle prompt), not scripture, and is presented distinctly in the UI.
 *
 * NOTE (production): before any public release, review verse sourcing and translation
 * licensing (e.g., NIV/ESV require permission/attribution). Keep to public-domain
 * translations or obtain the appropriate license, and confirm any reflection copy.
 */

/** A verse paired with an app-generated reflection prompt (the reflection is NOT scripture). */
export interface DailyVerse {
  /** Scripture only (reference, text, translation). */
  verse: Verse;
  /** App-written reflection/prompt — clearly distinct from the verse in the UI. */
  reflection: string;
}

export const mockVerses: DailyVerse[] = [
  {
    verse: {
      reference: 'Psalm 23:1',
      text: 'The LORD is my shepherd; I shall not want.',
      translation: 'KJV',
    },
    reflection: 'Where do you need to trust that you are cared for today?',
  },
  {
    verse: {
      reference: 'Philippians 4:6',
      text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
      translation: 'KJV',
    },
    reflection: 'Name one worry, and quietly hand it over in prayer.',
  },
  {
    verse: {
      reference: 'Matthew 11:28',
      text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
      translation: 'KJV',
    },
    reflection: 'What heavy thing could you set down, even for a moment?',
  },
  {
    verse: {
      reference: 'Psalm 46:1',
      text: 'God is our refuge and strength, a very present help in trouble.',
      translation: 'KJV',
    },
    reflection: 'Recall a time you were carried through something hard.',
  },
  {
    verse: {
      reference: 'Isaiah 41:10',
      text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God.',
      translation: 'KJV',
    },
    reflection: 'Where is fear asking for your attention? Breathe, and be still.',
  },
  {
    verse: {
      reference: 'Proverbs 3:5',
      text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
      translation: 'KJV',
    },
    reflection: 'What would it look like to loosen your grip on the outcome?',
  },
  {
    verse: {
      reference: 'Psalm 34:18',
      text: 'The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.',
      translation: 'KJV',
    },
    reflection: 'If your heart is heavy, you are not alone in it.',
  },
  {
    verse: {
      reference: 'Lamentations 3:22-23',
      text: 'It is of the LORD’s mercies that we are not consumed, because his compassions fail not. They are new every morning.',
      translation: 'KJV',
    },
    reflection: 'What small mercy can you give thanks for this morning?',
  },
  {
    verse: {
      reference: 'John 14:27',
      text: 'Peace I leave with you, my peace I give unto you: let not your heart be troubled, neither let it be afraid.',
      translation: 'KJV',
    },
    reflection: 'Invite peace into one anxious corner of your day.',
  },
  {
    verse: {
      reference: 'Psalm 121:1-2',
      text: 'I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD.',
      translation: 'KJV',
    },
    reflection: 'Lift your eyes for a moment. Where is your help coming from?',
  },
  {
    verse: {
      reference: '1 Thessalonians 5:16-18',
      text: 'Rejoice evermore. Pray without ceasing. In every thing give thanks.',
      translation: 'KJV',
    },
    reflection: 'Name one thing, however small, you can be thankful for right now.',
  },
  {
    verse: {
      reference: 'Joshua 1:9',
      text: 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
      translation: 'KJV',
    },
    reflection: 'What is one brave, small step you can take today?',
  },
];

export default mockVerses;
