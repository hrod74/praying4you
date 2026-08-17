# QA EAS Update Scenarios

## Status

PASSED on 2026-08-17. EAS Update delivery and cleanup were both verified in the installed Android preview APK without reinstalling the application.

## Configuration Under Test

- Expo project: `@product-spark-studio/praying4you`
- EAS channel and branch: `preview`
- Platform: Android
- Runtime version: `1.0.0`
- Update URL: `https://u.expo.dev/0d161eba-4631-418c-a437-4e613a87804d`
- Update-capable build ID: `825e4338-62e3-4745-922b-34cd958eecb1`
- Build source commit: `5dcac296a80b448e6f65eb47bc9e76ddc5867929`
- Test device: Android Studio Pixel 2 emulator

## Baseline Build

- [x] `expo-updates` was installed using the Expo SDK-compatible package version.
- [x] EAS Update was configured using the existing EAS project ID.
- [x] The preview profile was connected to the `preview` channel.
- [x] The EAS preview APK built successfully.
- [x] The owner installed the new APK.
- [x] The owner signed in to a Firebase test account.
- [x] The feed and Verse of the Day appeared normally before any OTA test update was published.

## OTA Delivery Test

- Temporary visible change: a card at the top of Settings reading `Preview update test successful` and `Delivered through EAS Update on August 17, 2026.`
- Source commit: `cf4b7b6a8abf8743a1545bd80e1970d530a12633`
- Update group ID: `8a610ff7-808a-49e2-8e92-86f92d370bae`
- Android update ID: `01a01038-52ac-7d48-98d1-aa9a8e08f467`

- [x] The update was published only to the Android `preview` channel.
- [x] The existing APK was not reinstalled.
- [x] The owner fully closed and reopened the app to download and apply the update.
- [x] The owner confirmed the temporary Settings card appeared.

## OTA Cleanup Test

- Cleanup source commit: `f13cebb0fe280fef363f255ce676bbb10c7ddaa6`
- Cleanup update group ID: `6508574a-6f0f-4d0e-9cd2-250c50756a29`
- Cleanup Android update ID: `01a0103b-6eb9-7945-b664-ad512b8d0334`

- [x] The temporary card was removed from the source tree.
- [x] The cleanup was published only to the Android `preview` channel.
- [x] The existing APK was not reinstalled.
- [x] The owner fully closed and reopened the app to download and apply the cleanup.
- [x] The owner confirmed the temporary Settings card was gone.

## Result Boundary

This test proves that the installed Android preview build can receive compatible JavaScript updates from the `preview` channel and that a follow-up cleanup update can replace the prior update without reinstalling the APK. The production channel was not used or modified.

The test does not prove iOS OTA delivery. A future iOS build must include `expo-updates`, use a compatible runtime, and receive an iOS or all-platform update before iOS OTA delivery is marked verified. Native dependency, permission, Expo SDK, and other native-runtime changes still require a new store build.

## Outcome

EAS Update is configured and verified for the Android preview workflow. The temporary verification UI has been removed, and the installed preview app is back to the intended product experience.
