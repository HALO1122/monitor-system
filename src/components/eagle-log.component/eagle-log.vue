<template>
    <div :id="logs.permit">
        <p class="tag-monitor-status"><i class="ez-icon-font">&#xe95c;</i> 运行中</p>
        <div class="eagle-show">
            <img src="" class="eagle-photo" width="100%">
            <video class="eagle-video" ref="eagle_vidoe" muted autoplay playsinline></video>
        </div>
        <ul class="eagle-entry-log pt10 pb10">
            <vue-scroll :ops="ops">
                <li v-for="(subitem,index) in logs.entry_log" :key="index">
                    <div v-if="subitem.login"><p class="login">登录考试</p><p>{{subitem.login}}</p></div>
                    <div v-if="subitem.eagle_login"><p class="login">进入鹰眼</p><p>{{subitem.eagle_login}}</p></div>
                    <div v-if="subitem.error_screen"><p class="monitor">截屏异常</p><p>{{subitem.error_screen.time}}</p></div>
                    <div v-if="subitem.entry_message"><p class="login">监考发消息</p><p>{{subitem.entry_message.time}}</p></div>
                    <div v-if="subitem.entry_call"><span class="login">监考通话</span><p>{{subitem.entry_call.time}}</p></div>
                    <div v-if="subitem.leave"><span class="leave">离开考试</span><p>{{subitem.leave}}</p></div>
                    <div v-if="subitem.end"><span class="end">交卷</span><p>{{subitem.end}}</p></div>
                    <div v-if="subitem.force"><span class="force">强制交卷</span><p>{{subitem.force}}</p></div>
                    <div v-if="subitem.timeout"><span class="timeout">自动收卷</span><p>{{subitem.timeout}}</p></div>
                    <div v-if="subitem.out"><span class="out">离开页面</span><p>{{subitem.out}}</p></div>
                </li>
            </vue-scroll>
        </ul>
        <i class="ez-icon-font eagle-cut txt-20px">&#xe807;</i>
    </div>
</template>

<script>
export default {
    name: "eagle-log",
    data() {
        return{
            eagleStatus: "",
            ops: {
                vuescroll: {},
                scrollPanel: {},
                rail: {
                    background: "#555557",    //轨道的背景色。
                    opacity: 0.4,            //轨道的透明度。 0是透明，1是不透明
                    size: "8px",             //轨道的尺寸。
                    specifyBorderRadius: false, //是否指定轨道的 borderRadius， 如果不那么将会自动设置。
                    gutterOfEnds: null,
                    gutterOfSide: "0px",      //距离容器的距离
                    keepShow: false
                },
                bar: {
                    hoverStyle: false,
                    onlyShowBarOnScroll: false, //是否只有滚动的时候才显示滚动条
                    background: "#f1f1f1",
                    opacity: 0.4,
                    "overflow-x": "hidden"
                }
            }
        }
    },
    mounted() {
        console.log(this.eagleLog, 'eagle_socket_id')
    },
    computed: {
        logs (){
            return this.eagleLog
        }
    },
    props: {
        eagleLog: {
            type: Object,
            dafault: {}
        },
    }
}
</script>

<style lang="scss" scoped>
@import './eagle-log.scss';
</style>