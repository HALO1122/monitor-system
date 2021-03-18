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
                <p class="handsup-num" v-show="handsUpList.length != 0">{{handsUpList.length}}</p>
                <span style="font-size: 24px;position: relative;" class="handsup-icon" @click="controlHandsup()">
                    <i class="ez-icon-font txt-24px">&#xe686;</i>
                    <p class="handsup-arrow" v-if="handsUp"></p>
                </span>
                <div class="handsup-content" v-show="handsUp">
                    <div class="room-handsup-list"  v-for="item in handsUpList" :key="item.permit" >
                        <i class="ez-icon-font handsup-icon">&#xe95b;</i>
                        <span class="handsup-icon">&nbsp;{{ $t('monitor.handsup') }}</span>
                        <span class="pl10">{{item.fullName}}</span>
                        <span class="handsup-time">{{item.time}}</span>
                        <span class="handsop-open" @click="openCallVideo(item)"><i class="ez-icon-font">&#xe66c;</i></span>
                    </div>
                </div>
            </div>
            <p class="room-refresh-msg">
                <span class="entries">{{ $t('monitor.candidate') }}{{roomInfo.entries_count}}</span>
                <span class="online">{{ $t('monitor.online') }}{{roomInfo.entries_online_count}}</span>
                <span class="complete">{{ $t('monitor.complete') }}{{roomInfo.entries_achieve_count}}</span>
                <span class="interrupt">{{ $t('monitor.interrupt') }}{{roomInfo.entries_break_off_count}}</span>
                <button class="btn btn-refresh" @click="refreshRoomMsg()"><i class="ez-icon-font txt-12px">&#xe7d3;</i>&nbsp;{{ $t('monitor.refresh') }}</button>
            </p>
            <span>{{ $t('monitor.proctor') }}{{roomInfo.superviser_name}}</span>
            <button class="btn-end-proctor ml20" v-if="endExam" @click="endSessionExam()">{{ $t('monitor.endExam') }}</button>
        </div>
    </div>
</template>

<script>
import Bus from '@/utils/bus.js';
import { monitorRoomEnd } from '@/utils/api.js'
export default {
    data() {
        return{
            showExamTime: false,
            handsUp: false,
            handsUpList: []
        }
    },
    props: {
        roomInfo: {
            type: Object,
            dafault: {}
        },
        endExam: {
            type: Boolean,
            default: true
        },
        timerNum: {
            type: Number,
            default: 10
        }
    },
    mounted() {
       this.handshupCallvideo()
    },
    methods: {
        controlHandsup() {
            this.handsUp = !this.handsUp
        },
        refreshRoomMsg() {
            this.$emit('getRoomMsg', 'refresh')
        },
        handshupCallvideo() {
            Bus.$on('handshupCallvideo', target => {
                console.log(target, 'target')
                if (target.data.length != 0) {
                    this.handsUp = true;
                    this.handsUpList = target.data;
                } else {
                    this.handsUp = false;
                    this.handsUpList = [];
                }
            });
        },
        openCallVideo(item) {
            item.full_name = item.fullName;
            item.socket_id = item.from;
            Bus.$emit('handsupCall', {"item": item} );
            console.log(item, 'item')
        },
        hoverShowTime() { this.showExamTime = true },
        leaverShowTime() { this.showExamTime = false },
        endSessionExam() {
            monitorRoomEnd({}).then(()=> {
                this.$router.push('/end');
            }).catch((xhr) => {console.log(xhr)}) 
        }
    }
}
</script>

<style scoped lang="scss">
@import './nav-header.scss';
</style>