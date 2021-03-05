import fetch from '../network/fetch'
import { dispatch } from '../dispatch-registry'

import { ACTIVE_GAME_STATUS } from '../actions'
import { stringToStatus } from '../../common/game-status'

export default function ({ ipcRenderer }) {
  ipcRenderer.on(ACTIVE_GAME_STATUS, (event, status) => {
    dispatch({
      type: ACTIVE_GAME_STATUS,
      payload: status,
    })

    if (status.state === 'playing' || status.state === 'error') {
      fetch('/api/1/games/' + encodeURIComponent(status.id), {
        method: 'put',
        body: JSON.stringify({ status: stringToStatus(status.state), extra: status.extra }),
      })
    }
  })
}
