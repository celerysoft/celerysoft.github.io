---
layout: page
title: 标签
metatag: 标签
permalink: /tag/
---

{% if page.tags.size > 0 %}
    {% capture tags_content %}Posted with {% if page.tags.size == 1 %}<i class="fa fa-tag"></i>{% else %}<i class="fa fa-tags"></i>{% endif %}: {% endcapture %}
    {% for post_tag in page.tags %}
        {% for data_tag in site.data.tags %}
            {% if data_tag.slug == post_tag %}
                {% assign tag = data_tag %}
            {% endif %}
        {% endfor %}
        {% if tag %}
            {% capture tags_content_temp %}{{ tags_content }}<a href="/blog/tag/{{ tag.slug }}/">{{ tag.name }}</a>{% if forloop.last == false %}, {% endif %}{% endcapture %}
            {% assign tags_content = tags_content_temp %}
        {% endif %}
    {% endfor %}
{% else %}
    {% assign tags_content = '' %}
{% endif %}

<p id="post-meta">{{ tags_content }}</p>

<h1>Articles by tag :{{ page.tag }}</h1>
<div>
    {% if site.tags[page.tag] %}
        {% for post in site.tags[page.tag] %}
            <a href="{{ post.url }}/">{{ post.title }}</a>
        {% endfor %}
    {% else %}
        <p>There are no posts for this tag.</p>
    {% endif %}
</div>
