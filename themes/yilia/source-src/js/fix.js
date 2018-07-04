function init() {
	// 由于hexo分页不支持，手工美化
	var $nav = document.querySelector('#page-nav')
	if ($nav && !document.querySelector('#page-nav .extend.prev')) {
		$nav.innerHTML = '<a class="extend prev disabled" rel="prev">&laquo; 上一页</a>' + $nav.innerHTML
	}
	if ($nav && !document.querySelector('#page-nav .extend.next')) {
		$nav.innerHTML = $nav.innerHTML + '<a class="extend next disabled" rel="next">下一页 &raquo;</a>'
	}

	// 新窗口打开
	if (yiliaConfig && yiliaConfig.open_in_new) {
		let $a = document.querySelectorAll(('.article-entry a:not(.article-more-a)'))
		$a.forEach(($em) => {
			let target = $em.getAttribute('target');
			if (!target || target === '') {
				$em.setAttribute('target', '_blank');
			}
		})
	}
	// 目录序号
	if (yiliaConfig && yiliaConfig.toc_hide_index) {
		let $a = document.querySelectorAll(('.toc-number'))
		$a.forEach(($em) => {
			$em.style.display = 'none';
		})
	}

	// about me 转义
	var $aboutme = document.querySelector('#js-aboutme')
	if ($aboutme && $aboutme.length !== 0) {
		$aboutme.innerHTML = $aboutme.innerText
	}
	
}

module.exports = {
	init: init
}