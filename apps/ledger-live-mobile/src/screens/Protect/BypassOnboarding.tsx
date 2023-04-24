import React, { useEffect } from "react";
import { Linking } from "react-native";
import { useDispatch } from "react-redux";
import useFeature from "@ledgerhq/live-common/featureFlags/useFeature";

import {
  completeOnboarding,
  setHasOrderedNano,
  setReadOnlyMode,
} from "../../actions/settings";

export default function BypassOnboardingScreen() {
  const recoverFeature = useFeature("protectServicesMobile");
  const dispatch = useDispatch();

  const recoverAccountPage = recoverFeature?.params?.account?.homeURI;

  useEffect(() => {
    if (!recoverFeature?.enabled) return;

    dispatch(completeOnboarding());
    dispatch(setReadOnlyMode(false));
    dispatch(setHasOrderedNano(false));

    Linking.canOpenURL(recoverAccountPage).then(canOpen => {
      if (canOpen) Linking.openURL(recoverAccountPage);
    });
  }, [dispatch, recoverAccountPage, recoverFeature?.enabled]);

  return <></>;
}
