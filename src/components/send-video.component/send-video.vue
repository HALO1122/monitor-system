<template>
    <!-- 发送视频通话 -->
    <div class="room-shadow" v-if="callVideoData.openVideoCallModal">
        <div class="video-call-content">
            <div class="video-call-left">
                <video class="video-student" ref="videoStudent" autoplay playsinline></video>
                <span class="video-tag tag-student">{{$t('monitor._entry')}}</span>
                <video class="video-teacher" ref="videoTeacher" muted autoplay playsinline></video>
                <span class="video-tag tag-teacher">{{$t('monitor._proctor')}}</span>
            </div>
            <div class="video-call-right" v-if="callVideoData.eagleStream != undefined">
                <video class="video-eagle" ref="videoEagle" muted autoplay playsinline></video>
                <span class="video-tag tag-student">{{$t('monitor._eagleVideo')}}</span>
                <p class="video-eagle-cut">
                    <i class="ez-icon-font eagle-cut txt-18px" @click="eagleCut($event)">&#xe807;</i>
                </p>
            </div>
        </div>
        <div class="video-config">
            <span class="call-permit">{{$t('monitor.permit')}}： {{callVideoData.permit}}</span>
            <p><i class="ez-icon-font" @click="closeCallVideo()">&#xe640;</i></p>
            <span class="call-name">{{$t('monitor.name')}}： {{callVideoData.full_name}}</span>
        </div>

        <canvas v-show="cutCanvas" ref="Canvas" width="320" height="240"></canvas>
    </div>
</template>
<script>
import { mapState } from "vuex";
import { callVideo, screenshotEntry } from '@/utils/api.js';
import Bus from '@/utils/bus.js';
const peers = {}, to_peers = {};
const SimplePeer = require("simple-peer");
const MultiStreamsMixer = require("multistreamsmixer");
const RecordRTC = require("recordrtc");
export default {
    data() {
        return {
            cutCanvas: false,
            canvas: "",
            localSocketId: "",
            localStream: null, // 本地视频流
            curBlob: null, // 当前录制的blob
            mediaRecorder: null, // 视频录制
            blobsFailed: [],
            studentStream: null
        };
    },
    props: {
        callVideoData: {
            type: Object,
            dafault: {}
        },
        timerPause: {
            type: Boolean,
            dafault: false
        }
    },
    computed: {
        ...mapState({ global: state=>state.global }),
        callDataStatus() {
            return this.callVideoData.openVideoCallModal;
        }
    },
    watch: {
        callDataStatus(status) {
            if (status) {
                this.getLocalStream();
            }
        }
    },
    sockets: {
        message: function(data) {
            let that = this;
            switch (data.type) {
                case "signal_called":
                    var peer = peers[data.to_peer];
                    to_peers[data.to_peer] = data.from_peer;
                    if (peer !== null && peer != undefined) {
                        peer.signal(data.msg);
                    }
                break;
                case "signal":
                    var peer = peers[data.to_peer];
                    to_peers[data.to_peer] = data.from_peer;
                    if (peer !== null && peer != undefined) {
                        peer.signal(data.msg);
                    }
                break;
                case "call":
                    let iceServers = this.global.socket.config.iceServers;
                    const Cpeer = new SimplePeer({
                        config: iceServers,
                        stream: that.localStream,
                        initiator: true
                    });
                    Cpeer.on("signal", function(peer_data) {
                        var pkt = {
                        type: "signal_called",
                        to: that.callVideoData.socket_id,
                        from: that.localSocketId,
                        from_peer: Cpeer._id,
                        to_peer: data.from_peer,
                        msg: peer_data
                        };
                        that.$socket.emit("message", pkt);
                    });
                    if (Cpeer !== null && Cpeer != undefined) {
                        peers[Cpeer._id] = Cpeer;
                        that.peerNow = Cpeer;
                    }
                break;
            }
        }
    },
    methods: {
        initCanvas(data) {
            this.canvas = this.$refs.Canvas;
            let ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			ctx.drawImage(data, 0, 0, this.canvas.width, this.canvas.height);
        },
        eagleCut(e) {
            let eagleVideo = $(e.target).parents(".video-call-right").find(".video-eagle")[0];
            let cutData ={
                "image_base64_str": '',
                "mismatch_type": '11',
                "permit": this.callVideoData.permit,
                "remark": ''
            }
            if (eagleVideo != undefined) {
                this.initCanvas(eagleVideo);
                cutData.image_base64_str = this.canvas.toDataURL('image/jpeg', 0.6);
                screenshotEntry({ data: cutData }).then((res)=> {
                    if(res.code == 200) {
                        Bus.$emit('screenshotLogs', {"permit": this.callVideoData.permit, "logs": res.data.entry_log,
                            "error_screen_photo_count": res.data.error_screen_photo_count, "machine_photo_count": res.data.machine_photo_count});
                    }
                }).catch((xhr) => {console.log(xhr)})
            }
        },
        getLocalStream() {
            let that = this;
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                var constraints = (window.constraints = {
                audio: true,
                video: {
                    width: { min: 320, ideal: 320, max: 800 },
                    height: { min: 240, ideal: 240, max: 600 }
                }
            });
            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(function(stream) {
                    that.localStream = stream;
                    that.studentStream = that.callVideoData.studentStream;
                    that.eagleStream = that.callVideoData.eagleStream;
                    that.$refs.videoTeacher.srcObject = that.localStream;
                    that.$refs.videoStudent.srcObject = that.studentStream;
                    that.$refs.videoEagle.srcObject = that.eagleStream;
                    if (that.studentStream) {
                    let pkt = {
                        type: "connected",
                        to: that.callVideoData.socket_id,
                        from: that.$socket.id
                    };
                        that.localSocketId = that.$socket.id;
                        that.$socket.emit("message", pkt);
                    }
                    
                    that.startCallVideo(that.localStream, that.studentStream);
                })
                .catch(function(error) {});
            }
        },
        startCallVideo(localStreams,studentStreams) {
            let params = {
                entry_permit: this.callVideoData.permit,
                entry_name: this.callVideoData.full_name,
                status: "start"
            }
            callVideo({ data: params }).then((res)=> {
                this.startRecordVideo(localStreams,studentStreams, res);
            })
        },
        // 挂断视频通话
        closeCallVideo() {
            this.endMessage();
            this.$emit('_timerPause', this.timerPause)
            this.callVideoData.openVideoCallModal = false;
            if (this.localStream) {
                for (let track of this.localStream.getTracks()) {
                    track.stop();
                }
            }
            // 停止通话视频录制
            this.mediaRecorder.stopRecording();
            this.peerNow.destroy();
        },
        endMessage() {
            let params = {
                entry_permit: this.callVideoData.permit,
                entry_name: this.callVideoData.full_name,
                status: "end"
            }
            callVideo({ data: params }).then((res)=> {
                if(res.code == 200) {
                    Bus.$emit('callVideoLogs', { "permit": this.callVideoData.permit, "logs": res.entry_log });
                }
            })
        },
        // 视频录制
        async startRecordVideo(localStreams,studentStreams, sign) {
            let that = this,
                streams = [localStreams, studentStreams];
            const mixer = new MultiStreamsMixer(streams);
            mixer.startDrawingFrames();
            const mixedStream = mixer.getMixedStream();

            const options = {
                type: "video",
                mimeType: "video/webm;codecs=opus,vp8",
                bitsPerSecond: 256 * 1024,
                timeSlice: 60 * 1000,
                ondataavailable: blob => {
                    console.log(blob, "blob");
                    that.curBlob = null;
                    that.curBlob = blob;
                    if (that.curBlob && that.curBlob.size > 0) {
                        this.submitBlob(that.curBlob, sign);
                    }
                }
            };
            // 监考视频通话录制
            that.mediaRecorder = new RecordRTC.RecordRTCPromisesHandler(mixedStream, options);
            that.mediaRecorder.startRecording();
        },
        submitBlob(blob, sign) {
        let data = { name: "", file: blob };
        data.name = Date.now() + ".webm";
        this.uploadResource(
            data,
            sign,
            () => {
            console.log("success submit blob");
            },
            () => {
            // 保存失败，放在本地变量里
            this.blobsFailed.push(data);
            this.submitBlobsFailed(0, sign);
            console.log("blob submit failed");
            }
        );
        },
        submitBlobsFailed(index, sign) {
        console.log(this.blobsFailed, "blobsFailed");
        const blob = this.blobsFailed[index];
        this.uploadResource(
            blob,
            sign,
            () => {
            // 保存成功，删除当前blob
            this.deleteBlobSubmitted(blob);
            },
            () => {}
        );
        },
        deleteBlobSubmitted(blobSubmitted) {
            for (let i = 0, len = this.blobsFailed.length; i < len; i++) {
                if (this.blobsFailed[i]["name"] === this.blobSubmitted.name) {
                    this.blobsFailed.splice(i, i + 1);
                    i--;
                    len--;
                }
            }
        },
        uploadResource(data, sign, success_callback, error_callback) {
            const formData = new FormData();
            formData.append("OSSAccessKeyId", sign.accessid);
            formData.append("policy", sign.policy);
            formData.append("success_action_status", "200");
            formData.append("key", sign.dir + data.name);
            formData.append("signature", sign.signature);
            formData.append("file", data.file);
            var request = new XMLHttpRequest();
            request.open("post", sign.host);
            request.send(formData);

            request.onreadystatechange = function() {
                console.log(request.status, request.readyState, "request.status"); //HTTP状态码
                if (request.readyState === 4 && request.status === 200) {
                success_callback();
                } else if (request.status !== 200) {
                error_callback();
                }
            };
        }
    }
};
</script>

<style lang="scss" scoped>
.room-shadow {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.6);
    .video-call-content {
        display: flex;
        justify-content: center;
        width: 640px;
        background-color: rgba(0, 0, 0, 0.6);
        margin: 60px auto 0;
        .video-call-left {
            position: relative;
            .video-student {
                width: 640px;
            }
            .video-teacher {
                position: absolute;
                top: 0;
                left: 0;
                max-height: 160px;
                box-shadow: 0 0 5px 1px #333;
            }
        }
        .video-call-right {
            position: relative;
            .video-eagle{
                width: 360px;
                box-shadow: 0px 0px 5px 1px #333;
            }
            .video-eagle-cut{
                color: #fff;
                background-color: #999;
                padding: 2px 4px;
                cursor: pointer;
                position: absolute;
                bottom: 0px;
                right: 0px;
            }
        }
        .video-tag {
            position: absolute;
            top: 5px;
            color: #fff;
            font-size: 12px;
            padding: 1px 10px;
            border-radius: 10px;
        }
        .tag-student {
            right: 10px;
            background-color: #03cd70;
        }
        .tag-teacher {
            left: 10px;
            background-color: #2e80fe;
        }
    }
    .video-config {
        width: 1000px;
        line-height: 36px;
        display: flex;
        justify-content: center;
        background-color: #3d3c41;
        color: #fff;
        padding: 15px 0;
        margin: 0 auto;
        p {
            margin: 0 50px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: red;
            i {
                font-size: 22px;
            }
        }
    }
}
</style>
