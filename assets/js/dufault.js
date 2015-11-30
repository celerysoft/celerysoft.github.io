$(document).ready(function() {
		$('.post img').addClass('img-responsive');
});

// 返回顶部
$(window).scroll(function() {
	if ($(this).scrollTop() > 100) {
		$('.scroll-top').fadeIn(200);
	} else {
		$('.scroll-top').fadeOut(200);
	}
});
$('.scroll-top').bind('click', function(e) {
	e.preventDefault();
	$('body, html').animate({
		scrollTop: 0
		}, 200);
});

// 百度分享
window._bd_share_config={"common":{"bdSnsKey":{},"bdText":"","bdMini":"2","bdMiniList":false,"bdPic":"","bdStyle":"1","bdSize":"24"},"slide":{"type":"slide","bdImg":"5","bdPos":"right","bdTop":"250"}};
with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];
