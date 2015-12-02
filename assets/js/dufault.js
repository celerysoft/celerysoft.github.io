$(document).ready(function() {
		$('.post img').addClass('img-responsive');
		$('.page img').addClass('img-responsive');
});

$(window).scroll(function() {
	if ($(this).scrollTop() == 0) {
		$('.navbar').fadeIn(200);
	}
});

var scrollFunc = function(e) {
	e = e || window.event;
	var position;
	if (e.wheelDelta) {//IE/Opera/Chrome
		position = e.wheelDelta;
	} else if (e.detail) {//Firefox
		position = e.detail;
	}
	if (position > 0) {
		$('.navbar').fadeIn(200);
	} else {
		$('.navbar').fadeOut(200);
	}
}

/*注册事件*/
if(document.addEventListener) {
	document.addEventListener('DOMMouseScroll',scrollFunc,false);
}//W3C
window.onmousewheel = document.onmousewheel = scrollFunc;//IE/Opera/Chrome
