namespace RadarSoft {
    export class Legend {
        shapeHeight: number;
        shapeWidth: number;
        canvasHeight: number;
        canvasWidth: number;
        drawY: number;
        itemSize: Size;
        itemPadY: number;
        itemPadX: number;
        headerSize: Size;
        headerPadY: number;
        headerPadX: number;
        measureItems: Object;
        hierarchyItems: Object;
        legendSize: Size;
        drawAreaLayer: Layer;
        backLayer: Layer;
        selectionLayer: ServiceLayer;
        id: string;
        drawingLayers: Layer[];
        serviceLayers: Layer[];
        _colorCount: number;
        legendContainer: HTMLDivElement;
        _modifInfo: any;
        cellset: any;
        layout: any;
        container: HTMLElement;
        olapGrid: OlapGridBase;

        constructor(olapGrid: OlapGridBase) {
            this.olapGrid = olapGrid;
            this.container = olapGrid.jqRS_OG('#all_legends').get(0);
            this.layout = olapGrid.getLayout();
            this.cellset = olapGrid.getCellSet();
            this._modifInfo = olapGrid._modifInfo;

            this.legendContainer = document.createElement("div");
            this.legendContainer.style.position = "relative";
            this.legendContainer.style.top = "0";
            this.legendContainer.style.left = "0";

            this._colorCount = olapGrid._colorCount;

            RadarSoft.$(this.container).data('legend', this);
            this.serviceLayers = [];
            this.drawingLayers = [];

            this.id = this.container.id;

            this.selectionLayer = new ServiceLayer("selectionLayer");
            var selectionCanvas = this.selectionLayer.GetCanvas();
            if (selectionCanvas != null)
                selectionCanvas.style.zIndex = "1";
            this.backLayer = new ServiceLayer("backLayer");
            var backCanvas = this.backLayer.GetCanvas();
            if (backCanvas != null)
                backCanvas.style.display = "none";
            this.drawAreaLayer = new ServiceLayer("drawAreaLayer");

            this.legendSize = null;

            this.hierarchyItems = {};
            this.measureItems = {};

            this.headerPadX = 5;
            this.headerPadY = 10;
            this.headerSize = null;

            this.itemPadX = 10;
            this.itemPadY = 8;
            this.itemSize = null;

            this.drawY = 0;
            this.canvasWidth = 0;
            this.canvasHeight = 0;

            this.shapeWidth = 12;
            this.shapeHeight = 16;
        }

        getLegendImage() {
            var canvas = this.drawAreaLayer.GetCanvas();
            var axis = canvas.toDataURL();
            var w = canvas.width;
            var h = canvas.height;

            var legendImage: any = { background: null, image: axis, width: w, height: h };

            return legendImage;
        }

        initLegend() {
            this.initLegendItems();
            this.prepareDrawing();
            this.applyLegend();
        }

        prepareDrawing() {
            this.headerSize = this.getLineSize("Header height", true);
            this.itemSize = this.getLineSize("Item height", false);
            this.difineLegendSize();
            this.legendContainer.style.height = this.legendSize.height + "px";
            this.legendContainer.style.width = this.legendSize.width + "px";
            this.drawAreaLayer.canvas.height = this.legendSize.height;
            this.drawAreaLayer.canvas.width = this.legendSize.width;
            this.drawAreaLayer.beforeDraw();
            this.drawY = 0;
        }

        getLineSize(text: string, isBold?: boolean) {
            var canvas = createCanvas();
            if (canvas == null)
                return new Size(0, 0);

            var ctx = canvas.getContext("2d");
            this.applayFontStyle(ctx);
            if (isBold)
                ctx.font = "bold " + ctx.font;
            return new Size(ctx.measureText(text).width, 12);
        }

        drawHeader(header: string) {
            var ctx = this.drawAreaLayer.GetContext();
            this.applayFontStyle(ctx);
            ctx.font = "bold " + ctx.font;
            var padY = this.headerSize.height + this.headerPadY;
            ctx.fillText(header, this.headerPadX, this.drawY + padY);
            this.drawY += padY;
        }

        drawItem(text: string, brush: Brush, grd: GradientBrush, sizeChart?: any, shapeChart?: any) {
            var shapeW = this.shapeWidth;
            var shapeH = this.shapeHeight;
            var res = null;
            var ctx = this.drawAreaLayer.GetContext();

            var padY = this.itemSize.height + this.itemPadY;

            var pos = new Position(5 + this.drawY, this.itemPadX);

            var textPadX = shapeW + 1.5 * this.itemPadX;

            var size = new Size(shapeW, shapeH);
            res = new Bar(new Descriptor(pos, size, brush, null, grd));

            res.beginDraw(this.drawAreaLayer);

            if (text) {
                this.applayFontStyle(ctx);
                ctx.fillText(text, textPadX, this.drawY + padY);
            }

            this.drawY += padY;

            var itemWidth = ctx.measureText(text).width;
            if (this.canvasWidth < itemWidth)
                this.canvasWidth = itemWidth;
        }

        applayFontStyle(ctx: CanvasRenderingContext2D) {
            var contentStyle = this.olapGrid.jqRS_IG(".ui-widget-content").first();
            ctx.strokeStyle = contentStyle.css("color");
            ctx.fillStyle = contentStyle.css("color");
            ctx.font = contentStyle.css("font-size") + " " + contentStyle.css("font-family");;
        }

        difineLegendSize() {
            var legendHeight = 0.0;
            var legendWidth = 0.0;
            var seriesInfo;
            var obj;
            var lineWidth = 0.0;
            var text;
            var shapeW = this.shapeWidth;
            var shapeH = this.shapeHeight;
            var displayValue = 0;
            var displayName = "";

            for (var groupAttr in this.hierarchyItems) {

                text = this.olapGrid.getFirstVisibleLevel(groupAttr).DisplayName;
                lineWidth = this.getLineSize(text, true).width + this.headerPadX;

                if (legendWidth < lineWidth)
                    legendWidth = lineWidth;

                legendHeight += this.headerSize.height + this.headerPadY;

                seriesInfo = this.hierarchyItems[groupAttr];

                for (var siAttr in seriesInfo) {

                    obj = seriesInfo[siAttr];
                    displayName = obj.colorMember ? obj.colorMember.DisplayName
                        : obj.foreColorMember ? obj.foreColorMember.DisplayName
                            : null;

                    if (!displayName)
                        continue;

                    lineWidth = this.getLineSize(displayName).width + 1.5 * this.itemPadX;

                    //shapeW = defSize.width * (this.lipatovChart.maxMultiplier + this.lChart.minMultiplier);
                    //shapeH = obj.sizeMember ? (obj.sizeMember.SizeMultiplier * defSize.height) : (this._modifInfo['default'].sizeMember.SizeMultiplier * defSize.height);

                    lineWidth += shapeW;

                    if (legendWidth < lineWidth)
                        legendWidth = lineWidth;

                    if (this.itemSize.height + this.itemPadY > shapeH)
                        legendHeight += (this.itemSize.height + this.itemPadY);
                    else
                        legendHeight += shapeH;
                }
            }

            var measureInfo = null;

            for (var attr in this.measureItems) {

                obj = this._modifInfo[attr];

                if (this.olapGrid._measures[attr] == null)
                    continue;

                text = this.olapGrid._measures[attr].DisplayName;

                lineWidth = this.getLineSize(text, true).width + this.headerPadX;

                if (legendWidth < lineWidth)
                    legendWidth = lineWidth;

                legendHeight += this.headerSize.height + this.headerPadY;

                if (obj.colorMeasure != null && obj.foreColorMeasure != null ||
                    obj.colorMeasure != null && obj.foreColorMeasure == null)
                    measureInfo = obj.colorMeasure;
                else if (obj.foreColorMeasure != null)
                    measureInfo = obj.foreColorMeasure;

                for (var ind in measureInfo.ColorsInfo) {
                    displayValue = this.olapGrid._settings.rsMax;

                    lineWidth = this.getLineSize(displayValue.toString()).width + 1.5 * this.itemPadX;

                    //shapeW = defSize.width * (this.lipatovChart.maxMultiplier + this.lChart.minMultiplier);
                    //shapeH = sizeK * defSize.height;

                    lineWidth += shapeW;

                    if (legendWidth < lineWidth)
                        legendWidth = lineWidth;

                    if (this.itemSize.height + this.itemPadY > shapeH)
                        legendHeight += (this.itemSize.height + this.itemPadY);
                    else
                        legendHeight += shapeH;
                }
            }

            legendHeight += shapeH / 2;

            this.legendSize = new Size(Math.ceil(legendWidth) + 1, Math.ceil(legendHeight) + 1);
        }

        initLegendItems() {
            var obj;
            var groupUniqName;

            for (var attr in this._modifInfo) {
                if ((attr == this.layout.ColorAxisItem && this.cellset.ColorChartMembers == null)
                    || (attr == this.layout.ForeColorAxisItem && this.cellset.ForeColorChartMembers == null)) {

                    this.measureItems[attr] = this._modifInfo[attr];

                } else {
                    obj = this._modifInfo[attr];
                    groupUniqName = obj.colorMember ? obj.colorMember.GroupUniqName
                        : obj.foreColorMember ? obj.foreColorMember.GroupUniqName
                            : null;
                    if (!groupUniqName)
                        continue;

                    if (this.hierarchyItems[groupUniqName] == null)
                        this.hierarchyItems[groupUniqName] = [];

                    this.hierarchyItems[groupUniqName].push(obj);
                }
            }
        }

        applyLegend() {
            var displayName = "";
            var shortName = "";
            var brush = null;
            var grd = null;
            var obj = null;
            var seriesInfo = null;
            var level = null;
            var colorInfo = null;
            var measureInfo = null;

            for (var groupAttr in this.hierarchyItems) {

                level = this.olapGrid.getFirstVisibleLevel(groupAttr);

                //shortName = this.olapGrid.cutText(level.DisplayName, this.olapGrid._settings.maxTextLength);
                //            if (this.olapGrid._settings.maxTextLength < level.DisplayName.length)
                //                span.title = level.DisplayName;
                //            span.innerHTML = shortName;

                this.drawHeader(level.DisplayName);

                seriesInfo = this.hierarchyItems[groupAttr];

                for (var siAttr in seriesInfo) {
                    obj = seriesInfo[siAttr];
                    displayName = obj.foreColorMember ? obj.foreColorMember.DisplayName
                        : obj.colorMember ? obj.colorMember.DisplayName
                            : null;

                    if (!displayName)
                        continue;

                    //                shortName = this.olapGrid.cutText(displayName, this.olapGrid._settings.maxTextLength);
                    //                if (this.olapGrid._settings.maxTextLength < displayName.length)
                    //                    span.title = displayName;
                    //                span.innerHTML = shortName;

                    brush = obj.colorMember ? obj.colorMember.Color
                        : obj.foreColorMember ? obj.foreColorMember.Color
                            : null;

                    //                grd = obj.colorMember ? obj.colorMember.Gradient
                    //                    : this._modifInfo['default'].colorMember.Gradient;

                    this.drawItem(displayName, brush, grd);
                }
            }

            var displayValue = "";

            for (var attr in this.measureItems) {

                obj = this._modifInfo[attr];

                //            shortName = this.olapGrid.cutText(this.olapGrid._measures[attr].DisplayName, this.olapGrid._settings.maxTextLength);
                //            if (this.olapGrid._settings.maxTextLength < this.olapGrid._measures[attr].DisplayName)
                //                span.title = this.olapGrid._measures[attr].DisplayName;
                //            span.innerHTML = shortName;

                if (this.olapGrid._measures[attr] == null)
                    continue;

                this.drawHeader(this.olapGrid._measures[attr].DisplayName);

                if (obj.colorMeasure != null && obj.foreColorMeasure != null ||
                    obj.colorMeasure != null && obj.foreColorMeasure == null)
                    measureInfo = obj.colorMeasure;
                else if (obj.foreColorMeasure != null)
                    measureInfo = obj.foreColorMeasure;

                for (var i = this._colorCount; i > 0; i--) {

                    if (i == this._colorCount)
                        displayValue = this.olapGrid._settings.rsMax;
                    else if (i == 1)
                        displayValue = this.olapGrid._settings.rsMin;
                    else
                        displayValue = "";

                    colorInfo = measureInfo.ColorsInfo[i - 1];

                    brush = new Brush(colorInfo.borderColor, colorInfo.color, { lineWidth: 1, opacity: 0.5 });

                    this.drawItem(displayValue, brush, grd);
                }
            }

            var legendContainer = RadarSoft.$(this.legendContainer);
            legendContainer.children().remove();

            var domContainer = RadarSoft.$(this.container);

            domContainer.children().remove();

            legendContainer.append(this.drawAreaLayer.canvas);

            domContainer.append(this.legendContainer);
        }
    }
}