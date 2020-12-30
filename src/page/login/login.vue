<template>
    <div class="login">
        <a class="help-center" href="http://docs.eztest.org" target="_blank"><i class="ez-icon-font txt-16px">&#xe606;</i>帮助中心</a>
        <div class="login-logo"></div>
        <p class="wrap-title">—— &nbsp;&nbsp;监控系统&nbsp;&nbsp; ——</p>

        <div class="wrap-form">
            <el-form class="wrap-inputs" ref="form" :model="form" label-width="90px">
                <el-alert class="mb10" :title="errorTip" type="error" center show-icon v-show="error" @close="closeAlert"></el-alert>
                <el-form-item label="监控老师："><el-input v-model="id_name" autofocus="true" placeholder="请输入姓名"></el-input></el-form-item>
                <el-form-item label="监控口令："><el-input v-model="id_code" placeholder="请输入口令"></el-input></el-form-item>
                <el-button type="primary" class="btn-login mt20" @click="Login()">登录</el-button>

                <p class="mt30">监考前，请先进行<span class="theme-color" @click="detectDevice()">设备检测</span></p>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return{
            form: { name: '' },
            id_name: "",
            id_code: "",
            error: false,
            errorTip: "error"
        }
    },
    methods: {
        closeAlert() {
            this.error = false;
            this.errorTip = "";
        },
        Login() {
            if( this.id_name == "" || this.id_code == "" ){
                this.error = true;
                this.errorTip = "姓名和口令不能为空！";
            } else{
                this.Register();
            }
        },
        Register() {
            let msg = {
                superviser_name: this.id_name,
                code: this.id_code
            };
            this.$http({
                url: "/schedule/session/3163/monitor_room_login/",
                method: "post",
                crossdomain: true,
                data: msg 
            })
            .then(res => {
                if (res.code == 200) {
                    this.$store.commit('SET_TOKEN', res.token);
                    this.$store.commit('ROOM_ID', res.room_id);
                    this.$store.commit('TEACHER_ID', res.teacher_id);
                    this.$router.push('/role');
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
