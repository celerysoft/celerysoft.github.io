---
layout: post
title: Flex自动调整DataGrid控件的列宽的方法
categories: Flex
tags: [Flex, DataGrid, 自适应]
---

在Flex API中，DataGrid（表格）控件的列宽并不能根据单元格的内容来自动调整，所以只能自己动手了，以下是方法：

{% highlight ActionScript3 %}

public function autoSetDataGridWidth(dataGrid:DataGrid,
                                    lengthFix:Number=0,
                                    settingType:uint=0):void
{
	//dataGrid为需要调整列宽的表格对象
	//setingType为设置类型，0为不可调整表格整体宽度，1为可调整表格整体宽度
	//lengthFix为表格宽度的修正，数值越大表格越宽，推荐数值为0.0-1.5，默认字号，表格内容为纯汉字推荐用1.0

  //起始和终止的表格宽度，调整列宽不能改变表格宽度
	const DATA_GRID_WIDTH:Number = dataGrid.width;
  //当前表格宽度
	var gridWidth:Number = 0;
	var dataProvider:IList = dataGrid.dataProvider;
	var column:GridColumn;
	var colWidth:Number = 0.0;

	//得出各列的列宽
	var gridColumnCounts:int = dataGrid.columnsLength;
	for(var i:uint = 0; i<gridColumnCounts; i++)
	{
		//根据列标题来获取列宽值
		column = dataGrid.columns.getItemAt(i) as GridColumn;
		colWidth = (column.headerText.length+lengthFix) * dataGrid.getStyle("fontSize");

		//根据该列中，每一行的内容来获取列宽值
		var dataLength:uint
		if(dataProvider)
			dataLength = dataProvider.length;
		else
			dataLength = 0;

		var width:Number = 0;
		for(var j:uint=0; j<dataLength; j++)
		{
			var content:Object = dataProvider.getItemAt(j);
			var contentLength:int = content[column.dataField].length + lengthFix;
			width = contentLength*dataGrid.getStyle("fontSize");
			//列宽值取较大者
			colWidth = width > colWidth ? width : colWidth;
		}
		column.width = colWidth;
		gridWidth += colWidth;
	}

	if(settingType == 0)//根据当前表格宽度和实际表格宽度的比值，调整各列的列宽
	{
		var scale:Number = DATA_GRID_WIDTH / gridWidth;
		for(i=0; i<dataGrid.columnsLength; i++)
		{
			column = dataGrid.columns.getItemAt(i) as GridColumn;
			column.width * = scale;
		}
	}
  //调整表格的宽度
  else
	{
		dataGrid.width = gridWidth;
  }
}

{% endhighlight %}

该方法效率不太高，需要遍历所有的内容，在表格内容很庞大的情况下不推荐使用。
