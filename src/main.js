import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './assets/style/_icon.scss'
import './assets/style/_common.scss'
import axios from "./utils/config.js";

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.config.productionTip = false;
Vue.prototype.$http = axios;

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
