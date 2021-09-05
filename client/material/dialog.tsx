import keycode from 'keycode'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import CloseDialogIcon from '../icons/material/ic_close_black_24px.svg'
import KeyListener from '../keyboard/key-listener'
import { CardLayer, colorDividers } from '../styles/colors'
import { headline5 } from '../styles/typography'
import { IconButton } from './button'
import { fastOutLinearIn, fastOutSlowIn, linearOutSlowIn } from './curve-constants'
import { useScrollIndicatorState } from './scroll-indicator'
import { shadowDef8dp } from './shadow-constants'
import { zIndexDialog } from './zindex'

const ESCAPE = keycode('esc')

const Container = styled.div`
  position: absolute;
  left: var(--pixel-shove-x, 0);
  right: 0;
  top: var(--pixel-shove-y, 0);
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: space-around;
  pointer-events: none;
  z-index: ${zIndexDialog};
`

const Surface = styled(CardLayer)`
  width: calc(100% - 160px);
  max-width: 768px;
  max-height: calc(100% - 160px);
  flex-grow: 0;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  border-radius: 2px;
  box-shadow: ${shadowDef8dp};
  pointer-events: auto;

  &.enter {
    transform: translate3d(0, -100%, 0) scale(0.6, 0.2);
    opacity: 0;
  }

  &.enterActive {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    transition: transform 350ms ${linearOutSlowIn}, opacity 250ms ${fastOutSlowIn};
  }

  &.exit {
    pointer-events: none;
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }

  &.exitActive {
    transform: translate3d(0, -100%, 0) scale(0.6, 0.2);
    opacity: 0;
    transition: transform 250ms ${fastOutLinearIn}, opacity 200ms ${fastOutSlowIn} 50ms;
  }
`

const TitleBar = styled.div<{ $showDivider?: boolean }>`
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;

  display: flex;
  align-items: center;

  &::after {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 1px;

    background-color: ${props => (props.$showDivider ? colorDividers : ' transparent')};
    content: '';
    transition: background-color 125ms linear;
  }
`

const Title = styled.div`
  ${headline5};
  flex-grow: 1;
  padding: 24px 24px 20px;
`

const CloseButton = styled(IconButton)`
  flex-shrink: 0;
  margin-right: 12px;
`

const Body = styled.div`
  width: 100%;
  min-height: 100px;
  flex-grow: 1;

  contain: content;
  padding: 0 24px 24px;
  overflow: auto;
`

const Actions = styled.div<{ $showDivider?: boolean }>`
  flex-grow: 0;
  flex-shrink: 0;

  /** NOTE(tec27): This will become 8px with the border. */
  padding: 7px 4px 0;
  margin-bottom: 2px;
  border-top: 1px solid ${props => (props.$showDivider ? colorDividers : 'transparent')};
  transition: border-color 150ms linear;
  text-align: right;
`

export interface DialogProps {
  buttons?: React.ReactNodeArray
  children: React.ReactNode
  className?: string
  dialogRef?: React.Ref<HTMLDivElement>
  showCloseButton?: boolean
  tabs?: React.ReactNode
  title: string
  titleAction?: React.ReactNode
  onCancel?: () => void
}

export function Dialog({
  buttons,
  children,
  className,
  dialogRef,
  showCloseButton = false,
  tabs,
  title,
  titleAction,
  onCancel,
}: DialogProps) {
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (onCancel && event.keyCode === ESCAPE) {
        onCancel()
        return true
      }

      return false
    },
    [onCancel],
  )
  const [isAtTop, isAtBottom, topNode, bottomNode] = useScrollIndicatorState()

  const closeButton = showCloseButton ? (
    <CloseButton icon={<CloseDialogIcon />} title='Close dialog' onClick={onCancel} />
  ) : null

  return (
    <Container role='dialog'>
      <Surface className={className} ref={dialogRef}>
        <KeyListener onKeyDown={onKeyDown} exclusive={true} />
        <TitleBar $showDivider={!isAtTop && !tabs}>
          <Title>{title}</Title>
          {titleAction}
          {closeButton}
        </TitleBar>
        {tabs}

        <Body>
          {topNode}
          {children}
          {bottomNode}
        </Body>
        {buttons && buttons.length ? <Actions $showDivider={!isAtBottom}>{buttons}</Actions> : null}
      </Surface>
    </Container>
  )
}
