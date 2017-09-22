namespace RadarSoft {
    export class ChartLegend extends Legend {
        _legendCount: number;
        _seriesInfo: any;
        chartTypes: ChartTypes[];
        chartManager: ChartManager;

        constructor(olapChart: OlapGridBase) {
            super(olapChart);
            //this.container = container;

            this.chartManager = this.olapGrid.chartManager;

            this.chartTypes = this.olapGrid.chartTypes;
            this._seriesInfo = this.olapGrid._seriesInfo;


            this._colorCount = 10;
            this._legendCount = 7;

            $(this.container).data('legend', this);

            this.id = this.container.id;

        }

        getLineSize(text: string, isBold?: boolean) {
            var ctx = createCanvas().getContext("2d");
            //ctx.font = this.ChartManager.settings.fontProperties.html5Font;
            this.applayFontStyle(ctx);
            if (isBold)
                ctx.font = "bold " + ctx.font;
            return new Size(ctx.measureText(text).width, this.chartManager.settings.fontProperties.fontSize); //this.legendSettings.FontSize);// 
        };

        drawItem(text: string, brush: Brush, grd: GradientBrush, size: Size, shape: Shape) {
            var legendType = this.getLegendType();
            var defSize = this.chartManager.GetDefaultPointSize();
            var shapeW = defSize.width * (this.chartManager.maxMultiplier + this.chartManager.minMultiplier);
            var shapeH = defSize.height * (this.chartManager.maxMultiplier + this.chartManager.minMultiplier);
            var res: DrawableObject = null;
            var ctx = this.drawAreaLayer.GetContext();
            //ctx.font = this.ChartManager.settings.fontProperties.html5Font;
            var padY = this.itemSize.height + this.itemPadY;
            var pos = new Position((shapeW / 2) + this.drawY, (shapeH / 2) + this.itemPadX);
            var textPadX = shapeW + 1.5 * this.itemPadX;

            switch (legendType) {
                case LegendTypes.cercle:
                    pos = new Position(shapeW / 2 + this.drawY, (shapeH / 2) + 2 + this.itemPadX);
                    res = new Point(false, new Descriptor(pos,
                        size, brush, null, grd), shape);
                    break;
                case LegendTypes.line:
                    pos = new Position(shapeW / 2 + this.drawY, 6 + this.itemPadX);
                    var nextPosition = new Position(shapeW / 2 + this.drawY + padY, 20 + this.itemPadX);
                    var spline = new linearTrend();
                    spline.BuildFunc([pos.left, nextPosition.left], [pos.top, pos.top], 2);
                    res = new PolyLine(
                        new Descriptor(pos, size, brush),
                        spline, nextPosition);
                    break;
                case LegendTypes.sector:
                    var startAngle = -0.7;
                    var endAngle = 0.7;
                    var radius = 10;
                    var descriptor = new Descriptor(pos, null,
                        brush, null, grd);
                    res = new Pie(descriptor, radius,
                        startAngle, endAngle);
                    break;
                case LegendTypes.bar:
                    pos = new Position(3 + this.drawY, 8 + this.itemPadX);
                    size = new Size(12, 16);
                    res = new Bar(new Descriptor(pos, size, brush, null, grd));
                    break;
            }

            res.beginDraw(this.drawAreaLayer);

            if (legendType == LegendTypes.line) {
                pos = new Position(shapeW / 2 + this.drawY, shapeW / 2 + 2 + this.itemPadX);
                res = new Point(false, new Descriptor(pos,
                    size, brush, null, grd), shape);
                res.beginDraw(this.drawAreaLayer);
            }

            if (text) {
                this.applayFontStyle(ctx);
                ctx.fillText(text, textPadX, this.drawY + padY);
            }

            this.drawY += padY;

            var itemWidth = ctx.measureText(text).width;
            if (this.canvasWidth < itemWidth)
                this.canvasWidth = itemWidth;
        };

        difineLegendSize() {
            var legendHeight = 0.0;
            var legendWidth = 0.0;
            var seriesInfo;
            var obj;
            var lineWidth = 0.0;
            var text;
            var shapeW = 0.0;
            var shapeH = 0.0;
            var value = 0.0;
            var displayValue = 0;
            var displayName = "";
            var defSize = this.chartManager.GetDefaultPointSize();

            for (var groupAttr in this.hierarchyItems) {

                text = this.chartManager.getLastVisibleLevel(this.olapGrid._hierarchies[groupAttr].Levels).DisplayName;
                lineWidth = this.getLineSize(text, true).width + this.headerPadX;

                if (legendWidth < lineWidth)
                    legendWidth = lineWidth;

                legendHeight += this.headerSize.height + this.headerPadY;

                seriesInfo = this.hierarchyItems[groupAttr];

                for (var siAttr in seriesInfo) {

                    obj = seriesInfo[siAttr];
                    displayName = obj.sizeMember ? obj.sizeMember.DisplayName
                        : obj.colorMember ? obj.colorMember.DisplayName
                            : obj.shapeMember ? obj.shapeMember.DisplayName
                                : null;

                    if (!displayName || displayName == 'default')
                        continue;

                    lineWidth = this.getLineSize(displayName).width + 1.5 * this.itemPadX;

                    shapeW = defSize.width * (this.chartManager.maxMultiplier + this.chartManager.minMultiplier);
                    shapeH = obj.sizeMember ? (obj.sizeMember.SizeMultiplier * defSize.height)
                        : (this._seriesInfo['default'].sizeMember.SizeMultiplier * defSize.height);

                    lineWidth += shapeW;

                    if (legendWidth < lineWidth)
                        legendWidth = lineWidth;

                    legendHeight += this.itemPadY;

                    if (this.itemSize.height > shapeH)
                        legendHeight += this.itemSize.height;
                    else
                        legendHeight += shapeH;
                }
            }

            for (var attr in this.measureItems) {

                obj = this._seriesInfo[attr];

                if (this.olapGrid._measures[attr] == null)
                    continue;

                text = this.olapGrid._measures[attr].DisplayName;

                lineWidth = this.getLineSize(text, true).width + this.headerPadX;

                if (legendWidth < lineWidth)
                    legendWidth = lineWidth;

                legendHeight += this.headerSize.height + this.headerPadY;

                for (var ind in this.measureItems[attr]) {

                    value = this.measureItems[attr][ind];
                    displayValue = Math.round(value);
                    lineWidth = this.getLineSize(displayValue.toString()).width + 1.5 * this.itemPadX;

                    var maxSizeValue = obj.sizeMembers ? obj.sizeMembers.SizeMaxValue : 0;
                    var minSizeValue = obj.sizeMembers ? obj.sizeMembers.SizeMinValue : 0;

                    var sizeK = this._seriesInfo['default'].sizeMember.SizeMultiplier;
                    if (obj.sizeMembers != null) {
                        sizeK = maxSizeValue != minSizeValue ?
                            this.chartManager.minMultiplier + (this.chartManager.maxMultiplier - this.chartManager.minMultiplier) * (displayValue - minSizeValue) / (maxSizeValue - minSizeValue) :
                            this.chartManager.maxMultiplier;
                    }

                    shapeW = defSize.width * (this.chartManager.maxMultiplier + this.chartManager.minMultiplier);
                    shapeH = sizeK * defSize.height;

                    lineWidth += shapeW;

                    if (legendWidth < lineWidth)
                        legendWidth = lineWidth;

                    legendHeight += this.itemPadY;

                    if (this.itemSize.height > shapeH)
                        legendHeight += this.itemSize.height;
                    else
                        legendHeight += shapeH;
                }
            }

            this.legendSize = new Size(Math.ceil(legendWidth) + 1, Math.ceil(legendHeight) + 1);
        };

        applayFontStyle(ctx: CanvasRenderingContext2D) {
            var contentStyle = this.olapGrid.jqRS_OG(".ui-widget-content").first();
            ctx.strokeStyle = contentStyle.css("color");
            ctx.fillStyle = contentStyle.css("color");
            ctx.font = contentStyle.css("font-size") + " " + contentStyle.css("font-family");;
        };


        initLegendItems() {
            var obj;
            var groupUniqName;
            var displayName;
            var step = this._legendCount;
            this.measureItems = {};
            this.hierarchyItems = {};

            for (var attr in this._seriesInfo) {
                groupUniqName = null;
                if (attr != 'default') {
                    if ((attr == this.layout.SizeAxisItem && this.cellset.SizeChartMembers == null)
                        || (attr == this.layout.ColorAxisItem && this.cellset.ColorChartMembers == null)) {

                        this.measureItems[attr] = [];

                        obj = this._seriesInfo[attr];
                        var maxSizeValue = obj.sizeMembers ? obj.sizeMembers.SizeMaxValue : 0;
                        var minSizeValue = obj.sizeMembers ? obj.sizeMembers.SizeMinValue : 0;

                        var maxColorValue = obj.colorMembers ? obj.colorMembers.ColorMaxValue : 0;
                        var minColorValue = obj.colorMembers ? obj.colorMembers.ColorMinValue : 0;

                        if (obj.sizeMembers != null && maxSizeValue == minSizeValue)
                            step = 1;

                        if (obj.colorMembers != null && maxColorValue == minColorValue)
                            step = 1;

                        var sizeValueStep = (maxSizeValue == minSizeValue) ? 0 : (maxSizeValue - minSizeValue) / (step - 1);

                        var colorValueStep = (maxColorValue == minColorValue) ? 0 : (maxColorValue - minColorValue) / (step - 1);

                        if (Math.abs(sizeValueStep) == Infinity || Math.abs(colorValueStep) == Infinity)
                            continue;


                        for (var i = 0; i < step; i++) {

                            var sizeValue = minSizeValue + i * sizeValueStep;
                            if (obj.sizeMembers != null)
                                displayName = sizeValue;


                            var colorValue = minColorValue + i * colorValueStep;
                            if (obj.colorMembers != null)
                                displayName = colorValue;

                            if (displayName)
                                this.measureItems[attr].push(displayName);
                        }
                    }
                    else {
                        obj = this._seriesInfo[attr];
                        groupUniqName = obj.sizeMember ? obj.sizeMember.GroupUniqName
                            : obj.colorMember ? obj.colorMember.GroupUniqName
                                : obj.shapeMember ? obj.shapeMember.GroupUniqName
                                    : null;
                        if (!groupUniqName)
                            continue;

                        if (this.hierarchyItems[groupUniqName] == null)
                            this.hierarchyItems[groupUniqName] = [];

                        this.hierarchyItems[groupUniqName].push(obj);
                    }
                }
            }
        };

        applyLegend() {
            var table = document.createElement('table');
            $(table).css("text-align", "center");

            var displayName = "";
            var shortName = "";
            var uniqueName = "";

            var row = null;
            var colorTd = null;
            var memberTd = null;
            var span = null;
            var colorDiv = null;
            var brush = null;
            var grd = null;
            var shapeW = null;
            var shapeH = null;
            var size = null;
            var defSize = this.chartManager.GetDefaultPointSize();
            var shape = null;
            var step = this._legendCount;
            var obj = null;
            var seriesInfo = null;
            var canvas = null;
            var level = null;
            for (var groupAttr in this.hierarchyItems) {

                row = document.createElement('tr');
                colorTd = document.createElement('td');
                colorTd.colSpan = 2;
                span = document.createElement('span');
                span.style.fontWeight = "Bold";
                span.style.whiteSpace = "nowrap";
                colorTd.appendChild(span);
                row.appendChild(colorTd);
                level = this.chartManager.getLastVisibleLevel(this.olapGrid._hierarchies[groupAttr].Levels);
                shortName = cutText(level.DisplayName, this.olapGrid.get_settings().maxTextLength);
                if (this.olapGrid.get_settings().maxTextLength < level.DisplayName.length)
                    span.title = level.DisplayName;
                span.innerHTML = shortName;
                colorTd.appendChild(span);

                //*
                this.drawHeader(level.DisplayName);
                //**

                table.appendChild(row);
                seriesInfo = this.hierarchyItems[groupAttr];

                for (var siAttr in seriesInfo) {
                    obj = seriesInfo[siAttr];
                    displayName = obj.sizeMember ? obj.sizeMember.DisplayName
                        : obj.colorMember ? obj.colorMember.DisplayName
                            : obj.shapeMember ? obj.shapeMember.DisplayName
                                : null;

                    uniqueName = obj.sizeMember ? obj.sizeMember.UniqueName
                        : obj.colorMember ? obj.colorMember.UniqueName
                            : obj.shapeMember ? obj.shapeMember.UniqueName
                                : null;

                    if (!displayName || displayName == 'default')
                        continue;

                    row = document.createElement('tr');
                    $(row).attr("uid", groupAttr + "|" + uniqueName).css('cursor', 'pointer').click({
                        legend: this
                    },
                        function (event) {
                            var member = (<string>$(event.target).findAttr('uid')).split("|");
                            event.data.legend.selectMemberPoints(member[1]);
                        });
                    colorTd = document.createElement('td');
                    memberTd = document.createElement('td');
                    span = document.createElement('span');
                    span.style.whiteSpace = "nowrap";
                    shortName = cutText(displayName, this.olapGrid.get_settings().maxTextLength);
                    if (this.olapGrid.get_settings().maxTextLength < displayName.length)
                        span.title = displayName;
                    span.innerHTML = shortName;


                    memberTd.appendChild(span);
                    row.appendChild(colorTd);
                    row.appendChild(memberTd);
                    colorDiv = document.createElement('div');

                    brush = obj.colorMember ? obj.colorMember.Color : this._seriesInfo['default'].colorMember.Color;
                    grd = obj.colorMember ? obj.colorMember.Gradient
                        : this._seriesInfo['default'].colorMember.Gradient;
                    shapeW = obj.sizeMember ? (obj.sizeMember.SizeMultiplier * defSize.width)
                        : (this._seriesInfo['default'].sizeMember.SizeMultiplier * defSize.width);
                    shapeH = obj.sizeMember ? (obj.sizeMember.SizeMultiplier * defSize.height)
                        : (this._seriesInfo['default'].sizeMember.SizeMultiplier * defSize.height);
                    size = new Size(shapeW, shapeH);
                    shape = obj.shapeMember ? obj.shapeMember.Shape
                        : this._seriesInfo['default'].shapeMember.Shape;

                    //*
                    this.drawItem(displayName, brush, grd, size, shape);
                    //**


                    canvas = this.drawLegendItem(brush, grd, size, shape);

                    colorDiv.appendChild(canvas);
                    colorTd.appendChild(colorDiv);
                    table.appendChild(row);
                }
            }

            for (var attr in this.measureItems) {

                obj = this._seriesInfo[attr];

                if (this.olapGrid._measures[attr] == null)
                    continue;

                row = document.createElement('tr');
                colorTd = document.createElement('td');
                colorTd.colSpan = 2;
                span = document.createElement('span');
                span.style.fontWeight = "Bold";
                span.style.whiteSpace = "nowrap";
                shortName = cutText(this.olapGrid._measures[attr].DisplayName, this.olapGrid.get_settings().maxTextLength);
                if (this.olapGrid.get_settings().maxTextLength < this.olapGrid._measures[attr].DisplayName)
                    span.title = this.olapGrid._measures[attr].DisplayName;
                span.innerHTML = shortName;

                //*
                this.drawHeader(this.olapGrid._measures[attr].DisplayName);
                //**

                colorTd.appendChild(span);
                row.appendChild(colorTd);
                table.appendChild(row);

                for (var ind in this.measureItems[attr]) {
                    var displayValue = this.measureItems[attr][ind] as number;
                    row = document.createElement('tr');
                    colorTd = document.createElement('td');
                    memberTd = document.createElement('td');
                    span = document.createElement('span');
                    span.style.whiteSpace = "nowrap";
                    memberTd.appendChild(span);
                    row.appendChild(colorTd);
                    row.appendChild(memberTd);
                    colorDiv = document.createElement('div');

                    shape = this._seriesInfo['default'].shapeMember.Shape;
                    brush = this._seriesInfo['default'].colorMember.Color;

                    var maxSizeValue = obj.sizeMembers ? obj.sizeMembers.SizeMaxValue : 0;
                    var minSizeValue = obj.sizeMembers ? obj.sizeMembers.SizeMinValue : 0;

                    var sizeK = this._seriesInfo['default'].sizeMember.SizeMultiplier;
                    if (obj.sizeMembers != null) {
                        sizeK = maxSizeValue != minSizeValue ?
                            this.chartManager.minMultiplier + (this.chartManager.maxMultiplier - this.chartManager.minMultiplier) * (displayValue - minSizeValue) / (maxSizeValue - minSizeValue) :
                            this.chartManager.maxMultiplier;
                        //?
                        displayName = Math.round(displayValue).toString();
                    }

                    shapeW = sizeK * defSize.width;
                    shapeH = sizeK * defSize.height;
                    size = new Size(shapeW, shapeH);

                    if (obj.colorMembers != null) {
                        displayName = Math.round(displayValue).toString();
                        var colorInfo = this.olapGrid.getColorByMeasureValue(displayValue);
                        brush = new Brush(colorInfo.borderColor, colorInfo.color, { lineWidth: 1, opacity: 0.5 });
                    }

                    span.innerHTML = displayName;

                    //*
                    this.drawItem(displayName, brush, grd, size, shape);
                    //**
                    canvas = this.drawLegendItem(brush, grd, size, shape);

                    colorDiv.appendChild(canvas);
                    colorTd.appendChild(colorDiv);
                    table.appendChild(row);

                }
            }

            var legendContainer = $(this.legendContainer);
            legendContainer.children().remove();

            var domContainer = $(this.container);
            //        domContainer.unbind('contextmenu').bind('contextmenu', {
            //            grid: this.olapChart
            //        }, this.olapChart.createPopup);
            domContainer.children().remove();

            legendContainer.append(this.drawAreaLayer.canvas);
            domContainer.append(this.legendContainer);

            //domContainer.append(table);
        };


        drawLegendItem(brush: Brush, grd: GradientBrush, size: Size, shape: Shape) {

            var legendType = this.getLegendType();
            var defSize = this.chartManager.GetDefaultPointSize();
            var canvW = defSize.width * (this.chartManager.maxMultiplier + this.chartManager.minMultiplier);
            var canvH = defSize.height * (this.chartManager.maxMultiplier + this.chartManager.minMultiplier);
            var pos = new Position(canvW / 2, canvH / 2);
            var res = null;


            switch (legendType) {
                case LegendTypes.cercle:
                    pos = new Position(canvW / 2, canvW / 2 + 2);
                    res = new Point(false, new Descriptor(pos,
                        size, brush, null, grd), shape);
                    break;
                case LegendTypes.line:
                    pos = new Position(canvW / 2, 6);
                    var nextPosition = new Position(canvW / 2, 20);
                    var spline = new linearTrend();
                    spline.BuildFunc([pos.left, nextPosition.left], [pos.top, pos.top], 2);
                    res = new PolyLine(
                        new Descriptor(pos, size, brush),
                        spline, nextPosition);
                    break;
                case LegendTypes.sector:
                    var startAngle = -0.7;
                    var endAngle = 0.7;
                    var radius = 10;
                    var descriptor = new Descriptor(pos, null,
                        brush, null, grd);
                    res = new Pie(descriptor, radius,
                        startAngle, endAngle);
                    break;
                case LegendTypes.bar:
                    pos = new Position(3, 8);
                    size = new Size(12, 16);
                    res = new Bar(new Descriptor(pos, size, brush, null, grd));
                    break;
            }

            var layer = new Layer();
            var canvas = layer.GetCanvas();
            canvas.width = canvW;
            canvas.height = canvW;
            canvas.style.position = '';
            var ctx = layer.GetContext();
            //ctx.translate(0.5, 0.5);
            res.beginDraw(layer);

            if (legendType == LegendTypes.line) {
                pos = new Position(canvW / 2, canvW / 2 + 2);
                res = new Point(false, new Descriptor(pos,
                    size, brush, null, grd), shape);
                res.beginDraw(layer);
            }

            return canvas;
        };

        getLegendType() {
            if (this.chartTypes.length == 0)
                return LegendTypes.cercle;

            if (this.chartTypes.length > 1) {
                var same = true;
                for (var i = 0; i < this.chartTypes.length - 1; i++) {
                    same = this.chartTypes[i] == this.chartTypes[i + 1];
                    if (same == false)
                        return LegendTypes.cercle;
                }
            }

            switch (this.chartTypes[0]) {
                case ChartTypes.pie:
                    return LegendTypes.sector;
                case ChartTypes.bar:
                case ChartTypes.deltaBar:
                case ChartTypes.percentBar:
                    return LegendTypes.bar;
                case ChartTypes.points:
                    return LegendTypes.cercle;
                default:
                    return LegendTypes.line;
            }
        };

        selectMemberPoints(member: any) {
            var charts = this.chartManager.charts;
            var memberPoints = null;
            for (var i = 0; i < charts.length; i++) {
                memberPoints = this.getMemberPoints(charts[i], member);
                if (memberPoints.length == 0)
                    continue;
                charts[i].SelectShape(memberPoints);
            }
        };

        getMemberPoints(chart: Chart, member: any) {
            var memberPoints = [];
            var layer = null;
            var shape: Shape = null;
            for (var j = 0; j < chart.drawingLayers.length; j++) {
                layer = chart.drawingLayers[j];
                for (var k = 0; k < layer.shapes.length; k++) {
                    shape = layer.shapes[k] as Shape;
                    if (shape.data && shape.data.series && shape.data.series.ColorMember == member
                        || shape.data && shape.data.series && shape.data.series.SizeMember == member
                        || shape.data && shape.data.series && shape.data.series.ShapeMember == member) {
                        memberPoints.push(shape);
                    }
                }
            }
            //		if (chart.processServiceLayers) {
            //		    for (var s = 0; s < chart.serviceLayers.length; s++) {
            //		        layer = chart.serviceLayers[s];
            //		        for (var l = 0; l < layer.shapes.length; l++) {
            //		            shape = layer.shapes[l];
            //		            if (shape.data && shape.data.func == member
            //		            || shape.data.func.shapeInfo.UniqueName == member
            //		            || shape.data.func.sizeInfo.UniqueName == member) {
            //		                memberPoints = memberPoints.push(shape);
            //		            }
            //		        }
            //		    }
            //		}

            return memberPoints;

        };
    }
}