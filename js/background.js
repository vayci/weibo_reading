var menu_1 = chrome.contextMenus.create({"title": "增加阅读","contexts":["all"],"onclick":add_reading});
var menu_2 = chrome.contextMenus.create({"title": "管理群组","contexts":["all"],"onclick":manage_group});

//群发消息 增加阅读量
function add_reading(info, tab) {  
	 sendMessageToContentScript({"opt":1},function(){});
}   
//管理目标群组
function manage_group(info, tab) {  
	 sendMessageToContentScript({"opt":2},function(){});
}   

//向content_script发送消息
function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            var tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, message, function(response) {
                callback(response);
            });
        });
    
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        switch(request.opt){
            case 1:show_notice(request.value);break;
            break;
            default:break;
            }
});

function show_notice(gname){
        chrome.notifications.create(gname, {
            type: 'basic',
            iconUrl: 'img/icon.png',
            title: gname,
            message: '微博成功分享至群组'
        });
        setTimeout(function(){
                chrome.notifications.clear(gname, function(){})
        },2000);
}