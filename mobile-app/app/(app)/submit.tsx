import { useRouter } from 'expo-router';

import { PrayerForm, type PrayerFormValues } from '../../src/components/PrayerForm';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/context/AuthContext';
import { useFeedback } from '../../src/context/FeedbackContext';
import { usePrayers } from '../../src/context/PrayerContext';

/**
 * Create / submit a prayer request (write path — local/mock only).
 *
 * A persistent **tab**, always reachable from the bottom navigation. A signed-in user
 * composes a request via the shared PrayerForm (text + category + named/anonymous choice);
 * on submit it is added to local state and the user is taken to the new request's detail
 * (it also appears at the top of the feed), with a calm "Prayer request shared." confirmation.
 * The owner (the local profile) is always retained privately; email is never shown.
 */
export default function SubmitPrayerScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { addPrayer } = usePrayers();
  const { showSuccess, showError } = useFeedback();

  const handleCreate = async (values: PrayerFormValues) => {
    if (!profile) return;
    try {
      const newId = await addPrayer({
        userId: profile.id,
        displayName: profile.displayName,
        isAnonymous: values.isAnonymous,
        body: values.body,
        category: values.category,
      });
      showSuccess('Prayer request shared.');
      router.navigate(`/(app)/feed/${newId}`);
    } catch {
      showError('We could not share your request just now. Please try again.');
      throw new Error('share-failed'); // re-enable the form
    }
  };

  return (
    <Screen scroll>
      <PrayerForm
        heading="Share a prayer request"
        subtitle="Write what you're carrying. Others in the community will lift it up in prayer."
        submitLabel="Share request"
        ownerDisplayName={profile?.displayName ?? 'your name'}
        onSubmit={handleCreate}
      />
    </Screen>
  );
}
