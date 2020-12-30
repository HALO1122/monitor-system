<template>
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">{{modalName}}</div>
            <div class="modal-body clearfix">
                <input id="d_id" type="hidden"/>
                <p id="d_content" class="txt-14px"></p>
            </div>
            <div class="modal-footer footer-default">
                <button type="button" class="btn btn-primary" id="end_exam">{{confirmText}}</button>
                <button type="button" class="btn btn-primary btn-gray" id="cancel_end_exam" >{{cancelText}}</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>
    .modal-dialog{
        border-radius: 5px;
        border-top: 4px solid #0195ff;
    }
    .modal-sm{
        width: 400px;
    }
    .modal-sm .modal-body{
        min-height: 80px;
    }
    .modal-content{
        -webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, 0);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0);
        border-color: transparent;
        border-radius: 4px;
    }
    .modal-header{
        font-weight: bold;
        font-size: 16px;
    }
    .modal-body{
        padding: 5px 20px;
    }
    .modal-footer {
        padding: 15px 15px 15px;
        margin: 0 20px 30px;
        border-bottom: 1px solid #e5e5e5;
        border-right: 1px solid #e5e5e5;
        border-top:none;
    }
</style>