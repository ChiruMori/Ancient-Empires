'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

// 按钮层级关系
cxlm.optionTree = [{
  showText: '登录账号',
  cb: () => cxlm.showToast('warning', '账号机制正在开发'),
}, {
  showText: '教学关卡',
  son: [{
    showText: '战斗的基本',
    cb: () => cxlm.toggleToGame('initial1'),
  }, {
    showText: '修理、占领与招募',
    cb: () => cxlm.showToast('danger', '游戏主体正在开发'),
  }, {
    showText: '准备战斗！',
    cb: () => cxlm.showToast('danger', '游戏主体正在开发'),
  }, {
    showText: '返回',
    back: true,
  }],
}, {
  showText: '单人战役',
  son: [{
    showText: '战役1',
    cb: () => cxlm.showToast('danger', '游戏主体正在开发'),
  }, {
    showText: '返回',
    back: true,
  }]
}, {
  showText: '多人游戏',
  cb: () => cxlm.showToast('warning', '联机模式正在开发'),
}, {
  showText: '关于本页',
  cb: () => cxlm.showToast('primary', '远古帝国仿作'),
}];

/**
 * 切换底部数据栏颜色
 * @param {string} from 合法属性：primary, secondary, success, danger, warning
 * @param {string} to 合法属性：primary, secondary, success, danger, warning
 */
cxlm.toggleToastGroup = function (from, to) {
  const dataBar = $('#alert-group .alert-item');
  dataBar.removeClass('alert-' + from);
  dataBar.addClass('alert-' + to);
}

/**
 * 显示、隐藏游戏菜单
 * @param show 需要显示菜单
 */
cxlm.toggleGameMenu = function (show) {
  if (cxlm.gameMenu && show) {
    console.warn('重复激活：游戏菜单已显示');
    return Promise.resolve();
  } else if (!show && !cxlm.gameMenu) {
    console.warn('重复隐藏：游戏菜单尚未显示');
    return Promise.resolve();
  }
  cxlm.gameMenu = show;
  if (show) {
    return Promise.all([ // 显示导航栏、数据栏
      cxlm.domAnimateWithLib('header-navbar', ['animate__slideInDown'], 1),
      cxlm.domAnimateWithLib('alert-group', ['animate__slideInUp'], 1),
    ]);
  } else {
    return Promise.all([ // 隐藏导航栏、数据栏
      cxlm.domAnimateWithLib('header-navbar', ['animate__slideOutUp'], -1),
      cxlm.domAnimateWithLib('alert-group', ['animate__slideOutDown'], -1),
    ])
  }
}

/**
 * 菜单切换到游戏界面
 * @param {string} missionName 战役名 
 */
cxlm.toggleToGame = async function (missionName) {
  cxlm.toggleLoading('show', 'Loading...');
  cxlm.toggleGameMenu(true);
  await cxlm.resetBtnGroup([], null);
  cxlm.canvas = $('#main-canvas');
  cxlm.ctx = cxlm.canvas[0].getContext('2d'); // 获取画笔
  document.getElementById('start-menu-container').style.setProperty('display', 'none'); // 隐藏按钮组
  // 设置画布尺寸
  if (window.innerWidth < 1000) {
    // 窄屏
    cxlm.canvas[0].style.removeProperty('margin-left');
    cxlm.canvasWidth = innerWidth;
    cxlm.canvasHeight = ~~(window.innerHeight * 0.6);
  } else {
    cxlm.canvas[0].style.setProperty('margin-left', ~~(window.innerWidth * 0.1) + 'px');
    cxlm.canvasWidth = ~~(window.innerWidth * 0.8);
    cxlm.canvasHeight = ~~(window.innerHeight * 0.8);
  }
  cxlm.canvas.width(cxlm.canvasWidth); // 画布宽
  cxlm.canvas.attr('width', cxlm.canvasWidth);
  cxlm.canvas.height(cxlm.canvasHeight); // 画布高
  cxlm.canvas.attr('height', cxlm.canvasHeight);
  // 显示主容器
  await cxlm.domAnimateWithLib('main-container', ['animate__fadeIn'], 1);
  $('#main-container').height(window.innerHeight - 110); // 设定容器高度（scroll）
  cxlm.loadGame = undefined; // 清除游戏加载状态
  // 获取战役数据
  let missionData = null;
  await cxlm.requestMission(missionName).then(data => missionData = data);
  $('body').append($(`<script src="${missionData.url}"></script>`)); // 注入游戏脚本
  while (typeof cxlm.loadGame !== 'function') {
    console.log('等待脚本加载');
    await cxlm.sleep(999); // 等待脚本加载完毕
  }
  await Promise.all([cxlm.loadGame(), // 加载游戏数据
    cxlm.initMapMetaData(), // 加载地图元数据
    cxlm.initUnitMetaData(), // 加载单元元数据
    cxlm.initLeaderMetaData(), // 加载领主元数据
    cxlm.initFragMetaData(), // 加载其他必要碎片
  ]);

  cxlm.initModalMenu(); // 初始化招募菜单
  cxlm.toggleLoading('hide');
  // 开始绘制游戏画面
  cxlm.startGame();
}

// 更新底部信息栏
cxlm.changeInfo = function () {
  let unit = cxlm.groups.units[cxlm.cursorY][cxlm.cursorX];
  let unitMeta = {
    x: 1000,
    y: 1000
  }
  if (unit !== undefined) {
    unitMeta = cxlm.unitParts[unit.unit + '1'];
  }
  let land = cxlm.getMapEleMetaOf(cxlm.cursorY, cxlm.cursorX);
  if (!unit) {
    unit = {
      hp: '-',
      hpMax: '-',
      atk: '-',
      def: '-',
      defAdd: '-',
      move: '-',
    }
  }
  $('#unit-hp').text(`${unit.hp}/${unit.hpMax}`);
  if (unit.exp) {
    $('#unit-ex').text(`${unit.exp}/${unit.level + 1}00`);
  } else {
    $('#unit-ex').text('-/-');
  }
  $('#unit-atk').text(unit.atk);
  $('#unit-def').text(unit.def);
  $('#unit-buf').text(unit.defAdd);
  $('#unit-mov').text(unit.move);
  // TODO 单元描述
  if (unit.isLeader) {
    $('#unit-img')[0].style.setProperty('background-image', `url(./img/leader.png)`);
    $('#unit-img')[0].style.setProperty('background-position', `-${cxlm.leaders['leader_' + unit.color].small1.x}px -${cxlm.leaders['leader_' + unit.color].small1.y}px`);
  } else {
    $('#unit-img')[0].style.setProperty('background-image', `url(./img/unit.png)`);
    $('#unit-img')[0].style.setProperty('background-position', `-${unitMeta.x}px -${unitMeta.y}px`);
  }
  $('#land-def').text(land.def);
  $('#land-mov').text(land.mov);
  $('#land-coin').text(land.coin);
  // TODO 地形描述
  $('#land-img')[0].style.setProperty('background-position', `-${land.x}px -${land.y}px`);
}


/**
 * 显示剧情，mode 指定显示或隐藏
 * @param {string} mode 合法值：show, hide
 * @param {string} color 角色名
 * @param {string} text 剧情文字
 */
cxlm.story = function (mode, color, text) {
  let jqDom = $('#story-area');
  if (mode === 'hide') {
    jqDom[0].style.setProperty('display', 'none');
    return;
  } else if (!cxlm.leaders) {
    console.error('数据未加载，必须确保游戏数据加载完成后调用本方法');
  } else {
    jqDom[0].style.setProperty('display', '');
    let storyRole = $('#story-role');
    storyRole[0].style.setProperty('background-position', cxlm.leaders['leader_' + color].big.x + 'px -' + cxlm.leaders['leader_' + color].big.y + 'px');
    storyRole.width(cxlm.leaders['leader_' + color].big.width);
    storyRole.height(cxlm.leaders['leader_' + color].big.height);
    $('#story-text').text(text);
  }
}

/**
 * 显示行动盘区域
 * @param {string} mode show / hide
 * @param {[string]} actions 要显示的行动
 */
cxlm.toggleActions = function (mode, actions) {
  if (mode === 'show') {
    if (cxlm.actionShowing) throw '行动盘已在显示';
    cxlm.actionShowing = true;
    actions.forEach(act => {
      $('#act-' + act).removeClass('d-none');
    })
    cxlm.domAnimateWithLib('actions-area', ['animate__fadeInLeft'], 1);
  } else {
    if (!cxlm.actionShowing) throw '行动盘未显示';
    cxlm.actionShowing = false;
    cxlm.domAnimateWithLib('actions-area', ['animate__fadeOutLeft'], -1).then(() => $('.action-item').addClass('d-none'));
  }
}

/**
 * 初始化招募菜单
 * TODO: 根据当前状态（人口上限、金币是否充足等）设置单元是否可以招募
 * TODO: 绑定点击监听（点击招募后向事件中心发送消息）
 * TODO: 弹窗切换（toggle），参考代码：$('#recruitModal').modal('show')
 */
cxlm.initModalMenu = function () {
  let btnContainer = $('#modalUnits');
  btnContainer.html('');
  const listUnits = [
    'soldier', 'ghost', 'merman', 'archer', 'slime',
    'water', 'dark', 'wizard', 'paladin', 'spirit',
    'berserker', 'wolf', 'rock', 'ice', 'druid',
    'catapult', 'wolfarcher', 'dragon', 'skull'
  ];
  listUnits.forEach(unitName => {
    let unitMeta = cxlm.unitParts[unitName + '1'];
    let HTML = `<div class="col"><div class="modalUnitItem" style="background-position: -${unitMeta.x}px -${unitMeta.y}px"></div></div>`;
    btnContainer.append($(HTML));
  })
}