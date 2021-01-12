<template>
    <div class="room-nav">
        <div class="room-logo">           
            <span>{{ $t('monitor.title') }}</span>
            <span class="pl20 pr20">{{roomInfo.room_name}}</span>
            <i class="ez-icon-font txt-20px" @mouseenter="hoverShowTime()" @mouseleave="leaverShowTime()">&#xe803;</i>
            <p class="exam-time" v-show="showExamTime">{{ $t('monitor.time') }}{{ roomInfo.session_start }} - {{ roomInfo.session_end }}</p>
        </div>
        <p class="room-btn-toggle">{{ timerNum }}{{ $t('monitor.countdown') }}</p>
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
                <span class="entries">{{ $t('monitor.candidate') }}{{roomInfo.entries_count}}</span>
                <span class="online">{{ $t('monitor.online') }}{{roomInfo.entries_online_count}}</span>
                <span class="complete">{{ $t('monitor.complete') }}{{roomInfo.entries_achieve_count}}</span>
                <span class="interrupt">{{ $t('monitor.interrupt') }}{{roomInfo.entries_break_off_count}}</span>
                <button class="btn btn-refresh"><i class="ez-icon-font txt-12px">&#xe7d3;</i>&nbsp;{{ $t('monitor.refresh') }}</button>
            </p>
            <span>{{ $t('monitor.proctor') }}{{roomInfo.superviser_name}}</span>
            <button class="btn-end-proctor" v-if="endExam">{{ $t('monitor.endExam') }}</button>
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