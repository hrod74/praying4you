import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from './ThemeContext';
import { colors, createThemedStyles, radius, spacing, typography } from '../theme/theme';

/**
 * FeedbackContext — one calm, shared confirmation pattern for the whole app (Phase H.1).
 *
 * Several actions (creating a profile, signing in/out, sharing a request, praying,
 * resetting data, editing/removing a request) succeed quietly. This provider gives them a
 * single, consistent way to confirm success, and a gentle way to report a failure, instead
 * of scattered one-off messages or silent completions.
 *
 * The surface is a quiet banner near the top of the screen: a parchment card for success
 * (with a muted gold accent and a check), a soft clay card for errors (with a caution
 * mark). Meaning is never carried by color alone — there is always an icon and text. It
 * fades in, announces itself to screen readers, auto-dismisses after a few seconds, and can
 * be tapped to dismiss. No popups, no gamified language. Local prototype only.
 */

type Tone = 'success' | 'error';

interface ToastState {
  id: number;
  message: string;
  tone: Tone;
}

interface FeedbackContextValue {
  /** Show a calm success confirmation (auto-dismisses). */
  showSuccess: (message: string) => void;
  /** Show a gentle error message (auto-dismisses, lingers a little longer). */
  showError: (message: string) => void;
}

const SUCCESS_MS = 3200;
const ERROR_MS = 4200;

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  useAppTheme();
  const [toast, setToast] = useState<ToastState | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const dismiss = useCallback(() => {
    clearTimer();
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) setToast(null);
      },
    );
  }, [anim]);

  const show = useCallback(
    (message: string, tone: Tone) => {
      clearTimer();
      counter.current += 1;
      setToast({ id: counter.current, message, tone });
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      // Announce for VoiceOver / TalkBack so the confirmation is not visual-only.
      try {
        AccessibilityInfo.announceForAccessibility(message);
      } catch {
        // Non-fatal: the visible banner still conveys the message.
      }
      timer.current = setTimeout(
        () => {
          Animated.timing(anim, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) setToast(null);
          });
        },
        tone === 'error' ? ERROR_MS : SUCCESS_MS,
      );
    },
    [anim],
  );

  const showSuccess = useCallback((message: string) => show(message, 'success'), [show]);
  const showError = useCallback((message: string) => show(message, 'error'), [show]);

  const value = useMemo<FeedbackContextValue>(
    () => ({ showSuccess, showError }),
    [showSuccess, showError],
  );

  return (
    <FeedbackContext.Provider value={value}>
      <View style={styles.host}>
        {children}
        {toast ? <Toast toast={toast} anim={anim} onDismiss={dismiss} /> : null}
      </View>
    </FeedbackContext.Provider>
  );
}

function Toast({
  toast,
  anim,
  onDismiss,
}: {
  toast: ToastState;
  anim: Animated.Value;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const isError = toast.tone === 'error';
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { top: insets.top + 52, opacity: anim, transform: [{ translateY }] },
      ]}
    >
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={toast.message}
        accessibilityHint="Dismisses this message"
        accessibilityLiveRegion="polite"
        style={[styles.toast, isError ? styles.toastError : styles.toastSuccess]}
      >
        <Text
          style={[styles.icon, isError ? styles.iconError : styles.iconSuccess]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {isError ? '!' : '✓'}
        </Text>
        <Text style={styles.message} maxFontSizeMultiplier={1.6}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return ctx;
}

const styles = createThemedStyles(() => ({
  host: {
    flex: 1,
  },
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    maxWidth: 520,
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    // Gentle, low shadow — paper resting on paper, consistent with the cards.
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  toastSuccess: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderLeftColor: colors.gold,
  },
  toastError: {
    backgroundColor: colors.dangerSurface,
    borderColor: colors.danger,
    borderLeftColor: colors.danger,
  },
  icon: {
    fontSize: 16,
    fontWeight: '700',
    width: 18,
    textAlign: 'center',
  },
  iconSuccess: {
    color: colors.gold,
  },
  iconError: {
    color: colors.danger,
  },
  message: {
    ...typography.body,
    flex: 1,
  },
} as const));

export default FeedbackProvider;
