inputEmail.onkeydown=function(event){
	if(event.keyCode==13&&this.value){
		inputPsw.focus();
	}
};
inputPsw.onkeydown=function(event){
	if(event.keyCode==13){
		btnLogin.click();
	}
};
btnLogin.onclick=function(){
	if(inputEmail.value&&inputPsw.value){
		var email=inputEmail.value.toLowerCase();
		var password=MD5(inputPsw.value);
		btnLogin.disabled=true;
		fetch("https://api.rthe.cn/backend/userdata/verify?"+encodeData({
			"email":email,
			"password":password,
			"referrer":document.referrer
		})).then(function(response){
			btnLogin.disabled=false;
			if(response.ok||response.status==200){
				return response.json();
			}else{
				error(response);
			}
		}).then(function(data){
			if(data){
				if(data.alert){
					alert(data.alert);
				}else if(data.index){
					if(data.token){
						localStorage.setItem("Email",data.email);
						localStorage.setItem("Token",data.token);
						localStorage.setItem("Username",data.username);
						if(self!=top&&(!document.referrer||/^https:\/\/airportal\.cn/.test(document.referrer))){
							parent.postMessage(btoa(JSON.stringify({
								"email":data.email,
								"token":data.token,
								"username":data.username
							})),"*");
						}else{
							location.href="/";
						}
					}else if(confirm(multilang({
						"en-US":"Incorrect password. Do you want to reset the password?",
						"zh-CN":"密码错误。您想重置密码吗？",
						"zh-TW":"密碼錯誤。您想重設密碼嗎？"
					}))){
						location.href="login.html?"+encodeData({
							"email":email,
							"page":"resetpassword"
						});
					}
				}else{
					alert(multilang({
						"en-US":"This user does not exist.",
						"zh-CN":"此用户不存在。",
						"zh-TW":"此用戶不存在。"
					}));
				}
			}
		});
	}
};
if(!zh){
	loginTip.innerText="Log in to AirPortal with Your RTH Account";
	signUp.innerText="Sign Up";
	inputEmail.placeholder="Email";
	inputPsw.placeholder="Password";
	btnLogin.innerText="Login";
}else if(!chs){
	loginTip.innerText="使用熱鐵盒賬號來登入到 AirPortal";
	signUp.innerText="註冊";
	inputEmail.placeholder="郵箱";
	inputPsw.placeholder="密碼";
	btnLogin.innerText="登入";
}
