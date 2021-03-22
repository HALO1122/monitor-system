export function SoundMeter(context) {
    this.context = context;
    this.instant = 0.0;
    this.slow = 0.0;
    this.clip = 0.0;
    this.script = context.createScriptProcessor(2048, 1, 1);
    this.mic =null;
    const that = this;
    this.script.onaudioprocess = function (event) {
        const input = event.inputBuffer.getChannelData(0);
        let i;
        let sum = 0.0;
        let clipcount = 0;
        for (i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
            if (Math.abs(input[i]) > 0.99) {
                clipcount += 1;
            }
        }
        that.instant = Math.sqrt(sum / input.length);
        that.slow = 0.95 * that.slow + 0.05 * that.instant;
        that.clip = clipcount / input.length;
    };

    this.connectToSource = function (stream, callback) {
        try {
            this.mic = context.createMediaStreamSource(stream);
            console.log(this.mic, 'mic')
            this.mic.connect(this.script);
            this.script.connect(context.destination);
            console.log(this.script, 'script')
            if (typeof callback !== 'undefined') {
                callback(null);
            }
        } catch (e) {
            if (typeof callback !== 'undefined') {
                callback(e);
            }
        }
    };

    this.stop = function () {
        this.mic.disconnect();
        this.script.disconnect();
    };
}
  
  