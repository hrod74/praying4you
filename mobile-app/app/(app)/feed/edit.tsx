import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../../src/components/Button';
import { EmptyState } from '../../../src/components/EmptyState';
import { PrayerForm, type PrayerFormValues } from '../../../src/components/PrayerForm';
import { Screen } from '../../../src/components/Screen';
import { useAuth } from '../../../src/context/AuthContext';
import { useFeedback } from '../../../src/context/FeedbackContext';
import { usePrayers } from '../../../src/context/PrayerContext';

/**
 * Edit a prayer request (owner only — local/mock only).
 *
 * Reached from the owner controls on a request's detail screen. Reuses the shared
 * PrayerForm in edit mode, pre-filled with the current text, category, and named/anonymous
 * choice. Only the owner can edit; the screen guards against anyone else (the entry point is
 * already owner-only). On save it updates local state and returns to the detail with a calm
 * "Prayer request updated." confirmation.
 */
export default function EditPrayerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { getById, editPrayer } = usePrayers();
  const { showSuccess, showError } = useFeedback();

  const prayer = getById(id);
  const isOwn = Boolean(profile && prayer && prayer.userId === profile.id);

  if (!prayer) {
    return (
      <Screen>
        <EmptyState
          title="Prayer not found"
          message="This request may have been removed."
        />
        <Button label="Go back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!isOwn) {
    return (
      <Screen>
        <EmptyState
          title="This isn't your request"
          message="You can only edit prayer requests you created."
        />
        <Button label="Go back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const handleEdit = async (values: PrayerFormValues) => {
    if (!profile) return;
    try {
      await editPrayer(prayer.id, profile.id, {
        body: values.body,
        category: values.category,
        isAnonymous: values.isAnonymous,
        ownerDisplayName: profile.displayName,
      });
      showSuccess('Prayer request updated.');
      router.back();
    } catch {
      showError('We could not save your changes just now. Please try again.');
      throw new Error('edit-failed'); // re-enable the form
    }
  };

  return (
    <Screen scroll>
      <PrayerForm
        heading="Edit your prayer request"
        subtitle="Update your words, the category, or whether your name is shown."
        submitLabel="Save changes"
        ownerDisplayName={profile?.displayName ?? 'your name'}
        initialValues={{
          body: prayer.body,
          category: prayer.category,
          isAnonymous: prayer.isAnonymous,
        }}
        onSubmit={handleEdit}
      />
    </Screen>
  );
}
