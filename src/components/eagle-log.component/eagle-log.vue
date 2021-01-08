<template>
    <div>
        <p class="tag-monitor-status"><i class="ez-icon-font">&#xe95c;</i> 运行中</p>
        <div class="eagle-show">
            <img src="" class="eagle-photo" width="100%">
            <video class="eagle-video" muted="" autoplay="" playsinline=""></video>
        </div>
        <ul class="eagle-entry-log pt10 pb10">
            <li v-for="(subitem,index) in eagleLog.entry_log" :key="index">
                <div v-if="subitem.login"><p class="login">登录考试</p><p>{{subitem.login}}</p></div>
                <div v-if="subitem.eagle_login"><p class="login">进入鹰眼</p><p>{{subitem.eagle_login}}</p></div>
                <div v-if="subitem.error_screen"><p class="monitor">截屏异常</p><p>{{subitem.error_screen.time}}</p></div>
                <div v-if="subitem.entry_message"><p class="login">监考发消息</p><p>{{subitem.entry_message.time}}</p></div>
                <div v-if="subitem.entry_call"><span class="login">监考通话</span><p>{{subitem.entry_call.time}}</p></div>
                <div v-if="subitem.leave"><span class="leave">离开考试</span><p>{{subitem.leave}}</p></div>
                <div v-if="subitem.end"><span class="end">交卷</span><p>{{subitem.end}}</p></div>
                <div v-if="subitem.force"><span class="force">强制交卷</span><p>{{subitem.force}}</p></div>
                <div v-if="subitem.timeout"><span class="timeout">自动收卷</span><p>{{subitem.timeout}}</p></div>
                <div v-if="subitem.out"><span class="out">离开页面</span><p>{{subitem.out}}</p></div>
            </li>
        </ul>
        <i class="ez-icon-font eagle-cut txt-20px">&#xe807;</i>
    </div>
</template>

<script>
export default {
    name: "eagle-log",
    data() {
        return{
            eagleStatus: ""
        }
    },
    mounted() {
        console.log(this.eagleLog, 'eagle_socket_id')
    },
    props: {
        eagleLog: {
            type: Object,
            dafault: {}
        },
    }
}
</script>

<style lang="scss" scoped>
@import './eagle-log.scss';
</style>