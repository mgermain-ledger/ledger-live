---
"live-mobile": patch
---

chore: bump react-native-reanimated to v3

Our usage of react-native-reanimated in v2.15 was creating freezing issues on iOS (see ticket).

- Bumped react-native-reanimated to v3.1.0.
- Added necessary babel plugins to devDependencies that are needed for react-native-reanimated.
- Also updated metro.config.js to stop forcing resolving react-native-reanimated from the LLM folder as it was creating import issues.
- Bumped lottie-react-native to 6.0.0-rc.6 and lottie-ios to 3.5.0.
  - Needed because with Reanimated 3, Lottie from lottie-react-native v5.1.5 were not working correctly anymore

Also adapted the following animations that were still using the v1 api of reanimated:

- AnimatedHeader
- ExperimentalHeader
- CollapsibleList
