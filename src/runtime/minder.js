/**
 * @fileOverview
 *
 * 脑图示例运行时
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function (require, exports, module) {
	var Minder = require('../minder');

	function MinderRuntime() {

		//初始化配置
		var default_option = {
			minder : {
				enableKeyReceiver : false,
				enableAnimation : true,
			}

		}
		var options = $.extend(true, default_option, this.option.minder)

			// 不使用 kityminder 的按键处理，由 ReceiverRuntime 统一处理
			var minder = new Minder(options);

		// 渲染，初始化
		minder.renderTo(this.selector);
		minder.setTheme(null);
		minder.setTemplate(options.defaultTemplate);
		minder.select(minder.getRoot(), true);
		minder.execCommand('text', this.option.defaultText || '中心主题');

		// 导出给其它 Runtime 使用
		this.minder = minder;

	}

	return module.exports = MinderRuntime;
});
