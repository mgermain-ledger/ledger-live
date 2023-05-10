import { handleActions } from "redux-actions";
import { NotificationContentCard, PortfolioContentCard, WhisperContentCard } from "~/types/dynamicContent";
import { Handlers } from "./types";

export type DynamicContentState = {
  portfolioCards: PortfolioContentCard[];
  notificationsCards: NotificationContentCard[];
  whisperCards:  WhisperContentCard[];
};

const state: DynamicContentState = {
  portfolioCards: [],
  notificationsCards: [],
  whisperCards: [],
};

type HandlersPayloads = {
  DYNAMIC_CONTENT_SET_PORTFOLIO_CARDS: PortfolioContentCard[];
  DYNAMIC_CONTENT_SET_NOTIFICATIONS_CARDS: NotificationContentCard[];
  DYNAMIC_CONTENT_SET_WHISPER_CARDS: WhisperContentCard[];
};
type DynamicContentHandlers<PreciseKey = true> = Handlers<
  DynamicContentState,
  HandlersPayloads,
  PreciseKey
>;

const handlers: DynamicContentHandlers = {
  DYNAMIC_CONTENT_SET_PORTFOLIO_CARDS: (
    state: DynamicContentState,
    { payload }: { payload: PortfolioContentCard[] },
  ) => ({
    ...state,
    portfolioCards: payload,
  }),
  DYNAMIC_CONTENT_SET_NOTIFICATIONS_CARDS: (
    state: DynamicContentState,
    { payload }: { payload: NotificationContentCard[] },
  ) => ({
    ...state,
    notificationsCards: payload,
  }),
  DYNAMIC_CONTENT_SET_WHISPER_CARDS: (
    state: DynamicContentState,
    { payload }: { payload: WhisperContentCard[] },
  ) => ({
    ...state,
    whisperCards: payload,
  }),
};

// Selectors

export const portfolioContentCardSelector = (state: { dynamicContent: DynamicContentState }) =>
  state.dynamicContent.portfolioCards;

export const notificationsContentCardSelector = (state: { dynamicContent: DynamicContentState }) =>
  state.dynamicContent.notificationsCards;

export const whisperContentCardSelector = (state: { dynamicContent: DynamicContentState }) =>
state.dynamicContent.whisperCards;

// Exporting reducer

export default handleActions<DynamicContentState, HandlersPayloads[keyof HandlersPayloads]>(
  (handlers as unknown) as DynamicContentHandlers<false>,
  state,
);
