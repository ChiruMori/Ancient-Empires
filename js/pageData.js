'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

// 保存在本地的战役数据
cxlm.localData = new Map();
cxlm.localData.set('initial1', {
  url: './story/initial1.js',
}).set('initial2', {
  url: './story/?.js',
});

// 颜色映射，仅支持关键 5 种颜色的映射
cxlm.colorMap = {
  blue: [
    [12, 53, 112],
    [0, 100, 198],
    [65, 149, 233],
    [150, 217, 244],
    [237, 242, 244],
  ],
  red: [
    [112, 14, 12],
    [198, 0, 14],
    [233, 65, 76],
    [244, 150, 176],
    [244, 237, 239],
  ],
  green: [
    [12, 112, 37],
    [0, 198, 32],
    [65, 233, 93],
    [154, 244, 150],
    [237, 244, 237],
  ],
  dark: [
    [16, 11, 105],
    [0, 7, 186],
    [61, 67, 219],
    [141, 163, 230],
    [233, 225, 230],
  ],
  purple: [
    [104, 12, 112],
    [163, 0, 198],
    [204, 65, 233],
    [208, 150, 244],
    [241, 237, 244],
  ],
  yellow: [
    [112, 99, 12],
    [198, 153, 0],
    [233, 196, 65],
    [244, 203, 150],
    [244, 241, 237],
  ],
  grey: [
    [62, 62, 62],
    [99, 99, 99],
    [149, 149, 149],
    [197, 197, 197],
    [240, 240, 240],
  ]
}

/** 角色数据 */
cxlm.roleData = {
  leader: {
    atk: 60,
    def: 20,
    defAdd: 0,
    move: 4,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 1,
    hpGrow: 0,
    population: 0,
    rangeMin: 1,
    rangeMax: 1,
    cost: 400,
    town: true, // 村庄捕获者
  },
  soldier: {
    atk: 55,
    def: 5,
    defAdd: 0,
    move: 4,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 1,
    rangeMin: 1,
    rangeMax: 1,
    cost: 150,
    town: true, // 村庄捕获者
  },
  ghost: {
    atk: 50,
    def: 10,
    defAdd: 5,
    move: 4,
    magic: true,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 1,
    hpGrow: 0,
    population: 1,
    rangeMin: 1,
    rangeMax: 1,
    cost: 200,
    air: true, // 空军
  },
  merman: {
    atk: 40,
    def: 0,
    defAdd: 0,
    move: 4,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 1,
    rangeMin: 1,
    rangeMax: 2,
    cost: 200,
    water: true, // 水之子
  },
  archer: {
    atk: 45,
    def: 5,
    defAdd: 0,
    move: 4,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 1,
    rangeMin: 2,
    rangeMax: 3,
    cost: 250,
  },
  slime: {
    atk: 50,
    def: 15,
    defAdd: -25,
    move: 4,
    magic: true,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 5,
    population: 1,
    rangeMin: 1,
    rangeMax: 1,
    cost: 250,
    restore: true, // 自我修复
  },
  water: {
    atk: 60,
    def: 15,
    defAdd: 0,
    move: 4,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 1,
    rangeMin: 1,
    rangeMax: 1,
    cost: 300,
    water: true,
  },
  dark: {
    atk: 50,
    def: 10,
    defAdd: 10,
    move: 4,
    magic: true,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 1,
    rangeMin: 1,
    rangeMax: 2,
    cost: 300,
    blinder: true, // 致盲者
  },
  wizard: {
    atk: 45,
    def: 20,
    defAdd: 20,
    move: 4,
    magic: true,
    atkGrow: 5,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 2,
    rangeMin: 1,
    rangeMax: 2,
    cost: 400,
  },
  paladin: {
    atk: 50,
    def: 10,
    defAdd: 0,
    move: 4,
    magic: false,
    atkGrow: 5,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 2,
    rangeMin: 1,
    rangeMax: 1,
    cost: 400,
    heal: true, // 治愈
    town: true, // 村庄捕获者
  },
  spirit: {
    atk: 55,
    def: 25,
    defAdd: 5,
    move: 4,
    magic: true,
    atkGrow: 5,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 2,
    rangeMin: 1,
    rangeMax: 2,
    cost: 500,
    air: true,
    forest: true, // 森林之子
  },
  berserker: {
    atk: 70,
    def: 15,
    defAdd: 5,
    move: 5,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 2,
    rangeMin: 1,
    rangeMax: 1,
    cost: 500,
    land: true, // 大地之子
    back: true, // 反击风暴
  },
  wolf: {
    atk: 75,
    def: 15,
    defAdd: 5,
    move: 6,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 3,
    rangeMin: 1,
    rangeMax: 1,
    cost: 600,
    land: true, // 大地之子
    assault: true, // 突击部队
    poisoner: true, // 投毒者
  },
  rock: {
    atk: 55,
    def: 20,
    defAdd: 10,
    move: 5,
    magic: false,
    atkGrow: 5,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 25,
    population: 3,
    rangeMin: 1,
    rangeMax: 1,
    cost: 600,
    mountain: true, // 山地之子
  },
  ice: {
    atk: 55,
    def: 15,
    defAdd: 5,
    move: 4,
    magic: true,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 10,
    population: 3,
    rangeMin: 1,
    rangeMax: 3,
    cost: 600,
    water: true,
    restore: true,
  },
  druid: {
    atk: 40,
    def: 15,
    defAdd: 15,
    move: 4,
    magic: true,
    atkGrow: 5,
    defGrow: 5,
    moveGrow: 1,
    hpGrow: 0,
    population: 3,
    rangeMin: 1,
    rangeMax: 2,
    cost: 600,
  },
  catapult: {
    atk: 60,
    def: 5,
    defAdd: 0,
    move: 3,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 4,
    rangeMin: 3,
    rangeMax: 5,
    cost: 800,
    breaker: true, // 破坏者
  },
  wolfarcherr: {
    atk: 60,
    def: 15,
    defAdd: 5,
    move: 6,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 4,
    rangeMin: 1,
    rangeMax: 3,
    cost: 800,
    blinder: true,
    assault: true,
  },
  dragon: {
    atk: 70,
    def: 25,
    defAdd: 0,
    move: 6,
    magic: true,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 5,
    rangeMin: 1,
    rangeMax: 2,
    cost: 1000,
    assault: true,
    air: true,
    // 近战大师
    // 远程防御
  },
  skull: {
    atk: 40,
    def: 5,
    defAdd: 0,
    move: 3,
    magic: false,
    atkGrow: 10,
    defGrow: 5,
    moveGrow: 0,
    hpGrow: 0,
    population: 0,
    rangeMin: 1,
    rangeMax: 1,
    cost: 0,
    poisoner: true, // 投毒者
  },
  crystal: {
    atk: 0,
    def: 0,
    defAdd: 0,
    move: 4,
    magic: true,
    atkGrow: 0,
    defGrow: 0,
    moveGrow: 0,
    hpGrow: 0,
    population: 0,
    rangeMin: 0,
    rangeMax: 0,
    cost: 0,
  },
}

/**
 * 角色类
 */
cxlm.Role = class {
  constructor(name, x, y) {
    let nameEles = name.split('_');
    let rawData = null;
    if (nameEles[1] === 'leader') {
      this.isLeader = true;
      this.color = nameEles[0];
      rawData = cxlm.roleData.leader;
    } else {
      this.color = nameEles[0];
      this.isLeader = false;
      this.unit = nameEles[1];
      rawData = cxlm.roleData[this.unit];
    }
    Object.assign(this, rawData);
    this.hp = 100;
    this.hpMax = 100;
    this.x = x;
    this.y = y;
    this.exp = 0;
    this.level = 0;
  }

  draw() {
    if (this.x < 0) return;
    let scale = cxlm.options.scale;
    let scaledWidth = cxlm.options.mapMeta.itemWidth * scale,
      scaledHeight = cxlm.options.mapMeta.itemHeight * scale;
    let offsetX, offsetY;
    if (offsetX < 0 || offsetX > cxlm.canvasWidth + scaledWidth || offsetY < 0 || offsetY > cxlm.canvasHeight + scaledHeight) return; // 越界
    // 绘制
    let nowStep = ((cxlm.clock / 30) & 1) + 1;
    if (this.isLeader) {
      let imgData = cxlm.leaders['leader_' + this.color];
      let nowKey = 'small' + nowStep;
      offsetY = cxlm.offsetY + this.y * scaledHeight + scaledHeight - cxlm.options.leaderMeta.smallHeight * scale + cxlm.dragOffsetY;
      offsetX = cxlm.offsetX + this.x * scaledWidth + scaledWidth - cxlm.options.leaderMeta.smallWidth * scale + cxlm.dragOffsetX;
      cxlm.ctx.drawImage(cxlm.leaderImgDom, imgData[nowKey].x, imgData[nowKey].y,
        imgData[nowKey].width, imgData[nowKey].height, offsetX, offsetY,
        imgData[nowKey].width * scale, imgData[nowKey].height * scale);
    } else {
      let imgData = cxlm.unitParts[this.unit + nowStep];
      let unitMeta = cxlm.options.unitMeta;
      offsetX = cxlm.offsetX + this.x * scaledWidth + scaledWidth - cxlm.options.unitMeta.itemWidth * scale + cxlm.dragOffsetX;
      offsetY = cxlm.offsetY + this.y * scaledHeight + scaledHeight - cxlm.options.unitMeta.itemHeight * scale + cxlm.dragOffsetY;
      if (this.color === 'blue') {
        cxlm.ctx.drawImage(cxlm.unitImg, imgData.x, imgData.y, unitMeta.itemWidth, unitMeta.itemHeight,
          offsetX, offsetY, unitMeta.itemWidth * scale, unitMeta.itemHeight * scale);
      } else {
        cxlm.drawColorChangedImg(cxlm.unitImg, imgData.x, imgData.y, unitMeta.itemWidth, unitMeta.itemHeight, offsetX, offsetY, this.color);
      }
    }
  }

}

/**
 * 加载地图元数据
 */
cxlm.initMapMetaData = function () {
  if (cxlm.mapMetaLoaded) return Promise.resolve();
  let mapOption = cxlm.options.mapMeta;

  /**
   * 返回一个地图单体的数据对象
   * @param {number} row 所属行
   * @param {number} col 所属列
   * @param {number} def 提供的防御力
   * @param {number} mov 需要的行动点
   * @param {number} heal 提供的治愈力
   * @param {number} coin 提供的税收
   * @param {string} type 地形种类
   */
  let getMap = function (row, col, def, mov, heal = 0, coin = 0, type = 'water') {
    return {
      x: mapOption.itemWidth * col + mapOption.border * col,
      y: mapOption.itemHeight * row + mapOption.border * row,
      def,
      mov,
      heal,
      coin,
      type,
    }
  }

  /** 
   * 命名规则：
   * ---
   * w: 水面地形
   * l: 陆地地形
   * ---
   * p: 水面地形，露出陆地的角
   * s: 水面地形，露出陆地的边
   * b: 水面地形，桥
   * p：陆地地形，小路
   * ---
   * 0123: ↖↗↘↙
   * urdl: ↑→↓←
   */
  cxlm.mapParts = {
    w_p2: getMap(0, 0, 0, 3),
    w_p3: getMap(0, 1, 0, 3),
    w_p1: getMap(0, 2, 0, 3),
    w_p0: getMap(0, 3, 0, 3),
    w_p03: getMap(0, 4, 0, 3),
    w_p01: getMap(0, 5, 0, 3),
    w_p12: getMap(0, 6, 0, 3),
    w_p23: getMap(0, 7, 0, 3),
    w_p013: getMap(1, 0, 0, 3),
    w_p012: getMap(1, 1, 0, 3),
    w_p123: getMap(1, 2, 0, 3),
    w_p023: getMap(1, 3, 0, 3),
    w_p13: getMap(1, 4, 0, 3),
    w_p02: getMap(1, 5, 0, 3),
    w_slr: getMap(1, 6, 0, 3),
    w_sud: getMap(1, 7, 0, 3),
    w_p0_sd: getMap(2, 0, 0, 3),
    w_p1_sd: getMap(2, 1, 0, 3),
    w_p1_sl: getMap(2, 2, 0, 3),
    w_p2_sl: getMap(2, 3, 0, 3),
    w_p2_su: getMap(2, 4, 0, 3),
    w_p3_su: getMap(2, 5, 0, 3),
    w_p0_sr: getMap(2, 6, 0, 3),
    w_p3_sr: getMap(2, 7, 0, 3),
    w_p2_sul: getMap(3, 0, 0, 3),
    w_p3_sur: getMap(3, 1, 0, 3),
    w_p0_srd: getMap(3, 2, 0, 3),
    w_p1_sdl: getMap(3, 3, 0, 3),
    w_p23_su: getMap(3, 4, 0, 3),
    w_p03_sr: getMap(3, 5, 0, 3),
    w_p01_sd: getMap(3, 6, 0, 3),
    w_p12_sl: getMap(3, 7, 0, 3),
    w_su: getMap(4, 0, 0, 3),
    w_sr: getMap(4, 1, 0, 3),
    w_sd: getMap(4, 2, 0, 3),
    w_sl: getMap(4, 3, 0, 3),
    w_sur: getMap(4, 4, 0, 3),
    w_srd: getMap(4, 5, 0, 3),
    w_sdl: getMap(4, 6, 0, 3),
    w_sul: getMap(4, 7, 0, 3),
    w_surl: getMap(5, 0, 0, 3),
    w_surd: getMap(5, 1, 0, 3),
    w_srdl: getMap(5, 2, 0, 3),
    w_sudl: getMap(5, 3, 0, 3),
    w_p0123: getMap(5, 4, 0, 3),
    w_star1: getMap(5, 5, 0, 3),
    w_star2: getMap(5, 6, 0, 3),
    w_empty: getMap(5, 7, 0, 3),
    w_surdl: getMap(6, 0, 0, 3),
    w_stone1: getMap(6, 1, 10, 3),
    w_stone2: getMap(6, 2, 10, 3),
    w_temple: getMap(6, 3, 10, 3, 20),
    l_temple: getMap(6, 4, 10, 1, 20, 0, 'land'),
    l_temple_road: getMap(6, 5, 10, 1, 20, 0, 'land'),
    l_town_break: getMap(6, 6, 10, 1, 0, 0, 'land'),
    l_purdl: getMap(6, 7, 0, 1, 0, 0, 'land'),
    l_pu: getMap(7, 0, 0, 1, 0, 0, 'land'),
    l_pr: getMap(7, 1, 0, 1, 0, 0, 'land'),
    l_pd: getMap(7, 2, 0, 1, 0, 0, 'land'),
    l_pl: getMap(7, 3, 0, 1, 0, 0, 'land'),
    l_pul: getMap(7, 4, 0, 1, 0, 0, 'land'),
    l_pur: getMap(7, 5, 0, 1, 0, 0, 'land'),
    l_pld: getMap(7, 6, 0, 1, 0, 0, 'land'),
    l_prd: getMap(7, 7, 0, 1, 0, 0, 'land'),
    l_purl: getMap(8, 0, 0, 1, 0, 0, 'land'),
    l_purd: getMap(8, 1, 0, 1, 0, 0, 'land'),
    l_prdl: getMap(8, 2, 0, 1, 0, 0, 'land'),
    l_pudl: getMap(8, 3, 0, 1, 0, 0, 'land'),
    l_pud: getMap(8, 4, 0, 1, 0, 0, 'land'),
    l_prl: getMap(8, 5, 0, 1, 0, 0, 'land'),
    w_bud: getMap(8, 6, 0, 1),
    w_brl: getMap(8, 7, 0, 1),
    l_mountain: getMap(9, 0, 15, 3, 0, 0, 'land'),
    l_hill: getMap(9, 1, 10, 2, 0, 0, 'land'),
    l_tree3: getMap(9, 2, 10, 2, 0, 0, 'land'),
    l_tree2: getMap(9, 3, 10, 2, 0, 0, 'land'),
    l_tower_base: getMap(9, 4, 20, 3, 0, 0, 'land'),
    l_tower_head: getMap(9, 5, 10, 1, 0, 0, 'land'),
    l_tower_left: getMap(9, 6, 5, 1, 0, 0, 'land'),
    l_tower_right: getMap(9, 7, 5, 1, 0, 0, 'land'),
    l_empty: getMap(10, 0, 5, 1, 0, 0, 'land'),
    l_pen: getMap(10, 1, 10, 1, 20, 0, 'land'),
    l_cas_head: getMap(10, 2, 0, 0, 0, 0, 'none'),
    l_castle_blue: getMap(10, 3, 15, 1, 20, 100, 'land'),
    l_town_blue: getMap(10, 4, 15, 1, 20, 50, 'land'),
    // 以下元素通过变色进行绘制，这里标记可用的地图元素颜色
    l_castle_grey: 1,
    l_castle_red: 1,
    l_castle_green: 1,
    l_castle_dark: 1,
    l_castle_purple: 1,
    l_castle_yellow: 1,
    l_town_grey: 1,
    l_town_red: 1,
    l_town_green: 1,
    l_town_dark: 1,
    l_town_purple: 1,
    l_town_yellow: 1,
  }
  cxlm.mapImgDom = new Image(cxlm.options.mapMeta.width, cxlm.options.mapMeta.height);
  cxlm.mapImgDom.src = cxlm.options.mapMeta.url;
  // 等待图片加载完成
  return new Promise((res) => {
    cxlm.mapImgDom.onload = () => {
      cxlm.mapMetaLoaded = true;
      res();
    }
  })
}

/**
 * 加载单位元数据
 */
cxlm.initUnitMetaData = function () {
  if (cxlm.unitMetaLoded) return Promise.resolve();
  let unitOpt = cxlm.options.unitMeta;

  /**
   * 返回一个单元的数据对象
   * @param {number} row 所属行
   * @param {number} col 所属列
   */
  let getUnit = function (row, col) {
    return {
      x: unitOpt.itemWidth * col + unitOpt.border * col,
      y: unitOpt.itemHeight * row + unitOpt.border * row,
    }
  }

  // 单元在图片中的位置
  cxlm.unitParts = {
    soldier1: getUnit(0, 0),
    soldier2: getUnit(0, 1),
    ghost1: getUnit(0, 2),
    ghost2: getUnit(0, 3),
    merman1: getUnit(0, 4),
    merman2: getUnit(0, 5),
    archer1: getUnit(0, 6),
    archer2: getUnit(0, 7),
    slime1: getUnit(1, 0),
    slime2: getUnit(1, 1),
    water1: getUnit(1, 2),
    water2: getUnit(1, 3),
    dark1: getUnit(1, 4),
    dark2: getUnit(1, 5),
    wizard1: getUnit(1, 6),
    wizard2: getUnit(1, 7),
    paladin1: getUnit(2, 0),
    paladin2: getUnit(2, 1),
    spirit1: getUnit(2, 2),
    spirit2: getUnit(2, 3),
    berserker1: getUnit(2, 4),
    berserker2: getUnit(2, 5),
    wolf1: getUnit(2, 6),
    wolf2: getUnit(2, 7),
    rock1: getUnit(3, 0),
    rock2: getUnit(3, 1),
    ice1: getUnit(3, 2),
    ice2: getUnit(3, 3),
    druid1: getUnit(3, 4),
    druid2: getUnit(3, 5),
    catapult1: getUnit(3, 6),
    catapult2: getUnit(3, 7),
    wolfarcher1: getUnit(4, 0),
    wolfarcher2: getUnit(4, 1),
    dragon1: getUnit(4, 2),
    dragon2: getUnit(4, 3),
    skull1: getUnit(4, 4),
    skull2: getUnit(4, 5),
    crystal1: getUnit(4, 6),
    crystal2: getUnit(4, 7),
  }
  cxlm.unitImg = new Image(unitOpt.width, unitOpt.height);
  cxlm.unitImg.src = unitOpt.url;

  // 等待图片加载完成
  return new Promise(res => {
    cxlm.unitImg.onload = () => {
      cxlm.unitMetaLoded = true;
      res();
    }
  });
}

/**
 * 加载领主图片元数据
 */
cxlm.initLeaderMetaData = function () {
  if (cxlm.leaderMetaLoded) return Promise.resolve();
  let leaderOpt = cxlm.options.leaderMeta;

  /**
   * 返回首领的相关图片坐标
   */
  let getLeader = function (y, height) {
    return {
      big: {
        x: 0,
        y,
        width: leaderOpt.bigWidth,
        height
      },
      small1: {
        x: leaderOpt.bigWidth,
        y,
        width: leaderOpt.smallWidth,
        height: leaderOpt.smallHeight,
      },
      small2: {
        x: leaderOpt.bigWidth,
        y: y + leaderOpt.smallHeight,
        width: leaderOpt.smallWidth,
        height: leaderOpt.smallHeight,
      },
    }
  }

  /** 
   * 获取全部首领的数据
   */
  cxlm.leaders = {
    leader_blue: getLeader(0, 154),
    leader_red: getLeader(154, 168),
    leader_green: getLeader(322, 164),
    leader_dark: getLeader(486, 168),
    leader_purple: getLeader(654, 166),
    leader_yellow: getLeader(820, 158),
  }
  cxlm.leaderImgDom = new Image(leaderOpt.width, leaderOpt.height);
  cxlm.leaderImgDom.src = leaderOpt.url;
  // 等待图片加载完成
  return new Promise((res) => {
    cxlm.leaderImgDom.onload = () => {
      cxlm.leaderMetaLoded = true;
      res();
    }
  })
}

/**
 * 加载其他图片元数据
 */
cxlm.initFragMetaData = function () {
  if (cxlm.fragMetaLoaded) return Promise.resolve();

  let rect = (x, y, width, height) => {
    return {
      x,
      y,
      width,
      height
    }
  };

  cxlm.fragments = {
    circle1: rect(0, 0, 80, 82),
    circle2: rect(80, 0, 76, 80),
    circle3: rect(156, 0, 76, 80),
    att1: rect(0, 82, 38, 38),
    att2: rect(38, 82, 38, 38),
    att3: rect(76, 82, 38, 38),
    att4: rect(114, 82, 38, 38),
    att5: rect(152, 82, 38, 38),
    att6: rect(190, 82, 38, 38),
    mag1: rect(0, 120, 48, 48),
    mag2: rect(48, 120, 48, 48),
    mag3: rect(96, 120, 48, 48),
    mag4: rect(144, 120, 48, 48),
    mag5: rect(192, 120, 48, 48),
    mag6: rect(240, 120, 48, 48),
    cube1: rect(232, 0, 52, 52),
    cube2: rect(232, 52, 48, 48),
    cross: rect(284, 0, 36, 38),
    tombstone: rect(284, 38, 36, 36),
    lv1: rect(230, 102, 14, 10),
    lv2: rect(246, 102, 14, 14),
    lv3: rect(262, 102, 14, 18),
    lv4: rect(320, 54, 18, 22),
    red_rect: rect(294, 78, 44, 44),
    yellow_rect: rect(294, 124, 44, 44),
  }

  cxlm.fragImg = new Image(cxlm.options.fragMeta.width, cxlm.options.fragMeta.height);
  cxlm.fragImg.src = cxlm.options.fragMeta.url;
  // 等待图片加载完成
  return new Promise((res) => {
    cxlm.fragImg.onload = () => {
      cxlm.fragMetaLoaded = true;
      res();
    }
  });
}

// ---------------------------------
//      消息队列，发布订阅模型
// ---------------------------------

// 订阅者
cxlm.Subscriber = class {
  static allSubs = {};
  constructor(topic, priority, mq) {
    this.topic = topic;
    this.priority = priority;
    this.mq = mq;
    this.key = Symbol(topic);
  }
  // 请求一条消息
  acquire() {
    let that = this;
    return new Promise(function (res) {
      that.mq.consume(that, res);
    })
  }

  // 取消订阅，释放内存
  unsubscribe() {
    delete cxlm.Subscriber.allSubs[this.key];
  }

  /**
   * 自动控制事件处理、解除订阅
   * @param {function} fn 自动控制函数，接受一个参数为消息，返回布尔类型表示是否完成处理
   */
  async autoControl(fn) {
    let continueListen = true;
    while (continueListen) {
      await this.acquire().then(msg => continueListen = fn(msg));
    }
    this.unsubscribe();
  }

}

// 画布点击事件
cxlm.ClickMessage = class {
  constructor(x, y) {
    let itemWidth = cxlm.options.mapMeta.itemWidth * cxlm.options.scale;
    let itemHeight = cxlm.options.mapMeta.itemHeight * cxlm.options.scale;
    if (x < cxlm.offsetX || y < cxlm.offsetY || x > cxlm.offsetX + cxlm.mapCols * cxlm.options.mapMeta.itemWidth * cxlm.options.scale ||
      y > cxlm.offsetY + cxlm.mapRows * cxlm.options.mapMeta.itemHeight * cxlm.options.scale) {
      this.topic = '*';
    } else {
      this.topic = 'inner';
    }
    this.x = ~~((x - cxlm.offsetX) / itemWidth);
    this.y = ~~((y - cxlm.offsetY) / itemHeight);
    this.multiClick = (this.x === cxlm.cursorX && this.y === cxlm.cursorY); // 重复点击
  }
}
// 行动选择事件
cxlm.ActionMessage = class {
  constructor(act, srcUnit) {
    this.topic = 'action';
    this.msg = act;
    this.srcUnit = srcUnit;
  }
}

// 消息队列
cxlm.MessageQueue = class {
  dispacherWorking = false;
  nodeCompFunc = (a, b) => b.priority - a.priority;
  constructor() {
    this.messageQueue = [];
    this.blockingQueues = {};
    this.blockingQueues['*'] = new cxlm.PriorityQueue(this.nodeCompFunc);
  }

  // 对队列中的消息进行分发
  _dispatch() {
    this.dispacherWorking = true;
    while (this.messageQueue.length !== 0) {
      let nowMsg = this.messageQueue[0];
      let targetQueue = this.blockingQueues[nowMsg.topic];
      this.messageQueue.shift(); // 清除读取的消息
      if (nowMsg.topic !== '*' && !this.blockingQueues['*'].isEmpty() && this.blockingQueues['*'].peak().priority > targetQueue.peak().priority) {
        targetQueue = this.blockingQueues['*'];
      }
      if (targetQueue.length === 0) continue; // 消息积压时，直接丢弃消息，可以在这里添加其他处理方案
      let receiver = targetQueue.shift();
      receiver.res(nowMsg);
    }
    this.dispacherWorking = false;
  }

  /**
   * 生成订阅者
   * @param {string} topic 消息分类
   * @param {number} priority 当前订阅者在所属消息分类内的优先级
   * @returns {cxlm.Subscriber} 订阅者对象
   */
  subscribe(topic, priority) {
    let now = new cxlm.Subscriber(topic, priority, this);
    if (!this.blockingQueues[topic]) {
      this.newType(topic);
    }
    cxlm.Subscriber.allSubs[now.key] = now;
    return now;
  }

  /**
   * 创建阻塞队列
   * @param {string} topic 订阅主题
   */
  newType(topic) {
    if (!this.blockingQueues[topic]) {
      this.blockingQueues[topic] = new cxlm.PriorityQueue(this.nodeCompFunc);
    }
  }

  // 生产消息
  offer(msg) {
    this.messageQueue.push(msg);
    if (this.dispacherWorking) return;
    this._dispatch();
  }

  // 不应该手动调用，只应该由订阅者进行调用
  consume(sub, res) {
    this.blockingQueues[sub.topic].offer(new cxlm.BlockNode(sub.priority, res));
    if (this.messageQueue.length !== 0 && !this.dispacherWorking) {
      this._dispatch();
    }
  }

}

// 放在阻塞队列中的节点
cxlm.BlockNode = class {
  constructor(priority, res) {
    this.priority = priority;
    this.res = res;
  }
}

// 优先级队列
cxlm.PriorityQueue = class PriorityQueue {
  constructor(cmpFn = (a, b) => a - b) {
    this._cmp = cmpFn;
    this.length = 0;
    this._queue = [];
  };
  _swap(i, j) {
    let temp = this._queue[j];
    this._queue[j] = this._queue[i];
    this._queue[i] = temp;
  }
  _nodeUp(i) {
    while (i !== 0) {
      let root = (i - 1) >> 1;
      if (this._cmp(this._queue[root], this._queue[i]) >= 0) return;
      this._swap(root, i);
      i = root;
    }
  };
  _nodeDown(i) {
    while (i <= (this.length - 1) >> 1) {
      let l = (i << 1) + 1,
        r = l + 1;
      if (l + 1 < this.length) {
        // 包含两个子节点且
        if (this._cmp(this._queue[i], this._queue[l]) <= 0 && this._cmp(this._queue[i], this._queue[r]) <= 0) {
          // 比两个子节点都小，与较大的节点替换
          l = this._cmp(this._queue[l], this._queue[r]) >= 0 ? l : r;
          this._swap(l, i);
          i = l;
        } else if (this._cmp(this._queue[i], this._queue[l]) <= 0) {
          // 比左节点小
          this._swap(l, i);
          i = l;
        } else if (this._cmp(this._queue[i], this._queue[r]) <= 0) {
          // 比右节点小
          this._swap(r, i);
          i = r;
        } else {
          // 比两节点都大，结束
          break;
        }
      } else if (this._cmp(this._queue[i], this._queue[l]) <= 0) {
        // 只有左节点，且比左节点小
        this._swap(l, i);
        i = l;
      } else {
        // 退出：比仅有的左节点大
        break;
      }
    }
  };
  offer(ele) {
    this._queue[this.length] = ele;
    this._nodeUp(this.length++);
  };
  peak() {
    return this._queue[0];
  };
  shift() {
    let res = this._queue[0];
    this._queue[0] = this._queue[--this.length];
    this._nodeDown(0);
    return res;
  }
  isEmpty() {
    return this.length === 0;
  }
}

// -- END：消息队列

/**
 * 创建 DOM 节点
 * 
 * @param {Object} dom DOM 描述
 * DOM 支持属性如下：  
 *  tag: 节点名，默认为 div  
 *  text: 节点文本内容，script 节点将解释为脚本并执行  
 *  style: css 对象  
 *  props: 标签属性对象，如果已有 style 属性，则会将其覆盖  
 *  son: DOM 描述数组
 */
cxlm.buildDom = function (dom) {
  if (!dom.tag) {
    dom.tag = 'div'; // div 节点可以不指定节点名
  }
  let nowNode = document.createElement(dom.tag);
  // 节点内容
  if (dom.text) {
    if (dom.tag === 'script') {
      nowNode.text = dom.text;
    } else {
      nowNode.innerText = dom.text;
    }
  }
  // 设置 style
  if (dom.style && typeof dom.style === 'object') {
    for (let cssKey in dom.style) {
      nowNode.style[cssKey] = dom.style[cssKey];
    }
  }
  // 设置属性
  if (dom.props && typeof dom.props === 'object') {
    for (let propKey in dom.props) {
      nowNode.setAttribute(propKey, dom.props[propKey]);
    }
  }
  // 递归子节点
  if (dom.son && dom.son.length) {
    for (let eleOption in dom.son) {
      let sonEle = cxlm.buildDom(dom.son[eleOption]);
      nowNode.appendChild(sonEle);
    }
  }
  return nowNode;
};