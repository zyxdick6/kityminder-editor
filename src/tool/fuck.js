/**
 * @fileOverview
 *
 * 创建导航器的 DOM 元素以及交互的逻辑代码
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function (require, exports, module) {
	var tools = {
		createViewNavigator : function () {
			var minder = editor.minder;
			var $previewNavigator = $('<div>')
				.addClass('preview-navigator')
				.appendTo('#minder-editor');

			// 画布，渲染缩略图
			var paper = new kity.Paper($previewNavigator[0]);

			// 用两个路径来挥之节点和连线的缩略图
			var nodeThumb = paper.put(new kity.Path());
			var connectionThumb = paper.put(new kity.Path());

			// 表示可视区域的矩形
			var visibleRect = paper.put(new kity.Rect(100, 100).stroke('red', '1%'));

			var contentView = new kity.Box(),
			visibleView = new kity.Box();

			navigate();

			$previewNavigator.show = function () {
				$.fn.show.call(this);
				bind();
				updateContentView();
				updateVisibleView();
			};

			$previewNavigator.hide = function () {
				$.fn.hide.call(this);
				unbind();
			};

			function bind() {
				minder.on('layout layoutallfinish', updateContentView);
				minder.on('viewchange', updateVisibleView);
			}

			function unbind() {
				minder.off('layout layoutallfinish', updateContentView);
				minder.off('viewchange', updateVisibleView);
			}

			window.u = updateContentView;

			function navigate() {

				function moveView(center, duration) {
					var box = visibleView;
					center.x = -center.x;
					center.y = -center.y;

					var viewMatrix = minder.getPaper().getViewPortMatrix();
					box = viewMatrix.transformBox(box);

					var targetPosition = center.offset(box.width / 2, box.height / 2);

					minder.getViewDragger().moveTo(targetPosition, duration);
				}

				var dragging = false;

				paper.on('mousedown', function (e) {
					dragging = true;
					moveView(e.getPosition('top'), 200);
					$previewNavigator.addClass('grab');
				});

				paper.on('mousemove', function (e) {
					if (dragging) {
						moveView(e.getPosition('top'));
					}
				});

				$(window).on('mouseup', function () {
					dragging = false;
					$previewNavigator.removeClass('grab');
				});
			}
			function updateContentView() {

				var view = minder.getRenderContainer().getBoundaryBox();

				contentView = view;

				var padding = 30;

				paper.setViewBox(
					view.x - padding - 0.5,
					view.y - padding - 0.5,
					view.width + padding * 2 + 1,
					view.height + padding * 2 + 1);

				var nodePathData = [];
				var connectionThumbData = [];

				minder.getRoot().traverse(function (node) {
					var box = node.getLayoutBox();
					nodePathData.push('M', box.x, box.y,
						'h', box.width, 'v', box.height,
						'h', -box.width, 'z');
					if (node.getConnection() && node.parent && node.parent.isExpanded()) {
						connectionThumbData.push(node.getConnection().getPathData());
					}
				});

				paper.setStyle('background', minder.getStyle('background'));

				if (nodePathData.length) {
					nodeThumb
					.fill(minder.getStyle('root-background'))
					.setPathData(nodePathData);
				} else {
					nodeThumb.setPathData(null);
				}

				if (connectionThumbData.length) {
					connectionThumb
					.stroke(minder.getStyle('connect-color'), '0.5%')
					.setPathData(connectionThumbData);
				} else {
					connectionThumb.setPathData(null);
				}

				updateVisibleView();
			}

			function updateVisibleView() {
				visibleView = minder.getViewDragger().getView();
				visibleRect.setBox(visibleView.intersect(contentView));
			}

			return $previewNavigator;
		}
	}
	return module.exports = tools;
});
