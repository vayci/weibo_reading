var storage = window.localStorage;
$('#open_wb').on('click',function(){
  chrome.tabs.create({"url":"https://weibo.com"}, function(){});
});
