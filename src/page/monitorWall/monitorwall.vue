<template>
    <div class="wrap-room-wall">
        <!-- 头部班级信息 -->
        <div class="room-nav">
            <div class="room-logo">           
                <span>实时监控</span>
                <span>{{room_info.session_name}}</span>
                <i class="ez-icon-font txt-20px pl20" @mouseenter="hoverShowTime()" @mouseleave="leaverShowTime()">&#xe803;</i>
                <span v-show="showExamTime">考试时间：{{ room_info.session_start }} - {{ room_info.session_end }}</span>
            </div>
            <p class="room-btn-toggle">{{ timerNum }}S后切换</p>
            <div class="room-msg">
                <div v-if="room_info.hands_up">
                    <p class="handsup-num">0</p>
                    <span style="font-size: 24px;position: relative;" class="handsup-icon" onclick="controlHandsup()">
                        <i class="ez-icon-font txt-24px">&#xe686;</i>
                        <p class="arrow-handsup"></p>
                    </span>
                </div>
                <p class="room-refresh-msg">
                    <span class="entries">考生：{{room_info.entries_count}}</span>
                    <span class="online">在线：{{room_info.entries_online_count}}</span>
                    <span class="complete">完成：{{room_info.entries_achieve_count}}</span>
                    <span class="interrupt">中断：{{room_info.entries_break_off_count}}</span>
                    <el-button type="info" size="mini" icon="el-icon-refresh" class="txt-16px">刷新</el-button>
                </p>
                <span>监考老师：{{room_info.superviser_name}}</span>
                <p class="btn-end-proctor" v-if="endExam">结束监考</p>
            </div>
        </div>
        <!-- 展示内容 -->
        <div class="room-video-tip txt-16px" v-if="entryEmpty">暂无考生信息！</div>
        <div class="room-video-block" v-if="!entryEmpty">
            <span class="nav-btnPrev"><i class="icon-nav-btnPrev"></i></span>
            <span class="nav-btnNext"><i class="icon-nav-btnNext"></i></span>
            <ul class="room-video-list">
                <li class="room-video-li">
                    <span class="video-loading-wrap"></span>
                    <div class="video-entry-content">
                        <p class="video-tag-tip">
                            <span class="tag-monitor-status"><i class="ez-icon-font">&#xe73e;</i> 运行中</span>
                            <span class="tag-abnormal">有异常</span>
                        </p>
                        <a href="#" target="_blank"><img class="entry-picture mb5" src="">
                            <video class="entry-video" muted="" autoplay="" playsinline=""></video></a>
                    </div>
                    <p class="icon-event-content">
                        <span id="icon-pinVideo"><i class="ez-icon-font txt-18px">&#xe804;</i></span>
                        <span id="icon-controlSound"><i class="ez-icon-font txt-18px">&#xe806;</i></span>
                        <span id="icon-openVideo"><i class="ez-icon-font txt-18px">&#xe66c;</i></span>
                        <span id="icon-sendMsg"><i class="ez-icon-font txt-18px">&#xe63b;</i></span>
                        <span id="icon-cut"><i class="ez-icon-font txt-18px">&#xe807;</i></span>
                    </p>
                    <div class="entry-event-block">
                        <p class="double-video"></p>
                        <ul class="entry-log pt10 pb10 history-list">
                            <li>
                                <span class="login">登录考试</span>
                                <div><p>今天 13:41</p><p>172.16.21.50(局域网)</p><p>Chrome 87.0.4280</p></div>
                            </li>
                            <li>
                                <span class="login">进入鹰眼</span>
                                <div><p>今天 13:42</p><p>172.16.21.50(局域网)</p><p>Chrome 87.0.4280</p></div>
                            </li>
                        </ul>
                    </div>
                    <div class="eagle-event-block">
                        <p class="tag-monitor-status"><i class="ez-icon-font">&#xe95c;</i> 运行中</p>
                        <div class="eagle-show">
                            <img src="" class="eagle-photo" width="100%">
                            <video class="eagle-video" muted="" autoplay="" playsinline=""></video>
                        </div>
                        <p class="single-video"></p>
                        <ul class="eagle-entry-log pt10 pb10 eagle-list">
                            <li><p class="login">登录考试</p><p>今天 13:41</p></li>
                            <li><p class="login">进入鹰眼</p><p>今天 13:42</p></li>
                        </ul>
                        <i class="ez-icon-font eagle-cut txt-20px">&#xe807;</i>
                    </div>
                    <div class="entry-information">
                        <p>
                            <span>anCYK56584  | fsefsef</span>
                            <span class="icon-num">
                                <span><i class="ez-icon-font">&#xe81f;</i>0</span>
                                <span><i class="ez-icon-font">&#xe807;</i>0</span>
                            </span>
                        </p>
                        <p class="exam">
                            <span class="exam-answer">答题时长0时0分0秒</span>
                            <span class="exam-complete">已答0 / 196题</span>
                        </p>
                    </div>
                    <!-- <p class="tag-dingzhu"><i class="ez-icon-font txt-24px">&#xe80e;</i></p>
                    <p class="tag-yuyin"><i class="ez-icon-font txt-24px">&#xe80e;</i></p> -->
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { openSocket } from './monitorwall.js'
import { getMonitorRoom } from '@/utils/api.js'
export default {
    data() {
        return {
            room_info: {},
            showExamTime: false,
            entryEmpty: true,
            timeClock: null,
            timerNum: 10,
            timePause: true,
            endExam: true,
            id: ''
        }
    },

    mounted() {
        let role = this.$route.query;
        if (role == "patrol") {
            this.endExam = false;
        } else {
            this.endExam = true;
        }
        this.initMonitorRoom();
        console.log(this.$socket, 'socket connected///////*')
    },
    computed: {
        ...mapState({
            global: state=>state.global
        })
    },
    methods: {
        initMonitorRoom() {
            getMonitorRoom().then(res => {
                console.log(res, 'res')
                let _time = 0,
                    _timerPause = true,
                    that = this;
                that.room_info = res;                    
                if (res.entries_online.length != 0) {
                    that.entryEmpty = false;
                    openSocket(that.room_info);
                } else {
                    that.entryEmpty = true;
                }
                _time = that.timerNum;
                _timerPause = that.timePause;
                // that.timeClock = setInterval(function(){
                //     if(_timerPause) {
                //         _time--;
                //         if (_time == 0) { 
                //             _time = 10;
                //             autoRefresh();
                //         }
                //         that.timerNum = _time;
                //     } else {
                //         clearInterval( that.timeClock)
                //     }
                // }, 1000)
            })
            .catch(error => {
                console.log(error);
            }); 
        },
        hoverShowTime() { this.showExamTime = true },
        leaverShowTime() { this.showExamTime = false }
    }
}
</script>

<style scoped lang="scss">
@import './monitorwall.scss';
</style>