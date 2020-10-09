'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

// 控制台签名
console.log('%ccxlm.work%c2020.10.01 ~ ?%c',
  'border-radius:3px;padding:3px;background:#000;color:#fff;',
  'border-radius:3px;padding:3px;background:#0af;color:#fff;',
  'background:transparent;');

// 系统基础配置
cxlm.options = {
  scale: 1.5, // 缩放比例，保留，可能会使用
  mapMeta: {
    url: './img/map_texture.png', // 地图材质图片
    width: 391,
    height: 538,
    itemWidth: 48,
    itemHeight: 48,
    border: 1,
  },
  unitMeta: {
    url: './img/unit.png',
    width: 384,
    height: 240,
    itemWidth: 48,
    itemHeight: 48,
    border: 0,
  },
  fragMeta: {
    url: './img/frag_texture.png',
    width: 338,
    height: 168,
  },
  leaderMeta: {
    url: './img/leader.png',
    width: 216,
    height: 978,
    bigWidth: 170,
    smallWidth: 46,
    smallHeight: 48,
  }
}

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
  cxlm.groups = { // TODO: 制作存档时保留
    blue: {}, // leader
    red: {}, // units
    green: {}, // money
    dark: {}, // population
    purple: {}, // active
    yellow: {},
    units: [], // 存放所有单元的二维矩阵
    population: 50,
    turns: -1,
    order: ['blue', 'red', 'green', 'dark', 'purple', 'yellow'],
  };
  cxlm.clickMQ = new cxlm.MessageQueue();
  // 点击地图内合法元素
  cxlm.clickMQ.subscribe('inner', 10).autoControl(msg => {
    cxlm.cursorX = msg.x;
    cxlm.cursorY = msg.y;
    // TODO 全局点击事件处理
    if (!msg.multiClick) {
      cxlm.changeInfo();
      cxlm.clearRange();
      let clickUnit = cxlm.groups.units[msg.y][msg.x];
      if (clickUnit !== undefined) { // 点击了某个单位
        let nowColor = cxlm.groups.order[cxlm.groups.turns];
        if (clickUnit.color === nowColor) { // 点击了己方单位
          cxlm.showReachable(false, clickUnit, clickUnit.move);
        } else { // 点击了非己方单位
          cxlm.showReachable(true, clickUnit, clickUnit.move);
        }
      }
    }
    console.log(msg);
    return true;
  })
  cxlm.toggleLoading('hide');
  // 开始绘制游戏画面
  cxlm.startGame();
}

cxlm.getMapEleMetaOf = function (row, col) {
  let landKey = cxlm.map[row][col];
  if (landKey.indexOf('castle') !== -1) landKey = 'l_castle_blue';
  else if (landKey.indexOf('town') !== -1) landKey = 'l_town_blue';
  return cxlm.mapParts[landKey];
}

// 判断两个单元是否互为敌方
cxlm.enemyTo = function (unit1, unit2) {
  if (unit1 === undefined || unit2 === undefined || unit1.color === unit2.color)
    return false;
  let teamIndex1, teamIndex2;
  for (let i = 0; i < cxlm.team.length; i++) {
    cxlm.team[i].forEach(color => {
      if (unit1.color === color) teamIndex1 = i;
      if (unit2.color === color) teamIndex2 = i;
    })
  }
  return teamIndex1 === teamIndex2;
}

/**
 * 显示可达区域
 * @param {boolean} showAtk 是否同时显示可以攻击的范围
 * @param {object} unit 单元对象，需要根据单位的技能确定范围
 * @param {number} step 可以走的步数，因突击部队的存在，不能使用 unit.step
 */
cxlm.showReachable = function (showAtk, unit, step) {
  let nowMap = [];
  let res = [];
  for (let i = 0; i < cxlm.mapRows; i++) {
    let nowRow = []
    for (let j = 0; j < cxlm.mapCols; j++) {
      let eleMeta = cxlm.getMapEleMetaOf(i, j);
      nowRow[j] = eleMeta.mov;
      // 仅需一个移动点的情况
      if ((eleMeta.type === 'water' && unit.water) || (eleMeta.type === 'land' && unit.land)) {
        nowRow[j] = 1;
      }
      if (cxlm.enemyTo(unit, cxlm.groups.units[i][j])) {
        nowRow[j] = Number.POSITIVE_INFINITY; // 不让敌方通过
      }
      if (unit.air) { // 飞翔的力量
        nowRow[j] = 1;
      }
    }
    nowMap[i] = nowRow;
    res.push([]);
  }
  let attack = function (row, col) {
    if (unit.isBland) {
      res[row][col] = 2; // 打得到自己
      return;
    }
    let reachIfInBound = function (r, c) {
      if (r >= 0 && c >= 0 && r < cxlm.mapRows && c < cxlm.mapCols) { // 越界判定
        res[row][col] = 2; // 打得到
      }
    }
    for (let nowReach = unit.rangeMin; nowReach <= unit.rangeMax; nowReach++) {
      for (let r = row - nowReach, c = col; r < row; r++, c++) reachIfInBound(r, c); // ↘
      for (let r = row, c = col + nowReach; c > col; r++, c--) reachIfInBound(r, c); // ↙
      for (let r = row + nowReach, c = col; r > row - nowReach; r--, c--) reachIfInBound(r, c); // ↖
      for (let r = row, c = col - nowReach; c < col; r--, c++) reachIfInBound(r, c); // ↗
    }
  }
  // 搜索（迪杰斯特拉）
  let bfsQueue = new cxlm.PriorityQueue((a, b) => a.step - b.step);
  bfsQueue.offer({ // 起点
    row: unit.y,
    col: unit.x,
    step: 0
  });
  let getKey = (r, c) => r + ',' + c;
  let startKey = getKey(unit.y, unit.x);
  let covered = {};
  covered[startKey] = true;
  const dir = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];
  while (!bfsQueue.isEmpty()) {
    let nowNode = bfsQueue.shift();
    dir.forEach(nowDir => {
      let newRow = nowNode.row + nowDir[0];
      let newCol = nowNode.col + nowDir[1];
      if (newRow >= cxlm.mapRows || newRow < 0 || newCol >= cxlm.mapCols || newCol < 0) return;
      let nowMapEle = nowMap[newRow][newCol];
      let nowKey = getKey(newRow, newCol);
      if (nowMapEle !== Number.POSITIVE_INFINITY && !covered[nowKey] && nowNode.step + nowMapEle <= step) {
        bfsQueue.offer({
          row: newRow,
          col: newCol,
          step: nowNode + nowMapEle,
        });
        covered[nowKey] = true;
      }
    })
    if (cxlm.groups.units[nowNode.row][nowNode.col] === undefined) { // 没有人站在上面
      res[nowNode.row][nowNode.col] = 1; // 可达
      if (showAtk) attack(nowNode.row, nowNode.col); // 计算可达区域
    }
  }
  for (let r = 0; r < cxlm.mapRows; r++) {
    for (let c = 0; c < cxlm.mapCols; c++) {
      if (res[r][c] === 1) {
        cxlm.newRangeCube(c, r, 'yellow');
      } else if (res[r][c] === 2) {
        cxlm.newRangeCube(c, r, 'red');
      }
    }
  }
}

// 更新底部信息栏
cxlm.changeInfo = function () {
  let unit = cxlm.groups.units[cxlm.cursorY][cxlm.cursorX];
  let unitMeta = {
    x: 1000,
    y: 1000
  }
  if (unit !== undefined) {
    unitMeta = cxlm.unitParts[cxlm.groups.units[cxlm.cursorY][cxlm.cursorX].unit + '1'];
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
 * 在画布指定位置绘制颜色转换后的图像
 * @param {CanvasImageSource} img 原图像
 * @param {number} x 原图坐标
 * @param {number} y 原图坐标
 * @param {number} wid 原图截取宽度
 * @param {number} hei 原图截取高度
 * @param {number} targetX 目标坐标
 * @param {number} targetY 目标坐标
 * @param {string} targetColor 需要转换成的颜色，合法值为：red, green, dark, purple, yellow
 */
cxlm.drawColorChangedImg = function (img, x, y, wid, hei, targetX, targetY, targetColor) {
  if (!cxlm.vcanvas) {
    // 创建虚拟画布
    cxlm.vcanvas = $('<canvas id="vcanvas" width="100", height="100"></canvas>');
    // 禁用 smooth
    cxlm.vcanvas[0].imageSmoothingEnabled = false;
    cxlm.vcanvas[0].mozImageSmoothingEnabled = false;
    cxlm.vcanvas[0].webkitImageSmoothingEnabled = false;
    cxlm.vcanvas[0].msImageSmoothingEnabled = false;
  }
  let vctx = cxlm.vcanvas[0].getContext('2d');
  vctx.clearRect(0, 0, 100, 100);
  // 绘制到虚拟画布
  vctx.drawImage(img, x, y, wid, hei, 0, 0, wid, hei);
  let sourceData = vctx.getImageData(0, 0, wid, hei); // 获取虚拟画布上的图像数据
  let dat = sourceData.data;
  // 转换颜色
  for (let i = 0; i < dat.length; i += 4) {
    for (let j = 0; j < cxlm.colorMap.blue.length; j++) {
      let rgbBlue = cxlm.colorMap.blue[j];
      if (dat[i] === rgbBlue[0] &&
        dat[i + 1] === rgbBlue[1] &&
        dat[i + 2] === rgbBlue[2]) {
        dat[i] = cxlm.colorMap[targetColor][j][0];
        dat[i + 1] = cxlm.colorMap[targetColor][j][1];
        dat[i + 2] = cxlm.colorMap[targetColor][j][2];
      }
    }
  }
  vctx.putImageData(sourceData, 0, 0, 0, 0, wid, hei); // 绘制回虚拟画布
  // 缩放绘制
  cxlm.ctx.drawImage(cxlm.vcanvas[0], 0, 0, wid, hei, targetX, targetY, wid * cxlm.options.scale + 1, hei * cxlm.options.scale + 1);
}

// 绘制地图
cxlm.drawMap = function () {
  let w = cxlm.options.mapMeta.itemWidth,
    h = cxlm.options.mapMeta.itemHeight;
  // 填充背景
  cxlm.ctx.fillStyle = 'black';
  cxlm.ctx.fillRect(0, 0, cxlm.canvasWidth, cxlm.canvasHeight);
  // 绘制地图
  let nowX, nowY = cxlm.offsetY + cxlm.dragOffsetY;
  for (let r = 0; r < cxlm.map.length; r++) {
    let row = cxlm.map[r];
    nowX = cxlm.offsetX + cxlm.dragOffsetX;
    for (let c = 0; c < row.length; c++, nowX += w * cxlm.options.scale) {
      let mapName = row[c];
      if (cxlm.mapParts[mapName] === undefined) {
        console.error `指定的地图元素[${mapName}]不存在，请检查`;
        continue;
      }
      // 超出绘制区域，跳过绘制
      if (nowX < -w || nowX - w > cxlm.canvasWidth || nowY < -h || nowY - h > cxlm.canvasHeight) continue;
      if ((mapName.startsWith('l_castle_') || mapName.startsWith('l_town_')) && !mapName.endsWith('blue')) {
        // 需变色
        let divPoint = mapName.lastIndexOf('_') + 1;
        let targetColor = mapName.substring(divPoint);
        let prefix = mapName.substring(0, divPoint);
        cxlm.drawColorChangedImg(cxlm.mapImgDom, cxlm.mapParts[prefix + 'blue'].x, cxlm.mapParts[prefix + 'blue'].y, w, h, nowX, nowY, targetColor);
      } else {
        cxlm.ctx.drawImage(cxlm.mapImgDom,
          cxlm.mapParts[mapName].x,
          cxlm.mapParts[mapName].y,
          w, h, nowX, nowY,
          w * cxlm.options.scale + 1, h * cxlm.options.scale + 1); // 缩放补偿
      }
      if (mapName.startsWith('l_castle_')) { // 城堡，需在其上方补充一个盖子，即使越界也要画
        cxlm.ctx.drawImage(cxlm.mapImgDom,
          cxlm.mapParts['l_cas_head'].x,
          cxlm.mapParts['l_cas_head'].y,
          w, h, nowX, nowY - h * cxlm.options.scale,
          w * cxlm.options.scale + 1, h * cxlm.options.scale + 1); // 缩放补偿
      }
    }
    nowY += h * cxlm.options.scale;
  }
}

/** 绘制单元
 * TODO: 单元状态
 */
cxlm.drawUnits = function () {
  cxlm.groups.order.forEach(async color => {
    let nowGroup = cxlm.groups[color];
    if (!nowGroup.active) return;
    if (nowGroup.leader) {
      nowGroup.leader.draw();
    }
    if (!nowGroup.units) return;
    for (let nowUnit of nowGroup.units) {
      nowUnit.draw();
    }
  });
}

/** 绘制光标 */
cxlm.drawCursor = function () {
  let step = ((cxlm.clock / 30) & 1) + 1;
  let cursorMeta = cxlm.fragments['cube' + step];
  let mapItemWid = cxlm.options.mapMeta.itemWidth * cxlm.options.scale;
  let mapItemHei = cxlm.options.mapMeta.itemHeight * cxlm.options.scale;
  let targetX = cxlm.offsetX + cxlm.cursorX * mapItemWid + cxlm.dragOffsetX;
  let targetY = cxlm.offsetY + cxlm.cursorY * mapItemHei + cxlm.dragOffsetY;
  targetX -= (cursorMeta.width * cxlm.options.scale - mapItemWid) >> 1;
  targetY -= (cursorMeta.height * cxlm.options.scale - mapItemHei) >> 1;
  cxlm.ctx.drawImage(cxlm.fragImg, cursorMeta.x, cursorMeta.y,
    cursorMeta.width, cursorMeta.height, targetX, targetY,
    cursorMeta.width * cxlm.options.scale, cursorMeta.height * cxlm.options.scale);
}

/** 绘制范围提示网格 */
cxlm.drawRange = function () {
  if (!cxlm.range) return;
  cxlm.range.forEach(cube => {
    let rect = cxlm.fragments[cube.color + '_rect'];
    cxlm.ctx.drawImage(cxlm.fragImg, rect.x, rect.y, rect.width, rect.height,
      cxlm.offsetX + cube.x * cxlm.options.mapMeta.itemWidth * cxlm.options.scale + ((cxlm.options.mapMeta.itemWidth - rect.width) >> 1),
      cxlm.offsetY + cube.y * cxlm.options.mapMeta.itemHeight * cxlm.options.scale + ((cxlm.options.mapMeta.itemHeight - rect.height) >> 1),
      rect.width * cxlm.options.scale, rect.height * cxlm.options.scale);
  });
}

cxlm.newRangeCube = (x, y, color) => {
  if (cxlm.range === undefined) {
    cxlm.range = [];
  }
  cxlm.range.push({
    x,
    y,
    color
  });
}

cxlm.clearRange = () => delete cxlm.range;

cxlm.nextTurn = function () {
  cxlm.groups.turns++;
  while (!cxlm.groups[cxlm.groups.order[cxlm.groups.turns]].active) {
    cxlm.groups.turns++;
  }
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
 * 启动绘制逻辑
 */
cxlm.startGame = function () {
  // 地图行列数
  let mapRows = cxlm.map.length;
  let mapCols = cxlm.map[0].length;
  cxlm.mapRows = mapRows;
  cxlm.mapCols = mapRows;
  for (let i = 0; i < mapRows; i++) {
    cxlm.groups.units[i] = [];
  }
  // 初始化光标位置
  cxlm.cursorX = mapRows >> 1;
  cxlm.cursorY = mapCols >> 1;
  // 可绘制区域宽高
  let drawWidth = mapCols * cxlm.options.mapMeta.itemWidth * cxlm.options.scale;
  let drawHeight = mapRows * cxlm.options.mapMeta.itemHeight * cxlm.options.scale;
  // 绘制区域偏移量
  cxlm.offsetX = ~~((cxlm.canvasWidth - drawWidth) / 2);
  cxlm.offsetY = ~~((cxlm.canvasHeight - drawHeight) / 2);
  cxlm.mainLoopStarted = true;
  // 启用监听函数
  cxlm.canvas.on('click', event => {
    if (cxlm.dragStartX !== event.offsetX || cxlm.dragStartY !== event.offsetY) return; // 拖拽事件
    cxlm.clickMQ.offer(new cxlm.ClickMessage(event.offsetX, event.offsetY)); // 交由消息队列进行分发
  });
  // 监听拖拽
  cxlm.dragOffsetX = cxlm.dragOffsetY = 0;
  let down = function (x, y, touch = false) {
    cxlm.dragMode = !touch;
    cxlm.dragStartX = x;
    cxlm.dragStartY = y;
  }
  cxlm.canvas[0].onmousedown = event => down(event.offsetX, event.offsetY);
  cxlm.canvas[0].ontouchstart = event => down(event.touches[0].pageX, event.touches[0].pageY, true);
  let up = function (x, y, touch = false) {
    if (!cxlm.dragMode && !touch) return;
    cxlm.dragMode = false;
    if (cxlm.dragStartX !== x || cxlm.dragStartY !== y) {
      cxlm.offsetY += (y - cxlm.dragStartY);
      cxlm.offsetX += (x - cxlm.dragStartX);
      // 防止地图完全脱离绘制区域
      cxlm.offsetX = Math.max(-(mapCols - 1) * cxlm.options.mapMeta.itemWidth * cxlm.options.scale, cxlm.offsetX);
      cxlm.offsetY = Math.max(-(mapRows - 1) * cxlm.options.mapMeta.itemHeight * cxlm.options.scale, cxlm.offsetY);
      cxlm.offsetX = Math.min(cxlm.canvasWidth - cxlm.options.mapMeta.itemWidth * cxlm.options.scale, cxlm.offsetX);
      cxlm.offsetY = Math.min(cxlm.canvasHeight - cxlm.options.mapMeta.itemHeight * cxlm.options.scale, cxlm.offsetY);
    }
    if (touch) {
      cxlm.dragStartX = x;
      cxlm.dragStartY = y;
    }
    cxlm.dragOffsetX = 0;
    cxlm.dragOffsetY = 0;
  }
  cxlm.canvas[0].onmouseup = event => up(event.offsetX, event.offsetY);
  cxlm.canvas[0].onmouseleave = () => {
    cxlm.dragMode = false;
    cxlm.dragOffsetX = 0;
    cxlm.dragOffsetY = 0;
  };
  cxlm.canvas[0].ontouchmove = event => up(event.touches[0].pageX, event.touches[0].pageY, true);
  cxlm.canvas[0].onmousemove = event => {
    if (cxlm.dragMode) {
      cxlm.dragOffsetX = event.offsetX - cxlm.dragStartX;
      cxlm.dragOffsetY = event.offsetY - cxlm.dragStartY;
    }
  };
  // 初始化单元
  cxlm.initRoles.forEach(roleRaw => {
    let role = new cxlm.Role(roleRaw[0], roleRaw[1], roleRaw[2]);
    let toGroup = cxlm.groups[role.color];
    toGroup.active = true;
    if (role.isLeader) {
      toGroup.leader = role;
    } else {
      if (!toGroup.units) {
        toGroup.units = [];
      }
      toGroup.units.push(role);
    }
    cxlm.groups.units[role.x][role.y] = role;
  })
  cxlm.clock = 0; // 绘图时钟
  // TODO: 拓展存档加载功能
  cxlm.changeInfo();
  // 获取剧情
  if (!cxlm.storyIndex) { // 没有获取到存档，重新开始
    cxlm.storyIndex = 0; // TODO 存档时保留
    cxlm.storyShowing = false;
  }
  $('#story-area').click(() => cxlm.clickMQ.offer(new this.ClickMessage(-1, -1))); // 点击剧情区域时，生成一个越界点击事件
  // 启动主循环
  let loop = function () {
    if (cxlm.mainLoopStarted) {
      cxlm.mainLoop = requestAnimationFrame(loop);
      cxlm.clock++;
      if (cxlm.clock >= 1024) cxlm.clock = 0;
      cxlm.drawMap();
      cxlm.drawUnits();
      cxlm.drawRange(); // 绘制范围提示
      cxlm.drawCursor(); // 绘制光标
      if (!cxlm.storyShowing && cxlm.storyLine.length > cxlm.storyIndex && cxlm.storyLine[cxlm.storyIndex].startCondition()) {
        cxlm.story('show', cxlm.storyLine[cxlm.storyIndex].text[0][0], cxlm.storyLine[cxlm.storyIndex].text[0][1]);
        cxlm.storyShowing = true;
        cxlm.nowStoryIndex = 1;
        // 监听阻塞事件直到当前故事结束
        cxlm.clickMQ.subscribe('*', 999).autoControl(() => {
          let storyArr = cxlm.storyLine[cxlm.storyIndex].text;
          if (cxlm.nowStoryIndex >= storyArr.length) {
            cxlm.storyLine[cxlm.storyIndex].effect(); // 发动剧情效果
            cxlm.story('hide');
            cxlm.storyIndex++; //  进入下一个剧情
            return cxlm.storyShowing = false;
          }
          cxlm.story('show', storyArr[cxlm.nowStoryIndex][0], storyArr[cxlm.nowStoryIndex][1])
          cxlm.nowStoryIndex++;
          return true;
        });
      }
      // TODO: 绘制其他元素
    }
  }
  loop();
}

$().ready(() => {
  cxlm.toggleLoading('show', 'Loading...'); // 显示加载动画
  cxlm.mainContainer = $('#main-container'); // 游戏面板主容器
  // 初始游戏菜单
  let btnGroup = $('#btn-container');
  cxlm.btnGroup = btnGroup;
  // 柯里化
  cxlm.futureReset = (optArgs, parent = null) => () => cxlm.resetBtnGroup(optArgs, parent);
  // 重设按钮
  cxlm.resetBtnGroup = async function (optArgs, parent, newContext = false) {
    if (!optArgs instanceof Array) throw '参数非法：' + optArgs;
    if (!newContext) { // 需要清除原按钮组
      await cxlm.domAnimateWithLib('start-menu-container', ['animate__fadeOutLeft'], -1);
    }
    // 清空按钮组内所有按钮
    btnGroup.html('');
    optArgs.forEach(opt => {
      // 生成新的按钮
      let nowBtn = $(`<div class="start-btn">${opt.showText}</div>`);
      if (opt.back) { // 绑定方法：返回上一级菜单
        nowBtn.on('click', cxlm.futureReset(parent, optArgs));
      } else if (typeof opt.cb === 'function') { // 执行回调函数
        nowBtn.on('click', opt.cb);
      } else { // 进入子级菜单
        nowBtn.on('click', cxlm.futureReset(opt.son, optArgs));
      }
      btnGroup.append(nowBtn);
    });
    if (!newContext) { // 需要使用进入动画
      await cxlm.domAnimateWithLib('start-menu-container', ['animate__fadeInRight'], 1);
    }
  }
  cxlm.resetBtnGroup(cxlm.optionTree, null, true); // 将按钮放入按钮组
  // 显示按钮组
  cxlm.domAnimateWithLib('start-menu-container', ['animate__backInDown'], 1);
  cxlm.toggleLoading('hide'); // 隐藏加载动画
});