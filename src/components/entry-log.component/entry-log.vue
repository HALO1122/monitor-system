<template>
    <li>
        <div class="entry-log-type" v-if="entryLog.login">
            <span class="login">登录考试</span>
            <div>
                <p>{{entryLog.login}}</p>
                <p>{{entryLog.ip}}</p>
                <p>{{entryLog.browser}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="entryLog.eagle_login">
            <span class="login">进入鹰眼</span>
            <div>
                <p>{{entryLog.eagle_login}}</p>
                <p>{{entryLog.ip}}</p>
                <p>{{entryLog.browser}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="entryLog.error_screen">
            <span class="monitor">截屏异常</span>
            <img src="https:dev.eztest.org/media/photo/556590/c979b5eff9f94558979602e2016d2647.jpg" width="120" height="90">
            <div>
                <p>{{entryLog.error_screen.time}}</p>
                <p>类型：{{entryLog.error_screen.screen_type}}</p>
                <p>备注：{{entryLog.error_screen.remark}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="entryLog.entry_message">
            <span class="login">监考发消息</span>
            <div>
                <p>{{entryLog.entry_message.time}}</p>
                <p>{{entryLog.entry_message.content}}</p>
                <p>{{entryLog.entry_message.message}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="entryLog.entry_call"><span class="login">监考通话</span><p>{{entryLog.entry_call.time}}</p></div>
        <div class="entry-log-type" v-if="entryLog.leave"><span class="leave">离开考试</span><p>{{entryLog.leave}}</p></div>
        <div class="entry-log-type" v-if="entryLog.end"><span class="end">交卷</span><p>{{entryLog.end}}</p></div>
        <div class="entry-log-type" v-if="entryLog.force"><span class="force">强制交卷</span><p>{{entryLog.force}}</p></div>
        <div class="entry-log-type" v-if="entryLog.timeout"><span class="timeout">自动收卷</span><p>{{entryLog.timeout}}</p></div>
        <div class="entry-log-type" v-if="entryLog.out"><span class="out">离开页面</span><p>{{entryLog.out}}</p></div>
    </li>
</template>

<script>
export default {
    name: "entry-log",
    data() {
        return{

        }
    },
    props: {
        entryLog: {
            type: Object,
            dafault: {}
        },
    }
}
</script>

<style lang="scss" scoped>
@import './entry-log.scss';
</style>