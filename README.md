#简介#
  
YprogressBar是一款基于HTML5的进度条插件。  
YprogressBar是一款轻量级进度条插件，使用方便，资源占用少，模仿好压的解压界面，带有数字显示，同时支持在描述中增加参数，以动态显示更详细的执行信息，比如上传速度、剩余时间等等。  
YprogressBar代码书写简洁，结构设计合理，不会给您的系统带来不良影响。  
  
#使用说明#
  
##文件引用##
  
只需引用yprogressbar.css和yprogressbar.js文件即可。  
  
##使用概览##
  
    var ypb = new YprogressBar({
      title: "正在上传文件...",
      des: "上传速度：{{y:speed}}MB/秒 剩余时间约{{y:second}}秒",
      closeable: true,
      cancelCallback: function(rate, vars){
    console.log(rate);
    console.log(vars);
      }
    });
    ypb.show();
  
##实例化参数说明##
  
为了尽显面向对象逼格，要想使用YprogressBar，总得实例化一下吧，而实例化的时候，是需要一些参数的，整体上就是一个object，具体参数接下来一一说明。  
  
####title####
  
进度条标题，说明下这个进度条是干嘛的。  
  
####des####
  
对要做的事情进行更详细的描述，可以直接写一句话。  
有时候我们想搞点花样，比如说显示上传速度、剩余时间什么的，YprogressBar完全支持你这样做，只需要在描述中加入变量即可，格式：{{y:name}}。  
例如：des: "上传速度：{{y:speed}}MB/秒 剩余时间约{{y:second}}秒"，这里的{{y:speed}}和{{y:second}}就是变量。  
如果此处指定了变量，在做update操作时，必须在第二个参数中指定变量的值。  
  
####closeable####
  
右上角是否出现关闭按钮。  
  
####cancelCallback####
  
销毁回调。YprogressBar一旦被销毁，无论是手动调用destroy方法，还是用户点击关闭按钮，都会触发此回调。  
回调触发时，会传入两个参数，分别是：当前执行进度、此刻描述中的参数值(object中包含name、value)。  
  
####show方法####
  
无需任何参数。  
调用show方法后进度条才会显示。  
  
####update方法####
  
更新进度，两个参数。  
第一个参数是当前进度，直接用数字表示，例如：26，代表26%。  
第二个参数是一个object，需要包含描述中所有变量的值。如果描述中无变量，此参数可以忽略。  
  
######示例######
  
    ypb.update(26,{
      speed: 312,
      second: 5
    });
  
####destroy方法####
  
销毁进度条，释放内存。  
  