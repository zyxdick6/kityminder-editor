/**
 * @fileOverview
 *
 * 脑图示例运行时
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function (require, exports, module) {

	function MinderRuntime() {
		var Debug = require('../tool/fuck');
		//var debug = new Debug('fsm');
		
		// 导出给其它 Runtime 使用
		this.tools = Debug;

	}

	return module.exports = MinderRuntime;
});
