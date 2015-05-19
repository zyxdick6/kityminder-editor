define(function (require, exports, module) {
	var Debug = require('../tool/debug');
	var debug = new Debug('node');
	var debughb = new Debug('hotbox');

	function NodeRuntime() {
		var runtime = this;
		var minder = this.minder;
		var hotbox = this.hotbox;
		var fsm = this.fsm;

		var defaultButtons = {
			'center' : {
				'button' : ['编辑:F2:Editnode']
			},
			'ring' : {
				'button' : [
					'前移:Alt+Up:ArrangeUp',
					'下级:Tab:AppendChildNode',
					'同级:Enter:AppendSiblingNode',
					'后移:Alt+Down:ArrangeDown',
					'删除:Delete|Backspace:RemoveNode',
					'归纳:Shift+Tab|Shift+Insert:AppendParentNode',
					'整理:Ctrl+R:ResetLayout'
				]
			},
			'top' : {
				'button' : [
					'超链接:H:input|hyperLink',
					'图片:I:input|image',
					'备注:N:input|note',
					'优先级:P:next|priority',
					'进度:G:next|progress',
					'资源:R:input|resource'
				],
				'subMenu' : {
					'priority' : {
						'ring' : {
							'button' : [
								'1级:1:priority|1',
								'2级:2:priority|2',
								'3级:3:priority|3',
								'4级:4:priority|4',
								'5级:5:priority|5',
								'6级:6:priority|6',
								'7级:7:priority|7',
								'8级:8:priority|8',
								'9级:9:priority|9'
							]
						},
						'center' : {
							'button' : ['移除:Del:priority']
						},
						'top' : {
							'button' : ['返回:Esc:next|back']
						}
					},
					'progress' : {
						'ring' : {
							'button' : [
								'未开始:0:progress|1',
								'1/8:1:progress|2',
								'2/8:2:progress|3',
								'3/8:3:progress|4',
								'4/8:4:progress|5',
								'5/8:5:progress|6',
								'6/8:6:progress|7',
								'7/8:7:progress|8',
								'8/8:8:progress|9'
							]
						},
						'center' : {
							'button' : ['移除:Del:progress']
						},
						'top' : {
							'button' : ['返回:Esc:next|back']
						}
					}
				}
			},
			'bottom' : {
				'button' : [
					'模板:T:next|theme',
					'布局:L:next|template',
					'样式:S:next|style',
					'展开:/:Expand',
					'放大:+|=:zoomin',
					'缩小:-:zoomout'
				],
				'subMenu' : {
					'theme' : {
						'bottom' : {
							'button' : [
								'紧凑经典::theme|classic-compact',
								'紧凑天盘::theme|tianpan-compact',
								'紧凑冷光::theme|snow-compact',
								'紧凑蓝::theme|fresh-blue-compat',
								'紧凑绿::theme|fresh-green-compat',
								'紧凑粉::theme|fresh-pink-compat',
								'紧凑紫::theme|fresh-purple-compat',
								'紧凑红::theme|fresh-red-compat',
								'紧凑黄::theme|fresh-soil-compat',
								'线框::theme|wire',
							]
						},
						'center' : {
							'button' : ['返回:Esc:next|back']
						},
						'top' : {
							'button' : [
								'脑图经典::theme|classic',
								'经典天盘::theme|tianpan',
								'温柔冷光::theme|snow',
								'天空蓝::theme|fresh-blue',
								'文艺绿::theme|fresh-green',
								'脑残粉::theme|fresh-pink',
								'浪漫紫::theme|fresh-purple',
								'清新红::theme|fresh-red',
								'泥土黄::theme|fresh-soil',
								'鱼骨图::theme|fish',
							]
						}
					},
					'template' : {
						'top' : {
							'button' : [
								'思维导图:S:template|default',
								'组织结构图:O:template|structure',
								'目录组织图:M:template|filetree'
							]
						},
						'center' : {
							'button' : ['返回:Esc:next|back']
						},
						'bottom' : {
							'button' : [
								'逻辑结构图:L:template|right',
								'鱼骨图:F:template|fish-bone',
								'天盘图:T:template|tianpan'
							]
						}
					}
				}
			}

		}
		var showButton = '前移|下级|同级|后移|删除|归纳|整理';

		function initOption(option, oldOption) {
			if (option.hasOwnProperty('addBtn')) {
				var buttons = option.addBtn;
				for (var position in buttons) {
					var newbtn = buttons[position].button;
					if (!oldOption.hasOwnProperty(position)) {
						oldOption[position] = {
							button : []
						};
					}
					oldOption[position].button = oldOption[position].button.concat(newbtn);

					if (buttons[position].hasOwnProperty('subMenu')) {
						var submenu = buttons[position].subMenu;
						for (var skey in submenu) {
							if (!oldOption[position].subMenu.hasOwnProperty(skey)) {
								oldOption[position].subMenu[skey] = {};
							}
							initOption(submenu[skey], oldOption[position].subMenu[skey]);
						}
					}
				}
			}
			if (option.hasOwnProperty('showBtn')) {
				showButton = option.showBtn || showButton;
			}

		}
		initOption(this.option.hotbox, defaultButtons);
		addHotbox(defaultButtons, 'main');

		function addHotbox(buttons, state) {
			var states = hotbox.state(state);

			for (var position in buttons) {
				buttons[position].button.forEach(function (button) {
					var parts = button.split(':');
					var label = parts.shift();
					var isShow = true;
					if (showButton.indexOf(label) == -1 && state == 'main') {
						isShow = false;
					}

					if (isShow) {
						var key = parts.shift();
						var command = parts.shift().split('|');
						var option = {
							position : position,
							label : label,
							enable : function () {
								return minder.queryCommandState(command[0]) != -1;
							}
						}
						if(key != ''){
							option.key = key;
						}
						if (command.length > 1) {
							if (command[0] == 'next') {
								option.next = command[1];
							} else {
								option.action = function () {
									minder.execCommand(command[0], command[1]);
									fsm.jump(fsm.preState(), 'command-executed');
								};
							}
						} else {
							option.action = function () {
								minder.execCommand(command[0]);
								fsm.jump(fsm.preState(), 'command-executed');
							}
						}
						states.button(option);
					}
				});
				if (buttons[position].hasOwnProperty('subMenu')) {
					var submenu = buttons[position].subMenu
						for (var key in submenu) {
							addHotbox(submenu[key], key)
						}

				}

			}
		}

		// var priority = hotbox.state('style');
		// '123456789'.split('').forEach(function (p) {
		// priority.button({
		// position : 'ring',
		// label : 'P' + p,
		// key : p,
		// action : function () {
		// minder.execCommand('priority', p);
		// fsm.jump(fsm.preState(), 'command-executed');
		// },
		// render: function () {
		// console.log(this);
		// return '<div><input type="text" id="style_'+p+'"/></div>'
		// }
		// });
		// });
		// priority.button({
		// position : 'center',
		// label : '移除',
		// key : 'Del',
		// next : 'idle',
		// action : function () {
		// minder.execCommand('priority', 0);
		// fsm.jump(fsm.preState(), 'command-executed');
		// },
		// render: function () {
		// console.log(this);
		// return '<div></div>'
		// }
		// });
		// priority.button({
		// position : 'top',
		// label : '返回',
		// key : 'Esc',
		// next : 'back'
		// });
	}

	return module.exports = NodeRuntime;
});
