'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

// 服务器 URL 前缀
cxlm.serverBase = 'https://cxlm.work/empires/';
// 发送 Ajax 请求，获取数据
cxlm.request = function (api, method, data) {

}

/**
 * 请求战役名称
 * @param {string} missionName 战役名称
 */
cxlm.requestMission = async (missionName) => new Promise((res, rej) => {
  if (cxlm.localData.has(missionName)) {
    res(cxlm.localData.get(missionName));
  } else {
    // TODO: 网络请求，并缓存
    cxlm.request().then(data => res(data)).catch(err => rej(err));
  }
});