import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
// socket
import vueSocketIo from "vue-socket.io";
// elementui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// public css
import './assets/style/_icon.scss'
import './assets/style/_common.scss'


Vue.config.productionTip = false;
Vue.use(ElementUI);

Vue.use(
  new vueSocketIo({
      debug: false,
      connection: "https://peer7.eztest.org:8888",
  })
);

const vue = new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')

export default vue