var chs=/zh-cn|zh-hans|zh-hans-cn/i.test(navigator.language);
var zh=navigator.language.indexOf("zh")!=-1;
function encodeData(data){
	var array=[];
	for(var key in data){
		if(data[key]){
			array.push(key+"="+encodeURIComponent(data[key]));
		}
	}
	return array.join("&");
}
function multilang(json){
	if(chs){
		return json["zh-CN"];
	}else if(zh){
		return json["zh-TW"];
	}else{
		return json["en-US"];
	}
}
if(!zh){
	document.getElementsByTagName("html")[0].lang="en-US";
}else if(!chs){
	document.getElementsByTagName("html")[0].lang="zh-TW";
}
