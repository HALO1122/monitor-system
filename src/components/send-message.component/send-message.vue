<template>
    <!-- 发消息弹窗 -->
    <div class="room-shadow" >
        <div class="sendMsg-modal">
            <p class="title mb20"><span>{{ $t('monitor.notice') }} {{sendMsgData.full_name}}</span>
                <i class="ez-icon-font txt-18px" @click="closeMsgModal()">&#xe7bf;</i></p>
            <p class="send-radio" v-if="eagle_eye">
                <label><input type="radio" name="sendRadio" @change="radioChange($event)" :value="$t('monitor.msg.tip1')">{{$t('monitor.msg.tip1')}}</label>
            </p>
            <p class="send-radio" v-for="(tip, index) in msgTip" :key="index">
                <label><input type="radio" name="sendRadio" @change="radioChange($event)" :value="tip.msg"> <span>{{tip.msg}}</span></label>
            </p>
            <p class="send-radio" id="toggleContent">
                <input type="radio" name="sendRadio" @change="radioChange($event)" value="-1"> 
                <span>{{$t('monitor.customize')}}</span>
                <input type="text" v-if="customize" v-model="content">
            </p>
            <div class="mt20 mb10 send-btn">
                <button type="button" class="btn btn-primary btn-blue" @click="submit_sendmsg()">{{$t('monitor.send')}}</button>
                <button type="button" class="btn btn-primary btn-gray" @click="closeMsgModal()">{{$t('monitor.cancel')}}</button>
            </div>
        </div>
    </div>
</template>
<script>
import { sendEntryMsg } from '@/utils/api.js'
import Bus from '@/utils/bus.js'; 
export default {
    data() {
        return {
            customize: false,
            content: '',
            messageContent: '',
            msgTip: [
                {"msg": this.$t('monitor.msg.tip2')},
                {"msg": this.$t('monitor.msg.tip3')},
                {"msg": this.$t('monitor.msg.tip4')},
                {"msg": this.$t('monitor.msg.tip5')},
                {"msg": this.$t('monitor.msg.tip6')},
                {"msg": this.$t('monitor.msg.tip7')},
                {"msg": this.$t('monitor.msg.tip8')}
            ]
        }
    },
    mounted() {
        console.log(this.sendMsgData.openMessageModal);
    },
    props: {
        sendMsgData: {
            type: Object,
            dafault: {}
        },
        eagle_eye: {
            type: Boolean,
            dafault: false
        }
    },
    computed: {

    },
    methods: {
        radioChange(e) {
            console.log(e)
            if (e.target.value == -1) {
                this.messageContent = e.target.value;
                this.customize = true;
            } else {
                this.messageContent = e.target.value;
                this.customize = false;
            }
        },
        // 监控中向考生发送消息
        submit_sendmsg() {
            let pkt = {
                type: "notice",
                to: this.sendMsgData.socket_id,
                msg: ''
            },
            msgData = {
                message_content: "",
                entry_name: this.sendMsgData.full_name,
                entry_permit: this.sendMsgData.permit
            };
            if (this.messageContent == '-1') {
                msgData.message_content = this.content;
                pkt.msg = this.content;
            } else {
                msgData.message_content = this.messageContent;
                pkt.msg = this.messageContent;
            }
            console.log(msgData, 'msgData')
            this.$socket.emit("message", pkt);
            // 将发送的数据存放接口日志里
            sendEntryMsg({ data: msgData }).then((res)=> {
                if(res.code == 200) {
                    Bus.$emit('changeLogs', { "permit": this.sendMsgData.permit, "logs": res.entry_log });
                    this.closeMsgModal()
                }
            }).catch((xhr) => {console.log(xhr)})
        },
        closeMsgModal() {
            this.customize = false;
            this.sendMsgData.openMessageModal = false;
            Bus.$emit('busTimerPause', {"status": true} );
        }
    }
}
</script>

<style lang="scss" scoped>
    .room-shadow { 
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 9999;
        background-color: rgba(0,0,0,0.6);
        .sendMsg-modal{
            .title{ 
                display: flex;
                justify-content: space-between;
                font-size: 20px;
                color: #000;
            }
            background-color: #ffffff;
            position: absolute;
            top: 24%;
            left: 38%;
            padding: 24px 30px 12px;
            .send-radio{
                font-size: 14px;
                color: #666666;
                margin: 5px 24px;
                text-align: left;
                &:hover{color: #0195ff;}
            }
            .send-btn{
                display: flex; 
                justify-content: space-evenly;
            }
        }
    }
</style>