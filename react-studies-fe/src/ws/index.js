import { getVar, isDev } from '../util/env';
import WsWithQueue from './ws-with-queue';


const host = getVar('REACT_APP_HOST', window.location.host);
const ws = new WsWithQueue(`ws${isDev ? '' : 's'}://${host}/ws`);

export default ws;