import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { routerActions } from 'react-router-redux'
import keycode from 'keycode'
import { goToIndex } from './navigation/action-creators'
import { DEV_INDICATOR } from '../shared/flags'
import styles from './main-layout.css'

import ActivityBar from './activities/activity-bar.jsx'
import ActivityButton from './activities/activity-button.jsx'
import ActivityOverlay from './activities/activity-overlay.jsx'
import ActivitySpacer from './activities/spacer.jsx'
import Divider from './material/left-nav/divider.jsx'
import HotkeyedActivityButton from './activities/hotkeyed-activity-button.jsx'
import IconButton from './material/icon-button.jsx'
import LeftNav from './material/left-nav/left-nav.jsx'
import Section from './material/left-nav/section.jsx'
import Subheader from './material/left-nav/subheader.jsx'
import ConnectedDialogOverlay from './dialogs/connected-dialog-overlay.jsx'
import ConnectedSnackbar from './snackbars/connected-snackbar.jsx'
import ActiveUserCount from './serverstatus/active-users.jsx'
import SelfProfileOverlay, { ProfileAction } from './profile/self-profile-overlay.jsx'

import AddIcon from './icons/material/ic_add_black_24px.svg'
import ChangelogIcon from './icons/material/ic_new_releases_black_24px.svg'
import CreateGameIcon from './icons/material/ic_gavel_black_36px.svg'
import FeedbackIcon from './icons/material/ic_feedback_black_24px.svg'
import FindMatchIcon from './icons/material/ic_cake_black_36px.svg'
import JoinGameIcon from './icons/material/ic_call_merge_black_36px.svg'
import LogoutIcon from './icons/material/ic_power_settings_new_black_24px.svg'
import ReplaysIcon from './icons/material/ic_movie_black_36px.svg'
import SettingsIcon from './icons/material/ic_settings_black_36px.svg'

import ActiveGameNavEntry from './active-game/nav-entry.jsx'
import ChatNavEntry from './chat/nav-entry.jsx'
import LobbyNavEntry from './lobbies/nav-entry.jsx'
import WhisperNavEntry from './whispers/nav-entry.jsx'

import auther from './auth/auther'
import { isAdmin } from './admin/admin-utils'
import { openDialog } from './dialogs/dialog-action-creator'
import { openSnackbar } from './snackbars/action-creators'
import { openOverlay } from './activities/action-creators'
import { leaveChannel } from './chat/action-creators'
import { leaveLobby } from './lobbies/action-creators'
import { closeWhisperSession } from './whispers/action-creators'
import { isPsiHealthy } from './network/is-psi-healthy'
import { openChangelogIfNecessary, openChangelog } from './changelog/action-creators'

import { MULTI_CHANNEL } from '../shared/flags'

const KEY_C = keycode('c')
const KEY_J = keycode('j')
const KEY_S = keycode('s')

function stateToProps(state) {
  return {
    activeGame: state.activeGame,
    auth: state.auth,
    inLobby: state.lobby.inLobby,
    lobby: state.lobby.inLobby ?
        { name: state.lobby.info.name, hasUnread: state.lobby.hasUnread } : null,
    chatChannels: state.chat.channels.map(c => ({
      name: c,
      hasUnread: state.chat.byName.get(c.toLowerCase()).hasUnread,
    })),
    whispers: state.whispers.sessions.map(s => ({
      name: s,
      hasUnread: state.whispers.byName.get(s.toLowerCase()).hasUnread,
    })),
    network: state.network,
    upgrade: state.upgrade,
    routing: state.routing,
  }
}

@connect(stateToProps)
class MainLayout extends React.Component {
  state = {
    avatarOverlayOpened: false,
  };

  componentWillMount() {
    if (!this.props.children) {
      this.props.dispatch(goToIndex(routerActions.replace))
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.children) {
      nextProps.dispatch(goToIndex(routerActions.replace))
    }
  }

  componentDidMount() {
    this.props.dispatch(openChangelogIfNecessary())
  }

  renderLobbyNav() {
    if (!this.props.inLobby) return null

    const {
      lobby: { name, hasUnread },
      routing: { location: { pathname: currentPath } }
    } = this.props
    return [
      <Subheader key='lobby-header'>Lobby</Subheader>,
      <Section key='lobby-section'>
        <LobbyNavEntry key='lobby' lobby={name} currentPath={currentPath} hasUnread={hasUnread}
            onLeaveClick={this.onLeaveLobbyClick}/>
      </Section>,
      <Divider key='lobby-divider'/>
    ]
  }

  renderActiveGameNav() {
    if (!this.props.activeGame.isActive) return null

    return [
      <Section key='active-game-section'>
        <ActiveGameNavEntry key='active-game' currentPath={this.props.routing.location.pathname} />
      </Section>,
      <Divider key='active-game-divider' />,
    ]
  }

  renderAvatarOverlay() {
    return (<SelfProfileOverlay
        open={this.state.avatarOverlayOpened}
        onDismiss={this.onCloseProfileOverlay}
        user={this.props.auth.user.name}>
      {
        window._sbFeedbackUrl ?
            <ProfileAction icon={<FeedbackIcon />}
                text='Send feedback' onClick={this.onFeedbackClick}/> :
            null
      }
      <ProfileAction icon={<ChangelogIcon />} text='View changelog'
          onClick={this.onChangelogClick}/>
      <ProfileAction icon={<LogoutIcon />} text='Log out' onClick={this.onLogOutClick}/>
    </SelfProfileOverlay>)
  }

  render() {
    const { inLobby, chatChannels, whispers, routing: { location: { pathname } } } = this.props
    const channelNav = chatChannels.map(c =>
        <ChatNavEntry key={c.name}
            channel={c.name}
            currentPath={pathname}
            hasUnread={c.hasUnread}
            onLeave={this.onChannelLeave}/>)
    const joinChannelButton = <IconButton icon={<AddIcon/>} title='Join a channel'
        className={styles.subheaderButton} onClick={this.onJoinChannelClick} />
    const whisperNav = whispers.map(w =>
        <WhisperNavEntry key={w.name}
            user={w.name}
            currentPath={pathname}
            hasUnread={w.hasUnread}
            onClose={this.onWhisperClose}/>)
    const addWhisperButton = <IconButton icon={<AddIcon/>} title='Start a whisper'
        className={styles.subheaderButton} onClick={this.onAddWhisperClick} />
    const footer = [
      DEV_INDICATOR ? <span key='dev' className={styles.devIndicator}>Dev Mode</span> : null,
      <ActiveUserCount key='userCount' className={styles.userCount}/>,
      isAdmin(this.props.auth) ? <p key='adminPanel'><Link to='/admin'>Admin</Link></p> : null,
    ]

    return (<ConnectedDialogOverlay className={styles.layout}>
      <LeftNav footer={footer}>
        {this.renderActiveGameNav()}
        {this.renderLobbyNav()}
        <Subheader button={MULTI_CHANNEL ? joinChannelButton : null}>Chat channels</Subheader>
        <Section>
          {channelNav}
        </Section>
        <Divider/>
        <Subheader button={addWhisperButton}>Whispers</Subheader>
        <Section>
          {whisperNav}
        </Section>
      </LeftNav>
      { this.props.children }
      <ActivityBar user={this.props.auth.user.name} avatarTitle={this.props.auth.user.name}
          onAvatarClick={this.onAvatarClick}>
        <ActivityButton icon={<FindMatchIcon />} label='Find match'
            onClick={this.onFindMatchClick} />
        <HotkeyedActivityButton icon={<CreateGameIcon />} label='Create'
            onClick={this.onCreateLobbyClick} disabled={inLobby} keycode={KEY_C} altKey={true} />
        <HotkeyedActivityButton icon={<JoinGameIcon />} label='Join' onClick={this.onJoinLobbyClick}
            keycode={KEY_J} altKey={true} />
        <ActivityButton icon={<ReplaysIcon />} label='Replays' onClick={this.onReplaysClick} />
        <ActivitySpacer />
        <HotkeyedActivityButton icon={<SettingsIcon />} label='Settings'
            onClick={this.onSettingsClick} keycode={KEY_S} altKey={true} />
      </ActivityBar>
      { this.renderAvatarOverlay() }
      <ActivityOverlay />
      <ConnectedSnackbar />
    </ConnectedDialogOverlay>)
  }

  onAvatarClick = () => {
    this.setState({
      avatarOverlayOpened: true
    })
  };

  onCloseProfileOverlay = () => {
    this.setState({
      avatarOverlayOpened: false
    })
  };

  onJoinChannelClick = () => {
    this.props.dispatch(openDialog('channel'))
  };

  onChannelLeave = channel => {
    this.props.dispatch(leaveChannel(channel))
  };

  onAddWhisperClick = () => {
    this.props.dispatch(openDialog('whispers'))
  };

  onWhisperClose = user => {
    this.props.dispatch(closeWhisperSession(user))
  };

  onLeaveLobbyClick = () => {
    this.props.dispatch(leaveLobby())
  };

  onSettingsClick = () => {
    this.props.dispatch(openDialog('settings'))
  };

  onLogOutClick = () => {
    this.onCloseProfileOverlay()
    this.props.dispatch(auther.logOut().action)
  };

  onFindMatchClick = () => {
    this.props.dispatch(openSnackbar({
      message: 'Not implemented yet. Coming soon!',
    }))
  };

  onCreateLobbyClick = () => {
    if (!isPsiHealthy(this.props)) {
      this.props.dispatch(openDialog('psiHealth'))
    } else {
      this.props.dispatch(openOverlay('createLobby'))
    }
  };

  onJoinLobbyClick = () => {
    if (!isPsiHealthy(this.props)) {
      this.props.dispatch(openDialog('psiHealth'))
    } else {
      this.props.dispatch(openOverlay('joinLobby'))
    }
  };

  onReplaysClick = () => {
    this.props.dispatch(openSnackbar({
      message: 'Not implemented yet. Coming soon!',
    }))
  };

  onFeedbackClick = () => {
    this.onCloseProfileOverlay()
    window.open(window._sbFeedbackUrl, '_blank')
  };

  onChangelogClick = () => {
    this.onCloseProfileOverlay()
    this.props.dispatch(openChangelog())
  };
}

export default MainLayout
