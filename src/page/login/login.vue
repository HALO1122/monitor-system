<template>
    <div class="login">
        <a class="help-center" href="http://docs.eztest.org" target="_blank">
            <i class="ez-icon-font">&#xe65e;</i>&nbsp;{{ $t('login.help') }}</a>
        <div class="login-logo"></div>
        <p class="wrap-title">—— &nbsp;&nbsp;{{ $t('login.system') }}&nbsp;&nbsp; ——</p>

        <div class="wrap-form">
            <div class="wrap-inputs login-inputs">
                <p class="tip-wrap txt-left" v-if="error">{{errorTip}}</p>
                <p class="form-group">{{ $t('login.proctor') }}
                    <input type="text" class="form-control" v-model="id_name" :placeholder="$t('login._placeProctor')" autofocus></p>
                <p class="form-group mt30">{{ $t('login.code') }}
                    <input type="text" class="form-control" v-model="id_code" :placeholder='$t("login._placeCode")'></p>
                <button class="btn btn-blue btn-login mt30" @click="Login()">{{ $t('login.login') }}</button>
                <p class="mt30">{{$t('login.detectBefore')}}
                    <span class="theme-color" @click="detectDevice()">{{ $t('login.detect') }}</span>
                </p>
            </div>
        </div>

        <!-- 设备检测弹窗 -->
        <div class="wrap-camera-view" v-show="detectModal">
            <div class="camera-view-box">
                <p class="text-center text-title txt-20px">
                    {{$t('login.detect')}}<i class="ez-icon-font" @click="closeDetectModal()">&#xe7bf;</i>
                </p>
                <div class="container mt20">
                    <div class="row">
                        <div class="col-md view-r">
                            <video id="camera_view" autoplay playsinline muted></video>
                            <button class="btn btn-blue btn-primary mt10" @click="detectMicrophone()">
                                <i class="ez-icon-font">&#xe651;</i>{{$t('login.microSelect')}}</button>
                        </div>
                        <div class="col-md view-r ml30">
                            <p class="view-box mt10 mb50">
                                <span class="view-name">{{$t('login.browser')}}</span>
                                <span class="view-middle" id="browser_version">{{getBrowser().name + getBrowser().version}}</span>
                                <i class="ez-icon-font view-browser-icon" :class="{true: browserStatus !='&#xe811;'}" v-html="browserStatus"></i>
                            </p>
                            <p class="view-box mt10 mb50">
                                <span  class="view-name">{{$t('login.cameraSelect2')}}</span>
                                <select id="videoSource" class="view-middle"></select>
                                <i class="ez-icon-font view-browser-icon" :class="{true: videoStatus !='&#xe811;'}" v-html="videoStatus"></i>
                            </p>
                            <p class="view-box mt10 mb50">
                                <span class="view-name">{{$t('login.microphone')}}</span>
                                <select id="audioSource"  class="view-middle"></select>
                                <i class="ez-icon-font view-browser-icon" :class="{true: audioStatus !='&#xe811;'}" v-html="audioStatus"></i>
                            </p>
                            <p class="view-measure">
                                <span class="ml20">{{$t('login.videoBandwidth')}} <span>{{measureBW().bw}}</span> </span>
                                <span class="ml20">{{$t('login.delay')}} <span>{{measureBW().rtt}}</span></span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="wrap-camera-tip" v-if="openDetectMicrophone">
            <div class="camera-tip">
                <h5 class="camera-title txt-bold">{{micrTitle}}</h5>
                <div class="camera-track" ref="cameraTrack">
                    <p v-show="recordContent">{{$t('login.tip3')}}</p>
                    <div class="record-flag" v-show="!recordContent" :style="{right: audioIndex + '%'}"><p></p></div>
                    <div class="record-star-inserted" v-show="!recordContent" v-for="(item, index) in volumeBlocks" :key="index" :style="{height: item + 'px'}"></div>
                </div>
                <div>
                    <button v-show="confirmRecord" class="btn btn-blue btn-primary" @click="recordMircophone()">{{$t('role.confirm')}}</button>
                    <button v-show="!confirmRecord" class="btn btn-primary btn-gray mr30" @click="stopRecordAudio('cancel')">{{$t('monitor.cancel')}}</button>
                    <button v-show="!confirmRecord" class="btn btn-primary btn-blue ml30" @click="playRecord($event)">{{$t('login.play')}}</button>
                </div>
            </div>
        </div>

        <alertComponent :btnType="btnType" :alertContent="alertContent" :alertIsShow="alertIsShow"
            @confirmEvent="confirmForceExam" @cancelEvent="cancelForceExam"></alertComponent>
    </div>
</template>

<script>
import { RoomLogin } from '@/utils/api.js';
import alertComponent from '@/components/alert-component';
import { getStream, gotDevices, getDevices, stopTrack, deviceSource, device } from '@/utils/index.js';
import { SoundMeter } from '@/utils/sound_meter.js';
const RecordRTC = require("recordrtc");
export default {
    data() {
        return{
            id_name: "",
            id_code: "",
            error: false,
            errorTip: "",
            detectModal: false,
            browserStatus: "&#xe811;",
            videoStatus: "&#xe811;",
            audioStatus: "&#xe811;",
            alertIsShow: false,
            btnType: true,
            alertContent: '',
            openDetectMicrophone: false,
            confirmRecord: true,
            recordContent: true,
            recordRTC: null,
            timeClock: null,
            timerOffset: null,
            timeVolume: null,
            soundMeter: null,
            audioIndex: 0,
            volumeBlocks: [],
            recordedVideo: null,
            micrTitle: this.$t('login.tip1')
        }
    },
    components: { alertComponent },
    methods: {
        Login() {
            if( this.id_name == "" || this.id_code == "" ){
                this.error = true;
                this.errorTip = this.$t('login.errorTip');
            } else{
                this.Register();
            }
        },
        Register() {
            let msg = {
                superviser_name: this.id_name,
                code: this.id_code
            };
            RoomLogin({ data:msg }).then(res => {
                if (res.code == 200) {
                    this.error = false;
                    sessionStorage.token = res.token;
                    this.$store.commit('SET_TOKEN', res.token);
                    this.$store.commit('ROOM_ID', res.room_id);
                    this.$store.commit('TEACHER_ID', res.teacher_id);
                    this.$store.commit('SET_SOCKET', res.peer_setting);
                    this.$router.push('/role');
                } else{
                    this.error = true;
                    this.errorTip = res.msg;
                }
            })
            .catch(error => {
                console.log(error);
            });  
        },
        async detectDevice() {
            let devicExists = device();
            if (devicExists) {
                this.detectModal = true;
            } else {
                this.alertIsShow = true;
                this.alertContent = this.$t('login.tip2');
            }
            const videoSelect = document.querySelector('select#videoSource');
            const audioSelect = document.querySelector('select#audioSource');

            if(videoSelect) videoSelect.onchange = getStream.bind(this);
            if(audioSelect) audioSelect.onchange = getStream.bind(this);
            getStream().then(
                getDevices().then(gotDevices.bind(this)).then(
                    await this.getDetectStatus()
                )
            );

        },
        // 获取浏览器版本信息
        getBrowser() {
            $('.view-browser-icon').find('use').attr("xlink:href", "#icon-keyong")
            let ua = navigator.userAgent, tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident|eztest(?=\/))\/?\s*(\d+)/i) || [];
            
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return {name: 'IE', version: (tem[1] || '')};
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\bOPR|Edge\/(\d+)/)
                if (tem != null) {
                    return {name: 'Opera', version: tem[1]};
                }
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) {
                M.splice(1, 1, tem[1]);
            }
            this.browserStatus= "&#xe810;"
            return {
                name: M[0],
                version: M[1]
            };
        },
        // 获取设备网络连接信息
        measureBW() {
            const internet = {};
            const navi = navigator['connection'];
            if (navi) {
                // internet.bw = navi.downlink * 1024 / 8 + 'KB/sec'; //单位为KB/sec
                internet.bw = (navi.downlink / 8).toFixed(1) + 'Mb/s'; //单位为MB/sec
                internet.rtt = navi.rtt + 'ms'; //单位为毫秒
            }
            return internet;
        },
        getDetectStatus() {
            let status = deviceSource();
            if(status.video) this.videoStatus= "&#xe810;";
            if(status.audio) this.audioStatus= "&#xe810;";

        },
        closeDetectModal() {
            this.detectModal = false;
            const videoElement = document.querySelector('#camera_view');
            stopTrack(videoElement.srcObject);
        },
        cancelForceExam() {
            this.alertIsShow = false;
        },
        confirmForceExam(){ },
        detectMicrophone() {
            this.openDetectMicrophone = true;
            this.confirmRecord = true;
            this.recordContent = true;
            this.micrTitle = this.$t('login.tip1');
        },
        // 检测麦克风
        recordMircophone() {
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then(this.successCallback.bind(this));
        },
        successCallback(stream) {
            var options = {
                audio: true,
                video: false,
                mimeType: 'audio/webm',
                numberOfAudioChannels: 1,
                desiredSampRate: 16000
            };
            this.stream = stream;
            this.recordRTC = RecordRTC(stream, options);
            this.recordRTC.startRecording();

            this.confirmRecord = false;
            this.recordContent = false;
            this.showVolume();
            this.recordAudioTime();
        },
        recordAudioTime() {
            let that = this,
                volumeRecordTime = 11;
            that.timeClock = setInterval(() => {
                if (volumeRecordTime >= 1) {
                    volumeRecordTime--;
                    that.micrTitle = volumeRecordTime+'S';
                } else {
                    volumeRecordTime = 0;
                    that.stopRecordAudio();
                }
            }, 1000)
        },
        //显示音频波动
        showVolume() {
            this.volumeBlocks = [];
            this.soundMeter = new SoundMeter(new AudioContext());
            const videoElement = document.querySelector('#camera_view');
            const stream = videoElement.srcObject;
            let that = this;

            this.soundMeter.connectToSource(stream, (e) => {
                //根据音频波动弹出框的宽度控制绘制的频率
                const frequency = (10 * 1000) * 1.1 / (that.$refs.cameraTrack.offsetWidth / 4);
                that.timeVolume = setInterval(() => {
                    const meter = parseInt((this.soundMeter.instant * 100).toFixed(2));
                    this.volumeBlocks.push((meter > 1 ? meter : 1) < 50 ? (meter > 1 ? meter : 1) : 50);
                }, frequency);
            });
        },
        // 播放录制的音频
        playRecord(e) {
            let blob = this.recordRTC.getBlob();            
            if (blob != null) {
                this.oprateAudioIndex();
                this.recordedVideo = document.createElement("video");
                this.recordedVideo.src = window.URL.createObjectURL(blob);
                this.recordedVideo.addEventListener('loadedmetadata', () => {
                    this.recordedVideo.play();
                });
            }
        },
        // 音轨滑块偏移
        oprateAudioIndex() {
            let that = this;
            that.timerOffset && clearInterval(that.timerOffset);
            that.timerOffset = setInterval(() => {
                if (that.audioIndex < 100) {
                    that.audioIndex += 1;
                } else {
                    that.audioIndex = 0;
                    clearInterval(that.timerOffset)
                }
            }, 100)
        },
        stopRecordAudio(type) {
            this.audioIndex = 0;
            this.recordRTC.stopRecording();
            this.timeClock && clearInterval(this.timeClock);
            this.timerOffset && clearInterval(this.timerOffset);
            this.timeVolume && clearInterval(this.timeVolume);
            this.soundMeter && this.soundMeter.stop();
            if (type=='cancel') this.openDetectMicrophone=false;
            if (this.recordedVideo != null) this.recordedVideo.pause();
        }
    }
}
</script>

<style scoped lang="scss">
@import './login.scss';
</style>
