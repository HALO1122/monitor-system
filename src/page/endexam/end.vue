<template>
    <div class="room-end">
        <div class="room-logo">           
            <span>{{ $t('monitor.title') }}</span>
            <span class="pl20 pr20">{{roomInfo.room_name}}</span>
            <i class="ez-icon-font txt-20px" @mouseenter="hoverShowTime()" @mouseleave="leaverShowTime()">&#xe803;</i>
            <p class="exam-time" v-show="showExamTime">{{ $t('monitor.time') }}{{ roomInfo.session_start }} - {{ roomInfo.session_end }}</p>
        </div>
        <div class="end-tip">
            <i class="ez-icon-font">&#xe645;</i>
            <p class="mt10">{{ $t('endTip') }}</p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showExamTime: false,
            roomInfo: {}
        }
    }
}
</script>

<style lang="scss" scoped>
.room-end{
    width: 100%;
    height: 100%;
    min-height: 100%;
    overflow-y: auto;
    background-color: rgb(255, 255, 255);
    .room-logo {
        display: flex;
        height: 60px;
        line-height: 60px;
        padding: 0px 16px 0px 130px;
        background-color: #3A3B3F;
        color: #ffffff;
        background-image: url('../../assets/images/command-logo.png');
        background-repeat: no-repeat;
        background-size: 70px 28px;
        background-position: 20px 18px;
        .exam-time{
            position: relative;
            margin: 12px;
            padding: 0px 12px;
            background-color: #4F5054;
            border-radius: 5px;
            height: 36px;
            line-height: 36px;
            &::before{
                content: "";
                border-top: 8px solid transparent;
                border-bottom: 8px solid transparent;
                border-right: 8px solid #4F5054;
                position: absolute;
                top: 10px;
                left: -8px;
            }
        }
    }
    .end-tip{
        font-size: 20px;
        margin: 160px 0px 0px;
        i{color: #00CF71; font-size: 32px;}
    }
}
</style>