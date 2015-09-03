$(function() {



    // todo: delete after you do "link page" fuature
    var ajax_req = new ajaxReq();
    ajax_req.ajaxContent('/ajax/news.php');


    commons();
    ajaxEvent();
    updateStatData();
});

function commons() {

    $('body').on("click", ".downloadClient", function(e){
        e.preventDefault();
        window.open(var_rm_client_download);
    });
    
    $('body').on("click", ".liveView", function(e){
        e.preventDefault();
        window.location.href = '/?l=true';
    });
}

function updateStatData() {
    
        var ajax_req = new ajaxReq();
        ajax_req.manReq({
            form_act : '/ajax/stats.php',
            type_data : 'HTML',
            callback_func: function (msg, done) {

                var sr  = $('#sr');
    			var snr = $('#snr');
    			var ncn = $('#ncn');
    			var ftw = $('#ftw');

                if (done) {
                    msg = $.parseXML(msg);
                    $msg = $(msg);

                    var cpuUsage = ($msg.find('cpu-usage').text() || 0);
                    var memInUse = ($msg.find('memory-inuse').text() || 0);
                    var memTotal = ($msg.find('memory-total').text() || 0);
                    var memPertg = ($msg.find('memory-used-percentage').text() || 0);
                    var serverUp = ($msg.find('server-uptime').text() || 0);
                    var serverRn = ($msg.find('bc-server-running').text() || 0);

                    if (serverRn != 'up'){
                        sr.hide();
                        snr.show();
                    } else {
                        snr.hide();
                        sr.show();
                    }
                    ncn.hide();
                    $('#server-stats').show();
                    updateStatBar('stat-cpu', cpuUsage);
                    updateStatBar('stat-mem', memPertg);
                    $('#stat-meminfo').html(Math.round(memInUse/1024) + "MB / " + Math.round(memTotal/1024)+ "MB");
                    $('#server-uptime').html(serverUp);

                } else {
                    ncn.show();
                    sr.hide();
                    snr.hide();
                }
            }
        }); 
        setTimeout("updateStatData();", 2000);
}

updateStatBar = function(barId, val, y, r){
	var yb = (y || 50);
	var rb = (r || 80);
	var el = $('#'+barId);
    var progress_bar = el.find('.progress-bar');

    //alert(val_calc);
    
	progress_bar.css('width', val+'%');
    progress_bar.attr('aria-valuenow', val);

    var pBarColor = 'progress-bar-success';
    if (val >= yb && val < rb){ pBarColor = 'progress-bar-warning'; }
    else if (val >= rb) { pBarColor = 'progress-bar-danger'; }

    progress_bar.removeClass('progress-bar-success');
    progress_bar.removeClass('progress-bar-warning');
    progress_bar.removeClass('progress-bar-danger');

    progress_bar.addClass(pBarColor);
    //el.css('background-image', 'url("/img/pbar-'+pBarColor+'.png")');

    el.find('span').html(val+'%');
}

function delTr(form) {
    form.closest('tr').remove();
}

var ajaxReq = function () {
    var self = this;
    var send_but = null;
    var form = null;
    var form_act = null;
    var form_data = null;
    var alert_bl = null;
    var data_send = null;
    var error_ajax = null;
    var process_data = false;
    var content_type = false;
    var redir = false;
    var ajax_content = false;
    var type_req = "POST";
    var type_data = "JSON";
    var callback_func = null;
    var func_after = null;
    var redirect_after = null;


    var send = function () {
        if (form !== null) form_data =  new FormData(form[0]);

        if (alert_bl !== null) {
            alert_bl.hide();
        }
        
        //$.ajax({
            //type: "POST",
            //url: form_act,
            ////data: form.serialize(),
            //data: form_data,
            //processData: false,
            //contentType: false,
            //dataType: "JSON",
            //xhrFields: {
                //// add listener to XMLHTTPRequest object directly for progress (jquery doesn't have this yet)
                //onprogress: function(progress) {
                //}
            //},            
            //success: function(msg){
                //respProc(msg);
            //},
            //error: function (msg) {
                //if (error_ajax) alert('err ajax');
                ////alert('err ajax');
            //},
            //timeout: function (msg) {
                ////if (error_ajax) alert('err ajax');
                //alert('timeout');
            //},
            //beforeSend: function() {
                //send_but.trigger("start.search");
            //},
            //complete: function() {
                //if (!redir) send_but.trigger("finish.search");
            //}            
      //});
        var hz = $.ajax({
                type: type_req,
                url: form_act,
                //data: { id : 'menuId' },
                //data: form.serialize(),
                data: form_data,
                processData: process_data,
                contentType: content_type,
                dataType: type_data,
                xhrFields: {
                    // add listener to XMLHTTPRequest object directly for progress (jquery doesn't have this yet)
                    onprogress: function(progress) {
                    }
                },            
                beforeSend: function() {
                    if (send_but !== null) {
                        if (ajax_content) send_but.trigger("start_content.search");
                        else send_but.trigger("start.search");
                    }
                }
            })
            .done(function(msg) {
                respProc(msg);
            })
            .fail(function(msg) {
                if (error_ajax) alert('err ajax');

                if ((callback_func !== null) && (typeof(callback_func === 'function'))) {
                    callback_func(msg, false);
                }
            }).always(function() {
                if (!redir && (send_but !== null)) {
                    if (ajax_content) send_but.trigger("finish_content.search");
                    else send_but.trigger("finish.search");
                }
            });
    };

    var respProc = function (msg) {

        if (ajax_content) {
            // todo: uncomment after you do "link page" fuature
            //window.history.pushState({},'', form_act);
            send_but.html(msg);
            return false;
        }

        if ((callback_func !== null) && (typeof(callback_func === 'function'))) {
            callback_func(msg, true);
            return false;
        }

        redir = false;


        if(parseInt(msg.status)==1) {
            redir = true;
            window.location.href = msg.msg;
        } else if (msg.status == 2) {
            alert_bl.html(msg.msg);
            alert_bl.show();
        } else if (msg.status == 3) {
            var func = msg.msg[0].name;
            window[func](form, msg.msg);
        } else if (msg.status == 4) {
            alert(msg.msg);
            //showModal(msg.msg.title, msg.msg.content);
        } else if (msg.status == 5) {
            redir = true;
            alert_bl.html(msg.msg.msg);
            alert_bl.show();
            window.location.href = msg.msg.url;
        } else if (msg.status == 6) {
            $.notify({
                icon: 'fa fa-warning fa-fw',
                message: msg.msg
            },{
                type: 'success',
                delay: 4000,
                animate: {
                    exit: 'animated fadeOut'
                }
            });
        } else if (msg.status == 7) {
            $.notify({
                icon: 'fa fa-times-circle fa-fw',
                message: msg.msg
            },{
                type: 'danger',
                delay: 4000,
                animate: {
                    exit: 'animated fadeOut'
                }
            });
        } else {
            if (form.find('.form-group-m').length) {
                var form_cl = 'form-group-m';
            } else {
                var form_cl = 'form-group';
            }

            $.each(msg.msg, function(i, val){
                form.find('.'+form_cl+'[data-name="'+val.name+'"]').addClass('has-error');
                if (val.error != '') {
                    //alert_bl.html(val.error);
                    //alert_bl.show();
                    form.find('[name="'+val.name+'"]').popover({content : val.error, placement: 'top', trigger: 'focus'});
                }
                        
            });  
            form.find('*').popover('show');
        }

        if (func_after) {
            window[func_after](form, msg);
        }

        if (redirect_after) {
            var ajax_req = new ajaxReq();
            ajax_req.ajaxContent(redirect_after);
        }
    };

    var delAlertClass = function() {
        alert_bl.removeClass();
        alert_bl.addClass('alert');
        alert_bl.addClass('alert-ajax');
    };

    var showPopover = function () {
        form.find('*').not($(this)).popover('hide');
        $(this).popover('show');
    };    

    var hidePopover = function () {
        form.find('*').popover('hide');
    };    

    var hideProperErr = function () {
        form.find('.add').val('');
        form.find('*').popover('destroy');
        form.find(".form-group").removeClass('has-error');
        form.find(".form-group-m").removeClass('has-error');
    };

    self.setData = function (el) {
        var act_sub = true;

        var conf_msg = el.data('confirm');
        if (conf_msg) {
            act_sub = confirm(conf_msg);
        }

        if (act_sub) {
            data_send = null;

            send_but = el;
            
            var form_id = el.data('form-id');
            if (form_id) {
                if (form_id == 'prev') form = el.prev('form');
                else form = $('#'+form_id);
            } else form = el.closest('form');
            
            form_act = form.attr('action');
            alert_bl = form.find('.alert');

            func_after = el.data('func-after') || null;

            redirect_after = el.data('redirect') || null;

            hideProperErr();

            var ajsend = el.data('ajsend');
            if (ajsend != 'off') mch_ajsend(el);

            var func_call = el.data('func');
            if (func_call) window[func_call](form);

            var error = el.data('error');
            if (error == 0) error_ajax = 0;
            else error_ajax = 1;

            //form.submit();
            send();
        }

        return false;
    };

    self.ajaxContent = function (el) {
        type_req = "GET";
        type_data = "HTML";
        process_data = undefined;
        content_type = undefined;
        form_data = { type : 'ajax_content' };
        //form_data = 'type=ajax_content';
        
        
        if (el.jquery) {
            
            form_act = el.data('url') || el.attr('href');
        } else {
            form_act = el;
        }

        send_but = $('#page-container');
        ajax_content = true;
        mch_ajsend(send_but);

        send();

        // close left menu for mobile devices
        var navbar = $('#navbar-collapse');
        if (navbar.hasClass('collapse')) $('.navbar-collapse').collapse('hide');

        return false;
    };

    self.manReq = function (data) {
        form_act = data.form_act || null;
        type_req = data.type_req || type_req;
        type_data = data.type_data || type_data;
        form_data = data.form_data || form_data;

        if ((data.process_data == true) || (data.process_data == undefined)) {
            process_data = data.process_data;
        } else process_data = process_data;

        if ((data.content_type == true) || (data.content_type == undefined)) {
            content_type = data.content_type;
        } else content_type = content_type;

        callback_func = data.callback_func || null;
        //if ((data.callback_func !== null) && (typeof(data.callback_func === 'function'))) {
            //callback_func = data.callback_func;
        //};
        send();
    };

    var constructor = function () {
    };
    constructor();
};
function ajaxEvent() {
    $('body').on("click", ".send-req-form", function(e){
        var ajax_req = new ajaxReq();
        return ajax_req.setData($(this)); 
    }); 

    $('body').on("click", ".ajax-content", function(e){
        e.preventDefault();
        var ajax_req = new ajaxReq();
        ajax_req.ajaxContent($(this));
    }); 

    $('body').on("click", ".click-event", function(e){
        e.preventDefault();
        var el = $(this);

        var func = $(this).data('function');
        if (func) {
            window[func](el);
        } else {
            var class_c = $(this).data('class');
            class_c = class_c.split('.');
            var class_tmp = '';

            $.each(class_c, function(i, val){
                if (i == 0) {
                    class_tmp = new window[val](el);
                } else {
                    var start_pos = val.indexOf('(') + 1;
                    var end_pos = val.indexOf(')',start_pos);
                    var args = val.substring(start_pos,end_pos);

                    val = val.substring(0, start_pos - 1);

                    if (args) {
                        args = args.split(',');
                        if (args.length == 1) {
                            class_tmp[val](args[0]);
                        } else {
                            class_tmp[val](args);
                        }
                    } else {
                        class_tmp[val]();
                    }
                }
            });
        }
    }); 
}

function mch_ajsend(el) {

    if (el.is('div')) {
        el.on("start_content.search", function() {
            el.addClass('page-container-loading');
        });
        el.on("finish_content.search", function() {
            el.removeClass('page-container-loading');
        });
    } else {
        el.on("start.search", function() {
            el.button('loading');
        });
        el.on("finish.search", function() {
            if (el.data('complete-text')) {
                el.button('complete');
            } else {
                el.button('reset');
            }
        });
    }
}
