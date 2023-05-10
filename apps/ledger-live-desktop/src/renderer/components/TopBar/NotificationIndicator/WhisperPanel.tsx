/* eslint-disable react/prop-types */

import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { Trans } from "react-i18next";
import { InView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import InfoCircle from "~/renderer/icons/InfoCircle";
import TriangleWarning from "~/renderer/icons/TriangleWarning";
import LinkWithExternalIcon from "~/renderer/components/LinkWithExternalIcon";
import { openURL } from "~/renderer/linking";
import { ScrollArea } from "~/renderer/components/Onboarding/ScrollArea";
import Box from "~/renderer/components/Box";
import Text from "~/renderer/components/Text";
import { useDeepLinkHandler } from "~/renderer/hooks/useDeeplinking";
import { closeInformationCenter } from "~/renderer/actions/UI";
import useDateTimeFormat from "~/renderer/hooks/useDateTimeFormat";
import { useNotifications } from "~/renderer/hooks/useNotifications";
import TrackPage from "~/renderer/analytics/TrackPage";
import { urls } from "~/config/urls";
import Button from "~/renderer/components/Button";
import { LocationContentCard, NotificationContentCard } from "~/types/dynamicContent";
import { flattenAccountsSelector } from "~/renderer/reducers/accounts";
// Martin's loco test
// import {
//   Transaction,
//   TransactionSign,
//   WalletAPIClient,
//   WindowMessageTransport,
// } from "@ledgerhq/wallet-api-client";
// import HWTransport from "@ledgerhq/hw-transport";

const DateRowContainer = styled.div`
  padding: 4px 16px;
  background-color: ${({ theme }) => theme.colors.palette.background.default};
  border-radius: 4px;
  margin: 25px 0px;
`;
const levelThemes = {
  info: {
    title: "palette.text.shade100",
    text: "palette.text.shade50",
    background: undefined,
    icon: undefined,
    link: undefined,
    padding: undefined,
  },
  warning: {
    title: "white",
    text: "white",
    background: "orange",
    icon: "white",
    link: "white",
    padding: "16px",
  },
  alert: {
    title: "palette.text.shade100",
    text: "palette.text.shade50",
    background: "red",
    icon: "white",
    link: "white",
    padding: undefined,
  },
};
const getLevelTheme = (levelName: keyof typeof levelThemes) => {
  const levelData = levelThemes[levelName];
  if (levelData) {
    return levelData;
  }
  return levelThemes.info;
};
const UnReadNotifBadge = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${p => p.theme.colors.wallet};
  border-radius: 8px;
  position: absolute;
  top: calc(50% - 4px);
  left: 0px;
  z-index: 1;
`;
type DateRowProps = {
  date: Date;
};
const DateLabel = styled(Text).attrs({
  color: "palette.text.shade60",
  ff: "Inter|SemiBold",
  fontSize: "11px",
  lineHeight: "18px",
})`
  display: inline-block;

  &::first-letter {
    text-transform: uppercase;
  }
`;
function DateRow({ date }: DateRowProps) {
  const dateFormatter = useDateTimeFormat({
    dateStyle: "full",
  });
  return (
    <DateRowContainer>
      <DateLabel>{dateFormatter(date)}</DateLabel>
    </DateRowContainer>
  );
}
const ArticleRootContainer = styled.div<{ isRead?: boolean }>`
  padding-left: ${p => (p.isRead ? 0 : 16)}px;
  position: relative;
`;
const ArticleContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  border-radius: 4px;
`;
const ArticleRightColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
type ArticleProps = {
  level: keyof typeof levelThemes;
  icon: keyof typeof icons;
  title: React.ReactNode;
  text: React.ReactNode;
  link?: {
    label?: string;
    href: string;
  };
  utmCampaign?: string;
  isRead?: boolean;
};
const icons = {
  warning: {
    defaultIconColor: "orange",
    Icon: TriangleWarning,
  },
  info: {
    defaultIconColor: "wallet",
    Icon: InfoCircle,
  },
};
const getIcon = (iconName: keyof typeof icons) => {
  const iconData = icons[iconName];
  if (iconData) {
    return iconData;
  }
  return icons.info;
};
type ArticleLinkProps = {
  label?: string;
  href: string;
  utmCampaign?: string;
  color?: string;
};
function ArticleLink({ label, href, utmCampaign, color }: ArticleLinkProps) {
  const { handler } = useDeepLinkHandler();
  const dispatch = useDispatch();
  const url = useMemo(() => {
    const url = new URL(href);
    url.searchParams.set("utm_medium", "announcement");
    if (utmCampaign) {
      url.searchParams.set("utm_campaign", utmCampaign);
    }
    return url;
  }, [href, utmCampaign]);
  const onLinkClick = useCallback(() => {
    const isDeepLink = url.protocol === "ledgerlive:";
    if (isDeepLink) {
      handler(null, url.href);
      dispatch(closeInformationCenter());
    } else openURL(url.href);
  }, [url, handler, dispatch]);
  return (
    // <LinkWithExternalIcon
    //   color={color}
    //   onClick={onLinkClick}
    //   style={{
    //     marginTop: 15,
    //   }}
    // >
    //   {label || href}
    // </LinkWithExternalIcon>
    <div>
      <Button mt={2} small primary onClick={onLinkClick}>
        <Box horizontal flow={1} alignItems="center">
          <Box>{label || href}</Box>
        </Box>
      </Button>
    </div>
  );
}
function Article({
  level = "info",
  icon = "info",
  title,
  text,
  link,
  utmCampaign,
  isRead,
}: ArticleProps) {
  const levelTheme = getLevelTheme(level);
  const { Icon, defaultIconColor } = getIcon(icon);
  return (
    <ArticleRootContainer isRead={isRead}>
      <ArticleContainer
        bg={levelTheme.background}
        py={levelTheme.padding}
        px="16px"
        color={levelTheme.icon || defaultIconColor}
      >
        <ArticleRightColumnContainer>
          <Box horizontal alignItems="center" justifyContent="center">
            <Icon size={15} />
            <Box ml={2} flex="1">
              <Text
                color={levelTheme.title}
                ff="Inter|SemiBold"
                fontSize="14px"
                lineHeight="16.94px"
              >
                {title}
              </Text>
            </Box>
          </Box>

          <Text
            mt="4px"
            color={levelTheme.text}
            ff="Inter|Medium"
            fontSize="12px"
            lineHeight="18px"
          >
            {text}
          </Text>
          {link ? (
            <ArticleLink
              href={link.href}
              label={link.label}
              utmCampaign={utmCampaign}
              color={levelTheme.link}
            />
          ) : null}
        </ArticleRightColumnContainer>
      </ArticleContainer>
      {isRead ? null : <UnReadNotifBadge />}
    </ArticleRootContainer>
  );
}
const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;
const Separator = styled.div`
  margin: 25px 0px;
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.neutral.c40};
`;

const notificationCardsDummy: NotificationContentCard[] = [
  {
    id: "1",
    location: LocationContentCard.NotificationCenter,
    imgs: [
      {
        source: "https://example.com/image1.jpg",
        transform: [0, 0, 100, 100],
        size: { width: 640, height: 480 },
      },
    ],
    title: "New feature available!",
    description: "We have released a new feature on our platform, check it out now.",
    url: "https://example.com/new-feature",
    createdAt: new Date(),
    cta: "Go to Feature",
    viewed: false,
  },
  {
    id: "2",
    location: LocationContentCard.NotificationCenter,
    imgs: [
      {
        source: "https://example.com/image2.jpg",
        transform: [0, 0, 100, 100],
        size: { width: 640, height: 480 },
      },
    ],
    title: "Limited-time offer",
    description: "Get 50% off your first purchase with us for a limited time only.",
    url: "https://example.com/offers",
    createdAt: new Date(),
    cta: "Shop Now",
    viewed: true,
  },
];

export function WhisperPanel() {
  const { logNotificationImpression, groupNotifications, onClickNotif } = useNotifications();

   // Define the Ledger Live API variable used to call api methods
  //  const api = useRef<WalletAPIClient>();
  //  const transport = useRef<HWTransport>();
 
   const [output, setOutput] = useState<any>(null);
 
   // Instantiate the Ledger Live API on component mount
  //  useEffect(() => {
  //    const windowTransport = new WindowMessageTransport();
  //    const client = new WalletAPIClient(windowTransport);
  //    windowTransport.connect();
  //    api.current = client;
 
  //    // Cleanup the Ledger Live API on component unmount
  //    return () => {
  //      api.current = undefined;
  //      windowTransport.disconnect();
  //    };
  //  }, []);

  //Modals 
  const accounts = useSelector(flattenAccountsSelector);
  const dispatch = useDispatch();

  const timeoutByUUID = useRef<Record<string, NodeJS.Timeout>>({});
  const handleInViewNotif = useCallback(
    (visible: boolean, uuid: keyof typeof timeoutByUUID.current) => {
      const timeouts = timeoutByUUID.current;

      if (
        notificationCardsDummy.find(n => !n.viewed && n.id === uuid) &&
        visible &&
        !timeouts[uuid]
      ) {
        timeouts[uuid] = setTimeout(() => {
          logNotificationImpression(uuid);
          delete timeouts[uuid];
        }, 2000);
      }
      if (!visible && timeouts[uuid]) {
        clearTimeout(timeouts[uuid]);
        delete timeouts[uuid];
      }
    },
    [logNotificationImpression, notificationCardsDummy],
  );

  const groups = useMemo(
    () => groupNotifications(notificationCardsDummy),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notificationCardsDummy],
  );

  if (!notificationCardsDummy) {
    return (
      <PanelContainer>
        <Text
          mt="22px"
          color="palette.text.shade100"
          ff="Inter|SemiBold"
          fontSize="18px"
          lineHeight="21.78px"
        >
          Let the chain whisper your next move
        </Text>
        <Text
          mt="8px"
          color="palette.text.shade50"
          ff="Inter|Regular"
          fontSize="13px"
          lineHeight="16px"
        >
          Create a new whisper to get started
        </Text>
        <Box
          mt={5}
          mb={5}
          horizontal
          style={{
            width: 300,
          }}
          flow={3}
          justifyContent="center"
        >
          <Button
            primary
            onClick={undefined}
            data-test-id="portfolio-empty-state-add-account-button"
          >
            Add Whisper
          </Button>
        </Box>
      </PanelContainer>
    );
  }
  return (
    <ScrollArea hideScrollbar>
      <Box py="32px">
        {groups.map((group, index) => (
          <React.Fragment key={index}>
            {group.day ? <DateRow date={group.day} /> : null}
            {group.data.map(({ title, description, path, url, viewed, id, cta }, index) => (
              <React.Fragment key={id}>
                <InView
                  as="div"
                  onChange={visible => handleInViewNotif(visible, id)}
                  onClick={() => onClickNotif(group.data[index])}
                >
                  <Article
                    title={title}
                    text={description}
                    isRead={viewed}
                    level={"info"}
                    icon={"info"}
                    link={{
                      label: cta,
                      href: url || path || urls.ledger,
                    }}
                  />
                </InView>
                {index < group.data.length - 1 ? <Separator /> : null}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </Box>
    </ScrollArea>
  );
}
