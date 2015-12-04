---
layout: page
title: 标签
permalink: /tags/
---

<div class="category">
	{% assign tag_list = site.tags %}
	{% if tag_list.first[0] == null %}
    error
	{% else %}
		{% for tag in tag_list %}
		<article class="index-post">
			<h2>
				<i class="fa fa-tag"></i>
        &nbsp;&nbsp;
				{{ tag[0] | capitalize }}
			</h2>
			{% assign pages_list = tag[1] %}
			{% for node in pages_list %}
				{% if node.title != null %}
					{% if group == null or group == node.group %}
					<li>
						<i class="fa fa-file-o"></i>
						&nbsp;&nbsp;
						<a href="{{node.url}}">{{node.title}}</a>
						<span>( {{ node.date | date: "%Y/%m/%d" }} )</span>
					</li>
					{% endif %}
				{% endif %}
			{% endfor %}
			{% assign pages_list = nil %}
			</article>
		{% endfor %}
	{% endif %}
	{% assign tag_list = nil %}
</div>
