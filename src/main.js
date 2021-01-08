import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import VueI18n from "vue-i18n";
// bootstrap
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
// socket
import vueSocketIo from "vue-socket.io";
// public css
import '@/assets/style/_icon.scss';
import '@/assets/style/_common.scss';


Vue.use(VueI18n);
const i18n = new VueI18n({
  // 页面刷新后仍保持当前的语言环境，一般会将语言参数缓存到localStorage中，
  // locale属性的初始赋值方式会变为 locale: localStorage.getItem(‘lang’) || ‘zh’
  locale: 'zh',
  messages: {
    'zh': require('@/assets/i18n/zh.json'),   
    'en': require('@/assets/i18n/en.json') 
  }
})



Vue.use(
  new vueSocketIo({
      debug: false,
      connection: "https://peer7.eztest.org:8888",
  })
);

Vue.config.productionTip = false;

const vue = new Vue({
  store,
  router,
  i18n,
  render: h => h(App)
}).$mount('#app')

export default vue