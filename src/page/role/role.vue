<template>
    <div id="main">
        <div class="role-content" v-show="sessionContent">
            <p class="txt-18px mb20">{{ $t('role.select') }}</p>
            <div class="pt30 role-select">
                <div id="proctorT" @click="roleColor = !roleColor" >
                    <img src="../../assets/images/proctor.png" :class="{proctorColor: !roleColor}" width="180" alt="proctor">
                    <p class="pt20 txt-16px">{{ $t('role.imProctor') }}</p>
                </div>
                <div id="patrolT" @click="roleColor = !roleColor" >
                    <img src="../../assets/images/patrol.png" :class="{patrolColor: roleColor}" width="180" alt="patrol">
                    <p class="pt20 txt-16px">{{ $t('role.imPatrol') }}</p>
                </div>
            </div>
            <button class="btn btn-blue mt20" @click="toRoomWall()">{{ $t('role.confirm') }}</button>
        </div>
        <div class="phont-content" v-show="!sessionContent">
            <h5>{{ $t('role.takePhoto') }}</h5>
            <div class="select-camera mt20">
                <span>{{ $t('role.cameraSelect') }}</span>
                <select class="device-select" id="videoSource"></select>
            </div>
            <div class="select-microphone mt20">
                <span>{{ $t('role.micSelect') }}</span>
                <select class="device-select" id="audioSource"></select>
            </div>
            <div class="video-source">
                <span class="wrap-lines">
                    <span class="tp-lt"></span>
                    <span class="tp-rt"></span>
                    <span class="bt-lt"></span>
                    <span class="bt-rt"></span>
                </span>
                <canvas id="canvas_photo" v-show="vidoeOrPhoto" width="320" height="240"></canvas>
                <video id="camera_view" v-show="!vidoeOrPhoto" muted autoplay playsinline></video>
            </div>
            <div class="mt30">
                <p class="mb20 txt-12px">{{ $t('role.tip') }}</p>
                <div id="save_photo" v-show="takephoto">
                    <button class="btn btn-blue take-photo-btn" @click="confirm_photo(false)">{{ $t('role.retry') }}</button>
                    <button class="btn btn-blue take-photo-btn" @click="confirm_photo(true)">{{ $t('role.done') }}</button>
                </div>
                <button v-show="!takephoto" class="take-photo mt20" @click="take_photo()" :disabled="isDisabled"><i></i></button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { saveProctorPhoto } from "@/utils/api";
import { getStream, gotDevices, getDevices, stopTrack } from '@/utils/index.js'
export default {
    data() {
        return {
            sessionContent: true,
            roleColor: false,
            vidoeOrPhoto: true,
            isDisabled: false,
            takephoto: false,
            photoData: null
        }
    },
    onLoad() {
        
    },
    computed: {
        ...mapState({
            global: state=>state.global
        })
    },
    methods: {
        toRoomWall() {
            let _this = this;
            if(_this.roleColor) {
                _this.$router.push('/monitorwall?role=patrol')
            } else {
                _this.sessionContent = false;
                _this.getMedia()
            }
        },
        take_photo() {
            this.takephoto = true;
            let video = document.getElementById("camera_view"),
                canvas = document.getElementById("canvas_photo"),
                ctx = canvas.getContext("2d");
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.drawImage(video,0,0,canvas.width,canvas.height);
            this.photoData = canvas.toDataURL('image/jpeg',0.6);
            this.vidoeOrPhoto = !this.vidoeOrPhoto;
        },
        getMedia() {
            const videoSelect = document.querySelector('select#videoSource');
            const audioSelect = document.querySelector('select#audioSource');
            this.vidoeOrPhoto = !this.vidoeOrPhoto;

            if(videoSelect) videoSelect.onchange = getStream.bind(this);
            if(audioSelect) audioSelect.onchange = getStream.bind(this);
            getStream().then(getDevices().then(gotDevices.bind(this)));
        },
        // 监考拍照
        confirm_photo(type) {
            if(!type) {
                this.vidoeOrPhoto = !this.vidoeOrPhoto;
                this.takephoto = false;
            } else {
                let msg = {"image_base64_str": this.photoData};
                saveProctorPhoto({ data: msg }).then(() => {
                    const videoElement = document.querySelector('#camera_view');
                    stopTrack(videoElement.srcObject);
                    this.$router.push('/monitorwall?role=proctor');
                })
                .catch(error => {
                    console.log(error);
                }); 
            }
        }
    }
}
</script>

<style scoped lang="scss">
@import './_role.scss';
</style>