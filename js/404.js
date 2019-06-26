var code=location.pathname.substring(1);
if(parseInt(code)&&code.length==4){
	if(/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
		location.href="/?code="+code;
	}else{
		localStorage.setItem("code",code);
		location.href="/";
	}
}else{
	location.href="/";
}
