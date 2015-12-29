import React from 'react'
import { IndexRoute, Route } from 'react-router'
import AppNotFound from './app-not-found.jsx'
import ChatChannel from './chat/channel.jsx'
import ChatList from './chat/list.jsx'
import MainLayout from './main-layout.jsx'
import Home from './home.jsx'
import LobbyList from './lobbies/list.jsx'
import LobbyView from './lobbies/view.jsx'
import LoginRequired from './auth/login-required.jsx'
import LoginLayout from './auth/login-layout.jsx'
import Login from './auth/login.jsx'
import Signup from './auth/signup.jsx'
import WhisperIndex from './whispers/index.jsx'
import WhisperView from './whispers/view.jsx'

const routes = <Route>
  <Route component={LoginRequired}>
    <Route component={MainLayout}>
      <Route path='/' component={Home} />
      <Route path='/chat'>
        <IndexRoute component={ChatList} />
        <Route path=':channel' component={ChatChannel} />
      </Route>
      <Route path='/lobbies'>
        <IndexRoute component={LobbyList} />
        <Route path=':lobby' component={LobbyView} />
      </Route>
      <Route path='/whispers'>
        <IndexRoute component={WhisperIndex} />
        <Route path=':user' component={WhisperView} />
      </Route>
    </Route>
  </Route>
  <Route component={LoginLayout}>
    <Route path='/login' component={Login} />
    <Route path='/signup' component={Signup} />
  </Route>
  <Route path='*' component={AppNotFound} />
</Route>

export default routes
