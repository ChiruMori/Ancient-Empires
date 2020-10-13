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

cxlm.getKey = (r, c) => r + ',' + c;

cxlm.getMapEleMetaOf = function (row, col) {
  let landKey = cxlm.map[row][col];
  if (landKey.indexOf('castle') !== -1) landKey = 'l_castle_blue';
  else if (landKey.indexOf('town') !== -1) landKey = 'l_town_blue';
  return cxlm.mapParts[landKey];
}

// 判断两个单元（颜色）是否互为敌方
cxlm.enemyTo = function (unit1, unit2) {
  if (unit1 === undefined || unit2 === undefined || unit1 === unit2 ||
    (typeof unit1 === 'object' && unit1.color === unit2.color))
    return false;
  let teamIndex1, teamIndex2 = -1;
  for (let i = 0; i < cxlm.team.length; i++) {
    cxlm.team[i].forEach(color => {
      if (unit1 === color || unit1.color === color) teamIndex1 = i;
      if (unit2 === color || unit2.color === color) teamIndex2 = i;
    })
  }
  return teamIndex1 !== teamIndex2 || teamIndex2 === -1;
}

// 制作可用于图算法的矩阵
cxlm.makeGraph = function (unit) {
  let nowGraph = [];
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
    nowGraph[i] = nowRow;
  }
  return nowGraph;
}

// 显示攻击范围
cxlm.showAttack = function (row, col, unit) {
  if (unit.isBland) {
    cxlm.newRangeCube(col, row, 'red');
    return;
  }
  let reachIfInBound = function (r, c) {
    let thisKey = cxlm.getKey(r, c);
    if (r >= 0 && c >= 0 && r < cxlm.mapRows && c < cxlm.mapCols && (!cxlm.range || cxlm.range[thisKey] === undefined)) { // 越界判定
      cxlm.newRangeCube(c, r, 'red');
    }
  }
  for (let nowReach = unit.rangeMin; nowReach <= unit.rangeMax; nowReach++) {
    for (let r = row - nowReach, c = col; r < row; r++, c++) reachIfInBound(r, c); // ↘
    for (let r = row, c = col + nowReach; c > col; r++, c--) reachIfInBound(r, c); // ↙
    for (let r = row + nowReach, c = col; r > row - nowReach; r--, c--) reachIfInBound(r, c); // ↖
    for (let r = row, c = col - nowReach; c < col; r--, c++) reachIfInBound(r, c); // ↗
  }
}

/**
 * 显示可达区域
 * @param {boolean} showAtk 是否同时显示可以攻击的范围
 * @param {object} unit 单元对象，需要根据单位的技能确定范围
 * @param {number} step 可以走的步数，因突击部队的存在，不能使用 unit.step
 */
cxlm.showReachable = function (showAtk, unit, step) {
  let nowMap = cxlm.makeGraph(unit);
  let res = [];
  for (let i = 0; i < cxlm.mapRows; i++) {
    res.push([]);
  }
  // 搜索（迪杰斯特拉）
  let bfsQueue = new cxlm.PriorityQueue((a, b) => b.step - a.step);
  bfsQueue.offer({ // 起点
    row: unit.y,
    col: unit.x,
    path: [
      [unit.y, unit.x]
    ],
    step: 0,
  });
  let startKey = cxlm.getKey(unit.y, unit.x);
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
      let nowKey = cxlm.getKey(newRow, newCol);
      if (nowMapEle !== Number.POSITIVE_INFINITY && !covered[nowKey] && nowNode.step + nowMapEle <= step) {
        let nowPath = nowNode.path.slice();
        nowPath.push([newRow, newCol]);
        bfsQueue.offer({
          row: newRow,
          col: newCol,
          step: nowNode.step + nowMapEle,
          path: nowPath,
        });
        covered[nowKey] = true;
      }
    })
    // 没有人站在上面，或者只有自己站在上面
    if (cxlm.groups.units[nowNode.row][nowNode.col] === undefined || cxlm.groups.units[nowNode.row][nowNode.col] === unit) {
      res[nowNode.row][nowNode.col] = nowNode.path; // 可达
      if (showAtk) cxlm.showAttack(nowNode.row, nowNode.col, unit); // 计算可攻击区域
    }
  }
  res[unit.y][unit.x] = [
    [unit.y, unit.x]
  ]; // 不动
  for (let r = 0; r < cxlm.mapRows; r++) {
    for (let c = 0; c < cxlm.mapCols; c++) {
      if (res[r][c] !== undefined && res[r][c].constructor === Array) {
        cxlm.newRangeCube(c, r, 'yellow', res[r][c]);
      } else if (res[r][c] === 2) {
        cxlm.newRangeCube(c, r, 'red');
      }
    }
  }
}

cxlm.nextTurn = function () {
  if (cxlm.groups.orderIndex !== -1) {
    let originTeam = cxlm.groups[cxlm.groups.order[cxlm.groups.orderIndex]];
    if (originTeam.units)
      originTeam.units.forEach(u => u.active = true);
    if (originTeam.leader)
      originTeam.leader.active = true;
  }
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
cxlm.actMsg = (act) => cxlm.clickMQ.offer(new cxlm.ActionMessage(act, cxlm.actionSub.unit));

/**
 * 启动绘制逻辑
 */
cxlm.startGame = function () {
  // 创建点击事件消息队列
  cxlm.clickMQ = new cxlm.MessageQueue();
  // 行动盘点击事件、释放死信订阅
  cxlm.actionSub = cxlm.clickMQ.subscribe('action', -1, async (msg) => {
    console.debug(msg);
    let srcUnit = msg.srcUnit;
    let actionFinish = null;
    let actionFlag = new Promise(res => {
      actionFinish = () => {
        cxlm.deadSub.abortController.abort(); // 解除死信监听者
        // 人物位置切换
        cxlm.groups.units[cxlm.backTo[0]][cxlm.backTo[1]] = undefined;
        cxlm.groups.units[srcUnit.y][srcUnit.x] = srcUnit;
        cxlm.toggleActions('hide');
        delete cxlm.backTo;
        res();
      }
    });
    switch (msg.msg) {
      case 'stay':
        srcUnit.actionEnd();
        delete cxlm.range;
        actionFinish();
        srcUnit.active = false;
        break;
      case 'cancel':
        srcUnit.x = cxlm.backTo[1];
        srcUnit.y = cxlm.backTo[0];
        delete cxlm.range;
        actionFinish();
        break;
      case 'occupy':
        let oriLand = cxlm.map[msg.srcUnit.y][msg.srcUnit.x];
        cxlm.map[msg.srcUnit.y][msg.srcUnit.x] = oriLand.substring(0, oriLand.lastIndexOf('_') + 1) + msg.srcUnit.color; // 更改颜色
        srcUnit.actionEnd();
        actionFinish();
        srcUnit.active = false;
        break;
      case 'atk':
        cxlm.showAttack(msg.srcUnit.y, msg.srcUnit.x, msg.srcUnit);
        cxlm.clickMQ.subscribe('inner', -10, async (clickMsg) => {
          let clickKey = cxlm.getKey(clickMsg.y, clickMsg.x);
          if (cxlm.range && cxlm.range[clickKey]) { // 点击位于范围内
            let enemy = cxlm.groups.units[clickMsg.y][clickMsg.x];
            if (cxlm.enemyTo(enemy, srcUnit)) {
              cxlm.cursorX = clickMsg.x;
              cxlm.cursorY = clickMsg.y;
              if (clickMsg.multiClick) {
                cxlm.cursorType = 'cube';
                srcUnit.attack(enemy, true);
                actionFinish();
                srcUnit.active = false;
                delete cxlm.range;
                return false;
              } else {
                cxlm.cursorType = 'circle';
              }
            }
            return true;
          } else { // 点击范围外，认为取消行动，恢复到原位
            srcUnit.x = cxlm.backTo[1];
            srcUnit.y = cxlm.backTo[0];
            delete cxlm.range;
            actionFinish();
            return false;
          }
        }).acquire();
        // TODO: 其他行动盘
    }
    await actionFlag;
    return false;
  });
  // （选择行动盘时使用）死信订阅者，用于阻塞事件监听，解除后需要额外生成一个反馈消息用于丢弃
  cxlm.deadSub = cxlm.clickMQ.subscribe('*', 5, (err) => {
    console.debug('接受中断信号：' + err);
    cxlm.clickMQ.offer({
      topic: '*',
      content: '反馈消息',
    });
  })
  // （激活人物后选择移动范围的事件监听）人物移动
  cxlm.canMoveSub = cxlm.clickMQ.subscribe('inner', 10, async (msg) => {
    let clickKey = cxlm.getKey(msg.y, msg.x);
    // 双击、显示范围与路径时才可以进入行动盘监听
    let enterAction = msg.multiClick && cxlm.range && cxlm.unitPath;
    if (enterAction) {
      // 激活死信订阅者
      cxlm.deadSub.abortController = new AbortController();
      cxlm.deadSub.abortSignal = cxlm.deadSub.abortController.signal; // 中断等待信号
      cxlm.deadSub.acquire();
      // 等待移动动画结束
      if (cxlm.unitPath === undefined) cxlm.unitPath = [
        [msg.y, msg.x]
      ];
      // 并记录起点，用于在取消行动时恢复人物位置
      cxlm.backTo = cxlm.unitPath[0];
      let now = cxlm.backTo;
      let targetUnit = cxlm.groups.units[now[0]][now[1]];
      for (let i = 1; i < cxlm.unitPath.length; i++) {
        let next = cxlm.unitPath[i];
        await targetUnit.moveTo(next[0] - now[0], next[1] - now[1]);
        now = next;
      }
      // 清除路径
      cxlm.clearRange();
      // 可选行动盘
      let actions = new Set();
      // 遍历所有单位（攻击、治疗、唤醒）
      for (let row of cxlm.groups.units) {
        for (let unit of row) {
          if (!unit) continue;
          let distance = Math.abs(unit.x - targetUnit.x) + Math.abs(unit.y - targetUnit.y);
          if (distance <= targetUnit.rangeMax && distance >= targetUnit.rangeMin) {
            if (cxlm.enemyTo(unit, targetUnit)) { // 敌对单位
              actions.add('atk');
            } else if (targetUnit.unit === 'druid' && !unit.active && unit.unit !== 'druid') {
              actions.add('awake');
            } else if (targetUnit.unit === 'paladin') {
              actions.add('heal');
            }
          }
        }
      }
      // TODO: 特殊单位（投石车、幽灵）需要遍历所有城镇（摧毁）
      // TODO: 巫师需要遍历所有墓碑
      // 当前位置如果是非己方城堡或城镇则可以占领
      let landNameArr = cxlm.map[targetUnit.y][targetUnit.x].split('_');
      if ((landNameArr[2] === 'grey' || cxlm.enemyTo(targetUnit.color, landNameArr[2])) &&
        (targetUnit.isLeader || (targetUnit.town && landNameArr[1] === 'town'))) {
        actions.add('occupy');
      }
      // 驻留与取消
      actions.add('stay').add('cancel');
      cxlm.toggleActions('show', actions);
      cxlm.actionSub.unit = targetUnit;
      // 更高优先级的行动盘事件订阅
      cxlm.actionSub.acquire();
      return false;
    }
    // 点击处如果无法到达则取消行动，能到达则生成可绘制路径
    if (cxlm.range && cxlm.range[clickKey] !== undefined) {
      cxlm.cursorX = msg.x;
      cxlm.cursorY = msg.y;
      cxlm.unitPath = cxlm.range[cxlm.getKey(msg.y, msg.x)].path;
      return true;
    } else { // 点击了范围外的地图
      cxlm.clickMQ.offer(msg); // 事件释放
      cxlm.clearRange();
      return false;
    }
  });
  // 点击地图内合法元素
  cxlm.clickMQ.subscribe('inner', 20).autoControl(msg => {
    cxlm.cursorX = msg.x;
    cxlm.cursorY = msg.y;
    // TODO 全局点击事件处理
    if (!msg.multiClick) {
      cxlm.changeInfo();
      cxlm.clearRange();
      let clickUnit = cxlm.groups.units[msg.y][msg.x];
      if (clickUnit !== undefined) { // 点击了某个单位
        let nowColor = cxlm.groups.order[cxlm.groups.orderIndex];
        if (clickUnit.color === nowColor) { // 点击了己方可行动单位
          if (clickUnit.active) {
            cxlm.showReachable(false, clickUnit, clickUnit.move);
            cxlm.canMoveSub.unit = clickUnit;
            cxlm.canMoveSub.acquire();
          }
          // 点击己方不可行动单位时无效果
        } else { // 点击了非己方单位
          cxlm.showReachable(true, clickUnit, clickUnit.move);
        }
      }
    }
    console.log(msg);
    return true;
  })
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
      cxlm.drawPath();
      cxlm.drawUnits();
      cxlm.drawCursor(); // 绘制光标
      if (!cxlm.storyShowing && cxlm.storyLine.length > cxlm.storyIndex && cxlm.storyLine[cxlm.storyIndex].startCondition()) {
        cxlm.story('show', cxlm.storyLine[cxlm.storyIndex].text[0][0], cxlm.storyLine[cxlm.storyIndex].text[0][1]);
        cxlm.storyShowing = true;
        cxlm.nowStoryIndex = 1;
        // 监听阻塞事件直到当前故事结束
        cxlm.clickMQ.subscribe('*', -1).autoControl(() => {
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