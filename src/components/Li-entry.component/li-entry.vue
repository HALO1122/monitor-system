<template>
    <li>
        <div class="entry-log-type" v-if="liEntry.login">
            <span class="login">登录考试</span>
            <div>
                <p>{{liEntry.login}}</p>
                <p>{{liEntry.ip}}</p>
                <p>{{liEntry.browser}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="liEntry.eagle_login">
            <span class="login">进入鹰眼</span>
            <div>
                <p>{{liEntry.eagle_login}}</p>
                <p>{{liEntry.ip}}</p>
                <p>{{liEntry.browser}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="liEntry.error_screen">
            <span class="monitor">截屏异常</span>
            <img src="https:dev.eztest.org/media/photo/556590/c979b5eff9f94558979602e2016d2647.jpg" width="120" height="90">
            <div>
                <p>{{liEntry.error_screen.time}}</p>
                <p>类型：{{liEntry.error_screen.screen_type}}</p>
                <p>备注：{{liEntry.error_screen.remark}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="liEntry.entry_message">
            <span class="login">监考发消息</span>
            <div>
                <p>{{liEntry.entry_message.time}}</p>
                <p>{{liEntry.entry_message.content}}</p>
                <p>{{liEntry.entry_message.message}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="liEntry.entry_call"><span class="login">监考通话</span><p>{{liEntry.entry_call.time}}</p></div>
        <div class="entry-log-type" v-if="liEntry.leave"><span class="leave">离开考试</span><p>{{liEntry.leave}}</p></div>
        <div class="entry-log-type" v-if="liEntry.end"><span class="end">交卷</span><p>{{liEntry.end}}</p></div>
        <div class="entry-log-type" v-if="liEntry.force"><span class="force">强制交卷</span><p>{{liEntry.force}}</p></div>
        <div class="entry-log-type" v-if="liEntry.timeout"><span class="timeout">自动收卷</span><p>{{liEntry.timeout}}</p></div>
        <div class="entry-log-type" v-if="liEntry.out"><span class="out">离开页面</span><p>{{liEntry.out}}</p></div>
    </li>
</template>

<script>
export default {
    name: "li-entry",
    data() {
        return{

        }
    },
    props: {
        liEntry: {
            type: Object,
            dafault: {}
        },
    }
}
</script>

<style lang="scss" scoped>
@import './li-entry.scss';
</style>