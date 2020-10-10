'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

cxlm.loadGame = function () {

  cxlm.missionName = '战斗的基本';
  cxlm.missionTargetDesc = '跟随教程指示赢得战斗';

  /**
   * 赢得战役判定
   * @returns {Number} 0 未分胜负；1 胜利；-1 败北
   */
  cxlm.victory = function () {
    return 0;
  };

  // 同盟
  cxlm.team = [
    ['blue'],
    ['red'],
  ]

  /**
   * 地图，必须
   */
  cxlm.map = [
    ['w_p2', 'w_sd', 'w_sd', 'w_sd', 'w_sd', 'w_sd', 'w_p3'],
    ['w_sr', 'l_castle_grey', 'l_tree3', 'l_hill', 'l_tree3', 'l_tree2', 'w_sl'],
    ['w_sr', 'l_tree3', 'w_surdl', 'l_tree3', 'w_surdl', 'l_tree3', 'w_sl'],
    ['w_sr', 'l_hill', 'l_tree3', 'l_temple', 'l_tree3', 'l_hill', 'w_sl'],
    ['w_sr', 'l_tree2', 'w_surdl', 'l_tree2', 'w_surdl', 'l_tree2', 'w_sl'],
    ['w_sr', 'l_tree2', 'l_tree3', 'l_hill', 'l_tree3', 'l_town_blue', 'w_sl'],
    ['w_p1', 'w_su', 'w_su', 'w_su', 'w_su', 'w_su', 'w_p0'],
  ];

  /**
   * 初始角色位置，坐标从零开始
   */
  cxlm.initRoles = [
    ['blue_leader', 5, 5],
    ['red_soldier', 5, 4],
    ['red_soldier', 5, 6],
    ['red_soldier', 4, 5],
    ['red_soldier', 6, 5],
    // 测试使用
    ['red_wolf', 1, 5],
  ]

  /**
   * 故事线与相关效果函数
   */
  cxlm.storyLine = [{
    startCondition: () => true,
    text: [
      ['blue', '你就是新来的指挥官？俺是首领王尼玛，不许笑，看到俺了吗？'],
      ['blue', '对，俺被包围了，点击俺可以选择行动，别让俺挂了'],
      ['blue', '什么？怎么移动？怎么攻击？不知道！']
    ],
    effect: () => {
      // 光标定位到蓝色领主
      cxlm.cursorX = 5;
      cxlm.cursorY = 5;
      cxlm.changeInfo();
    },
  }, {
    startCondition: () => {},
    text: [
      ['blue', '行了行了，先这样吧'],
      ['blue', '去把那个城堡占领了，占领它就可以招募军队了'],
      ['blue', '没钱？你占领的城堡和村庄都会交税，可别问俺要，俺没有！']
    ],
    effect: () => {},
  }, {
    startCondition: () => {},
    text: [
      ['blue', '听说你在背地里说俺扣，这俺可不能忍，俺其实相当不差钱'],
      ['blue', '这几个臭钱拿去，帮俺赶紧解决掉今天的训练！']
    ],
    effect: () => {},
  }];

  return Promise.resolve();
}