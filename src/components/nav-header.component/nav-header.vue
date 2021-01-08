<template>
    <div class="room-nav">
        <div class="room-logo">           
            <span class="txt-16px">实时监控&nbsp;&nbsp;&nbsp;{{roomInfo.session_name}}</span>
            <i class="ez-icon-font txt-20px pl20" @mouseenter="hoverShowTime()" @mouseleave="leaverShowTime()">&#xe803;</i>
            <p class="exam-time" v-show="showExamTime">考试时间：{{ roomInfo.session_start }} - {{ roomInfo.session_end }}</p>
        </div>
        <p class="room-btn-toggle">{{ timerNum }}S后切换</p>
        <div class="room-msg">
            <div v-if="roomInfo.hands_up">
                <p class="handsup-num">0</p>
                <span style="font-size: 24px;position: relative;" class="handsup-icon" onclick="controlHandsup()">
                    <i class="ez-icon-font txt-24px">&#xe686;</i>
                    <p class="handsup-arrow"></p>
                </span>
                <div class="handsup-content"></div>
            </div>
            <p class="room-refresh-msg">
                <span class="entries">考生：{{roomInfo.entries_count}}</span>
                <span class="online">在线：{{roomInfo.entries_online_count}}</span>
                <span class="complete">完成：{{roomInfo.entries_achieve_count}}</span>
                <span class="interrupt">中断：{{roomInfo.entries_break_off_count}}</span>
                <el-button type="info" size="mini" icon="el-icon-refresh" class="txt-16px">刷新</el-button>
            </p>
            <span>监考老师：{{roomInfo.superviser_name}}</span>
            <p class="btn-end-proctor" v-if="endExam">结束监考</p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return{
            showExamTime: false,
            endExam: true,
            timerNum: 10
        }
    },
    props: {
        roomInfo: {
            type: Object,
            dafault: {}
        },
        role: {
            type: String,
            default: ""
        }
    },
    mounted() {
        console.log(this.role, 'this.role')
        console.log(this.role == "patrol", 'this.role')
        this.role == "patrol" ? this.endExam = false : this.endExam = true;
    },
    methods: {
        hoverShowTime() { this.showExamTime = true },
        leaverShowTime() { this.showExamTime = false }
    }
}
</script>

<style scoped lang="scss">
@import './nav-header.scss';
</style>