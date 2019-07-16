var appName="AirPortal";
var version="19w29b1";
var consoleInfoStyle="color:rgb(65,145,245);font-family:Helvetica,sans-serif;";
console.info("%c%s 由 毛若昕 和 杨尚臻 联合开发",consoleInfoStyle,appName);
console.info("%c版本: %s",consoleInfoStyle,version);

var $_GET=(function(){
	var json={};
	if(location.search){
		var parameters=location.search.replace("?","").split("&");
		for(var i=0;i<parameters.length;i++){
			var split=parameters[i].split("=");
			json[split[0]]=decodeURIComponent(split[1]);
		}
	}
	return json;
})();
var chunk,currentExpTime,fileBackend,fileCount,fileDone,option,randomKey,signature,uploadCode;
var chunkSize=100*1048576;
var firstRun=JSON.parse(localStorage.getItem("firstRun"));
var invalidAttempt=0;
var isiOS=/iPhone|iPad/i.test(navigator.userAgent);
var isTencent=/(MicroMessenger|QQ)\//i.test(navigator.userAgent);
var login={
	"email":localStorage.getItem("Email"),
	"token":localStorage.getItem("Token"),
	"username":localStorage.getItem("Username")
};
var newScript=document.createElement("script");
var orderSubmitted=localStorage.getItem("orderSubmitted");
var settings={};
var title=document.title;
var tmpCode=localStorage.getItem("code");
if(!firstRun||firstRun[version]==undefined){
	firstRun={};
}
if(firstRun[version]!=false){
	firstRun[version]=false;
	localStorage.setItem("firstRun",JSON.stringify(firstRun));
	firstRun=true;
}
function btnPay0State(){
	if(document.getElementsByClassName("selected").length==2){
		btnPay0.style.pointerEvents="auto";
		btnPay0.style.opacity="1";
	}else{
		btnPay0.style.pointerEvents="none";
		btnPay0.style.opacity="0.5";
	}
}
function clearNotification(){
	var notificationBar=document.getElementsByClassName("notificationBar");
	if(notificationBar.length>0){
		for(var i=0;i<notificationBar.length;i++){
			notificationBar[i].parentElement.removeChild(notificationBar[i]);
		}
	}
}
function closePopup(elementId,animation){
	if(id(elementId)){
		switch(animation){
			case "slideOut":
			id(elementId).parentElement.childNodes[id(elementId).parentElement.childElementCount-2].style.left="0px";
			id(elementId).style.left="";
			break;
			default:
			id(elementId).style.opacity="";
			if(document.getElementsByClassName("popUp").length<=1){
				mainBox.style.opacity="";
			}
			break;
		}
		setTimeout(function(){
			id(elementId).style.display="none";
			id(elementId).parentElement.removeChild(id(elementId));
		},250);
	}
}
function downloadFile(fileInfo){
	if(fileInfo.download.length>1){
		showPopup([
			'<p id="prefetching" class="p1" style="padding-top: 20px;"></p>',
			'<p class="p3" id="lblDownloadP1" style="padding-top: 30px;"></p>',
			'<span class="progressBar" id="progressBarBg1"></span>',
			'<span class="progressBar" id="progressBar1"></span>',
			'<p class="p3" id="lblDownloadP2" style="padding-top: 30px;"></p>',
			'<span class="progressBar" id="progressBarBg2"></span>',
			'<span class="progressBar" id="progressBar2"></span>',
			'<div class="dlTipBox">',
				'<p id="dlTip0"></p>',
				'<p id="dlTip1"></p>',
			'</div>'
		],"recvBox2","popRecv","slideInFromRight");
		id("prefetching").innerText=multilang({
			"en-US":"Prefetching files from the server",
			"zh-CN":"正在从服务器预读取文件",
			"zh-TW":"正在從伺服器預讀取檔案"
		});
		id("lblDownloadP1").innerText=multilang({
			"en-US":"Downloading File Slices",
			"zh-CN":"下载文件碎片中",
			"zh-TW":"下載檔案碎片中"
		});
		id("lblDownloadP2").innerText=multilang({
			"en-US":"Total Progress",
			"zh-CN":"总下载进度",
			"zh-TW":"總下載進度"
		});
		id("dlTip0").innerText=multilang({
			"en-US":"If the download fails, please try again with Chrome or Firefox",
			"zh-CN":"如无法下载，请使用Chrome或Firefox浏览器重试",
			"zh-TW":"如無法下載，請使用Chrome或Firefox瀏覽器重試"
		});
		id("dlTip1").innerText=multilang({
			"en-US":"Once the fetching is complete, the file will be saved to your device immediately",
			"zh-CN":"读取完成后，文件会立即被保存到您的设备上",
			"zh-TW":"讀取完成后，檔案會立即被保存到您的裝置上"
		});
		var intervalId=setInterval(function(){
			if(id("dlTip0").style.marginTop=="0px"){
				id("dlTip0").style.marginTop="-20px";
				id("dlTip1").style.marginTop="-10px";
			}else{
				id("dlTip0").style.marginTop="0px";
				id("dlTip1").style.marginTop="0px";
			}
		},5000);
		var slice=[];
		var downloadSlice=function(progress){
			var xhr=new XMLHttpRequest();
			xhr.responseType="arraybuffer";
			xhr.onload=function(){
				if(xhr.status==200){
					slice.push(xhr.response);
					if(progress>=fileInfo.download.length){
						var newA=document.createElement("a");
						var url=URL.createObjectURL(new Blob(slice,{
							"type":fileInfo.type
						}));
						newA.href=url;
						newA.download=decodeURIComponent(fileInfo.name);
						newA.style.display="none";
						document.body.appendChild(newA);
						newA.click();
						document.title=title;
						clearInterval(intervalId);
						closePopup("popRecv");
					}else{
						progress++;
						downloadSlice(progress);
					}
				}else if(xhr.status==404){
					notify(multilang({
						"en-US":"The file is incomplete. Please upload it again.",
						"zh-CN":"文件损坏。请重新上传。",
						"zh-TW":"檔案損壞。請重新上傳。"
					}));
					document.title=title;
					clearInterval(intervalId);
					closePopup("popRecv");
				}else{
					error(xhr);
					document.title=title;
					clearInterval(intervalId);
					closePopup("popRecv");
				}
			}
			xhr.onprogress=function(e){
				if(e.lengthComputable){
					var percentage=Math.round(e.loaded/e.total*100);
					document.title="["+progress+"/"+fileInfo.download.length+": "+percentage+"%] "+title;
					progressBar1.style.width=percentage+"px";
					id("lblDownloadP1").innerText=multilang({
						"en-US":"Downloading File Slices ",
						"zh-CN":"下载文件碎片中 ",
						"zh-TW":"下載檔案碎片中 "
					})+percentage+"%";
					progressBar2.style.width=Math.round(progress/fileInfo.download.length*100)+"px";
					id("lblDownloadP2").innerText=multilang({
						"en-US":"Total Progress ",
						"zh-CN":"总下载进度 ",
						"zh-TW":"總下載進度 "
					})+progress+"/"+fileInfo.download.length;
				}
			}
			xhr.open("GET",fileInfo.download[progress-1],true);
			xhr.send();
		}
		downloadSlice(1);
	}else{
		location.href=fileInfo.download[0];
	}
}
function error(e){
	clearNotification();
	var text=multilang({
		"en-US":"Unable to connect to the server",
		"zh-CN":"无法连接至服务器",
		"zh-TW":"無法連接至伺服器"
	});
	if(e){
		text+=multilang({
			"en-US":": ",
			"zh-CN":"：",
			"zh-TW":"："
		})+e.status;
	}else{
		text+=multilang({
			"en-US":".",
			"zh-CN":"。",
			"zh-TW":"。"
		});
	}
	notify(text);
}
function getInfo(code,password){
	if(code){
		notify(multilang({
			"en-US":"Loading...",
			"zh-CN":"正在加载……",
			"zh-TW":"正在加載……"
		}),false);
		id("btnSub").disabled=true;
		invalidAttempt++;
		fetch("https://api.rthe.cn/backend/airportal/getinfo?"+encodeData({
			"code":code,
			"password":password,
			"username":login.username
		})).then(function(response){
			clearNotification();
			id("btnSub").disabled=false;
			if(response.ok||response.status==200){
				return response.text();
			}else{
				invalidAttempt--;
				error(response);
			}
		}).then(function(data){
			if(data===""){
				id("inputCode").value="";
				notify(multilang({
					"en-US":"The file does not exist.",
					"zh-CN":"文件不存在。",
					"zh-TW":"檔案不存在。"
				}));
			}else if(data){
				invalidAttempt--;
				data=JSON.parse(data);
				if(data.error){
					switch(data.error){
						case "loginRequired":
						if(login.username){
							notify(multilang({
								"en-US":"You do not have permission to download this file.",
								"zh-CN":"您没有下载此文件的权限。",
								"zh-TW":"您沒有下載此檔案的權限。"
							}));
						}else{
							notify(multilang({
								"en-US":"Login is required for downloading this file.",
								"zh-CN":"需要登录才能下载此文件。",
								"zh-TW":"需要登入才能下載此檔案。"
							}));
							menuItemLogin.click();
						}
						break;
						case "passwordIncorrect":
						id("inputRecvPsw").value="";
						notify(multilang({
							"en-US":"Incorrect password.",
							"zh-CN":"密码错误。",
							"zh-TW":"密碼錯誤。"
						}));
						break;
						case "passwordRequired":
						showPopup([
							'<p id="enterPsw" class="p1" style="padding-top: 40px;"></p>',
							'<input id="inputRecvPsw" class="inputCode" autocomplete="off"><br>',
							'<button class="btn1" id="btnSubPsw"></button>',
							'<span class="btnBack" id="btnBackRecvPsw"></span>'
						],"recvPswBox","popRecv","slideInFromRight");
						id("enterPsw").innerText=multilang({
							"en-US":"Please enter the password",
							"zh-CN":"请输入密码",
							"zh-TW":"請輸入密碼"
						});
						id("inputRecvPsw").onkeydown=function(event){
							if(event.keyCode==13){
								id("btnSubPsw").click();
							}
						};
						id("btnSubPsw").innerText=multilang({
							"en-US":"OK",
							"zh-CN":"确定",
							"zh-TW":"確定"
						});
						id("btnSubPsw").onclick=function(){
							password=id("inputRecvPsw").value;
							if(password){
								getInfo(code,MD5(password));
							}
						};
						id("btnBackRecvPsw").onclick=function(){
							closePopup("recvPswBox","slideOut");
						};
						setTimeout(function(){
							id("inputRecvPsw").focus();
						},250);
						break;
						default:
						notify(multilang({
							"en-US":"Error: ",
							"zh-CN":"错误：",
							"zh-TW":"錯誤："
						})+data.error);
						break;
					}
				}else if(data.text){
					showPopup([
						'<p id="txtReceived" class="p1"></p>',
						'<div id="txtView" class="contentBox"></div>',
						'<button class="btn1" id="btnDone4"></button>'
					],"recvBox1","popRecv","slideInFromRight");
					id("txtReceived").innerText=multilang({
						"en-US":"Text Received",
						"zh-CN":"接收到文本",
						"zh-TW":"接收到文字"
					});
					id("txtView").innerText=decodeURIComponent(data.text);
					id("btnDone4").innerText=multilang({
						"en-US":"Close",
						"zh-CN":"关闭",
						"zh-TW":"關閉"
					});
					id("btnDone4").onclick=function(){
						closePopup("popRecv");
					};
				}else if(data.length===1){
					downloadFile(data[0]);
				}else{
					showPopup([
						'<p id="multiFilesReceived" class="p1" style="margin-top: -10px;"></p>',
						'<p id="multiFilesTip" style="margin-top: -10px;"></p>',
						'<div id="fileList" class="fileList"></div>',
						'<button class="btn1" id="btnDone1"></button>'
					],"recvBox1","popRecv","slideInFromRight");
					id("multiFilesReceived").innerText=multilang({
						"en-US":"Multiple files received",
						"zh-CN":"接收到多个文件",
						"zh-TW":"接收到多個檔案"
					});
					id("multiFilesTip").innerText=multilang({
						"en-US":"Click on the items in the list to download them separately",
						"zh-CN":"单击列表中的项目来分别下载它们",
						"zh-TW":"單擊列表中的項目來分別下載它們"
					});
					for(var file=0;file<data.length;file++){
						var newA=document.createElement("a");
						newA.classList.add("menu");
						newA.innerText=decodeURIComponent(data[file].name);
						if(data[file].download.length===1){
							newA.href=data[file].download[0];
						}else{
							newA.setAttribute("index",file+1);
							newA.onclick=function(){
								var index=this.getAttribute("index")-1;
								downloadFile(data[index]);
							};
						}
						id("fileList").appendChild(newA);
					}
					id("btnDone1").innerText=multilang({
						"en-US":"Close",
						"zh-CN":"关闭",
						"zh-TW":"關閉"
					});
					id("btnDone1").onclick=function(){
						closePopup("popRecv");
					};
				}
			}
		}).catch(function(){
			id("btnSub").disabled=false;
			invalidAttempt--;
			error();
		});
	}
}
function getPostData(data){
	var formData=new FormData();
	for(var key in data){
		if(data[key]){
			formData.append(key,data[key]);
		}
	}
	return{
		"method":"POST",
		"body":formData
	};
}
function getQRCode(content){
	return "https://api.rthe.cn/backend/get?"+encodeData({
		"url":"http://qr.topscan.com/api.php?text="+content,
		"username":login.username||"admin"
	});
}
function getRandCharacter(len){
	var str="";
	for(var i=0;i<len;i++){
		str+=unescape("%u"+(Math.round(Math.random()*20901)+19968).toString(16));
	}
	return str;
}
function getRandStr(len){
	len=len||32;
	var chars="ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
	var maxPos=chars.length;
	var pwd="";
	for(var i=0;i<len;i++){
		pwd+=chars.charAt(Math.floor(Math.random()*maxPos));
	}
	return pwd;
}
function hideMenu(){
	mask.style.display="none";
	menu.style.opacity="0";
	setTimeout(function(){
		menu.style.display="none";
	},250);
}
function id(elementId){
	return document.getElementById(elementId);
}
function loadExpTime(){
	if(orderSubmitted&&new Date().getTime()-orderSubmitted>86400000){
		orderSubmitted=null;
		localStorage.removeItem("orderSubmitted");
	}
	if(document.getElementById("privilegeStatus")){
		fetch("https://api.rthe.cn/backend/get?"+encodeData({
			"name":appName,
			"token":login.token,
			"url":"privilege",
			"username":login.username
		})).then(function(response){
			if(response.ok||response.status==200){
				return response.text();
			}
		}).then(function(data){
			var expTime=Math.round((data-new Date().getTime()/1000)/86400);
			if(data&&expTime>0){
				if(orderSubmitted){
					orderSubmitted=null;
					localStorage.removeItem("orderSubmitted");
				}
				currentExpTime=data*1;
				privilegeStatus.innerText=multilang({
					"en-US":"Premium Plan "+expTime+" Days Remaining",
					"zh-CN":"高级账号 剩余"+expTime+"天",
					"zh-TW":"高級賬號 剩餘"+expTime+"天"
				});
			}else{
				if(orderSubmitted){
					privilegeStatus.innerText=multilang({
						"en-US":"Waiting for order confirmation",
						"zh-CN":"等待订单确认 最长需要24个小时",
						"zh-TW":"等待訂單確認 最長需要24個小時"
					});
				}else{
					privilegeStatus.innerText=multilang({
						"en-US":"Premium Plan Not Activated",
						"zh-CN":"高级账号 未激活",
						"zh-TW":"高級賬號 未激活"
					});
				}
			}
		});
	}
}
function loadServerList(auto){
	fileBackend=window.servers[auto].host;
	Object.keys(window.servers).forEach(function(key){
		var newA=document.createElement("a");
		var newTick=document.createElement("span");
		var newName=document.createElement("span");
		newA.classList.add("menuItem");
		newA.id=key;
		newA.onclick=function(){
			if(!currentExpTime&&window.servers[this.id].premium){
				notify(multilang({
					"en-US":"This server is for premium account users only.",
					"zh-CN":"此服务器仅限高级账号用户使用。",
					"zh-TW":"此伺服器僅限高級賬號用戶使用。"
				}));
				if(!login.username){
					menuItemLogin.click();
				}
			}else{
				fileBackend=window.servers[this.id].host;
				var tick=document.getElementsByClassName("tick");
				for(var i=0;i<tick.length;i++){
					if(tick[i].parentElement==this){
						tick[i].style.opacity="1";
					}else{
						tick[i].style.opacity="0";
					}
				}
			}
			hideMenu();
		};
		newTick.classList.add("tick");
		if(key==auto){
			newTick.style.opacity="1";
		}
		newName.innerText=window.servers[key].name;
		newA.appendChild(newTick);
		newA.appendChild(newName);
		menuServers.appendChild(newA);
	});
}
function loggedIn(newLogin){
	if(newLogin){
		localStorage.setItem("Email",login.email);
		localStorage.setItem("Token",login.token);
		localStorage.setItem("Username",login.username);
		closePopup("popLogin");
		if(id("filesTip")){
			id("filesTip").innerText=login.email;
		}
	}
	menuItemLogin.innerText=multilang({
		"en-US":"Log Out",
		"zh-CN":"退出登录",
		"zh-TW":"登出"
	});
	var newItem=document.createElement("a");
	newItem.classList.add("menuItem");
	newItem.onclick=function(){
		var btnCloseId="btnClose"+new Date().getTime();
		showPopup([
			'<span class="btnClose" id="'+btnCloseId+'"></span>',
			'<p class="p1" id="lblUsername"></p>',
				'<span class="line"></span>',
			'<p class="p3" id="lblExpTime"></p>',
			'<div class="payPlans">',
				'<p class="p2">',
					'<span id="activatePremium"></span>',
					'<a class="link1" id="showPrivilege"></a>',
				'</p>',
				'<p class="p4">',
					'<span id="plans"></span>',
					'<span id="promotionText"></span>',
				'</p>',
				'<span class="payItem plan" id="payItem1M">',
					'<span id="price-one"></span>',
					'<p id="month1" class="p4"></p>',
				'</span>',
				'<span class="payItem plan" id="payItem3M">',
					'<span id="price-three"></span>',
					'<p id="month3" class="p4"></p>',
				'</span>',
				'<span class="payItem plan" id="payItem1Y">',
					'<span id="price-twelve"></span>',
					'<p id="month12" class="p4"></p>',
				'</span>',
				'<p id="paymentMethod" class="p4" style="margin-top: 0px;"></p>',
				'<span class="payItem method" id="payItemAli">',
					'<p id="alipay" class="p5"></p>',
				'</span>',
				'<span class="payItem method" id="payItemWechat">',
					'<p id="wechatPay" class="p5"></p>',
				'</span>',
				'<span class="payItem method" id="payItemPaypal">',
					'<p id="paypal" class="p5">PayPal</p>',
				'</span>',
			'</div>',
			'<button class="btn1" id="btnPay0"></button>'
		],"accBox0","popAccount");
		id(btnCloseId).onclick=function(){
			closePopup("popAccount");
		};
		id("lblUsername").innerText=login.email;
		id("lblExpTime").innerText=privilegeStatus.innerText;
		id("activatePremium").innerText=multilang({
			"en-US":"Activate/Renew Premium Plan",
			"zh-CN":"激活 / 续期高级账号",
			"zh-TW":"啟用 / 續期高級賬號"
		});
		id("showPrivilege").innerText=multilang({
			"en-US":"Why?",
			"zh-CN":"高级账号有哪些特权？",
			"zh-TW":"高級賬號有哪些特權？"
		});
		id("showPrivilege").onclick=function(){
			showPopup([
				'<span class="btnBack" id="btnBackPrivileges"></span>',
				'<p id="titlePrivileges" class="p1"></p>',
				'<span class="line"></span>',
				'<p id="txtPrivileges" class="p3 contentLeftAligned"></p>'
			],"accBox_1","popAccount","slideInFromLeft");
			id("btnBackPrivileges").onclick=function(){
				closePopup("accBox_1","slideOut");
			}
			id("titlePrivileges").innerText=multilang({
				"en-US":"Privileges of Premium Plan",
				"zh-CN":"高级账号特权",
				"zh-TW":"高級賬號特權"
			});
			id("txtPrivileges").innerText=window.info.privileges;
		};
		id("promotionText").innerText=window.info.promotion;
		id("plans").innerHTML=multilang({
			"en-US":"Plans",
			"zh-CN":"支付方案",
			"zh-TW":"支付方案"
		});
		id("month1").innerText=multilang({
			"en-US":"1 Month",
			"zh-CN":"一个月",
			"zh-TW":"一個月"
		});
		id("month3").innerText=multilang({
			"en-US":"3 Months",
			"zh-CN":"三个月",
			"zh-TW":"三個月"
		});
		id("month12").innerText=multilang({
			"en-US":"1 Year",
			"zh-CN":"一年",
			"zh-TW":"一年"
		});
		id("payItem1M").onclick=
		id("payItem3M").onclick=
		id("payItem1Y").onclick=function(){
			payItemClick(this,"plan");
		};
		id("paymentMethod").innerText=multilang({
			"en-US":"Payment Method",
			"zh-CN":"支付方式",
			"zh-TW":"支付方式"
		});
		id("alipay").innerText=multilang({
			"en-US":"AliPay",
			"zh-CN":"支付宝",
			"zh-TW":"支付寶"
		});
		id("wechatPay").innerText=multilang({
			"en-US":"WeChat",
			"zh-CN":"微信支付",
			"zh-TW":"微信支付"
		});
		id("btnPay0").innerText=multilang({
			"en-US":"Pay",
			"zh-CN":"确认支付",
			"zh-TW":"確認支付"
		});
		id("payItemAli").onclick=
		id("payItemWechat").onclick=
		id("payItemPaypal").onclick=function(){
			payItemClick(this,"method");
		};
		Object.keys(window.info.price).forEach(function(key){
			id("price-"+key).innerHTML="";
			var newP=document.createElement("p");
			newP.classList.add("p2");
			window.info.price[key]["actualPrice"]=window.info.currency+window.info.price[key]["specialPrice"];
			if(window.info.price[key]["specialPrice"]!=window.info.price[key]["price"]){
				var newSpan=document.createElement("span");
				newSpan.classList.add("pDel");
				newP.innerText=window.info.currency+window.info.price[key]["specialPrice"];
				newSpan.innerText=window.info.currency+window.info.price[key]["price"];
				newP.appendChild(newSpan);
			}else{
				newP.innerText=window.info.currency+window.info.price[key]["price"];
			}
			id("price-"+key).appendChild(newP);
		});
		var pubPayPlan="N/A";
		var pubPayMethod="N/A";
		id("btnPay0").onclick=function(){
			showPopup([
				'<p class="p3" id="lblPayTip">您正在为此用户激活 / 续期高级账号</p>',
				'<div id="payQRC"></div>',
				'<span class="btnBack" id="btnBackPay"></span>',
				'<button class="btn1" id="btnPay1"></button>'
			],"accBox1","popAccount","slideInFromRight");
			id("btnBackPay").onclick=function(){
				closePopup("accBox1","slideOut");
			}
			id("btnPay1").innerText=multilang({
				"en-US":"I Have Paid",
				"zh-CN":"我已支付",
				"zh-TW":"我已支付"
			});
			var payPlan=document.getElementsByClassName("payItem plan selected").item(0).lastElementChild;
			var payMethod=document.getElementsByClassName("payItem method selected").item(0).lastElementChild;
			var actualPrice;
			var idPayPlan=payPlan.id;
			var idPayMethod=payMethod.id;
			pubPayPlan=payPlan.innerText;
			pubPayMethod=payMethod.innerText;
			id("payQRC").innerHTML="";
			var qrcode=new Image(200,200);
			switch(idPayMethod){
				case "alipay":
				switch(idPayPlan){
					case "month1":
					qrcode.src=getQRCode(window.info.price.one.alipay);
					actualPrice=window.info.price.one.actualPrice;
					break;
					case "month3":
					qrcode.src=getQRCode(window.info.price.three.alipay);
					actualPrice=window.info.price.three.actualPrice;
					break;
					case "month12":
					qrcode.src=getQRCode(window.info.price.twelve.alipay);
					actualPrice=window.info.price.twelve.actualPrice;
					break;
				}
				break;
				case "wechatPay":
				switch(idPayPlan){
					case "month1":
					qrcode.src=getQRCode(window.info.price.one.wechatpay);
					actualPrice=window.info.price.one.actualPrice;
					break;
					case "month3":
					qrcode.src=getQRCode(window.info.price.three.wechatpay);
					actualPrice=window.info.price.three.actualPrice;
					break;
					case "month12":
					qrcode.src=getQRCode(window.info.price.twelve.wechatpay);
					actualPrice=window.info.price.twelve.actualPrice;
					break;
				}
				break;
				case "paypal":
				switch(idPayPlan){
					case "month1":
					qrcode.src=getQRCode(window.info.price.one.paypal);
					actualPrice=window.info.price.one.actualPrice;
					break;
					case "month3":
					qrcode.src=getQRCode(window.info.price.three.paypal);
					actualPrice=window.info.price.three.actualPrice;
					break;
					case "month12":
					qrcode.src=getQRCode(window.info.price.twelve.paypal);
					actualPrice=window.info.price.twelve.actualPrice;
					break;
				}
				break;
			}
			id("payQRC").appendChild(qrcode);
			lblPayTip.innerText=multilang({
				"en-US":"Activate/Renew "+pubPayPlan+" of Premium Plan ("+actualPrice+")\nfor "+login.email+" with "+pubPayMethod,
				"zh-CN":"使用 "+pubPayMethod+" 为 "+login.email+"\n激活 / 续期"+pubPayPlan+"的高级账号（"+actualPrice+"）",
				"zh-TW":"使用 "+pubPayMethod+" 為 "+login.email+"\n啟用 / 續期"+pubPayPlan+"的高級賬號（"+actualPrice+"）"
			});
			accBox0.style.left="-500px";
			accBox1.style.left="0px";
			var payState="success";
			id("btnPay1").onclick=function(){
				showPopup([
					'<p class="p1" id="lblPayState0" style="margin-top: 50px;"></p>',
					'<p class="p3" id="lblPayState1" style="margin-top: 50px;"></p>',
					'<button class="btn1" id="btnDone3"></button>'
				],"accBox2","popAccount","slideInFromRight");
				id("lblPayState0").innerText=multilang({
					"en-US":"Submitting",
					"zh-CN":"提交中",
					"zh-TW":"提交中"
				});
				id("lblPayState1").innerText=multilang({
					"en-US":"We are processing your payment order\nPlease wait\nIf you need help, please contact us.",
					"zh-CN":"我们正在处理您的支付订单\n请稍候\n如需帮助，请与我们联系。",
					"zh-TW":"我們正在處理您的支付訂單\n請稍候\n如需幫助，請與我們聯繫。"
				});
				id("btnDone3").innerText=multilang({
					"en-US":"Close",
					"zh-CN":"关闭",
					"zh-TW":"關閉"
				});
				id("btnDone3").onclick=function(){
					if(payState=="success"){
						closePopup("popAccount");
					}else{
						id("btnPay1").onclick();
					}
				}
				var action="续期";
				if(!currentExpTime){
					action="激活";
				}
				fetch("https://api.rthe.cn/backend/feedback",getPostData({
					"appname":appName,
					"email":login.email,
					"lang":navigator.language,
					"name":login.username,
					"text":"通过 "+pubPayMethod+" "+action+" "+pubPayPlan+" 的高级账号",
					"ver":version
				})).then(function(response){
					if(response.ok||response.status==200){
						payState="success";
						id("btnDone3").innerText=multilang({
							"en-US":"Close",
							"zh-CN":"关闭",
							"zh-TW":"關閉"
						});
						id("lblPayState0").innerText=multilang({
							"en-US":"Submitted Successfully",
							"zh-CN":"提交成功",
							"zh-TW":"提交成功"
						});
						id("lblPayState1").innerText=multilang({
							"en-US":"We are processing your order.\nThe number of days remaining will be automatically updated within 24 hours;\nif not, please contact us after making sure you have paid.",
							"zh-CN":"我们正在处理您的支付订单。\n您的高级账号剩余天数会在24小时内自动更新；\n如果24小时后仍没有更新，请在确保您已支付后与我们联系。",
							"zh-TW":"我們正在處理您的支付訂單。\n您的高級賬號剩餘天數會在24小時內自動更新；\n如果24小時后仍沒有更新，請在確保您已支付后與我們聯繫。"
						});
						id("btnDone3").style.pointerEvents="auto";
						id("btnDone3").style.opacity="1";
						orderSubmitted=new Date().getTime();
						localStorage.setItem("orderSubmitted",orderSubmitted);
						loadExpTime();
					}else{
						payState="error";
						id("btnDone3").innerText=multilang({
							"en-US":"Try Again",
							"zh-CN":"重试",
							"zh-TW":"重試"
						});
						id("lblPayState0").innerText=multilang({
							"en-US":"Oops... something went wrong",
							"zh-CN":"Oops... 出错了",
							"zh-TW":"Oops... 出錯了"
						});
						id("lblPayState1").innerText=multilang({
							"en-US":"Unable to connect to the server.",
							"zh-CN":"无法连接至服务器。",
							"zh-TW":"無法連接至伺服器。"
						});
						id("lblPayState1").innerText+=multilang({
							"en-US":"\nPlease try again (no need to pay again)\nIf you need more help, please contact us.",
							"zh-CN":"\n请重试（无需再次扫码付款）\n如需更多帮助，请与我们联系。",
							"zh-TW":"\n請重試（無需再次掃碼付款）\n如需更多幫助，請與我們聯繫。"
						});
						id("btnDone3").style.pointerEvents="auto";
						id("btnDone3").style.opacity="1";
					}
				});
			};
		};
		hideMenu();
	};
	newItem.style.fontSize="small";
	newItem.innerText=login.email;
	menu.insertBefore(newItem,menu.firstChild);
	var newP=document.createElement("p");
	newP.id="privilegeStatus";
	newItem.appendChild(newP);
	loadExpTime();
	fetch("https://api.rthe.cn/backend/userdata/set?"+encodeData({
		"appname":appName,
		"token":login.token,
		"username":login.username
	})).then(function(response){
		if(response.ok||response.status==200){
			return response.json();
		}
	}).then(function(data){
		if(data){
			settings=data;
		}
	});
}
function notify(content,duration){
	var newDiv=document.createElement("div");
	newDiv.classList.add("notificationBar");
	if(!duration&&duration!==false){
		duration=3000;
	}
	newDiv.innerText=content;
	document.body.appendChild(newDiv);
	setTimeout(function(){
		newDiv.style.bottom="0px";
		if(duration){
			setTimeout(function(){
				newDiv.style.bottom="-50px";
				setTimeout(clearNotification,250);
			},duration);
		}
	},25);
}
function payItemClick(element,className){
	if(element.classList.contains("selected")){
		element.classList.remove("selected");
	}else{
		var elements=document.getElementsByClassName(className);
		for(var i=0;i<elements.length;i++){
			if(elements[i]==element){
				element.classList.add("selected");
			}else{
				elements[i].classList.remove("selected");
			}
		}
	}
	btnPay0State();
}
function showChangelog(text,firstRunOnly){
	if(firstRun===true||!firstRunOnly){
		showPopup([
			'<p id="titleUpdate" class="p1"></p>',
			'<div id="txtUpdate" class="contentBox"></div>',
			'<button class="btn1" id="btnDone4"></button>'
		],null,"popUpdate","rebound");
		id("titleUpdate").innerText=multilang({
			"en-US":"What's New",
			"zh-CN":"最近更新",
			"zh-TW":"最近更新"
		});
		txtUpdate.innerHTML=text;
		id("btnDone4").innerText=multilang({
			"en-US":"Close",
			"zh-CN":"关闭",
			"zh-TW":"關閉"
		});
		id("btnDone4").onclick=function(){
			closePopup("popUpdate");
		};
	}
}
function showPopup(html,elementId,parentId,animation){
	if(!id(parentId)){
		var newParent=document.createElement("div");
		newParent.classList.add("popUp");
		newParent.id=parentId;
		if(!elementId){
			newParent.innerHTML=html.join("");
		}
		mainBox.style.opacity="0";
		document.body.appendChild(newParent);
		setTimeout(function(){
			newParent.style.opacity="1";
			if(animation=="rebound"){
				newParent.style.transform="scale(1.05)";
			}
		},250);
		if(animation=="rebound"){
			setTimeout(function(){
				newParent.style.transform="scale(1)";
			},500);
		}
	}
	if(elementId&&!id(elementId)){
		var newDiv=document.createElement("div");
		newDiv.id=elementId;
		newDiv.innerHTML=html.join("");
		switch(animation){
			case "slideInFromLeft":
			newDiv.classList.add("slideInFromLeft");
			id(parentId).appendChild(newDiv);
			setTimeout(function(){
				id(parentId).childNodes[id(parentId).childElementCount-2].style.left="500px";
				newDiv.style.left="0px";
			},25);
			break;
			case "slideInFromRight":
			newDiv.classList.add("slideInFromRight");
			id(parentId).appendChild(newDiv);
			setTimeout(function(){
				id(parentId).childNodes[id(parentId).childElementCount-2].style.left="-500px";
				newDiv.style.left="0px";
			},25);
			break;
			default:
			newDiv.classList.add("popUpBox");
			id(parentId).appendChild(newDiv);
			break;
		}
	}
}
function upload(up,files,config){
	randomKey=getRandStr(10);
	if(config.password){
		config.password=MD5(config.password);
	}
	fetch("https://api.rthe.cn/backend/airportal/getcode",getPostData({
		"chunksize":chunkSize,
		"downloads":config.downloads,
		"host":fileBackend,
		"info":JSON.stringify(files),
		"key":randomKey,
		"password":config.password,
		"username":login.username
	})).then(function(response){
		if(response.ok||response.status==200){
			return response.json();
		}else{
			error(response);
		}
	}).then(function(data){
		if(data){
			if(data.alert){
				alert(data.alert);
				id("inputMaxDl").value=fileCount+1;
				if(!login.username){
					menuItemLogin.click();
				}
			}else{
				uploadCode=data.code;
				document.title="["+multilang({
					"en-US":"Uploading",
					"zh-CN":"正在上传",
					"zh-TW":"正在上傳"
				})+"] "+title;
				showPopup([
					'<p class="p1" id="lblUploadP"></p>',
					'<span class="progressBar" id="progressBarBg0"></span>',
					'<span class="progressBar" id="progressBar0"></span>'
				],"sendBox0","popSend","slideInFromRight");
				id("lblUploadP").innerText=multilang({
					"en-US":"Uploading...",
					"zh-CN":"正在上传……",
					"zh-TW":"正在上傳……"
				});
				option={
					"url":"https://"+data.host,
					"multipart_params":{
						"policy":data.policy,
						"OSSAccessKeyId":data.accessid,
						"success_action_status":"200",
						"signature":data.signature
					}
				};
				up.start();
			}
		}
	});
}
function uploadSuccess(code){
	var url="https://airportal.cn/?code="+code;
	document.title="[取件码 "+code+"] "+title;
	showPopup([
		'<p id="sentSuccessfully" class="p1"></p>',
		'<p id="yourCode"></p>',
		'<p id="recvCode"></p>',
		'<p id="whenReceving"></p>',
		'<p id="otherWays">'+multilang({
			"en-US":'You can also<a class="link1" id="copyLink">copy the download link</a>or<a class="link1" id="viewQRC">scan the QR code to download</a>.',
			"zh-CN":'您也可以<a class="link1" id="copyLink">复制下载链接</a>或<a class="link1" id="viewQRC">直接扫描二维码下载</a>。',
			"zh-TW":'您也可以<a class="link1" id="copyLink">複製下載連結</a>或<a class="link1" id="viewQRC">直接掃描 QR 碼下載</a>。'
		})+'</p>',
		'<button class="btn1" id="btnDone0"></button>'
	],"sendBox1","popSend","slideInFromRight");
	id("sentSuccessfully").innerText=multilang({
		"en-US":"File is sent successfully.",
		"zh-CN":"文件已成功传送。",
		"zh-TW":"檔案已成功發送。"
	});
	id("yourCode").innerText=multilang({
		"en-US":"Your Code (Expires in 1 Day):",
		"zh-CN":"您的取件码（1天内有效）：",
		"zh-TW":"您的取件碼（1天內有效）："
	});
	id("recvCode").innerText=code;
	id("whenReceving").innerText=multilang({
		"en-US":"When receving files, please enter this code.",
		"zh-CN":"接收文件时，请输入该四位数密码。",
		"zh-TW":"接收檔案時，請輸入該四位數密碼。"
	});
	id("viewQRC").style.marginRight="0px";
	id("btnDone0").innerText=multilang({
		"en-US":"Done",
		"zh-CN":"完成",
		"zh-TW":"完成"
	});
	copyLink.onclick=function(){
		if("clipboard" in navigator){
			navigator.clipboard.writeText(url).then(function(){
				notify(multilang({
					"en-US":"The download link is copied to the clipboard.",
					"zh-CN":"下载链接已复制到剪贴板。",
					"zh-TW":"下載連結已複製到剪貼簿。"
				}));
			});
		}else{
			prompt(multilang({
				"en-US":"Your browser does not support the clipboard API. Please copy it manually.",
				"zh-CN":"您的浏览器不支持剪贴板功能。请手动复制。",
				"zh-TW":"您的瀏覽器不支援剪貼簿功能。請手動複製。"
			}),url);
		}
	};
	viewQRC.onclick=function(){
		showPopup([
			'<div id="QRBox"></div>',
			'<span class="btnBack" id="btnBackQRC"></span>'
		],"sendBox2","popSend","slideInFromRight");
		var qrcode=new Image(200,200);
		qrcode.src=getQRCode(url);
		id("QRBox").appendChild(qrcode);
		id("btnBackQRC").onclick=function(){
			closePopup("sendBox2","slideOut");
		};
	};
	btnDone0.onclick=function(){
		document.title=title;
		closePopup("popSend");
		var popRecvCode=document.createElement("div");
		popRecvCode.classList.add("popRecvCode");
		popRecvCode.innerText=code;
		document.body.appendChild(popRecvCode);
		setTimeout(function(){
			popRecvCode.style.transform="scale(0.5,0.5)";
		},500);
		setTimeout(function(){
			popRecvCode.style.top="0px";
			popRecvCode.style.left="100%";
			popRecvCode.style.marginTop="0px";
			popRecvCode.style.marginLeft="-135px";
		},750);
		setTimeout(function(){
			popRecvCode.style.transformOrigin="65% 50%";
			popRecvCode.style.transform="scale(0,0)";
		},1750);
		setTimeout(function(){
			popRecvCode.style.opacity="0";
			setTimeout(function(){
				popRecvCode.style.display="none";
				popRecvCode.parentElement.removeChild(popRecvCode);
			},250);
		},2250);
	};
}
send.oncontextmenu=function(){
	var btnCloseId="btnClose"+new Date().getTime();
	showPopup([
		'<span class="btnClose" id="'+btnCloseId+'"></span>',
		'<p id="titleSendText" class="p1"></p>',
		'<textarea id="txtSend" placeholder=""></textarea>',
		'<button class="btn1" id="btnSendText"></button>'
	],"sendBox0","popSend","rebound");
	id("titleSendText").innerText=multilang({
		"en-US":"Send Text",
		"zh-CN":"发送文本",
		"zh-TW":"發送文字"
	});
	id("txtSend").placeholder=multilang({
		"en-US":"Enter the plain text here",
		"zh-CN":"在这里输入纯文本",
		"zh-TW":"在這裡輸入純文字"
	});
	id("btnSendText").innerText=multilang({
		"en-US":"Send",
		"zh-CN":"发送",
		"zh-TW":"發送"
	});
	id(btnCloseId).onclick=function(){
		closePopup("popSend");
	};
	id("btnSendText").onclick=function(){
		var value=id("txtSend").value;
		if(value){
			id("btnSendText").disabled=true;
			fetch("https://api.rthe.cn/backend/airportal/getcode",getPostData({
				"text":value,
				"username":login.username
			})).then(function(response){
				id("btnSendText").disabled=false;
				if(response.ok||response.status==200){
					return response.json();
				}else{
					error(response);
				}
			}).then(function(data){
				if(data){
					if(data.alert){
						alert(data.alert);
					}else{
						uploadSuccess(data.code);
					}
				}
			});
		}
	};
	id("txtSend").focus();
	return false;
};
receive.onclick=function(){
	showPopup([
		'<p class="p1" style="padding-top: 30px;">',
			'<span id="enterCode"></span>',
			'<p id="howToGetCode" class="tip"></p>',
		'</p>',
		'<input type="tel" id="inputCode" class="inputCode" maxlength="4" autocomplete="off"><br>',
		'<button class="btn1" id="btnSub"></button>',
		'<span class="btnBack" id="btnBackRecv"></span>'
	],"recvBox0","popRecv");
	id("enterCode").innerText=multilang({
		"en-US":"Please enter the code",
		"zh-CN":"请输入取件码",
		"zh-TW":"請輸入取件碼"
	});
	id("howToGetCode").innerText=multilang({
		"en-US":"You will get the code after sending a file",
		"zh-CN":"发送文件后就会获得取件码",
		"zh-TW":"發送檔案后就會獲得取件碼"
	});
	id("inputCode").onkeydown=function(event){
		if(event.keyCode==13){
			id("btnSub").click();
		}
	}
	id("btnSub").innerText=multilang({
		"en-US":"OK",
		"zh-CN":"确定",
		"zh-TW":"確定"
	});
	id("btnSub").onclick=function(){
		if(isTencent){
			alert("请在浏览器中打开此页面。");
		}else if(invalidAttempt>2){
			var code=getRandCharacter(3);
			var enteredCode=prompt(multilang({
				"en-US":"You have entered invalid codes many times. Please enter the verification code to continue: ",
				"zh-CN":"您已经多次输入了无效取件码。请输入验证码以继续：",
				"zh-TW":"您已經多次輸入了無效取件碼。請輸入驗證碼以繼續："
			})+code);
			if(enteredCode==code){
				getInfo(id("inputCode").value);
			}else if(enteredCode!==null){
				alert(multilang({
					"en-US":"Incorrect verification code.",
					"zh-CN":"验证码错误。",
					"zh-TW":"驗證碼錯誤。"
				}));
			}
		}else{
			getInfo(id("inputCode").value);
		}
	};
	id("btnBackRecv").onclick=function(){
		closePopup("popRecv");
	};
	id("inputCode").focus();
};
receive.oncontextmenu=function(){
	return false;
};
menuIcon.onclick=function(){
	menu.style.display="block";
	setTimeout(function(){
		menu.style.opacity="1";
	},10);
	mask.style.display="block";
	menuItemSelectServer.style.position="";
	menuItemSelectServer.style.marginLeft="0";
	menuServers.style.display="none";
	menuServers.style.marginLeft="200%";
};
mask.onclick=hideMenu;
menuItemLogin.onclick=function(){
	if(login.username){
		var ssoIFrame=document.createElement("iframe");
		ssoIFrame.style.display="none";
		ssoIFrame.src="https://account.rthsoftware.cn/sso.html?"+encodeData({
			"action":"logout"
		});
		document.body.appendChild(ssoIFrame);
	}else{
		var btnCloseId="btnClose"+new Date().getTime();
		showPopup([
			'<span class="btnClose" id="'+btnCloseId+'"></span>',
			'<iframe src="https://account.rthsoftware.cn/login-airportal.html"></iframe>'
		],null,"popLogin");
		id(btnCloseId).onclick=function(){
			closePopup("popLogin");
		};
	}
	hideMenu();
};
menuItemHistory.onclick=function(){
	showPopup([
		'<p id="titleHistory" class="p1"></p>',
		'<span class="line"></span>',
		'<div id="historyList">',
			'<p id="lblPlaceholder" class="placeholder"></p>',
		'</div>',
		'<button class="btn1" id="btnDoneHistory"></button>'
	],null,"popHistory");
	id("titleHistory").innerText=multilang({
		"en-US":"History",
		"zh-CN":"历史记录",
		"zh-TW":"歷史記錄"
	});
	id("btnDoneHistory").innerText=multilang({
		"en-US":"Close",
		"zh-CN":"关闭",
		"zh-TW":"關閉"
	});
	id("btnDoneHistory").onclick=function(){
		closePopup("popHistory");
	};
	var loadHistory=function(){
		id("historyList").innerHTML="";
		var lblPlaceholder=document.createElement("p");
		lblPlaceholder.classList.add("placeholder");
		id("historyList").appendChild(lblPlaceholder);
		lblPlaceholder.innerText=multilang({
			"en-US":"Loading",
			"zh-CN":"正在加载",
			"zh-TW":"正在加載"
		});
		fetch("https://api.rthe.cn/backend/airportal/get?"+encodeData({
			"token":login.token,
			"username":login.username
		})).then(function(response){
			if(response.ok||response.status==200){
				return response.json();
			}else{
				lblPlaceholder.innerText=multilang({
					"en-US":"Unable to connect to the server",
					"zh-CN":"无法连接至服务器",
					"zh-TW":"無法連接至伺服器"
				})+" ("+response.status+")";
			}
		}).then(function(data){
			if(data){
				lblPlaceholder.innerText=multilang({
					"en-US":"You have not uploaded any files yet",
					"zh-CN":"您尚未上传任何文件",
					"zh-TW":"您尚未上傳任何檔案"
				});
				if(data.length>0){
					lblPlaceholder.style.display="none";
					for(var i=data.length-1;i>=0;i--){
						var newHistory=document.createElement("span");
						var newSpan=document.createElement("span");
						var newP=document.createElement("p");
						var newDelBtn=document.createElement("span");
						newHistory.classList.add("historyItem");
						newHistory.setAttribute("code",data[i].code);
						newSpan.innerText=data[i].code;
						newSpan.title=multilang({
							"en-US":"Download",
							"zh-CN":"下载",
							"zh-TW":"下載"
						});
						newSpan.onclick=function(){
							open("https://airportal.cn/"+this.parentElement.getAttribute("code"));
						};
						newP.innerText=decodeURIComponent(data[i].name);
						newDelBtn.classList.add("btnDel");
						newDelBtn.title=multilang({
							"en-US":"Delete",
							"zh-CN":"删除",
							"zh-TW":"刪除"
						});
						newDelBtn.onclick=function(){
							var thisItem=this.parentElement;
							var code=thisItem.getAttribute("code");
							var filename=thisItem.getElementsByTagName("p")[0].innerText;
							if(confirm(multilang({
								"en-US":"Are you sure that you want to delete "+filename+" from the server?",
								"zh-CN":"确定要删除存储在服务器上的 "+filename+" 吗？",
								"zh-TW":"確定要刪除存儲在伺服器上的 "+filename+" 嗎？"
							}))){
								var reason;
								if(login.username=="admin"){
									reason=prompt("请输入原因。");
									if(reason===null){
										return false;
									}
								}
								fetch("https://api.rthe.cn/backend/airportal/del",getPostData({
									"code":code,
									"reason":reason,
									"token":login.token,
									"username":login.username
								})).then(function(response){
									if(response.ok||response.status==200){
										loadHistory();
									}else{
										error(response);
									}
								});
							}
						};
						newHistory.appendChild(newSpan);
						newHistory.appendChild(newP);
						newHistory.appendChild(newDelBtn);
						id("historyList").appendChild(newHistory);
					}
				}else{
					lblPlaceholder.style.display=id("historyList").style.marginTop="";
				}
			}
		});
	}
	loadHistory();
	hideMenu();
};
menuItemSettings.onclick=function(){
	showPopup([
		'<p id="titleSettings" class="p1"></p>',
		'<span class="line"></span>',
		'<div class="contentLeftAligned">',
			'<div>',
				'<input type="checkbox" class="cbox" id="inputLoginRequired"></input>',
				'<label id="lblLoginRequired" class="lblCbox" for="inputLoginRequired"></label>',
			'</div>',
		'</div>',
		'<button class="btn1" id="btnDone5"></button>'
	],null,"popSettings");
	if(settings["loginRequired"]){
		id("inputLoginRequired").checked=true;
	}
	id("titleSettings").innerText=multilang({
		"en-US":"Settings",
		"zh-CN":"设置",
		"zh-TW":"設定"
	});
	id("lblLoginRequired").innerText=multilang({
		"en-US":"Require my password when receiving my files",
		"zh-CN":"接收我的文件时需要登录我的账号",
		"zh-TW":"接收我的檔案時需要登入我的賬號"
	});
	id("inputLoginRequired").onchange=function(){
		if(login.username){
			settings["loginRequired"]=this.checked;
			fetch("https://api.rthe.cn/backend/userdata/set",getPostData({
				"appname":appName,
				"key":"loginRequired",
				"token":login.token,
				"username":login.username,
				"value":this.checked.toString()
			})).then(function(response){
				if(response.ok||response.status==200){
					notify(multilang({
						"en-US":"Settings are saved.",
						"zh-CN":"设置已保存。",
						"zh-TW":"設定已保存。"
					}),1500);
				}else{
					error(response);
				}
			})
		}else{
			this.checked=false;
			menuItemLogin.click();
		}
	};
	id("btnDone5").innerText=multilang({
		"en-US":"Done",
		"zh-CN":"完成",
		"zh-TW":"完成"
	});
	id("btnDone5").onclick=function(){
		closePopup("popSettings");
	};
	hideMenu();
};
menuItemFeedback.onclick=function(){
	var btnCloseId="btnClose"+new Date().getTime();
	showPopup([
		'<span class="btnClose" id="'+btnCloseId+'"></span>',
		'<p id="titleFeedback" class="p1"></p>',
		'<span class="line"></span>',
		'<a id="faq" class="link1" href="https://faq-ap.rthe.cn/" target="_blank"></a>&amp;<a id="qqGroup" class="link1" href="https://shang.qq.com/wpa/qunwpa?idkey=846414dde5b85a4ac77be8d6e63029d9abea174e571b52d45e4840257f5cb850" target="_blank"></a>',
		'<textarea id="txtFeedback"></textarea>',
		'<button class="btn1" id="btnSendFeed"></button>'
	],null,"popFeedback");
	id("titleFeedback").innerText=multilang({
		"en-US":"Send Us a Message",
		"zh-CN":"向我们发送消息",
		"zh-TW":"向我們發送訊息"
	});
	id("faq").innerText=multilang({
		"en-US":"FAQ",
		"zh-CN":"常见问题",
		"zh-TW":"常見問題集"
	});
	id("qqGroup").innerText=multilang({
		"en-US":"Our QQ Group #",
		"zh-CN":"我们的QQ群",
		"zh-TW":"我們的QQ群"
	})+" 319496964";
	id("txtFeedback").placeholder=multilang({
		"en-US":"Enter the message here",
		"zh-CN":"在这里输入消息内容",
		"zh-TW":"在這裡輸入訊息內容"
	});
	id("btnSendFeed").innerText=multilang({
		"en-US":"Send",
		"zh-CN":"发送",
		"zh-TW":"發送"
	});
	id("btnSendFeed").onclick=function(){
		if(txtFeedback.value){
			var emailPattern=/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
			var email=login.email||emailPattern.exec(txtFeedback.value)&&emailPattern.exec(txtFeedback.value)[0]||prompt(multilang({
				"en-US":"Please enter your email address.",
				"zh-CN":"请输入您的电子邮箱地址。",
				"zh-TW":"請輸入您的電子郵箱地址。"
			}));
			if(emailPattern.test(email)){
				fetch("https://api.rthe.cn/backend/feedback",getPostData({
					"appname":appName,
					"email":email,
					"lang":navigator.language,
					"name":login.username,
					"recipient":"405801769@qq.com",
					"text":txtFeedback.value,
					"ver":version
				})).then(function(response){
					if(response.ok||response.status==200){
						alert(multilang({
							"en-US":"Send successfully! We will process your feedback as soon as possible. Have a nice day :D",
							"zh-CN":"发送成功！我们会尽快处理您的反馈。祝您有开心的一天 :D",
							"zh-TW":"發送成功！我們會盡快處理您的回饋。祝您有開心的一天 :D"
						}));
						closePopup("popFeedback");
					}else{
						error(response);
					}
				});
			}else{
				alert(multilang({
					"en-US":"Please provide the correct email address, or we will not be able to reply to you.",
					"zh-CN":"请提供正确的电子邮箱地址，否则我们将无法回复您。",
					"zh-TW":"請提供正確的電子郵箱地址，否則我們將無法回復您。"
				}));
			}
		}
	};
	id(btnCloseId).onclick=function(){
		closePopup("popFeedback");
	};
	hideMenu();
};
menuItemSelectServer.onclick=function(){
	this.style.position="absolute";
	this.style.marginLeft="-100%";
	menuServers.style.display="";
	menuServers.style.marginLeft="0px";
};
addEventListener("message",function(e){
	try{
		login=JSON.parse(atob(e.data));
		if(login.username===null){
			localStorage.clear();
			location.reload();
		}else{
			loggedIn(true);
		}
	}catch(e){}
});
if(login.username){
	loggedIn();
}else{
	var ssoIFrame=document.createElement("iframe");
	ssoIFrame.style.display="none";
	ssoIFrame.src="https://account.rthsoftware.cn/sso.html";
	document.body.appendChild(ssoIFrame);
}
var uploader=new plupload.Uploader({
	"runtimes":"html5",
	"browse_button":"send",
	"drop_element":"send",
	"url":"https://"+fileBackend,
	"chunk_size":chunkSize,
	"init":{
		"FilesAdded":function(up,files){
			var btnCloseId="btnClose"+new Date().getTime();
			showPopup([
				'<span class="btnClose" id="'+btnCloseId+'"></span>',
				'<p id="filesSelected" class="p1" style="margin-top: -10px;"></p>',
				'<p id="filesTip" style="margin-top: -10px;"></p>',
				'<div id="selectedFileList" class="fileList"></div>',
				'<table class="tableUploadSettings">',
					'<tbody>',
						'<tr>',
							'<td>',
								'<label id="lblFilePsw" for="inputFilePsw"></label>',
							'</td>',
							'<td>',
								'<input id="inputFilePsw" autocomplete="off">',
							'</td>',
						'</tr>',
						'<tr>',
							'<td>',
								'<label id="lblMaxDl" for="inputMaxDl"></label>',
							'</td>',
							'<td>',
								'<input id="inputMaxDl" type="number" autocomplete="off">',
							'</td>',
						'</tr>',
					'</tbody>',
				'</table>',
				'<button class="btn1" id="btnUpload"></button>'
			],"uploadList","popSend","rebound");
			id(btnCloseId).onclick=function(){
				uploader.splice();
				closePopup("popSend");
			};
			id("filesSelected").innerText=multilang({
				"en-US":"You selected these files",
				"zh-CN":"您选择了这些文件",
				"zh-TW":"您選擇了這些檔案"
			});
			id("filesTip").innerText=login.email||multilang({
				"en-US":"Not Logged In",
				"zh-CN":"未登录",
				"zh-TW":"未登入"
			});
			plupload.each(files,function(file){
				var newA=document.createElement("a");
				newA.classList.add("menu");
				newA.innerText=file.name;
				id("selectedFileList").appendChild(newA);
			});
			id("lblFilePsw").innerText=multilang({
				"en-US":"Password",
				"zh-CN":"密码",
				"zh-TW":"密碼"
			});
			id("inputFilePsw").placeholder=multilang({
				"en-US":"Password for files (Optional)",
				"zh-CN":"为文件设置下载密码，可留空",
				"zh-TW":"為檔案設定下載密碼，可留空"
			});
			id("lblMaxDl").innerText=multilang({
				"en-US":"Maximum Downloads",
				"zh-CN":"可下载次数",
				"zh-TW":"可下載次數"
			});
			id("inputMaxDl").value=files.length+1;
			id("btnUpload").innerText=multilang({
				"en-US":"Upload",
				"zh-CN":"上传",
				"zh-TW":"上傳"
			});
			id("btnUpload").onclick=function(){
				chunk=1;
				fileCount=files.length;
				fileDone=0;
				var downloads=id("inputMaxDl").value;
				if(!downloads||parseInt(downloads)<1){
					downloads=fileCount+1;
				}
				upload(up,files,{
					"downloads":downloads,
					"password":id("inputFilePsw").value
				});
			};
		},
		"BeforeUpload":function(up,file){
			option["multipart_params"]["key"]=uploadCode+"/"+randomKey+"/1/"+file.name;
			up.setOption(option);
		},
		"UploadProgress":function(up,file){
			var percent=file.percent;
			if(percent>99){
				percent=99;
			}
			id("progressBarBg0").style.background="rgba(0,0,0,0.1)";
			document.title="["+percent+"%] "+title;
			if(percent==99){
				id("lblUploadP").innerText=multilang({
					"en-US":"Almost there",
					"zh-CN":"马上就好",
					"zh-TW":"馬上就好"
				})+" ("+(fileDone+1)+"/"+fileCount+")";
			}else{
				id("lblUploadP").innerText=multilang({
					"en-US":"Uploading",
					"zh-CN":"正在上传",
					"zh-TW":"正在上傳"
				})+" "+file.name+" "+percent+"%";
			}
			id("progressBar0").style.width=percent+"px";
		},
		"ChunkUploaded":function(up,file){
			chunk++;
			option["multipart_params"]["key"]=uploadCode+"/"+randomKey+"/"+chunk+"/"+file.name;
			up.setOption(option);
		},
		"FileUploaded":function(){
			fileDone++;
			if(fileDone>=fileCount){
				uploadSuccess(uploadCode);
			}
		},
		"Error":function(up,err){
			console.error(err.response);
		}
	}
});
uploader.init();
if(isiOS){
	setTimeout(function(){
		var longPress,longPressTimeout;
		document.getElementsByTagName("input")[0].addEventListener("touchstart",function(){
			send.classList.add("send-active");
			longPress=false;
			longPressTimeout=setTimeout(function(){
				longPress=true;
			},1000);
		},{
			passive:true
		});
		document.getElementsByTagName("input")[0].addEventListener("touchend",function(){
			send.classList.remove("send-active");
			clearTimeout(longPressTimeout);
			if(longPress){
				send.oncontextmenu();
			}
		},{
			passive:true
		});
	},100);
}
if(parseInt($_GET["code"])&&$_GET["code"].length==4){
	if(isTencent){
		tmpCode=$_GET["code"];
	}else{
		tmpCode=null;
		localStorage.setItem("code",$_GET["code"]);
		location.search="";
	}
}
if(tmpCode){
	localStorage.removeItem("code");
	if(parseInt(tmpCode)){
		receive.click();
		if(id("popRecv")){
			var animationProgress=0;
			var codeSplit=tmpCode.split("");
			id("inputCode").value="";
			var intervalId=setInterval(function(){
				if(animationProgress<tmpCode.length){
					id("inputCode").value+=codeSplit[animationProgress];
					animationProgress++;
				}else{
					clearInterval(intervalId);
					id("btnSub").click();
				}
			},400);
		}
	}
}
newScript.src="https://api.rthe.cn/backend/code?"+encodeData({
	"appname":appName,
	"lang":navigator.language,
	"token":login.token,
	"username":login.username,
	"ver":version
});
newScript.onload=function(){
	document.body.removeChild(newScript);
}
document.body.appendChild(newScript);
if(chs){
	txtVer.innerText="闽ICP备18016273号";
	txtVer.oncontextmenu=function(){
		txtVer.innerText=version;
		return false;
	};
}else{
	txtVer.innerText=version;
}
