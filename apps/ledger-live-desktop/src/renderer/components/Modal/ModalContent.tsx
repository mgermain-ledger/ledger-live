import React, { useState, useLayoutEffect, useCallback } from "react";
import styled from "styled-components";
const ContentWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
const ContentScrollableContainer = styled.div<{ noScroll?: boolean }>`
  padding: 20px ${p => (p.noScroll ? 20 : 20 - p.theme.overflow.trackSize)}px 40px 20px;
  ${p => (p.noScroll ? "overflow:hidden" : p.theme.overflow.y)};
  position: relative;
  flex: 0 auto;
`;
const ContentScrollableContainerGradient = styled.div.attrs<{ opacity?: number }>(p => ({
  style: {
    opacity: p.opacity,
  },
}))<{ opacity?: number }>`
  background: linear-gradient(
    rgba(255, 255, 255, 0),
    ${p => p.theme.colors.palette.background.paper}
  );
  transition: opacity 150ms;
  height: 40px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
`;
type Props = React.PropsWithRef<{
  children: React.ReactNode;
  noScroll?: boolean;
}>;

function ModalContent(
  // eslint is wrong here, it should not complain
  // eslint-disable-next-line
  { children, noScroll }: Props,
  containerRef: React.ForwardedRef<HTMLDivElement>,
) {
  const [isScrollable, setScrollable] = useState(false);
  const onHeightUpdate = useCallback(() => {
    const current = containerRef && "current" in containerRef && containerRef.current;
    if (!current || !("current" in containerRef)) return;
    setScrollable(current.scrollHeight > current.clientHeight);
  }, [containerRef]);
  useLayoutEffect(() => {
    if (!containerRef || !("current" in containerRef)) return;
    if (!containerRef?.current) return;
    const ro = new ResizeObserver(onHeightUpdate);
    ro.observe(containerRef?.current);
    return () => {
      ro.disconnect();
    };
  }, [containerRef, onHeightUpdate]);
  return (
    <ContentWrapper>
      <ContentScrollableContainer
        ref={containerRef}
        noScroll={noScroll}
        data-test-id="modal-content"
      >
        {children}
      </ContentScrollableContainer>
      <ContentScrollableContainerGradient opacity={isScrollable && !noScroll ? 1 : 0} />
    </ContentWrapper>
  );
}
export default React.forwardRef(ModalContent);
