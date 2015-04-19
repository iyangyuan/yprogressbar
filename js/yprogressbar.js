(function(exports){
  //实例集合
  var instances = {};
  //以下两个数据可以公用，不必放在实例中
  //模版参数正则
  var paramKeysRegex = /{{\s*y\s*:\s*([a-zA-Z0-9]+)\s*}}/g;
  //数字定位映射
  var positionMap = ["-224px 0px","-192px 0px","-256px 0px",
                      "-320px 0px","-288px 0px","-160px 0px",
                      "-32px 0px","0px 0px","-64px 0px","-128px 0px",
                      "-527px -225px"];
  
  /*
    核心类
  */
  function YprogressBarCore(options){
    this.key;
    this.domCache = {};
    this.cancelCallback = options.cancelCallback || function(){};
    this.paramKeys = [];
    this.desTemplate;
    this.rate;
    
    options = options || {};
    
    //初始化
    this.init(options);
  }
  
  /*
    初始化
  */
  YprogressBarCore.prototype.init = function(options){
    
    //生成key
    this.key = new Date().getTime();
    
    //构造html
    var html = this.buildHtml();
    
    //将html插入到body中
    var bodyDom = document.querySelector("body");
    bodyDom.appendChild(html);
    
    //缓存本实例对应的dom元素
    var domId = "#y_progress_"+this.key;
    this.domCache.box = document.querySelector(domId);
    this.domCache.title = document.querySelector(domId + " div.y-progress-bar-box-content-title");
    this.domCache.des = document.querySelector(domId + " div.y-progress-bar-box-content-des");
    this.domCache.tenth = document.querySelector(domId + " div.y-progress-bar-box-digital-tenth");
    this.domCache.oneth = document.querySelector(domId + " div.y-progress-bar-box-digital-oneth");
    this.domCache.cover = document.querySelector(domId + " div.y-progress-bar-cover");
    this.domCache.close = document.querySelector(domId + " div.y-progress-bar-close");
    
    //判断是否需要关闭按钮
    if(!options.closeable){
      this.domCache.close.parentNode.removeChild(this.domCache.close);
    }
    
    //设置标题
    this.domCache.title.innerText = options.title;
    
    //检查描述中是否有参数
    var pks;
    while(pks = paramKeysRegex.exec(options.des) || null){
      this.paramKeys.push(pks[1]);
    }
    
    //保存描述模版
    this.desTemplate = options.des;
    
    //初始化ui数据
    this.update(0,{});
  };
  
  /*
    html构造器
  */
  YprogressBarCore.prototype.buildHtml = function(){
    var html = "<div id='y_progress_" + this.key + "' style='display: none;' class='y-progress-bar-box'>"+
    "  <table cellpadding='0' cellspacing='0' border='0' width='80%'>"+
    "    <tbody>"+
    "      <tr>"+
    "        <td width='auto' valign='middle'>"+
    "          <div class='y-progress-bar-box-content-title'></div>"+
    "          <div class='y-progress-bar-box-content-sep15'></div>"+
    "          <div class='y-progress-bar-box-content-des'></div>"+
    "        </td>"+
    "        <td width='101px' valign='middle'>"+
    "          <div class='y-progress-bar-box-digital'>"+
    "            <div style='background-position: -527px -225px;' class='y-progress-bar-box-digital-tenth'></div>"+
    "            <div style='background-position: -224px 0px;' class='y-progress-bar-box-digital-oneth'></div>"+
    "            <div class='y-progress-bar-box-digital-rate'></div>"+
    "          </div>"+
    "        </td>"+
    "      </tr>"+
    "    </tbody>"+
    "  </table>"+
    "  <div style='width: 0%;' class='y-progress-bar-cover'></div>"+
    "  <div class='y-progress-bar-light'></div>"+
    "  <div onclick='javascript:YprogressBar.destroy(" + this.key + ");' class='y-progress-bar-close'></div>"+
    "</div>";
    
    var div = document.createElement("div");
    div.innerHTML = html;
    
    return div.firstChild;
  };
  
  /*
    ui更新
    rate 百分比，例如：35
    params 描述中的参数值
  */
  YprogressBarCore.prototype.update = function(rate, params){
    
    var tenth = 10,
        oneth = 10,
        des = "",
        param = "";
    
    //参数检查
    params = params || {};
    
    //记录当前进度
    this.rate = rate;
    
    //记录当前描述变量
    for(param in params){
      this.paramKeys[param] = params[param];
    }
    
    //将百分比拆分成两个数字
    if(rate < 10){
      oneth = rate;
    }else{
      oneth = rate % 10;
      tenth = parseInt(rate / 10);
    }
    
    //编译模版
    des = this.desTemplate.replace(paramKeysRegex, function(full, group1){
      return params[group1];
    });
    
    //更新遮罩层
    this.domCache.cover.style.width = rate + "%";
    
    //更新ui百分比
    this.domCache.tenth.style.backgroundPosition = positionMap[tenth];
    this.domCache.oneth.style.backgroundPosition = positionMap[oneth];
    
    //更新ui描述
    this.domCache.des.innerText = des;
  };
  
  /*
    显示
  */
  YprogressBarCore.prototype.show = function(){
    this.domCache.box.style.display = "block";
  };
  
  /*
    取消
  */
  YprogressBarCore.destroy = function(id){
    var callback = instances[id].cancelCallback,
        rate = instances[id].rate,
        paramKeys = instances[id].paramKeys,
        key = instances[id].key,
        boxDom = null;
    
    //从实例集合中移除当前实例
    instances[id] = undefined;
    
    //销毁ui
    boxDom = document.querySelector("#y_progress_" + key);
    boxDom.parentNode.removeChild(boxDom);
    
    //通知回调
    //setTimeout的作用是把回调任务放在下一个时间片中，防止阻塞当前方法
    setTimeout(function(){
      callback.call(null, rate, paramKeys);
    },0);
  };
  
  /*
    对外接口仅仅开放一部分核心功能
    options参数需要包含：closeable(是否可关闭) title(标题) des(描述)
    描述中可带参数：{{y: name}}
  */
  function YprogressBar(options){
    //实例化核心，并以私有成员的形式表示
    var instance = new YprogressBarCore(options),
        key = instance.key;
    
    //存入实例集合
    instances[key] = instance;
    
    //销毁当前实例
    instance = null;
    
    //利用闭包，对私有成员key进行访问
    //这里很有学问，首先用arguments.callee获取到当前的类(绝对不能用this，因为this代表的是实例)，也就是function YprogressBar。
    //然后在类上注册新的成员方法，之所以非得在构造方法里注册，就是为了利用闭包访问私有成员
    var thisClass = arguments.callee;
    thisClass.prototype.update = function(rate, params){
      instances[key].update(rate, params);
    };
    thisClass.prototype.show = function(){
      instances[key].show();
    };
    thisClass.prototype.destroy = function(){
      YprogressBarCore.destroy(instances[key].key);
    };
    /*
      此方法供close按钮使用
    */
    thisClass.destroy = function(key){
      YprogressBarCore.destroy(key);
    };
  }
  
  /*
    导出
  */
  exports.YprogressBar = YprogressBar;
  
})(this);


