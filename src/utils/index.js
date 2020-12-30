var videoSource, // 视频设备id
    audioSource; // 音频设备id


export function getStream() {
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const videoSelect = document.querySelector('select#videoSource');
        const audioSelect = document.querySelector('select#audioSource');
        const videoElement = document.querySelector('#camera_view');
        stopTrack(videoElement.srcObject);
        videoSource = videoSelect.value;
        audioSource = audioSelect.value;
        console.log('videoSource: ' + videoSource);
        console.log('audioSource: ' + audioSource);

        const constraints = {
            video: {
                deviceId: videoSource ? {exact: videoSource} : undefined,
                width: {min: 320, ideal: 320, max: 640},
                height: {min: 240, ideal: 240, max: 480}
            },
            audio: {
                deviceId: audioSource ? {exact: audioSource} : undefined,
                sampleRate: 11025,
                sampleSize: 8,
                channelCount: 1,
                volume: 1.0
            }
        };
        return navigator.mediaDevices.getUserMedia(constraints)
        .then( gotStream.bind(this) )
        .catch((err) => {
            console.log(err)
        })
    }
}

export function getDevices() {
    const deviceInfos = navigator.mediaDevices.enumerateDevices();
    return deviceInfos;
}

// 获取浏览器媒体设备信息
export function gotDevices(deviceInfos) {
    console.log(deviceInfos, 'deviceInfos')
    let videoSelect = document.querySelector('select#videoSource'),
        audioSelect = document.querySelector('select#audioSource');

    for (let deviceInfo of deviceInfos) {
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        } else if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || ` ${audioSelect.length + 1}`;
            audioSelect.appendChild(option);
        }
    }
}

export function gotStream(stream) {
    console.log('stream:', stream)
    const videoElement = document.querySelector('#camera_view');
    if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.muted = true;
    }
}

// 断开视频流
export function stopTrack(stream) {
    if (stream) {
      if (stream.getTracks().length) {
        for (let track of stream.getTracks()) {
          track.stop();
        }
      }
    }
}