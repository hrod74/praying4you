/**
 * Pure, deterministic, on-device pre-publication content filter (beta, Part 1 only).
 *
 * Scope and intent:
 * - This module has no side effects: no network calls, no third-party moderation service, no
 *   logging, no persistence, no analytics. It reads a string and returns a plain value.
 * - It is intentionally narrow. Praying For You is an adult-only Christian prayer-community app
 *   where legitimate prayers routinely discuss suicide, self-harm, abuse, addiction, illness,
 *   violence, grief, and mental health. This filter must not block those topics. It only blocks a
 *   small set of high-confidence categories (see BLOCK_RULES below) where there is essentially no
 *   legitimate prayer-request use of the matched language. Everything else is left to user
 *   reporting and human moderation.
 * - This module is NOT wired into any screen, form, or Firebase write path. That is a separate,
 *   later task.
 *
 * Known limitations (by design, for beta):
 * - This is a word/phrase pattern matcher, not a language model. It does not understand meaning,
 *   sarcasm, quotation, or context beyond the narrow patterns below.
 * - It does not attempt to detect every threat, every slur, every harassment phrase, or every
 *   possible spelling variation. The evasion handling below (case, whitespace, in-word
 *   punctuation, a small substitution set, repeated characters) covers common simple evasion, not
 *   all of it.
 * - Multi-word phrases are matched on whitespace-separated tokens. Punctuation used to replace a
 *   space entirely between two words of a phrase (for example a hyphen standing in for the space
 *   between "kill" and "you") is not reconstructed into a space and can evade a phrase match.
 *   Punctuation inserted inside a single word (for example "n.u.d.e.s") is handled, since it is
 *   removed rather than replaced with a space.
 * - The identity-slur list is intentionally short and covers only a handful of unambiguous,
 *   severe terms. It is not an exhaustive slur dictionary. For this controlled beta, an exact
 *   configured slur is blocked in every context, including a sincere user quoting or describing
 *   harassment they experienced using that exact term. That user will also be asked to revise
 *   their request. This is an intentional beta tradeoff: a deterministic pattern matcher cannot
 *   reliably distinguish quotation, condemnation, or being the target of a slur from targeted use
 *   of it, so the beta filter treats all three the same way rather than guessing.
 * - Repeated-character evasion (for example "kiiiiill") is handled at the pattern level, not by
 *   transforming the submitted text. Each letter of a reference word compiles to "that exact
 *   letter, one or more times" (see `letterTolerantPattern` below), so a doubled letter in the
 *   real spelling of a reference word (for example the two Gs in a slur, or the two Os in
 *   "hookup") still requires at least two of that letter to match. This is deliberate: an earlier
 *   version of this module collapsed repeated letters in the submitted text itself, which made a
 *   single-letter word or place name indistinguishable from a reference word that legitimately has
 *   a doubled letter in that position (for example, collapsing turned the country name "Niger"
 *   into the same normalized spelling as a configured slur that happens to have a doubled letter).
 *   Matching the exact letter sequence, only tolerating repetition, avoids that class of false
 *   positive while still catching stretched-out evasion.
 *
 * Fail-closed: if evaluating the input throws for any reason, the result is `blocked` with reason
 * `internalError`, never `allowed`.
 */

/** A stable, internal reason category. Never shown to users; used for branching and tests. */
export type ContentFilterReason =
  | 'sexualSolicitation'
  | 'childSexualExploitation'
  | 'identitySlur'
  | 'threatOfHarm'
  | 'targetedHarassment'
  | 'internalError';

/**
 * The filter's result. A discriminated union so an allowed result carries no reason or message,
 * and a blocked result always carries both. Never includes the matched word or pattern, and never
 * includes the submitted text.
 */
export type ContentFilterResult =
  | { allowed: true }
  | { allowed: false; reason: ContentFilterReason; message: string };

/**
 * The single calm, user-facing message shown for every blocked result, regardless of category.
 * Using one shared message (rather than per-category copy) is deliberate: it never hints at which
 * word or pattern triggered the block.
 */
export const CONTENT_FILTER_MESSAGE =
  'This contains language that cannot be shared with the community. Please revise it and try again.';

/**
 * A narrow, documented set of common character substitutions used for simple evasion
 * (for example "s3x", "f@ggot"). Intentionally small; not a general leetspeak decoder.
 */
const CHAR_SUBSTITUTIONS: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '3': 'e',
  '1': 'i',
  '0': 'o',
  '5': 's',
  $: 's',
  '7': 't',
};

const SUBSTITUTION_PATTERN = new RegExp(`[${Object.keys(CHAR_SUBSTITUTIONS).join('')}]`, 'g');

/**
 * Builds a copy of `text` normalized for matching only. The original string passed to
 * `filterProhibitedContent` is never modified; this always operates on a new string.
 *
 * Steps, in order:
 * 1. Lower-case, so matching ignores capitalization.
 * 2. Apply the narrow character-substitution set above.
 * 3. Strip everything that is not a lower-case letter, digit, or whitespace. This absorbs
 *    punctuation inserted inside a single prohibited term (for example "s.e.x" becomes "sex").
 * 4. Collapse repeated whitespace down to a single space and trim. This only affects whitespace;
 *    it does not touch repeated letters. Repeated-letter evasion (like "kiiiiill") is handled by
 *    the patterns themselves, not here (see `letterTolerantPattern` and the "Known limitations"
 *    note above).
 */
function normalizeForMatching(text: string): string {
  const lowered = text.toLowerCase();
  const substituted = lowered.replace(SUBSTITUTION_PATTERN, (ch) => CHAR_SUBSTITUTIONS[ch]);
  const stripped = substituted.replace(/[^a-z0-9\s]/g, '');
  return stripped.replace(/\s+/g, ' ').trim();
}

/**
 * Compiles a plain lower-case word or phrase (letters, digits, and single spaces only) into a
 * regex source fragment that matches that exact letter sequence, but tolerates any letter being
 * repeated one or more times in place of its single occurrence. A literal space in the phrase
 * stays a literal space (word boundaries between the words of a phrase are not stretched).
 *
 * This is what lets "kill" match a stretched "kiiiiill" while still requiring a doubled letter in
 * the source word (for example the two Gs in a configured slur) to appear at least twice, so a
 * word or name that only has a single occurrence of that letter (for example "Niger" against a
 * slur spelled with a doubled G) is never treated as equivalent.
 */
function letterTolerantPattern(phrase: string): string {
  return phrase
    .split('')
    .map((ch) => (ch === ' ' ? ' ' : `${ch}+`))
    .join('');
}

/** Builds a non-capturing alternation group from plain lower-case words or phrases. */
function altGroup(words: string[]): string {
  return `(?:${words.map(letterTolerantPattern).join('|')})`;
}

/** Builds a single word-boundary alternation pattern from a list of plain lower-case phrases. */
function phraseBoundaryPattern(phrases: string[]): RegExp {
  return new RegExp(`\\b${altGroup(phrases)}\\b`);
}

interface FilterRule {
  reason: ContentFilterReason;
  patterns: RegExp[];
}

const MINOR_TERMS = ['child', 'children', 'kid', 'kids', 'minor', 'minors', 'underage', 'preteen'];
const EXPLICIT_SEXUAL_TERMS = ['porn', 'porno', 'pornography', 'nude', 'nudes', 'naked'];
const MERGED_CHILD_EXPLOITATION_TERMS = ['childporn', 'kidporn', 'minorporn', 'preteenporn'];

const THREAT_INTENT_MARKERS = ['i will', 'im going to', 'i am going to', 'im gonna', 'i am gonna', 'ill'];
const THREAT_VERBS = ['kill', 'hurt', 'beat', 'attack', 'stab', 'shoot', 'murder'];
const THREAT_TARGETS = ['you', 'him', 'her', 'them', 'u'];

/**
 * High-confidence blocked categories only. Each pattern is checked against the normalized copy of
 * the text using word boundaries, so a blocked term inside an unrelated longer word (for example
 * "class", "assistant", "therapist", "assassin") does not match.
 */
const BLOCK_RULES: FilterRule[] = [
  {
    // Explicit sexual solicitation or pornographic phrasing. Deliberately does not include bare
    // words like "porn", "sex", or "sexting" alone, since those appear in legitimate prayers (for
    // example a prayer for freedom from pornography addiction, or a prayer for a teenager being
    // pressured into sexting by someone else). Only solicitation-style phrasing is blocked: either
    // an explicit ask/offer around nudes, or a phrase where the speaker is themselves soliciting or
    // promoting sexting, not describing it happening to someone else.
    reason: 'sexualSolicitation',
    patterns: [
      phraseBoundaryPattern([
        'send nudes',
        'send me nudes',
        'trade nudes',
        'sell nudes',
        'selling nudes',
        'nudes for cash',
        'nudes for money',
        'dm me for sex',
        'hookup tonight',
        'dm me for sexting',
        'looking for sexting',
        'sexting buddy',
        'lets sext',
        'anyone want to sext',
      ]),
    ],
  },
  {
    // Child sexual exploitation language. Requires a minor-referencing term directly adjacent to
    // an explicit pornographic term, in either order, or a small set of merged single-token
    // variants. Deliberately does NOT match general "child sexual abuse" advocacy or survivor
    // language, which pairs "child" with "abuse"/"assault", not with "porn"/"nude"/"naked".
    reason: 'childSexualExploitation',
    patterns: [
      new RegExp(`\\b${altGroup(MINOR_TERMS)}\\s+${altGroup(EXPLICIT_SEXUAL_TERMS)}\\b`),
      new RegExp(`\\b${altGroup(EXPLICIT_SEXUAL_TERMS)}\\s+${altGroup(MINOR_TERMS)}\\b`),
      phraseBoundaryPattern(MERGED_CHILD_EXPLOITATION_TERMS),
    ],
  },
  {
    // Direct targeted identity-based slurs. Intentionally a short, unambiguous list, not an
    // exhaustive slur dictionary. Matched as whole words only; see the "Known limitations" note at
    // the top of this file for the quotation/condemnation tradeoff this implies for beta.
    reason: 'identitySlur',
    patterns: [phraseBoundaryPattern(['nigger', 'faggot', 'chink', 'spic', 'kike'])],
  },
  {
    // Explicit first-person threats or stated intent to harm another person. Requires an explicit
    // intent marker (not bare "i") immediately followed by a harm verb immediately followed by a
    // second/third-person target, so passive or past-tense victim disclosure (for example
    // "I was hurt by him") does not match: there is no intent marker or harm verb in that order.
    reason: 'threatOfHarm',
    patterns: [
      new RegExp(
        `\\b${altGroup(THREAT_INTENT_MARKERS)}\\s+${altGroup(THREAT_VERBS)}\\s+${altGroup(THREAT_TARGETS)}\\b`,
      ),
    ],
  },
  {
    // Clear targeted harassment phrases: direct, second-person attacks telling someone else to
    // hurt themselves or that they are worthless. Distinct from first-person self-harm disclosure
    // (for example "I want to kill myself"), which targets the speaker, not another person, and is
    // never matched by these patterns.
    reason: 'targetedHarassment',
    patterns: [
      new RegExp(`\\b${altGroup(['kill'])}\\s+${altGroup(['yourself', 'urself', 'ur self'])}\\b`),
      new RegExp(
        `\\b${altGroup(['nobody', 'no one'])}\\s+${altGroup(['likes', 'wants', 'loves'])}\\s+${altGroup(['you'])}\\b`,
      ),
      new RegExp(
        `\\b${altGroup(['you are', 'youre'])}\\s+${altGroup(['worthless', 'pathetic', 'disgusting', 'a waste of space'])}\\b`,
      ),
      new RegExp(`\\b${altGroup(['everyone'])}\\s+${altGroup(['hates'])}\\s+${altGroup(['you'])}\\b`),
      new RegExp(`\\b${altGroup(['you'])}\\s+${altGroup(['should'])}\\s+${altGroup(['die', 'disappear'])}\\b`),
    ],
  },
];

/**
 * Evaluates a piece of submitted text and returns whether it may be shared with the community.
 *
 * Deterministic and side-effect-free: the same input always produces the same output, and this
 * function never logs, persists, or transmits the input or any matched term. The original `text`
 * argument is never mutated; all normalization happens on a separate copy.
 *
 * This function intentionally does NOT validate emptiness or length. That is the existing job of
 * `validatePrayerBody` (see `./validation.ts`); empty or whitespace-only text is allowed here.
 *
 * Fails closed: if evaluation throws for any reason (an unexpected internal failure), the result
 * is `blocked` with reason `internalError`, never `allowed`.
 */
export function filterProhibitedContent(text: string): ContentFilterResult {
  try {
    const normalized = normalizeForMatching(text);
    for (const rule of BLOCK_RULES) {
      if (rule.patterns.some((pattern) => pattern.test(normalized))) {
        return { allowed: false, reason: rule.reason, message: CONTENT_FILTER_MESSAGE };
      }
    }
    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'internalError', message: CONTENT_FILTER_MESSAGE };
  }
}
