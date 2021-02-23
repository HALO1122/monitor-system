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
    </div>
</template>

<script>
import { RoomLogin } from '@/utils/api.js'
export default {
    data() {
        return{
            id_name: "",
            id_code: "",
            error: false,
            errorTip: ""
        }
    },
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
        detectDevice() {
            alert("132")
        }
        // alert(trans.login.tip1)
    }
}
</script>

<style scoped lang="scss">
@import './login.scss';
</style>
