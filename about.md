---
layout: page
title: 关于我
permalink: /about/
---
<div class="about">
	<h2>基本信息</h2>
	{% if site.user.email%}
	<p>
		<em>email</em> : <a href="mailto:{{ site.user.email }}">celerysoft@gmail.com</a>
	</p>
	{% endif %}
	{% if site.user.weibo%}
	<p>
		<em>weibo</em> : <a href="{{ site.user.weibo }}">weibo.com/{{ site.username }}</a>
	</p>
	{% endif %}
	{% if site.user.twitter%}
	<p>
		<em>twitter</em> : <a href="{{ site.user.twitter }}">twitter.com/{{ site.username }}</a>
	</p>
	{% endif %}
	{% if site.user.github %}
	<p>
		<em>github</em> : <a href="{{ site.user.github}} ">github.com/{{ site.username }}</a>
	</p>
	{% endif %}

	{% if site.user.desc %}
		<h2>个人简介</h2>
		<p>
			{{ site.user.desc }}
		</p>
	{% endif %}

	<h2>语言：</h2>
	<div class='row'>
	    <div class='col-xs-8'>
	        <div class='progress'>
	            <div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='80' aria-valuemin='0' aria-valuemax='100' style='width: 66%'>
	                <span>熟悉</span>
	            </div>
	        </div>
	    </div>
	    <div class='col-sm-2'>
	        <em>Android</em>
	    </div>
	</div>
	<div class='row'>
	    <div class='col-xs-8'>
	        <div class='progress'>
	            <div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='80' aria-valuemin='0' aria-valuemax='100' style='width: 66%'>
	                <span>熟悉</span>
	            </div>
	        </div>
	    </div>
	    <div class='col-sm-2'>
	        <em>Java</em>
	    </div>
	</div>
	<div class='row'>
	    <div class='col-xs-8'>
	        <div class='progress'>
	            <div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='80' aria-valuemin='0' aria-valuemax='100' style='width: 33%'>
	                <span>了解</span>
	            </div>
	        </div>
	    </div>
	    <div class='col-sm-2'>
	        <em>iOS</em>
	    </div>
	</div>
	<div class='row'>
	    <div class='col-xs-8'>
	        <div class='progress'>
	            <div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='80' aria-valuemin='0' aria-valuemax='100' style='width: 33%'>
	                <span>了解</span>
	            </div>
	        </div>
	    </div>
	    <div class='col-sm-2'>
	        <em>Objective-C</em>
	    </div>
	</div>
	<div class='row'>
	    <div class='col-xs-8'>
	        <div class='progress'>
	            <div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='80' aria-valuemin='0' aria-valuemax='100' style='width: 33%'>
	                <span>了解</span>
	            </div>
	        </div>
	    </div>
	    <div class='col-sm-2'>
	        <em>Flex</em>
	    </div>
	</div>
	<div class='row'>
	    <div class='col-xs-8'>
	        <div class='progress'>
	            <div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='80' aria-valuemin='0' aria-valuemax='100' style='width: 33%'>
	                <span>了解</span>
	            </div>
	        </div>
	    </div>
	    <div class='col-sm-2'>
	        <em>C++</em>
	    </div>
	</div>

	<h2>标签：</h2>
	<p>
	    <button class='btn btn-default btn-sm'>Android</button>
	    <button class='btn btn-default btn-sm'>Java</button>
	    <button class='btn btn-default btn-xs'>iOS</button>
			<button class='btn btn-default btn-xs'>Objective-C</button>
	    <button class='btn btn-default btn-xs'>Flex</button>
	    <button class='btn btn-default btn-xs'>C++</button>
	</p>

	{% include extends/disqus.html %}
</div>
