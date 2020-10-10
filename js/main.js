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

cxlm.groups = { // TODO: 制作存档时保留
  blue: {}, // leader
  red: {}, // units
  green: {}, // money
  dark: {}, // population
  purple: {}, // active
  yellow: {},
  units: [], // 存放所有单元的二维矩阵
  population: 50,
  turns: 0,
  orderIndex: -1,
  order: ['blue', 'red', 'green', 'dark', 'purple', 'yellow'],
};

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
  return teamIndex1 !== teamIndex2;
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
      if (r >= 0 && c >= 0 && r < cxlm.mapRows && c < cxlm.mapCols && res[r][c] !== 1) { // 越界判定
        res[r][c] = 2; // 打得到
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
  let bfsQueue = new cxlm.PriorityQueue((a, b) => b.step - a.step);
  bfsQueue.offer({ // 起点
    row: unit.y,
    col: unit.x,
    step: 0,
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
          step: nowNode.step + nowMapEle,
        });
        covered[nowKey] = true;
      }
    })
    // 没有人站在上面，或者只有自己站在上面
    if (cxlm.groups.units[nowNode.row][nowNode.col] === undefined || cxlm.groups.units[nowNode.row][nowNode.col] === unit) {
      res[nowNode.row][nowNode.col] = 1; // 可达
      if (showAtk) attack(nowNode.row, nowNode.col); // 计算可攻击区域
    }
  }
  res[unit.y][unit.x] = 1; // 不动
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

cxlm.nextTurn = function () {
  cxlm.groups.turns++;
  cxlm.groups.orderIndex++;
  cxlm.groups.orderIndex %= cxlm.groups.order.length;
  while (!cxlm.groups[cxlm.groups.order[cxlm.groups.orderIndex]].active) {
    cxlm.groups.orderIndex++;
    cxlm.groups.orderIndex %= cxlm.groups.order.length;
  }
  cxlm.clearRange();
}

// 行动盘点击事件
cxlm.actMsg = (act) => cxlm.clickMQ.offer(new cxlm.ActionMessage(act, cxlm.actSub.unit));

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
    cxlm.groups.units[role.y][role.x] = role;
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
  cxlm.nextTurn(); // 开始第一轮
  // 启动主循环
  let loop = function () {
    if (cxlm.mainLoopStarted) {
      cxlm.mainLoop = requestAnimationFrame(loop);
      cxlm.clock++;
      if (cxlm.clock >= 1024) cxlm.clock = 0;
      cxlm.drawMap();
      cxlm.drawRange(); // 绘制范围提示
      cxlm.drawUnits();
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