'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

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
  for (let pathKey in cxlm.range) {
    let cube = cxlm.range[pathKey];
    let rect = cxlm.fragments[cube.color + '_rect'];
    cxlm.ctx.drawImage(cxlm.fragImg, rect.x, rect.y, rect.width, rect.height,
      cxlm.offsetX + cxlm.dragOffsetX + cube.col * cxlm.options.mapMeta.itemWidth * cxlm.options.scale + ((cxlm.options.mapMeta.itemWidth - rect.width) >> 1),
      cxlm.offsetY + cxlm.dragOffsetY + cube.row * cxlm.options.mapMeta.itemHeight * cxlm.options.scale + ((cxlm.options.mapMeta.itemHeight - rect.height) >> 1),
      rect.width * cxlm.options.scale, rect.height * cxlm.options.scale);
  }
}

cxlm.newRangeCube = (col, row, color, path) => {
  if (cxlm.range === undefined) {
    cxlm.range = {};
  }
  let crKey = cxlm.getKey(row, col);
  cxlm.range[crKey] = ({
    col,
    row,
    color,
    path,
  });
}

/** 绘制移动轨迹 */
cxlm.drawPath = function () {
  if (cxlm.unitPath === undefined) return;
  let len = cxlm.unitPath.length;
  let mapEleWidth = cxlm.options.mapMeta.itemWidth * cxlm.options.scale;
  let mapEleHeight = cxlm.options.mapMeta.itemHeight * cxlm.options.scale;
  if (len > 0) {
    cxlm.ctx.beginPath();
    cxlm.ctx.moveTo((cxlm.unitPath[0][1] + 0.5) * mapEleWidth + cxlm.offsetX + cxlm.dragOffsetX,
      (cxlm.unitPath[0][0] + 0.5) * mapEleHeight + cxlm.offsetY + cxlm.dragOffsetY);
    for (let i = 1; i < len; i++) {
      cxlm.ctx.lineTo((cxlm.unitPath[i][1] + 0.5) * mapEleWidth + cxlm.offsetX + cxlm.dragOffsetX,
        (cxlm.unitPath[i][0] + 0.5) * mapEleHeight + cxlm.offsetY + cxlm.dragOffsetY);
    }
    cxlm.ctx.strokeStyle = "#FF0000";
    cxlm.ctx.lineWidth = ~~(mapEleWidth * 0.2);
    cxlm.ctx.stroke();
  }
  let crossMeta = cxlm.fragments.cross;
  cxlm.ctx.drawImage(cxlm.fragImg, crossMeta.x, crossMeta.y, crossMeta.width, crossMeta.height,
    cxlm.unitPath[len - 1][1] * mapEleWidth + cxlm.offsetX + cxlm.dragOffsetX + ((mapEleWidth - crossMeta.width * cxlm.options.scale) >> 1),
    cxlm.unitPath[len - 1][0] * mapEleHeight + cxlm.offsetY + cxlm.dragOffsetY + ((mapEleHeight - crossMeta.height * cxlm.options.scale) >> 1),
    crossMeta.width * cxlm.options.scale, crossMeta.width * cxlm.options.scale);
}

cxlm.clearRange = () => {
  delete cxlm.range;
  delete cxlm.unitPath;
}