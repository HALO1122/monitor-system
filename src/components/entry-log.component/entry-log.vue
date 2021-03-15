<template>
    <ul class="entry-log pt10 pb10" :id="logs.permit">
        <vue-scroll :ops="ops">
            <li v-for="(log, index) in logs.entry_log" :key="index">
                <div class="entry-log-type" v-if="log.login">
                    <span class="login">{{ $t('monitor.login') }}</span>
                    <div>
                        <p>{{log.login}}</p>
                        <p>{{log.ip}}</p>
                        <p>{{log.browser}}</p>
                    </div>
                </div>
                <div class="entry-log-type" v-if="log.eagle_login">
                    <span class="login">{{ $t('monitor.eagle') }}</span>
                    <div>
                        <p>{{log.eagle_login}}</p>
                        <p>{{log.ip}}</p>
                        <p>{{log.browser}}</p>
                    </div>
                </div>
                <div class="entry-log-type" v-if="log.error_screen">
                    <span class="monitor">{{ $t('monitor.screen') }}</span>
                    <img :src="log.error_screen.photo_url" width="120" height="90">
                    <div>
                        <p>{{log.error_screen.time}}</p>
                        <p>{{ $t('monitor.type') }}{{log.error_screen.screen_type}}</p>
                        <p>{{ $t('monitor.remark') }}{{log.error_screen.remark}}</p>
                    </div>
                </div>
                <div class="entry-log-type" v-if="log.entry_message">
                    <span class="login">{{ $t('monitor.proctor_message') }}</span>
                    <div>
                        <p>{{log.entry_message.time}}</p>
                        <p>{{$t('monitor.content')}}{{log.entry_message.message}}</p>
                    </div>
                </div>
                <div class="entry-log-type" v-if="log.entry_call"><span class="login">{{ $t('monitor.proctor_call') }}</span><p>{{log.entry_call.time}}</p></div>
                <div class="entry-log-type" v-if="log.leave"><span class="leave">{{ $t('monitor.leave') }}</span><p>{{log.leave}}</p></div>
                <div class="entry-log-type" v-if="log.end"><span class="end">{{ $t('monitor.end') }}</span><p>{{log.end}}</p></div>
                <div class="entry-log-type" v-if="log.force"><span class="force">{{ $t('monitor.force') }}</span><p>{{log.force}}</p></div>
                <div class="entry-log-type" v-if="log.timeout"><span class="timeout">{{ $t('monitor.timeout') }}</span><p>{{log.timeout}}</p></div>
                <div class="entry-log-type" v-if="log.out"><span class="out">{{ $t('monitor.out') }}</span><p>{{log.out}}</p></div>
            </li>
        </vue-scroll>
    </ul>

</template>

<script>
import Bus from '@/utils/bus.js'; 
export default {
    name: "entry-log",
    data() {
        return{
            ops: {
                vuescroll: {},
                scrollPanel: {},
                rail: {
                    background: "#555557",    //轨道的背景色。
                    opacity: 0.4,            //轨道的透明度。 0是透明，1是不透明
                    size: "8px",             //轨道的尺寸。
                    specifyBorderRadius: false, //是否指定轨道的 borderRadius， 如果不那么将会自动设置。
                    gutterOfEnds: null,
                    gutterOfSide: "0px",      //距离容器的距离
                    keepShow: false
                },
                bar: {
                    hoverStyle: false,
                    onlyShowBarOnScroll: false, //是否只有滚动的时候才显示滚动条
                    background: "#f1f1f1",
                    opacity: 0.4,
                    "overflow-x": "hidden"
                }
            }
        }
    },
    computed: {
        logs (){
            return this.entryLog
        }
    },
    props: {
        entryLog: {
            type: Object,
            dafault: {}
        },
    },
    mounted(){
        this.changeLog()
    },
    methods: {
        changeLog() {
            Bus.$on('changeLogs', target => {
                if (this.logs.permit == target.permit) {
                    this.logs.entry_log = target.logs;
                }
            });
            Bus.$on('screenshotLogs', target => {
                if (this.logs.permit == target.permit) {
                    this.logs.entry_log = target.logs;
                }                 
            });
            
        }
    }
}
</script>

<style lang="scss" scoped>
@import './entry-log.scss';
</style>