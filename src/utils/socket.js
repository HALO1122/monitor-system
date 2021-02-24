import Vue from 'vue';
import store from '../store';
import vueSocketIo from "vue-socket.io";

console.log(`${store.state.global.socket.singal_server}`, '`${store.state.global.socket.peer_setting}`')

export function connectSocket () {
  Vue.use(
    new vueSocketIo({
      debug: false,
      connection: `${store.state.global.socket.singal_server}`
    })
  );
}
