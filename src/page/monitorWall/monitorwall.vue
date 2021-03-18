<template>
    <div class="wrap-room-wall">
        <!-- 头部班级信息 -->
        <nav-header :roomInfo="room_info" :endExam="endExam" :timerNum="timerNum" @getRoomMsg="initMonitorRoom"></nav-header>
        <div id="search_wrap" class="mr20 mt10 mb10">
            <input type="text" class="form-control" v-model="searchData" :placeholder="$t('monitor.search._place')" name="keyword">
            <button class="btn-search" type="submit" @click="search_entry()"><i class="ez-icon-font icon-monitor">&#xe6dc;</i></button>
        </div>
        <!-- 展示内容---无考生 -->
        <div class="room-video-tip txt-18px" v-if="permitIsEmpty">{{ $t('monitor.empty') }}</div>
        <span class="nav-btnPrev" v-if="!permitIsEmpty" @click="getPrevSingle()"><i class="icon-nav-btnPrev"></i></span>
        <span class="nav-btnNext" v-if="!permitIsEmpty" @click="getNextSingle()"><i class="icon-nav-btnNext"></i></span>
        <p class="monitor-error-tip mt10" v-if="monitorError">
            <i class="ez-icon-font">&#xe721;</i>&nbsp;&nbsp;<span>{{monitorErrorTip}}</span>
            <i class="ez-icon-font ml20" @click="monitorError = false">&#xe7bf;</i>
        </p>
        <!-- 展示内容---有考生 -->
        <div class="room-video-block" v-if="!permitIsEmpty">
            <ul class="room-video-list">
                <li class="room-video-li" v-for="item in entryInfo" :key="item.permit" ref="curLi" :permit="item.permit">
                    <entryComponent :item="item" :openVideo="openVideo" :doubleVideo="doubleVideo" :openForceExam="openForceExam"
                    :eagle="room_info.eagle_eye"></entryComponent>
                </li>
            </ul>
        </div>

        <search-entry v-if="searching" @searchModelClose="(data) => {this.searching = data}" :search_entry_data="search_entry_data" :room_info="room_info" @touchmove.prevent></search-entry>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { getMonitorRoom, getSingleEntry, searchSingleEntry, saveProctorSocketId } from '@/utils/api.js'
import navHeader from '@/components/nav-header.component/nav-header'
import entryLog from '@/components/entry-log.component/entry-log'
import eagleLog from '@/components/eagle-log.component/eagle-log'
import searchEntry from '@/components/search-entry.component/search-entry'
import entryComponent from '@/components/single-entry.component/single-entry'
import Bus from '@/utils/bus.js';
export default {
    data() {
        return {

            room_info: {},
            role: "",
            permitIsEmpty: true,
            timerNum: 10,
            timeClock: null,
            timerPause: true,
            openVideo: false,
            endExam: false,
            entryInfo: [],
            entryIndex: 0,     // 某个考生在考生列表的索引值
            whole_list: [],    // 所有考生列表
            entry_list: [],    // 考生数组,
            fixed_list: [],     // 存放钉住考生
            doubleVideo: false,
            entryVideo: {},
            searchData: "",
            searching: false,
            monitorError: false,
            monitorErrorTip: "这是错误提示",
            search_entry_data: [],
            action: '',
            openForceExam: false
        }
    },
    components: {
        entryLog, eagleLog, navHeader, searchEntry, entryComponent
    },
    mounted() {
        this.initMonitorRoom('init');
    },
    created() {
        this.role = this.$route.query.role;
        this.$store.commit('SAVE_ROLE', this.role);
        if (this.role == "patrol") {
            this.openVideo = false; this.endExam = false;
        } else {
            this.openVideo = true; this.endExam = true;
        }
    },
    computed: {
        ...mapState({ global: state=>state.global })
    },
    methods: {
        initMonitorRoom(action) {
            getMonitorRoom().then(res => {
                let that = this;
                that.room_info = res;
                that.room_info.eagle_eye ? this.doubleVideo = true : this.doubleVideo = false;
                if (that.role != "patrol") {
                    that.room_info.force_monitor ? this.openForceExam = true : this.openForceExam = false;
                }
                if (res.entries_online.length != 0) {
                    that.permitIsEmpty = false;
                    that.whole_list = res.entries_online;
                    if(action == 'init') { // 初始渲染5个考生
                        that.entry_list = that.whole_list.slice(this.entryIndex, 5);
                        that.saveSocketId();
                        that.initStudentVideo(that.entry_list, 'all');
                        that.countDown();
                    }
                } else {
                    that.permitIsEmpty = true;
                }

            }).catch(error => {
                console.log(error);
            }); 
        },
        // 保存监考老师socketId
        saveSocketId() {
            if (this.$socket.connected && this.role == 'proctor') {
                let msg = {"teacher_socket": this.$socket.id};
                saveProctorSocketId({ data: msg }).then(res => { }).catch(err => { console.log(err)  })
            }
        },
        countDown() {
            let that = this;
             Bus.$on('busTimerPause', target => {
                that.timerPause = target.status;
            });
            that.timeClock = setInterval(function(){
                if(that.timerPause) {
                    that.timerNum--;
                    if (that.timerNum == 0) { 
                        that.timerNum = 10;
                        that.autoRefresh();                 
                        // clearInterval(that.timeClock)
                    }
                } else {
                    that.timerNum = that.timerNum;
                }
            }, 1000)
        },
        async initStudentVideo(entry_list, action){
            console.log(entry_list, 'entry_list--------')
            if(action == 'all') {
                for (let i = 0, len = entry_list.length; i < len; i++ ) {
                    await this.initSingleVideo(entry_list[i], action, i);
                }
            } else {
                this.initSingleVideo(entry_list[0], action, 0);
            }
        },
        async initSingleVideo(permit, action, i) {
            let msg = {"permit": permit},
                that = this;
            await getSingleEntry({ data: msg }).then(res => {
                if (res.code == 200) {
                    this.action = action;
                    res.data.eagle_eye = that.room_info.eagle_eye;
                    res.data.audio_monitor = that.room_info.audio_monitor;
                    res.data.isVideo = false;
                    res.data.pinup = false;
                    res.data.openSound = false;
                    res.data.openMessageModal = false;
                    res.data.openScreenshotModal = false;
                    res.data.openVideoCallModal = false;
                    res.data.videoStatus = this.$t('monitor.connecting');
                    if (action != 'prev') {
                        that.entryInfo.push(res.data);
                    } else{
                        that.entryInfo.unshift(res.data);
                    }
                }
            })
        },
        autoRefresh() {
            if(this.entryInfo.length > 4) {
                this.autoToggleSingle();
            }
        },
        getPrevSingle() {
            let that = this;
            that.entry_list = [];
    

            that.whole_list = [];
            that.entryInfo.filter(item => {
                if (!item.pinup) that.whole_list.push(item.permit)
            });
            
            console.log(that.whole_list[that.whole_list.length - 1], 'entry_list')

            that.entry_list.push(that.whole_list[that.whole_list.length - 1]);
            that.initStudentVideo(that.entry_list, 'prev');
            that.destroySingleEntry("prev");
        },
        getNextSingle() {
            let singleLi = $('.room-video-li');
            if (singleLi.length > 4) { this.autoToggleSingle(); }
        },
        autoToggleSingle() {
            let that = this,
                singleLi = $('.room-video-li'),
                lastPermit = that.entryInfo[singleLi.length - 1].permit;
            that.entry_list = [];
            that.whole_list = [];

            // 过滤钉住的考生
            that.entryInfo.filter(item => {
                if (!item.pinup) that.whole_list.push(item.permit);
            });
            // 最后一个考生在列表中的索引值、浏览到最后一个重新请求列表
            that.entryIndex == undefined ? that.entryIndex = 0 : that.entryIndex = that.findEntryIndex(that.whole_list, lastPermit);

            if (that.entryIndex != that.whole_list.length - 1) {
                that.entry_list = that.whole_list.slice(that.entryIndex+1, that.entryIndex+2);
            } else {
                that.initMonitorRoom('reload');
                that.entry_list = that.whole_list.slice(0, 1);
            }

            console.log(that.entry_list, 'that.entry_list')
            if (that.entry_list.length != 0) that.initStudentVideo(that.entry_list, 'next');
            that.destroySingleEntry("next");

        },
        destroySingleEntry(action) {
            let removeList = [], pinupList = [];
            this.entryInfo.filter(item => { !item.pinup ? removeList.push(item) : pinupList.push(item); });

            if (action == 'next') {
                // 合并[钉住的考生] 和 [删除没有钉住的考生第一个]
                removeList.splice(0,1);
            } else if (action == 'prev') {
                removeList.pop();
            }
            this.entryInfo = pinupList.concat(removeList);
        },
        // 切换log
        togglesEventBlock(item, toggles) {
            toggles == 'one' ? item.eagle_eye = true : item.eagle_eye = false;
        },
        // 获取查询考生数据
        search_entry() {
            console.log(this.searchData, 'searchData')
            if (this.searchData != "") {
                searchSingleEntry({ data: this.searchData }).then(res => {
                    console.log(res, 'search--res')
                    if (res.code == 200) {
                        this.search_entry_data = res.data;
                        this.search_entry_data.openSound = false;
                        this.search_entry_data.openMessageModal = false;
                        this.search_entry_data.openScreenshotModal = false;
                        console.log(this.search_entry_data, 'this.search_entry_data')
                    } else {
                        this.monitorError = true,
                        this.monitorErrorTip = "查询不到该考生！"
                    }
                })
            }
        },
        // 寻找每个页面最后一个考生在列表中的索引
        findEntryIndex(arr, ele) {
            for(let i=0, len = arr.length; i<len; i++){
                if(arr[i] == ele){ return i; }              
            }
        }
    }
}
</script>

<style scoped lang="scss">
@import './monitorwall.scss';
</style>