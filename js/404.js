if(/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
	alert("请在浏览器中打开此页面。");
}else{
	var code=location.pathname.substr(1);
	if(parseInt(code)&&code.length==4){
		localStorage.setItem("code",code);
	}
	location.href="/";
}
