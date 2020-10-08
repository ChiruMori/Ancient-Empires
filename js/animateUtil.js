'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

/**
 * DOM 动画，使用动画库 animate.css，注意，对子元素使用动画后，无法再次对父元素使用动画，相反可以
 * @param {string} dom HTML 元素ID
 * @param {[string]} animateName 动画名
 * @param {Number} direction 动画方向，0 普通，-1 消失，1 进入（要求在传入本方法前隐藏该元素）
 * @return {Promise}
 */
cxlm.domAnimateWithLib = (domId, animateName, direction = 0) => {
  return new Promise((res, rej) => {
    let dom = document.getElementById(domId);
    if (!dom) rej("DOM 节点非法：" + dom);
    if (direction === 1) {
      dom.style.setProperty('display', ''); // 解除隐藏
    }
    // 为元素添加动画
    dom.classList.add('animate__animated', ...animateName);
    // 监听动画完成事件
    dom.addEventListener('animationend', () => {
      // 移除新增的类
      animateName.forEach(nam => dom.classList.remove(nam));
      dom.classList.remove('animate__animated');
      if (direction === -1) {
        dom.style.setProperty('display', 'none'); // 隐藏元素
      }
      res();
    }, {
      once: true
    });
  });
}

/** 休眠指定毫秒数 */
cxlm.sleep = function (time) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => resolve(), time);
  })
}

/**
 * 节点 CSS 属性动画
 * @param {HtmlElement} ele 需要做动画处理的 html 节点
 * @param {String} attr 动画作用的属性
 * @param {Number} from 属性初始值
 * @param {Number} to 属性结束值
 * @param {Number} frame 动画帧数
 * @param {String} suffix css 属性尾缀
 */
cxlm.domAnimate = (ele, attr, from, to, frame, suffix = '') => new Promise(async (res) => {
  const frameTime = 20;
  let stepValue = (to - from) / frame;
  ele.style[attr] = from + suffix;
  while (Math.abs(from - to) > Math.abs(stepValue)) {
    from += stepValue;
    ele.style[attr] = from + suffix;
    await cxlm.sleep(frameTime);
  }
  res();
});

/**
 * 简化的 Toast 弹窗
 * @param {string} msg 消息文本
 */
cxlm.infoToast = function (msg) {
  cxlm.showToast('light', msg);
}

/**
 * 显示提示框
 * @param {string} level 级别，合法: light, primary, danger, warning
 * @param {string} msg 必须，消息文本
 * @param {string} title 主标题，可缺省
 * @param {string} subTitle 副标题，可缺省
 * @param {string} containerId 容器 DOM id
 */
cxlm.showToast = function (level, msg, title, subTitle = '', containerId = 'toast-container-div') {
  let container = $(`#${containerId}`);
  if (!container[0]) throw '找不到元素：' + containerId;
  // 生成弹窗 ID
  if (!cxlm.toastId) {
    cxlm.toastId = 1;
  }
  let toastId = cxlm.toastId++;
  // 文字样式
  let whiteText = level === 'danger' || level === 'primary';
  let HTML = `<div id="cxlm-toast-${toastId}" class="toast bg-${level}" role="alert" aria-live="assertive" aria-atomic="true">`;
  if (title) { // 消息头部
    HTML += `<div class="toast-header">
          <strong class="mr-auto">${title}</strong>
          <small class="text-muted">${subTitle}</small>
          <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>`;
  }
  // 消息正文
  HTML += `<div class="toast-body font-weight-bold text-${whiteText ? 'light' : 'dark'}" style="white-space: nowrap;">${msg}</div></div>`;
  // 显示弹窗
  let jqObj = $(HTML);
  container.append(jqObj);
  jqObj.toast({
    delay: 2000 // 2 秒后销毁
  }).toast('show');
  jqObj.on('hidden.bs.toast', function () {
    jqObj.remove();
  })
}

/**
 * 加载动画
 * @param {string} cmd 合法值：show, hide
 * @param {string} msg 提示文本
 */
cxlm.toggleLoading = function (cmd, msg = '') {
  if (cmd === 'show' && cxlm.loadingDisplaying !== 'showing') { // 显示动画
    $.LoadingOverlay('show', {
      image: '',
      fontawesome: 'fa fa-spinner fa-spin',
      text: msg,
      textClass: 'hover-loading-text'
    });
    cxlm.loadingDisplaying = 'showing';
  } else if (cmd === 'hide' && cxlm.loadingDisplaying === 'showing') { // 隐藏加载动画
    $.LoadingOverlay('hide');
    cxlm.loadingDisplaying = 'hidden';
  } else {
    console.warn('显示状态不匹配，加载层显示状态：' + cxlm.loadingDisplaying);
  }
}

/**
 * 扩展字符串方法，与 Java 的 hashCode 行为一致
 * @returns {String} 字符串的 Hash 值
 */
String.prototype.hashCode = function () {
  let res = 0;
  for (let charIndex = 0, len = this.length; charIndex < len; charIndex++) {
    res = 31 * res + this.codePointAt(charIndex);
  }
  return res;
}