console.log("加载微博阅读量助手...");
var storage = window.localStorage;
var url = window.location.href;
var total_page = 1;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
		switch(request.opt){
			//群发消息 提升阅读量
	        case 1:add_reading();break;
	        //管理群组
	        case 2:	var groups = [];
	        var total_str = $(".page.S_txt1").eq(-2).text().trim();
	       	total_page = parseInt(total_str);
	        manage_groups(groups);
	        break;
	        default:break;
	        }
});

function add_reading(){
	var url = window.location.href;
	var reg = new RegExp("https://weibo.com/[0-9]+/[a-zA-Z0-9]+");
	var bad_reg1 = new RegExp("https://weibo.com/[0-9]+/profile");
	if (reg.test(url) && !bad_reg1.test(url)){
		send_group_msg(reg.exec(url))
	}else{
		alert("请在微博详情页面使用此功能!")
	}
}

/**
 * 判断是否存在目标群组数据
 * 		有则发送私信
 * 		无则跳转至私信界面
 * @param  {[type]} wb_url [description]
 * @return {[type]}        [description]
 */
function send_group_msg(wb_url){
	 var storage = window.localStorage;
	 var groups = storage.getItem("wb_groups");
	 console.log(groups);
	 if(groups == null){
	 		console.log("尚未添加发送的目标群组，跳转至私信界面添加！");
	 		window.location.href='https://weibo.com/messages?topnav=1&wvr=6';
	 }else{
	 		console.log("开始发送群组消息");
			var groups = storage.getItem("wb_groups");
			var array = JSON.parse(groups);
			var delay = 0;
			for(var i = 0 ; i < array.length; i++){ 
				delay+=2000;
				post_msg_request(wb_url,array[i].gid,delay,array[i].gname);
			}
	 }
}

/**
 * 发送私信请求
 */
function post_msg_request(text,gid,delay,gname){
		setTimeout(function(){
				$.ajax({
						type: 'POST',
						data:{
							text:text.toString(),
							gid:gid,
							location: 'msgdialog',
							module:'msgissue',
							type:2,
							style_id:1
						},
						url:"https://weibo.com/aj/message/groupchatadd?_wv=5&ajwvr=6&__rnd="+Date.now(),
						success:function(result){
				        	//console.log("已发送至群组："+gid+" "+Date.now());
				        	chrome.runtime.sendMessage({"opt":1,"value":gname}, function(response) {});
				    	}
					});
				},delay);
}

function manage_groups(groups){
	var reg = new RegExp("https://weibo.com/messages");
	var url = window.location.href;
	//在私信界面打开，则重新检索所有群组
	if(reg.test(url)){
		var current_page_str = $(".page.S_txt1.S_bg1").text().trim();
		var current_page =  parseInt(current_page_str);
		console.log("当前页码:"+current_page_str+" 总页码:"+total_page)
		$('#wbyx-loading').show();
		$('#group_box').hide();
    	$('#save').hide();
		showLoading("正在提取群组数据");
		$("#g_progress").val(current_page/total_page);
		setTimeout(function(){
				groups = get_groups(groups);
						var next_page = $(".page.next");
						var end_page = $(".page_dis.page.next");
						//未到最后一页 翻页
						if(end_page == null || end_page.length == 0){
							  var next_page = $(".page.next");
							  if(next_page != null)$(next_page).attr("id","next_page");
							  document.getElementById("next_page").click();
							  manage_groups(groups);
						}else{
							console.log("到最后一页,翻页结束...");
							hideLoading();
							$("#group_list").html("");
							for(var group of groups){  
					              $("#group_list").prepend("<p><input type='checkbox'  id='"+group.gid+"' checked='checked' name='t_group' gname='"+group.gname+"' value='"+group.gid+"' />"+group.gname+"</p>");

					        } 
					        storage.setItem("wb_groups_all",JSON.stringify(groups));
					        $('#group_box').show();
    						$('#save').show();
							return;
						}
		},2800);
	}
	//非私信界面
	else{
		$("#group_list").html("");
		var all_groups = storage.getItem("wb_groups_all");
		var all_groups_obj = JSON.parse(all_groups);
		if(all_groups_obj == null || all_groups_obj.length == 0){
			alert("没有群组信息，请先到私信界面检索添加！")
			window.location.href='https://weibo.com/messages?topnav=1&wvr=6';
			return;
		}
		for(var group_obj of all_groups_obj){  
				 $("#group_list").prepend("<p><input type='checkbox' id='"+group_obj.gid+"' name='t_group' gname='"+group_obj.gname+"' value='"+group_obj.gid+"' />"+group_obj.gname+"</p>");
		} 
		var selected_groups = storage.getItem("wb_groups");
		var selected_groups_obj = JSON.parse(selected_groups);
		for(var obj of selected_groups_obj){  
				 $("#"+obj.gid).attr("checked","checked");
		} 
		$('#group_box').show();
    	$('#save').show();
    	$('#wbyx-loading').show();
	}
}

// var script=document.createElement("script");
// script.type="text/javascript";
// script.src="https://code.jquery.com/jquery-3.2.1.min.js";
// document.getElementsByTagName('head')[0].appendChild(script);
function get_groups(groups){
	var list = $(".private_list");
	for(var i = 0; i < list.length ;i++){
		var gid = list.eq(i).attr("gid");
		if(gid != undefined){
			var gname = list.eq(i).find('.name').children('a').text();
			var group = {"gid":gid,"gname":gname};
			groups.push(group);
		}
	}
	return groups;
}

var showLoading = function(message) {
    var $loading = $('#loading');
    if ($loading.length == 0) {
        $loading = $('<div id="loading"><div class="modal"></div><div class="wbyx-message"></div><div class="progress_box"><progress id="g_progress" value="0" max="1"></progress><div><ul class="bokeh"><li></li><li></li><li></li><li></li></ul></div>');
        $('body').append($loading);
    }
    $loading.show();

    $('.wbyx-message', $loading).html(message);
};

var hideLoading = function() {
    $('#loading').hide();
};

$(function() {
  $('body').append(
    $(
      `<div id="wbyx-loading">
      <div class="wbyx-overlayer"><div id="group_box"><h1 class="wbyx_title">微博阅读量助手 群组管理</h1><div id="group_list"></div><div id="save" class="save_div">保存</div></div></div>
    </div>`
    ).hide()
  )


var button = document.getElementById("save");
button.addEventListener("click", function() {
	var save_groups = [];
	$("input[name='t_group']:checked").each(function(j) {  
		var group = {"gid":$(this).val(),"gname":$(this).attr('gname')};
			save_groups.push(group);
    });
    storage.setItem("wb_groups",JSON.stringify(save_groups));
    console.log("保存成功目标群组成功"+JSON.stringify(save_groups));
    $('#wbyx-loading').hide();
    $('#group_box').hide();
    $('#save').hide();
}, false);
})
