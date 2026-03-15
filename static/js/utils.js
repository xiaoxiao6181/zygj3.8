function maskString(str) {
    if (typeof str !== 'string') return str;
    
    if (str.length <= 8) {
        return str; // 如果字符串长度小于等于8，直接返回原字符串
    }
    
    const firstFour = str.substring(0, 4);
    const lastFour = str.substring(str.length - 4);
    const middleStars = '*'.repeat(str.length - 8);
    
    return firstFour + middleStars + lastFour;
}

async function  getUserInfo () {
	console.log(11)
    let res=await AjaxUtil.get('/index/user/getUserInfo')
	if(res.code==1) {
	  userInfo  =  res.data.user
	  window.localStorage.setItem('userInfo', JSON.stringify(userInfo))
	  return userInfo
	} else {
	  console.log(res.info)
	  window.location.href = '/login.html'
	}

}

function msg(title, content, type, url) {
	$(".contents").html(content);
	if (type == 1) {
		var btn = '<div class="confirm guanbi" onclick="$(\'.tipMask\').hide();">确定</div>';
	} else {
		var btn = '<div class="confirm guanbi" onclick="window.location.href=\'' + url + '\'">确定</div>';
	}
	$("#msgBtn").html(btn);
	$(".tipMask").show();
}

function getStatusText(status){
	  if(status==0){
		  return '审核中'
	  }
	  if(status==1){
			return '申请成功'
	  }
	  if(status==2){
			return '申请失败'
	  }
}

