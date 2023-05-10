import * as braze from "@braze/web-sdk";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LocationContentCard,
  Platform,
  ContentCard,
  WhisperContentCard,
} from "~/types/dynamicContent";
import { whisperContentCardSelector } from "~/renderer/reducers/dynamicContent";
import { setWhisperCards } from "~/renderer/actions/dynamicContent";
import { track } from "../analytics/segment";

export function useWhispers() {
  const [cachedWhispers, setCachedWhispers] = useState<braze.Card[]>([]);
  const dispatch = useDispatch();
  const whisperCards = useSelector(whisperContentCardSelector);
  
  useEffect(() => {
    console.log("rawCC", braze.getCachedContentCards().cards)
    const cards = braze
      .getCachedContentCards()
      .cards.filter(
        card =>
          card.extras?.location === LocationContentCard.Whisper,
      );
      setCachedWhispers(cards);
  }, []);

  function startOfDayTime(date: Date): number {
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return startOfDate.getTime();
  }

  const groupWhispers = (
    whispers: WhisperContentCard[],
  ): {
    day: Date | null | undefined;
    data: WhisperContentCard[];
  }[] => {
    const whispersByDay: Record<string, WhisperContentCard[]> = whispers.reduce(
      (sum: Record<string, WhisperContentCard[]>, whisper: WhisperContentCard) => {
        // group by publication date
        const k = startOfDayTime(whisper.createdAt);

        return { ...sum, [`${k}`]: [...(sum[k] || []), whisper] };
      },
      {},
    );
    // map over the keyed groups and sort them by date
    return Object.keys(whispersByDay)
      .filter(
        key => whispersByDay[key] && whispersByDay[key].length > 0, // filter out potential empty groups
      )
      .map(key => Number(key)) // map every string to a number for sort evaluation
      .sort((a, b) => {
        const aa = a === 0 ? Infinity : a; // sort out by timestamp key while keeping priority set announcements on top
        const bb = b === 0 ? Infinity : b; // this can work because a and b cannot be equal to 0 at same time
        return bb - aa;
      })
      .map(date => ({
        day: date === 0 ? null : new Date(date),
        // format Day if available
        data: whispersByDay[`${date}`],
      }));
  };

  const logWhisperImpression = useCallback(
    (cardId: string) => {
      const currentCard = cachedWhispers.find(card => card.id === cardId);

      braze.logContentCardImpressions(currentCard ? [currentCard] : []);

      const cards = (whisperCards ?? []).map(n => {
        if (n.id === cardId) {
          return { ...n, viewed: true };
        } else {
          return n;
        }
      });

      dispatch(setWhisperCards(cards));
    },
    [whisperCards, cachedWhispers, dispatch],
  );

  const onClickWhisper = useCallback(
    (card: ContentCard) => {
      const currentCard = cachedWhispers.find(c => c.id === card.id);

      // Add here the fact that we need to trigger the CTA to sign the transaction
      // console.log(card.id, "i'm clicked");

      if (currentCard) {
        braze.logContentCardClick(currentCard);
      }

      track("contentcard_clicked", {
        contentcard: card.title,
        link: card.path || card.url,
        campaign: card.id,
        page: "notification_center",
      });
    },
    [cachedWhispers],
  );

  return {
    groupWhispers,
    startOfDayTime,
    braze,
    cachedWhispers,
    whisperCards,
    logWhisperImpression,
    onClickWhisper,
  };
}
