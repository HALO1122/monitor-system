import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../page/login/login.vue'
import Role from '../page/role/role.vue'
import MonitorWall from '../page/monitorWall/monitorwall.vue'
import EndExam from '../page/endexam/end.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/role',
    name: 'Role',
    component: Role
  },
  {
    path: '/monitorwall',
    name: 'MonitorWall',
    component: MonitorWall
  },
  {
    path: '/end',
    name: 'EndExam',
    component: EndExam
  }
]

const router = new VueRouter({
  routes
})

export default router
