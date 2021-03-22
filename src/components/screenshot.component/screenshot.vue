<template>
    <div class="room-shadow">
        <div class="room-cut">
            <p class="title">
                <span>{{$t('monitor.register')}}</span>
                <span><i class="ez-icon-font txt-18px" @click="closeCutModal()">&#xe7bf;</i></span>
            </p>
            <ul class="mt10">
                <li class="room-abnormal-pic">
                    <canvas class="mt10 mb20" id="Canvas" ref="Canvas" width="320" height="240"></canvas>
                    <p> {{item.full_name}} | {{item.permit}} </p>
                </li>
                <li class="pl30 txt-left">
                    <p class="txt-18px pb10">{{$t('monitor.screenCut.reson')}}</p>
                    <p class="radio" v-for="tip in screenshotTip" :key="tip.value">
                        <label><input type="radio" name="redRadio" @change="radioChange($event)" :value="tip.value"> {{tip.msg}}</label>
                    </p>
                    <textarea class="room-abnormal-text mt5" name="remark" v-model="remark" cols="55" rows="4"></textarea>
                    <button type="button" class="btn btn-primary btn-blue mt10" @click="screenshotVideo()">{{$t('monitor.submit')}}</button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { screenshotEntry } from '@/utils/api.js';
import Bus from '@/utils/bus.js';
export default {
    data () {
        return{
            screenshotTip: [
                {"msg": this.$t('monitor.screenCut.tip1'), "value": 10},
                {"msg": this.$t('monitor.screenCut.tip2'), "value": 2},
                {"msg": this.$t('monitor.screenCut.tip3'), "value": 9},
                {"msg": this.$t('monitor.screenCut.tip4'), "value": 8},
                {"msg": this.$t('monitor.screenCut.tip5'), "value": 3},
                {"msg": this.$t('monitor.screenCut.tip6'), "value": 7},
                {"msg": this.$t('monitor.screenCut.tip7'), "value": 6},
                {"msg": this.$t('monitor.screenCut.tip8'), "value": 5}
            ],
            canvas: '',
            cutContent: '',
            remark: ''
        }
    },
    props: {
        screenshotData: {
            type: Object,
            dafault: {}
        },
        eagle_eye: {
            type: Boolean,
            dafault: false
        }
    },
    computed: {
        item: {
            get() {
                return this.screenshotData
            },
            set(data){
                this.screenshotData  = data;
            }
        }
    },
    created() {
        this.$nextTick(function () {
            this.openModal();
        })
    },
    methods:{
        openModal() {
            let that = this;
            Bus.$on('controlMainScreenshot', target => {
                if (that.item.permit == target.permit) {
                    console.log('controlMainScreenshot')
                    setTimeout(function() {
                        this.canvas = $("#Canvas")[0];
                        let ctx = this.canvas.getContext("2d");
                        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        ctx.drawImage(target.video, 0, 0, this.canvas.width, this.canvas.height);
                    }, 10)
                }
            });
        },
        radioChange(e) {
            this.cutContent = e.target.value;
        },
        screenshotVideo() {
            let cutData ={
                "image_base64_str": $("#Canvas")[0].toDataURL('image/jpeg', 0.6),
                "mismatch_type": this.cutContent,
                "permit": this.item.permit,
                "remark": this.remark
            }
            console.log(cutData, 'cutData')
            if (cutData.mismatch_type != "" && cutData.permit != "") {
                screenshotEntry({ data: cutData }).then((res)=> {
                    if(res.code == 200) {
                        Bus.$emit('screenshotLogs', {"permit": this.item.permit, "logs": res.data.entry_log,
                            "error_screen_photo_count": res.data.error_screen_photo_count, "machine_photo_count": res.data.machine_photo_count});
                        this.closeCutModal()
                    }
                }).catch((xhr) => {console.log(xhr)})
            }
        },
        closeCutModal() {
            this.item.openScreenshotModal = false;
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
        
         .room-cut{
            width: 820px;
            background-color: #E4E4E4;
            position: absolute;
            top: 20%;
            left: 26%;
            padding: 24px 30px 12px;
            color: #000;
            .title{
                font-size: 20px;
                display: flex;
                justify-content: space-between;
            }
            ul {
                display: flex;
            }
        }
        .room-abnormal-text {
            color: #000; 
            font-size: 14px;
        }
    }
</style>