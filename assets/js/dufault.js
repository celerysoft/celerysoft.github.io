$(document).ready(function() {
  $('.post img').addClass('img-responsive');
  $('.page img').addClass('img-responsive');
});

/* 下滑滚动导航菜单，上滑显示导航菜单开始 */
// pc端
$(window).scroll(function() {
  if ($(this).scrollTop() == 0) {
    $('.navbar').fadeIn(200);
  }
});

var scrollFunc = function(e) {
  e = e || window.event;
  var position;
  if (e.wheelDelta) { //IE/Opera/Chrome
    position = e.wheelDelta;
  } else if (e.detail) { //Firefox
    position = e.detail;
  }
  if (position > 0) {
    $('.navbar').fadeIn(200);
  } else {
    var currentScrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
    if (currentScrollTop > 0) {
      $('.navbar').fadeOut(200);
    }
  }
}

/* 注册监听滚动事件 */
window.addEventListener('DOMMouseScroll', scrollFunc, false); //W3C
window.onmousewheel = document.onmousewheel = scrollFunc; //IE/Opera/Chrome

// 移动端
var startX = startY = 0;
var mobileScrollTop = 0;

function touchSatrtFunc(e) {
  //e.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
  var touch = e.touches[0]; //获取第一个触点
  var x = Number(touch.pageX); //页面触点X坐标
  var y = Number(touch.pageY); //页面触点Y坐标
  startX = x;
  startY = y;
  mobileScrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
}
//touchmove事件
function touchMoveFunc(e) {
  //e.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
  var touch = e.touches[0];
  var x = touch.pageX - startX
  var y = touch.pageY - startY;

  var currentScrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
  // 返回顶部按钮
  if (currentScrollTop > 100) {
		//$('.scroll-top').fadeIn(200);
		$('.scroll-top-mobile').fadeIn(200);
  } else {
    //$('.scroll-top').fadeOut(200);
		$('.scroll-top-mobile').fadeOut(200);
  }
  // Actionbar
  if (currentScrollTop - mobileScrollTop < 20) {
    $('.navbar').fadeIn(200);
  } else if (currentScrollTop - mobileScrollTop > 20) {
    $('.navbar').fadeOut(200);
  }
}

//touchend事件
function touchEndFunc(e) {
  //e.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
  var currentScrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
  var touch = e.changedTouches[0]; //获取第一个触点
  var x = Number(touch.pageX); //页面触点X坐标
  var y = Number(touch.pageY); //页面触点Y坐标
}

document.addEventListener('touchstart', touchSatrtFunc, false);
document.addEventListener('touchmove', touchMoveFunc, false);
document.addEventListener('touchend', touchEndFunc, false);
/* 下滑滚动导航菜单，上滑显示导航菜单结束 */

/* 返回顶部按钮，开始 */
$(window).scroll(function() {
	var currentScrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
	if (currentScrollTop > 400) {
    $('.scroll-top').fadeIn(200);
  } else {
    $('.scroll-top').fadeOut(200);
  }
});
/* 返回顶部按钮，结束 */
