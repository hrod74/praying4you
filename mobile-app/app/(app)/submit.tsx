import { useRouter } from 'expo-router';
import { useState } from 'react';

import { PrayerForm, type PrayerFormValues } from '../../src/components/PrayerForm';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/context/AuthContext';
import { useFeedback } from '../../src/context/FeedbackContext';
import { usePrayers } from '../../src/context/PrayerContext';

/**
 * Create / submit a prayer request (write path — local/mock only).
 *
 * A persistent **tab**, always reachable from the bottom navigation. A signed-in user
 * composes a request via the shared PrayerForm (text + category + named/anonymous choice).
 * On submit it is added to local state and the user is returned to the **Feed**, where the
 * new request appears at the top, with a calm "Prayer request shared." confirmation (Phase
 * H.2: the user no longer lands on the request's detail/owner screen after creating it). The
 * form is reset for next time. The owner (the local profile) is always retained privately;
 * email is never shown.
 */
export default function SubmitPrayerScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { addPrayer } = usePrayers();
  const { showSuccess, showError } = useFeedback();

  // Bumping this remounts PrayerForm after a successful share, clearing it for next time.
  const [formKey, setFormKey] = useState(0);

  const handleCreate = async (values: PrayerFormValues) => {
    if (!profile) return;
    try {
      await addPrayer({
        userId: profile.id,
        displayName: profile.displayName,
        isAnonymous: values.isAnonymous,
        body: values.body,
        category: values.category,
      });
      showSuccess('Prayer request shared.');
      setFormKey((k) => k + 1);
      // Return to the Feed; the new request is prepended, so it sits at the top.
      router.navigate('/(app)/feed');
    } catch {
      showError('We could not share your request just now. Please try again.');
      throw new Error('share-failed'); // re-enable the form
    }
  };

  return (
    <Screen scroll>
      <PrayerForm
        key={formKey}
        heading="Share a prayer request"
        subtitle="Write what you're carrying. Others in the community will lift it up in prayer."
        submitLabel="Share request"
        ownerDisplayName={profile?.displayName ?? 'your name'}
        onSubmit={handleCreate}
      />
    </Screen>
  );
}
