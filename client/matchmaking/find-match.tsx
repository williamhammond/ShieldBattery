import { Immutable } from 'immer'
import React, { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import { assertUnreachable } from '../../common/assert-unreachable'
import { MatchmakingPreferences, MatchmakingType } from '../../common/matchmaking'
import { closeOverlay } from '../activities/action-creators'
import { ComingSoon } from '../coming-soon/coming-soon'
import KeyListener from '../keyboard/key-listener'
import { RaisedButton } from '../material/button'
import { useScrollIndicatorState } from '../material/scroll-indicator'
import { TabItem, Tabs } from '../material/tabs'
import { useAppDispatch, useAppSelector } from '../redux-hooks'
import { colorDividers, colorError } from '../styles/colors'
import { Headline5, subtitle1 } from '../styles/typography'
import { findMatch } from './action-creators'
import { Contents1v1 } from './find-1v1'
import { FindMatchFormRef } from './find-match-forms'

const ENTER = 'Enter'
const ENTER_NUMPAD = 'NumpadEnter'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const TitleBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 16px 24px;
`

const Contents = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  contain: strict;
`

const ContentsBody = styled.div`
  padding: 12px 24px;
`

const ScrollDivider = styled.div<{ show: boolean }>`
  position: absolute;
  height: 1px;
  left: 0;
  right: 0;
  top: 0;

  background-color: ${props => (props.show ? colorDividers : 'transparent')};
  transition: background-color 150ms linear;
`

const Actions = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 24px;
  contain: content;
`

const ErrorText = styled.div`
  ${subtitle1};
  margin-left: 16px;
  color: ${colorError};
`

// TODO(tec27): Remove this once 3v3 is added as a "real" matchmaking type
type ExpandedMatchmakingType = MatchmakingType | '3v3'

export function FindMatch() {
  const lastQueuedMatchmakingType = useAppSelector(
    s => s.matchmakingPreferences.lastQueuedMatchmakingType,
  )
  const [activeTab, setActiveTab] = useState(lastQueuedMatchmakingType as ExpandedMatchmakingType)

  const dispatch = useAppDispatch()
  const isMatchmakingEnabled = useAppSelector(
    s => s.matchmakingStatus.types.get(activeTab)?.enabled ?? false,
  )

  const [, isAtBottom, topElem, bottomElem] = useScrollIndicatorState({
    refreshToken: activeTab,
  })
  const formRef = useRef<FindMatchFormRef>(null)

  const onSubmit = useCallback(
    (prefs: Immutable<MatchmakingPreferences>) => {
      if (activeTab === '3v3') {
        return
      }
      dispatch(findMatch(activeTab, prefs))
      dispatch(closeOverlay() as any)
    },
    [activeTab, dispatch],
  )

  const onFindClick = useCallback(() => {
    formRef.current?.submit()
  }, [])

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === ENTER || event.code === ENTER_NUMPAD) {
        onFindClick()
        return true
      }

      return false
    },
    [onFindClick],
  )

  let contents: React.ReactNode | undefined
  switch (activeTab) {
    case MatchmakingType.Match1v1:
      contents = <Contents1v1 formRef={formRef} onSubmit={onSubmit} />
      break
    case MatchmakingType.Match2v2:
    case '3v3':
      // TODO(tec27): Build UIs for these
      contents = undefined
      break
    default:
      contents = assertUnreachable(activeTab)
  }

  return (
    <Container>
      <TitleBar>
        <Headline5>Find match</Headline5>
      </TitleBar>
      <Tabs bottomDivider={true} activeTab={activeTab} onChange={setActiveTab}>
        <TabItem text='1 vs 1' value={MatchmakingType.Match1v1} />
        <TabItem text='2 vs 2' value={MatchmakingType.Match2v2} />
        <TabItem text='3 vs 3' value={'3v3'} />
      </Tabs>

      {contents ? (
        <>
          <KeyListener onKeyDown={onKeyDown} />
          <Contents>
            {topElem}
            <ContentsBody>{contents}</ContentsBody>
            {bottomElem}
          </Contents>
          <Actions>
            <ScrollDivider show={!isAtBottom} />
            <RaisedButton
              label='Find match'
              disabled={!isMatchmakingEnabled}
              onClick={onFindClick}
            />
            {!isMatchmakingEnabled ? (
              <ErrorText>Matchmaking is currently disabled</ErrorText>
            ) : null}
          </Actions>
        </>
      ) : (
        <Contents>
          <ContentsBody>
            <ComingSoon />
          </ContentsBody>
        </Contents>
      )}
    </Container>
  )
}
