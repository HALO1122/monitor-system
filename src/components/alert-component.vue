<template>
    <div class="alert-dialog" v-if="Alert">
        <div class="alert-content">
            <div class="alert-header"></div>
            <div class="alert-body clearfix">
                <p class="txt-14px d_content">{{alertContent}}</p>
            </div>
            <div class="alert-footer" v-if="!btnType">
                <button type="button" class="btn btn-primary" @click="confirmEvent()">{{$t('role.confirm')}}</button>
                <button type="button" class="btn btn-primary btn-gray" @click="cancelEvent()">{{$t('monitor.cancel')}}</button>
            </div>
            <div class="alert-footer" v-if="btnType">
                <button type="button" class="btn btn-primary" @click="cancelEvent()">{{$t('know')}}</button>
            </div>
        </div>
    </div>
</template>

<script>
import Bus from '@/utils/bus.js';
export default {
    data() {
        return {
            Alert: false
        }
    },
    props: {
        alertIsShow: {
            type: Boolean,
            dafault: false
        },
        alertContent: {
            type: String,
            dafault: ""
        },
        btnType: {
            type: Boolean,
            dafault: false
        }
    },
    computed: {
        alertShow() {
            return this.alertIsShow
        }
    },
    watch: {
        alertShow(status) {
            console.log(status, 'status')
            status ? this.Alert = true : this.Alert = false;
        }
    },
    methods:{
        confirmEvent() {
            this.$emit('confirmEvent', "")
        },
        cancelEvent() {
            this.$emit('cancelEvent', "")
        }
    }
}
</script>

<style lang="scss" scoped>
    .alert-dialog{
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1050;
        overflow: hidden;
        transition: opacity .15s linear;
        outline: 0;
        background-color: rgba(0,0,0,0.3);
        .alert-content{
            width: 380px;
            height: 180px;
            margin: 120px auto;
            border-top: 4px solid #0195ff !important;
            background-color: #fff;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0);
            border-color: transparent;
            border-radius: 4px;
            .alert-header{
                min-height: 18px;
                padding: 15px;
                font-weight: bold;
                font-size: 16px;
            }
            .alert-body{
                min-height: 90px;
                padding: 15px 20px 5px;
                .d_content{
                    text-align: left;
                    color: #000;
                }
            }
            .alert-footer {
                padding: 10px 15px 0px;
                display: flex;
                justify-content: space-evenly;
                border-top: 1px solid #e5e5e5;
            }
        }
    }
</style>