/**
 * jQuery AJAX 封装工具
 * 功能：统一请求头、拦截器、错误处理、加载提示
 */
// let code=localStorage.getItem('code')
// if(!code){
// 	location.href='./pass.html'
// }
const baseConfig = {
	baseUrl: 'https://admin.zygj66.cyou', // 接口基础路径
	
	// baseUrl:'http://47.109.206.211:214',
	// baseUrl:'https://api.xiangmuceshi.shop',
	timeout: 10000, // 超时时间（毫秒）
	headers: {
	  'Content-Type': 'application/json',
	  'X-Requested-With': 'XMLHttpRequest',
	  "token":window.localStorage.getItem('token')
	}
};

window.AjaxUtil = (function($) {
  // 基础配置
  

  // 加载提示
  const loading = {
    show(text) {
      if (!document.querySelector('#ajax-loading')) {
        const div = document.createElement('div');
        div.id = 'ajax-loading';
        div.style.cssText = `
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          padding: 10px 20px; background: rgba(0,0,0,0.7); color: white;
          border-radius: 4px; z-index: 9999;
        `;
        div.innerHTML = text || '加载中...';
        document.body.appendChild(div);
      }
    },
    hide() {
      const el = document.querySelector('#ajax-loading');
      if (el) el.remove();
    }
  };

  // 请求拦截器（发送前处理）
  function requestInterceptor(config) {
    // 示例：添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Token'] = `${token}`;
    }
    // 拼接完整 URL
    config.url = baseConfig.baseUrl + config.url;
    return config;
  }

  // 响应拦截器（成功后处理）
  function responseInterceptor(response) {
    // 示例：统一处理业务错误（如 code 不为 200）
    const res = response.data;

	if(response.code==5001){
		location.href='./login.html'
	}
    if (res.code && res.code !== 200) {
      console.log(`业务错误：${res.msg || '操作失败'}`);
      return Promise.reject(res); // 抛出自定义错误
    }
    return res; // 返回处理后的数据
  }

  // 错误统一处理
  function errorHandler(error) {
	console.log('error',error)
    loading.hide();
    let message = '请求失败，请稍后重试';
    if (error.status) {
      // HTTP 状态码错误
      switch (error.status) {
        case 401:
          message = '未登录或登录已过期，请重新登录';
          // 可在此处跳转登录页
		  location.href="./login.html"
          break;
        case 403:
          message = '没有权限访问';
          break;
        case 404:
          message = '接口不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        case 408:
          message = '请求超时';
          break;
      }
    } else if (error.message === 'abort') {
      message = '请求已取消';
    }
    console.log(message);
    return Promise.reject(error);
  }

  // 核心请求方法
  function request(options) {
    // 合并配置
    const config = {
      ...baseConfig,
      ...options,
      headers: { ...baseConfig.headers, ...options.headers }
    };
	console.log(options)
    // 请求拦截
    const processedConfig = requestInterceptor(config);

    // 显示加载
	// console.log('loadingHide',loadingHide)
	if(!options.data.loadingHide){
		loading.show();
	}
    

    // 发起请求
    return $.ajax(processedConfig)
      .done(responseInterceptor)
      .fail(errorHandler)
      .always(loading.hide); // 无论成功失败都隐藏加载
  }

  // 暴露常用请求方法
  return {
    // GET 请求
    get(url, params = {}, options = {}) {
      return request({
        url,
        method: 'GET',
        data: params, // GET 参数自动拼到 URL
        ...options
      });
    },

    // POST 请求（JSON 格式）
    post(url, data = {}, options = {}) {
      return request({
        url,
        method: 'POST',
        data: JSON.stringify(data), // 转为 JSON 字符串
        ...options
      });
    },

    // POST 表单请求（form-data 格式）
    postForm(url, data = {}, options = {}) {
      // 转换为 FormData
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
	  console.log(formData)
      return request({
        url,
        method: 'POST',
        data: formData,
        contentType: false, // 不设置 Content-Type，由浏览器自动处理
        processData: false, // 不转换数据格式
        ...options
      });
    },

    // 取消请求（需配合 jQuery 的 xhr 对象）
    abort(xhr) {
      if (xhr && xhr.abort) {
        xhr.abort();
      }
    },
    loading
  };
})(jQuery);



$.ajaxSetup({
    headers: {
        'Token':  localStorage.getItem('token')
    }
});


AjaxUtil.get('/index/index/getConfigInfo').then(res => {
	localStorage.setItem('config',JSON.stringify(res.data))

	$(".t_span.four").attr('href',res.data.service)  
	$(".kefu").attr('href',res.data.service)  
	$("#notice").text(res.data.notice)
	$(".f_mine_header").attr('src',res.data.app_img.replaceAll('/upload/', baseConfig.baseUrl + '/upload/'))
	console.log(res.data.app_img.replaceAll('/upload/', baseConfig.baseUrl + '/upload/'))
})


window.addEventListener('pageshow', function(event) {
	if (event.persisted) {
		// 从缓存返回（比如通过浏览器后退按钮）
		window.location.reload();
	}
});

function isValidAlphanumeric(str) {
  // 使用正则表达式 /^[0-9a-zA-Z]+$/ 检查
  // ^       - 匹配字符串的开始
  // [0-9a-zA-Z] - 字符组，匹配任何一个数字或字母
  // +       - 表示前面的字符组出现一次或多次
  // $       - 匹配字符串的结束
  // 整个模式确保整个字符串都由数字和字母组成，不多不少。
  return /^[0-9a-zA-Z]+$/.test(str);
}