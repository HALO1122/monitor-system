import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
// socket.io
import socketIo from "vue-socket.io";
// elementui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// public css
import './assets/style/_icon.scss'
import './assets/style/_common.scss'

import { getMonitorRoom } from '@/utils/api.js'

Vue.config.productionTip = false;

Vue.use(ElementUI);


  // Vue.use(
  //   new socketIo({
  //     debug: true,
  //     // connection: io(res.peer_setting.singal_server, options),
  //     connection: "https://peer7.eztest.org:8888",
  //   })
  // );

  // getMonitorRoom().then(res => {
  // Vue.use(
  //   new socketIo({
  //     debug: true,
  //     // connection: io(res.peer_setting.singal_server, options),
  //     connection: res.peer_setting.singal_server,
  //   })
  // );
// })





new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
