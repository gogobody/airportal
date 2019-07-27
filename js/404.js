var code=parseInt(location.pathname.substring(1));
if(code>=1000&&code<=999999){
	if(/(MicroMessenger|QQ)\//i.test(navigator.userAgent)){
		location.href="/?code="+code;
	}else{
		localStorage.setItem("code",code);
		location.href="/";
	}
}else{
	location.href="/";
}
