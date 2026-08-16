import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CONTENT_FILTER_MESSAGE, filterProhibitedContent } from './contentFilter.ts';
import type { ContentFilterReason } from './contentFilter.ts';

/**
 * Pure unit tests for the pre-publication content filter. Runs under Node's built-in test runner
 * (`node --test`), no React Native, no Firebase. See package.json `test:content-filter`.
 *
 * Test names intentionally describe the scenario rather than quoting the exact blocked phrase,
 * consistent with the module's own rule of never surfacing matched text.
 */

// ---------------------------------------------------------------------------
// Allowed: sincere prayers touching sensitive, legitimate topics. This list is intentionally
// much larger than the blocked list below, matching the app's actual traffic: the overwhelming
// majority of submissions are genuine prayer requests that happen to be about hard subjects.
// ---------------------------------------------------------------------------

const ALLOWED_PRAYERS: string[] = [
  'Please pray for me, I have been struggling with suicidal thoughts and want to find hope again.',
  'I used to have thoughts of wanting to kill myself, but I am in recovery now and full of hope.',
  'Pray for my sister who is recovering from self-harm and needs strength each day.',
  'Please pray for my daughter who struggles with cutting and self-harm; we want her to feel loved.',
  'Pray for a friend escaping an abusive relationship and needs protection from more violence.',
  'Please pray for children who have experienced abuse, that they find safety and healing.',
  'I was hurt by him for years, but I have since found safety and I am rebuilding my life.',
  'Please pray for my cousin who survived an assault last year and is healing slowly.',
  'Pray for the victims of violence in our city and for peace to return.',
  'Please pray for my brother who is fighting alcohol addiction and trying to stay sober.',
  'Pray for my son who is battling drug addiction, that he finds recovery and hope.',
  'My mother was just diagnosed with cancer and we are asking for healing prayers.',
  'Please pray for my uncle going through chemotherapy for his cancer treatment.',
  'Please pray for our family, we are grieving the death of my father.',
  'Pray for peace and comfort as I walk through the grief of losing my closest friend.',
  'I have been dealing with depression and anxiety and would appreciate prayer.',
  'Please pray for my mental health, some days getting out of bed feels impossible.',
  'Please pray for my family, we are going through a lot of conflict and division right now.',
  'Pray for reconciliation between me and my father, our relationship has been so strained.',
  // Ordinary words that contain character sequences resembling prohibited fragments.
  'My therapist has really helped me process my grief this year, thank you for praying.',
  'Please pray for my class at school, we have a big exam and I am anxious about it.',
  'I started a new job as an assistant and feel overwhelmed, please pray for peace of mind.',
  // Ordinary words with normal double letters, unrelated to any reference word above.
  'Please continue praying for my illness and for a full recovery.',
  'Please pray for my classroom, my assistant, and my ongoing illness this week.',
  // A country name that happens to share a letter sequence with a configured slur once that
  // slur's doubled letter is ignored. See the regression tests below for the direct case.
  'Please pray for families in Niger.',
  'Please pray for peace and healing in Niger.',
  // A sincere prayer describing sexting happening to someone else, not soliciting it.
  'Please pray for a teenager being pressured into sexting.',
];

test('allowed: sincere prayers about sensitive but legitimate topics are never blocked', () => {
  for (const prayer of ALLOWED_PRAYERS) {
    const result = filterProhibitedContent(prayer);
    assert.equal(result.allowed, true, `expected this prayer to be allowed`);
  }
});

test('allowed: empty text is allowed by the filter itself (length is validation.ts\'s job)', () => {
  assert.deepEqual(filterProhibitedContent(''), { allowed: true });
});

test('allowed: whitespace-only text is allowed by the filter itself', () => {
  assert.deepEqual(filterProhibitedContent('   '), { allowed: true });
  assert.deepEqual(filterProhibitedContent('\n\t  \n'), { allowed: true });
});

// ---------------------------------------------------------------------------
// Regression: a place name is not conflated with a configured slur that happens to have a
// doubled letter. See the "Known limitations" note in contentFilter.ts for the root cause this
// guards against (an earlier version collapsed repeated letters in the submitted text itself).
// ---------------------------------------------------------------------------

test('allowed regression: a country name is never conflated with a slur that has a doubled letter', () => {
  assert.deepEqual(filterProhibitedContent('Please pray for families in Niger.'), { allowed: true });
  assert.deepEqual(filterProhibitedContent('Please pray for peace and healing in Niger.'), {
    allowed: true,
  });
});

test('allowed regression: ordinary words with normal double letters are never altered into a match', () => {
  assert.equal(filterProhibitedContent('Please continue praying for my illness and recovery.').allowed, true);
  assert.equal(filterProhibitedContent('My therapist has really helped me process my grief.').allowed, true);
  assert.equal(filterProhibitedContent('Please pray for my class at school.').allowed, true);
  assert.equal(
    filterProhibitedContent('I started a new job as an assistant and feel overwhelmed.').allowed,
    true,
  );
});

// ---------------------------------------------------------------------------
// Regression: the word "sexting" alone, or describing sexting happening to someone else, is not
// solicitation. Only a speaker soliciting or promoting sexting themselves is blocked.
// ---------------------------------------------------------------------------

test('allowed regression: describing sexting happening to someone else is not solicitation', () => {
  assert.deepEqual(filterProhibitedContent('Please pray for a teenager being pressured into sexting.'), {
    allowed: true,
  });
});

test('allowed: the bare word sexting on its own is not blocked', () => {
  assert.equal(filterProhibitedContent('sexting').allowed, true);
  assert.equal(filterProhibitedContent('I do not know what sexting even means.').allowed, true);
});

test('blocked: narrow sexting solicitation phrasing', () => {
  assert.equal(filterProhibitedContent('DM me for sexting').allowed, false);
  assert.equal(filterProhibitedContent('looking for sexting tonight').allowed, false);
  assert.equal(filterProhibitedContent('sexting buddy wanted').allowed, false);
});

// ---------------------------------------------------------------------------
// Blocked: high-confidence categories, with simple evasion variants.
// ---------------------------------------------------------------------------

test('blocked: explicit sexual solicitation phrasing', () => {
  const result = filterProhibitedContent('Send nudes');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'sexualSolicitation');
});

test('blocked: sexual solicitation, capitalization evasion', () => {
  const result = filterProhibitedContent('SEND NUDES please');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'sexualSolicitation');
});

test('blocked: sexual solicitation, repeated-whitespace evasion', () => {
  const result = filterProhibitedContent('send    nudes');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'sexualSolicitation');
});

test('blocked: sexual solicitation, punctuation inserted inside the term', () => {
  const result = filterProhibitedContent('s.e.n.d n.u.d.e.s');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'sexualSolicitation');
});

test('blocked: sexual solicitation, character-substitution evasion', () => {
  const result = filterProhibitedContent('s3nd nud3s');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'sexualSolicitation');
});

test('blocked: sexual solicitation, repeated-character evasion', () => {
  const result = filterProhibitedContent('senddddd nudessss');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'sexualSolicitation');
});

test('blocked: child sexual exploitation language', () => {
  const result = filterProhibitedContent('child porn');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'childSexualExploitation');
});

test('blocked: child sexual exploitation language, reversed word order', () => {
  const result = filterProhibitedContent('nude minor');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'childSexualExploitation');
});

test('blocked: child sexual exploitation, capitalization evasion', () => {
  const result = filterProhibitedContent('CHILD PORN');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'childSexualExploitation');
});

test('blocked: child sexual exploitation, repeated-whitespace evasion', () => {
  const result = filterProhibitedContent('child     porn');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'childSexualExploitation');
});

test('blocked: child sexual exploitation, punctuation used inside the merged term', () => {
  const result = filterProhibitedContent('child-porn');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'childSexualExploitation');
});

test('blocked: child sexual exploitation, character-substitution evasion', () => {
  const result = filterProhibitedContent('ch1ld p0rn');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'childSexualExploitation');
});

test('blocked: child sexual exploitation, repeated-character evasion', () => {
  const result = filterProhibitedContent('chiiiild porn');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'childSexualExploitation');
});

test('blocked: legitimate child-abuse advocacy language is not mistaken for exploitation language', () => {
  const result = filterProhibitedContent('Please pray for children who have experienced abuse.');
  assert.equal(result.allowed, true);
});

const SLUR_EXAMPLES: string[] = ['nigger', 'faggot', 'chink', 'spic', 'kike'];

test('blocked: each configured identity-based slur is blocked on its own', () => {
  for (const slur of SLUR_EXAMPLES) {
    const result = filterProhibitedContent(`That ${slur} thing you said was awful.`);
    assert.equal(result.allowed, false, `expected a slur to be blocked`);
    assert.equal(result.reason, 'identitySlur');
  }
});

test('blocked: identity slur, capitalization evasion', () => {
  const result = filterProhibitedContent('CHINK');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'identitySlur');
});

test('blocked: identity slur, punctuation inserted inside the term', () => {
  const result = filterProhibitedContent('n-i-g-g-e-r');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'identitySlur');
});

test('blocked: identity slur, character-substitution evasion', () => {
  const result = filterProhibitedContent('f4gg0t');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'identitySlur');
});

test('blocked: identity slur, repeated-character evasion', () => {
  const result = filterProhibitedContent('niggerrrrr');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'identitySlur');
});

test('blocked: a word merely containing a slur-like fragment does not trigger a false positive', () => {
  // Sanity check for word-boundary matching alongside the ALLOWED_PRAYERS corpus above.
  const result = filterProhibitedContent('Please pray for my class at school.');
  assert.equal(result.allowed, true);
});

test('blocked: explicit first-person threat to kill a named target', () => {
  const result = filterProhibitedContent('I will kill you');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'threatOfHarm');
});

test('blocked: threat of harm, other verbs and targets', () => {
  assert.equal(filterProhibitedContent('I am going to hurt him').allowed, false);
  assert.equal(filterProhibitedContent('Im gonna shoot them').allowed, false);
  assert.equal(filterProhibitedContent('I am gonna stab u').allowed, false);
});

test('blocked: threat of harm, contraction form', () => {
  const result = filterProhibitedContent("I'll kill you");
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'threatOfHarm');
});

test('blocked: threat of harm, capitalization evasion', () => {
  const result = filterProhibitedContent('I WILL KILL YOU');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'threatOfHarm');
});

test('blocked: threat of harm, repeated-whitespace evasion', () => {
  const result = filterProhibitedContent('I    will    kill    you');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'threatOfHarm');
});

test('blocked: threat of harm, trailing punctuation', () => {
  const result = filterProhibitedContent('I will kill you!!!');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'threatOfHarm');
});

test('blocked: threat of harm, character-substitution evasion', () => {
  const result = filterProhibitedContent('I w1ll k1ll you');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'threatOfHarm');
});

test('blocked: threat of harm, repeated-character evasion', () => {
  const result = filterProhibitedContent('I willllll killllll you');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'threatOfHarm');
});

test('allowed: first-person self-harm disclosure is not mistaken for a threat against another person', () => {
  assert.equal(filterProhibitedContent('I want to kill myself and need help.').allowed, true);
  assert.equal(filterProhibitedContent('I was hurt by him for years.').allowed, true);
});

test('blocked: telling someone else to harm themselves', () => {
  const result = filterProhibitedContent('Kill yourself');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'targetedHarassment');
});

test('blocked: targeted harassment phrases', () => {
  assert.equal(filterProhibitedContent('Nobody likes you').allowed, false);
  assert.equal(filterProhibitedContent('You are worthless').allowed, false);
  assert.equal(filterProhibitedContent("You're pathetic and disgusting").allowed, false);
  assert.equal(filterProhibitedContent('Everyone hates you').allowed, false);
  assert.equal(filterProhibitedContent('You should disappear').allowed, false);
});

test('blocked: targeted harassment, capitalization evasion', () => {
  const result = filterProhibitedContent('KILL YOURSELF');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'targetedHarassment');
});

test('blocked: targeted harassment, repeated-whitespace evasion', () => {
  const result = filterProhibitedContent('kill    yourself');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'targetedHarassment');
});

test('blocked: targeted harassment, character-substitution evasion', () => {
  const result = filterProhibitedContent('k1ll y0urs3lf');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'targetedHarassment');
});

test('blocked: targeted harassment, repeated-character evasion', () => {
  const result = filterProhibitedContent('killllll yourselffff');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'targetedHarassment');
});

// ---------------------------------------------------------------------------
// Fail-closed behavior, determinism, immutability, and result shape.
// ---------------------------------------------------------------------------

test('fails closed: an unexpected internal evaluation failure blocks, never allows', () => {
  // Simulates an internal failure (e.g. a caller violating the string type at runtime) by
  // deliberately passing a non-string value through an unsound cast.
  const badInputs: unknown[] = [null, undefined, 42, {}];
  for (const bad of badInputs) {
    const result = filterProhibitedContent(bad as unknown as string);
    assert.equal(result.allowed, false, 'an internal failure must never resolve to allowed');
    assert.equal(result.reason, 'internalError');
    assert.equal(result.message, CONTENT_FILTER_MESSAGE);
  }
});

test('is deterministic: the same input always produces the same result', () => {
  const inputs = ['Please pray for my family during this hard season.', 'I will kill you', 'child porn'];
  for (const input of inputs) {
    const first = filterProhibitedContent(input);
    for (let i = 0; i < 25; i++) {
      assert.deepEqual(filterProhibitedContent(input), first);
    }
  }
});

test('does not mutate the original input string', () => {
  const original = 'SEND nudes!!!   please   respond';
  const beforeCall = original;
  filterProhibitedContent(original);
  assert.equal(original, beforeCall);
  assert.equal(original, 'SEND nudes!!!   please   respond');
});

test('an allowed result contains only the allowed field', () => {
  const result = filterProhibitedContent('Please pray for my family.');
  assert.deepEqual(Object.keys(result).sort(), ['allowed']);
});

test('a blocked result contains only the typed outcome, reason, and message fields', () => {
  const result = filterProhibitedContent('I will kill you');
  assert.deepEqual(Object.keys(result).sort(), ['allowed', 'message', 'reason']);
});

test('user-facing copy is identical across every blocked category and never names the term', () => {
  const perCategoryInputs: Record<Exclude<ContentFilterReason, 'internalError'>, string> = {
    sexualSolicitation: 'send nudes',
    childSexualExploitation: 'child porn',
    identitySlur: 'chink',
    threatOfHarm: 'I will kill you',
    targetedHarassment: 'kill yourself',
  };
  for (const [reason, input] of Object.entries(perCategoryInputs)) {
    const result = filterProhibitedContent(input);
    assert.equal(result.allowed, false);
    assert.equal(result.reason, reason);
    assert.equal(result.message, CONTENT_FILTER_MESSAGE);
    assert.equal(result.message.toLowerCase().includes(input.toLowerCase()), false);
  }
});
