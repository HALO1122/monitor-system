<template>
    <div>
        <li lass="room-video-li">
            <span class="video-loading-wrap"></span>
            <div class="video-entry-content">
                <p class="video-tag-tip">
                    <i class="ez-icon-font icon-monitor">&#xe73e;</i><span class="icon-monitor">运行中</span>
                    <i v-show="search_entry_data[0].openSound" class="ez-icon-font txt-24px icon-yuyin">&#xe80e;</i>
                </p>
                <p class="tag-abnormal" v-show="search_entry_data[0].monitor_photo_count">{{ $t('monitor.abnormal') }}</p>
                <img class="entry-picture mb5" v-show="!search_entry_data[0].isVideo" ref="entry_img" :src="search_entry_data[0].photo_url">
                <video :id="search_entry_data[0].permit" v-show="search_entry_data[0].isVideo" ref="entry_video" muted autoplay playsinline></video>
            </div>
            <p class="icon-event-content">
                <i class="ez-icon-font txt-18px" @click="pingVideo(search_entry_data[0])">&#xe804;</i>
                <i v-if="search_entry_data[0].audio_monitor" @click="controlSound(search_entry_data[0], $event)" class="ez-icon-font txt-18px" v-html="sound"></i>
                <i v-if="openVideo" @click="openVideo(search_entry_data[0])" class="ez-icon-font txt-18px">&#xe66c;</i>
                <i class="ez-icon-font txt-18px" @click="sendMessage(search_entry_data[0])">&#xe63b;</i>
                <i class="ez-icon-font txt-18px" @click="screenshotCut(search_entry_data[0])">&#xe807;</i>
            </p>
            <div class="entry-event-block" v-if="!search_entry_data[0].eagle_eye">
                <p class="double-video" v-if="doubleVideo" @click="togglesEventBlock(search_entry_data[0], 'one')"></p>
                <!-- <entry-log :entryLog="search_entry_data[0]" ref="_entryLog"></entry-log> -->
            </div>
            <div class="eagle-event-block" v-if="search_entry_data[0].eagle_eye">
                <p class="single-video" @click="togglesEventBlock(search_entry_data[0], 'two')"></p>
                <!-- <eagle-log :eagleLog="search_entry_data[0]" ref="_eagleLog"></eagle-log> -->
            </div>
            <div class="entry-information">
                <p><span>{{search_entry_data[0].permit}} | {{search_entry_data[0].full_name}}</span>
                    <span class="icon-num">
                        <span><i class="ez-icon-font">&#xe81f;</i>{{search_entry_data[0].machine_photo_count}}</span>
                        <span><i class="ez-icon-font">&#xe807;</i>{{search_entry_data[0].error_screen_photo_count}}</span>
                    </span></p>
                <p class="exam">
                    <span class="exam-answer">{{ $t('monitor.time_spent') }}{{search_entry_data[0].time_spent}}</span>
                    <span class="exam-complete">{{ $t('monitor.answered') }}{{search_entry_data[0].answered_num}} / {{search_entry_data[0].item_num}}{{ $t('monitor.question') }}</span>
                </p>
            </div>
        </li>
    </div>
</template>

<script>
export default {
    data() {
        return{

        }
    },
    props: {
        search_entry_data: {
            type: Array,
            dafault: []
        },
    }
}
</script>

<style scoped lang="scss">
    .room-video-li { 
        position: relative; 
        width: 420px;
        margin: 0px 8px;
        .video-entry-content{
            height: 315px;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            background-color: #3D3C41;
            width: 100%;
            img {width: 100%;}
            video{
                width: 100%;
                height: 315px;
                border-top-left-radius: 16px;
                border-top-right-radius: 16px;
            }
            .video-tag-tip{
                position: absolute;
                left: 12px;
                top: 10px;
                i{ margin: 0px 6px; }
                .icon-monitor{ color: #FF5252 !important; }
                .icon-dingzhu { color: #4D84FF; }
                .icon-yuyin { color: #00CF71; }
            }
            .tag-abnormal{
                background: #BF1E1E;
                border-radius: 15px;
                padding: 2px 8px;
                font-size: 12px;
                position: absolute;
                top: 10px;
                right: 12px;
            }
        }
        .icon-event-content{
            background-color: #4C4E52;
            margin: 0px;
            padding: 8px 5px;
            text-align: left;
            i{ margin: 0px 6px; }
        }
        @mixin toggle-video{
            cursor: pointer;
            position: absolute;
            top: 180px;
            width: 0;
            height: 0;
            z-index: 99;
        }
        @mixin icon-spot{
            height: 96px;
            padding: 0px 30px;
            background: url(../../assets/images/icon-spot.png) 0 2px no-repeat;
            background-position: 12px 5px;
        }
        .entry-event-block{
            height: 350px;
            overflow-y: auto;
            background-color: #3D3C41;
            position: relative;
            .double-video{
                @include toggle-video;
                border-top: 8px solid transparent;
                border-bottom: 8px solid transparent;
                border-left: 8px solid #fff;
            }

        }
        .eagle-event-block{
            position: relative;
            background-color: #3D3C41;
            .single-video{
                right: 150px;
                @include toggle-video;
                border-top: 8px solid transparent;
                border-bottom: 8px solid transparent;
                border-right: 8px solid #fff;
            }
        }
        .entry-information{
            padding: 1px 12px;
            background-color: #3D3C41;
            margin-top: 2px;
            p{
                display: flex;
                justify-content: space-between;
                margin: 10px 0px;
            }
            .icon-num span{
                color: #889497;
                margin: 0px 5px;
            }
        }
    }
</style>