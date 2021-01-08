<template>
    <li>
        <div class="entry-log-type" v-if="entryLog.login">
            <span class="login">{{ $t('monitor.login') }}</span>
            <div>
                <p>{{entryLog.login}}</p>
                <p>{{entryLog.ip}}</p>
                <p>{{entryLog.browser}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="entryLog.eagle_login">
            <span class="login">{{ $t('monitor.eagle') }}</span>
            <div>
                <p>{{entryLog.eagle_login}}</p>
                <p>{{entryLog.ip}}</p>
                <p>{{entryLog.browser}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="entryLog.error_screen">
            <span class="monitor">{{ $t('monitor.screen') }}</span>
            <img src="https:dev.eztest.org/media/photo/556590/c979b5eff9f94558979602e2016d2647.jpg" width="120" height="90">
            <div>
                <p>{{entryLog.error_screen.time}}</p>
                <p>{{ $t('monitor.type') }}{{entryLog.error_screen.screen_type}}</p>
                <p>{{ $t('monitor.remark') }}{{entryLog.error_screen.remark}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="entryLog.entry_message">
            <span class="login">{{ $t('monitor.proctor_message') }}</span>
            <div>
                <p>{{entryLog.entry_message.time}}</p>
                <p>{{entryLog.entry_message.content}}</p>
                <p>{{entryLog.entry_message.message}}</p>
            </div>
        </div>
        <div class="entry-log-type" v-if="entryLog.entry_call"><span class="login">{{ $t('monitor.proctor_call') }}</span><p>{{entryLog.entry_call.time}}</p></div>
        <div class="entry-log-type" v-if="entryLog.leave"><span class="leave">{{ $t('monitor.leave') }}</span><p>{{entryLog.leave}}</p></div>
        <div class="entry-log-type" v-if="entryLog.end"><span class="end">{{ $t('monitor.end') }}</span><p>{{entryLog.end}}</p></div>
        <div class="entry-log-type" v-if="entryLog.force"><span class="force">{{ $t('monitor.force') }}</span><p>{{entryLog.force}}</p></div>
        <div class="entry-log-type" v-if="entryLog.timeout"><span class="timeout">{{ $t('monitor.timeout') }}</span><p>{{entryLog.timeout}}</p></div>
        <div class="entry-log-type" v-if="entryLog.out"><span class="out">{{ $t('monitor.out') }}</span><p>{{entryLog.out}}</p></div>
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