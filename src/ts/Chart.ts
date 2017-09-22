namespace RadarSoft {
    export class Chart {
        chartAreaIndex: number;
        index: number;
        column: number;
        row: number;
        selectionInfo: any;
        series: DataFunction[];
        selectedShapes: any[];
        drawAreaLayer: ServiceLayer;
        backLayer: ServiceLayer;
        axisSystems: AxisSystemDrawer;
        glassLayer: ServiceLayer;
        selectionLayer: ServiceLayer;
        areaMargin: number;
        size: Size;
        trendType: TrendType;
        drawArea: DrawArea;
        axisLayer: ServiceLayer;
        yAxis: any;
        xAxis: any;
        zeroPoint: CanvasPoint;
        type: ChartTypes;
        drawingLayers: ServiceLayer[];
        serviceLayers: ServiceLayer[];
        id: string;
        container: HTMLElement;
        chartManager: ChartManager;
        hidePoints: boolean;

        constructor(chartManager: ChartManager, type: any, container: HTMLElement, areaMargin: number, width: any, height?: number) {
            this.hidePoints = false;
            this.chartManager = chartManager;
            this.chartManager.charts.push(this);
            this.chartManager.chartsCount++;
            this.container = container; // chartDiv;
            $(container).data('chart', this);
            this.id = "chart" + this.chartManager.chartsCount;
            this.container.id = this.id;
            this.serviceLayers = [];
            this.drawingLayers = [];
            this.type = (type != null) ? type : this.chartManager.chartType;
            this.zeroPoint = null;
            this.xAxis = null;
            this.yAxis = null;
            this.axisLayer = new ServiceLayer("axisLayer");
            this.drawArea = null;
            this.trendType = TrendType.noTrends;
            this.size = new Size(width ? width : this.chartManager.defaultChartWidth * this.chartManager.tOLAPChart._scaleX,
                height ? height : this.chartManager.defaultChartHeight * this.chartManager.tOLAPChart._scaleY);
            this.areaMargin = areaMargin;
            this.selectionLayer = new ServiceLayer("selectionLayer");
            this.AddServiceLayer(this.selectionLayer);
            var canvas = this.selectionLayer.GetCanvas();
            canvas.style.zIndex = "1";
            this.glassLayer = this.createGlassLayer();
            this.axisSystems = this.createAxisContainer();
            this.zeroPoint = new CanvasPoint(this.areaMargin, this.size.height - this.areaMargin);
            this.container.style.position = "relative";
            this.container.style.top = "0";
            this.container.style.left = "0";
            this.container.style.width = this.size.width + "px";
            this.container.style.height = this.size.height + "px";
            this.container.setAttribute("class", "chartContainer");
            this.AddServiceLayer(this.axisLayer);
            this.backLayer = new ServiceLayer("backLayer");
            this.backLayer.GetCanvas().style.display = "none";
            this.AddServiceLayer(this.backLayer);
            this.drawAreaLayer = new ServiceLayer("drawAreaLayer");
            this.AddServiceLayer(this.drawAreaLayer);
            this.setOnMouseDown();
            this.setOnMouseMove();
            this.setOnMouseUp();
            this.setOnContextMenu();
            this.selectedShapes = [];
            this.series = [];
            this.selectionInfo = this.chartManager.selectionInfo;
            this.row = null;
            this.column = null;
        }

        Destroy() {
            for (var i = 0; i < this.drawingLayers.length; i++) {
                this.drawingLayers[i].Destroy(this.chartManager);
            }

            for (var i = 0; i < this.serviceLayers.length; i++) {
                this.serviceLayers[i].Destroy(this.chartManager);
            }

            this.chartManager.jqRS_OG("#" + this.container.id).remove();
        }

        SetCellId(row: number, column: number, index: number, chartAreaIndex: number) {
            this.row = row;
            this.column = column;
            this.index = index;
            this.chartAreaIndex = chartAreaIndex;
        }

        AttachAxisSystem(axisSystem: AxisSystem) {
            var axSyst = this.CreateAxisSystem();
            axSyst.parent = axisSystem;
            return axSyst;
        }

        SetSelectionInfo(sI: any) {
            this.selectionInfo = cpy(sI);
        }

        GetSelectionInfo() {
            return this.selectionInfo;
        }

        GetPointsAtRect(rect: any) {
            var pnts = [];
            var ctx = this.backLayer.GetContext();

            for (var i = 0; i < this.drawingLayers.length; i++) {
                var layer = this.drawingLayers[i];
                for (var k = 0; k < layer.shapes.length; k++) {
                    var shape = layer.shapes[k];
                    ctx.beginPath();
                    ctx.rect(rect.x, rect.y, rect.w, rect.h);
                    var pos = shape.GetPosition();
                    if (ctx.isPointInPath(pos.left, pos.top)) {
                        pnts.push(shape);
                    }
                }
            }
            return pnts;
        }

        GetPointsAtMouse(canvasPnt: any, processServiceLayers?: boolean): Shape[] {
            var pnts: Shape[] = [];
            for (var i = 0; i < this.drawingLayers.length; i++) {
                var layer = this.drawingLayers[i];
                for (var k = 0; k < layer.shapes.length; k++) {
                    var shape = layer.shapes[k];
                    shape.Path(this.backLayer);
                    var ctx = this.backLayer.GetContext();
                    if (ctx.isPointInPath(canvasPnt.x, canvasPnt.y)) {
                        pnts.push(shape as Shape);
                    }
                }
            }
            if (processServiceLayers) {
                for (var i = 0; i < this.serviceLayers.length; i++) {
                    var layer = this.serviceLayers[i];
                    for (var k = 0; k < layer.shapes.length; k++) {
                        var shape = layer.shapes[k];
                        var shapes = shape.CheckPath(this.backLayer, canvasPnt);
                        pnts = pnts.concat(shapes);
                    }
                }
            }

            return pnts;
        }

        ToggleAxisOrientation() {
            var axisSystems = this.axisSystems.GetSystems();
            for (var i = 0; i < axisSystems.length; i++) {
                var axSyst = axisSystems[i];
                var newOrientation = null;
                switch (axSyst.measureOrientation) {
                case Orientation.verticalOrientation:
                    newOrientation = Orientation.horizontalOrientation;
                    break;
                case Orientation.horizontalOrientation:
                    newOrientation = Orientation.verticalOrientation;
                    break;
                }
                axSyst.SetOrientation(newOrientation);
            }
        }

        SetTrendType(trendType: TrendType) {
            this.trendType = trendType;
        }

        GetTrendType(): TrendType {
            return this.trendType;
        }

        removeShapes() {
            for (var i = 0; i < this.drawingLayers.length; i++) {
                this.drawingLayers[i].Destroy(this.chartManager);
            }
            this.drawingLayers.splice(0, this.drawingLayers.length);

            for (var i = 0; i < this.serviceLayers.length; i++) {
                this.serviceLayers[i].RemoveShapes();
                this.serviceLayers[i].Clear();
            }
        }

        correctScale() {
            this.axisSystems.CorrectScale();
        }

        createShapes(drawMargins: any) {
            var layer = new Layer();
            this.AddDrawingLayer(layer);
            var shape = [];
            switch (this.type) {
            case ChartTypes.points:
                shape = this.createPoints(layer, drawMargins);
                break;
            case ChartTypes.spline:
            case ChartTypes.deltaSpline:
            case ChartTypes.percentSpline:
                shape = this.createSplines(layer, drawMargins);
                break;
            case ChartTypes.polyLine:
                shape = this.createPolyLines(layer, drawMargins);
                break;
            case ChartTypes.stepLine:
                shape = this.createStepLines(layer, drawMargins);
                break;
            case ChartTypes.bar:
                shape = this.createBars(layer, drawMargins, true);
                break;
            case ChartTypes.deltaBar:
            case ChartTypes.percentBar:
                shape = this.createBars(layer, drawMargins, false);
                break;
            case ChartTypes.area:
            case ChartTypes.deltaArea:
            case ChartTypes.percentArea:
                shape = this.createAreas(layer, drawMargins);
                shape = shape.concat(this.createSplines(layer, drawMargins));
                break;
            case ChartTypes.pie:
                shape = this.createPies(layer, drawMargins);
                break;
            }
            shape = shape.concat(this.createTrends(layer));
            if (shape.length > 0) {
                for (var k = 0; k < shape.length; k++) {
                    layer.AddShape(shape[k]);
                }
            }
        }

        createTrends(layer: Layer) {
            var trends = [];
            var dontCreate = (this.type == ChartTypes.deltaSpline ||
                this.type == ChartTypes.deltaBar ||
                this.type == ChartTypes.deltaArea ||
                this.type == ChartTypes.percentBar ||
                this.type == ChartTypes.percentArea ||
                this.type == ChartTypes.percentSpline ||
                this.type == ChartTypes.pie ||
                this.trendType == TrendType.noTrends);
            if (!dontCreate) {
                var trend = null;
                switch (this.trendType) {
                    case TrendType.linTrend:
                        trend = new linearTrend();
                    break;
                    case TrendType.quadTrend:
                        trend = new quadraticTrend();
                    break;
                    case TrendType.cubicTrend:
                        trend = new cubicTrend();
                    break;
                }
                if (trend) {
                    var axisSystems = this.axisSystems.GetSystems();
                    for (var k = 0; k < axisSystems.length; k++) {
                        var axisSystem = axisSystems[k];
                        var series = axisSystem.GetSeries();
                        for (var i = 0; i < series.length; i++) {
                            var func = series[i];
                            var axisSystem: AxisSystem = this.axisSystems.GetById(func.axisSystemID);

                            var brush = func.brush;

                            var x = [];
                            var y = [];
                            var pntsCnt = func.points.length;
                            if (pntsCnt <= 2) {
                                trend = new linearTrend();
                            } else if (pntsCnt <= 3 && !(trend instanceof linearTrend)) {
                                trend = new quadraticTrend();
                            }

                            var spline = trend;
                            for (var j = 0; j < pntsCnt; j++) {
                                var point = func.points[j];
                                var pos = axisSystem.GetPointPosition(point);
                                x.push(pos.left);
                                y.push(pos.top);
                                var size = new Size(this.size.width * 0.035,
                                    this.size.height * 0.035);
                                if (j < func.points.length - 1) {
                                    var nextPnt = func.points[j + 1];
                                    var nextPos = axisSystem
                                        .GetPointPosition(nextPnt);
                                    var trendLine = new PolyLine(
                                        new Descriptor(pos,
                                            size,
                                            brush),
                                        spline,
                                        nextPos);
                                    trendLine.isDotted = true;
                                    trends.push(trendLine);
                                }
                                spline.BuildFunc(x, y, x.length);
                            }
                        }
                    }
                }
            }
            return trends;
        }

        createPies(layer: Layer, drawMargins: any) {
            var shape = [];
            var systems = this.axisSystems.GetSystems();
            for (var i = 0; i < systems.length; i++) {
                var axisSystem = systems[i];
                var groups = axisSystem.GroupPoints();
                var dimensions = axisSystem.GetDimensionAxis().GetMarks();
                var used = 0;
                var ttlMeasure = 0;

                for (var j = 0; j < dimensions.length; j++) {
                    var dimension = dimensions[j];
                    if (groups[dimension]) {
                        var points = groups[dimension];
                        for (var k = 0; k < points.length; k++) {
                            ttlMeasure += points[k].measure;
                        }
                    }
                }

                for (var j = 0; j < dimensions.length; j++) {
                    var dimension = dimensions[j];
                    if (groups[dimension]) {
                        var points = groups[dimension];
                        var ttl = 0;
                        for (var k = 0; k < points.length; k++) {
                            ttl += points[k].measure;
                        }

                        var startAngle = Math.PI * 2 * used / ttlMeasure;
                        var endAngle = Math.PI * 2 * (used + ttl) / ttlMeasure;
                        used += ttl;
                        var pos = new Position(this.size.height / 2,
                            this.size.width / 2);
                        var horSize = this.size.width - drawMargins.xMarginLeft - drawMargins.xMarginRight;
                        var vertSize = this.size.height - drawMargins.yMarginTop - drawMargins.yMarginBottom;
                        var radius = horSize > vertSize
                            ? vertSize * 0.4
                            : horSize * 0.4;
                        var brush = groups[dimension][0].func.brush;
                        var grd = groups[dimension][0].func.gradientBrush;
                        var descriptor = new Descriptor(pos,
                            null,
                            brush,
                            null,
                            grd);
                        var res = new Pie(descriptor,
                            radius,
                            startAngle,
                            endAngle);
                        //?
                        //this.ChartManager);
                        res.SetData({
                            "measure": ttl,
                            "dimension": dimension,
                            "func": groups[dimension][0].func.name,
                            "measureName": axisSystem.GetMeasureName(),
                            "dimensionName": axisSystem.GetDimensionName(),
                            "series": groups[dimension][0].series,
                            "details": groups[dimension][0].details
                        });
                        shape.push(res);
                    }
                }
            }
            return shape;
        }

        createDeltaSplines(layer: Layer, drawMargins: any) {
            var shape = [];
            var systems = this.axisSystems.GetSystems();
            for (var i = 0; i < systems.length; i++) {
                var axisSystem = systems[i];
                var groups = axisSystem.GroupPoints();
                var dimensions = axisSystem.GetDimensionAxis().GetMarks();

                for (var j = 0; j < dimensions.length; j++) {
                    var dimension = dimensions[j];
                    if (groups[dimension]) {
                        var points = groups[dimension];
                        for (var k = 0; k < points.length; k++) {
                            var point = points[k];
                            var func = point.func;
                            var grd = func.gradientBrush;
                            var pos = axisSystem.GetPointPosition(point);
                            var brush = point.getBrush();
                            var size = point.getSize();
                            var res = new Point(this.hidePoints,
                                new Descriptor(pos,
                                    size,
                                    brush,
                                    null,
                                    grd),
                                func.shapeInfo.Shape,
                                this.hidePoints);
                            res.SetData({
                                "measure": point.measure,
                                "dimension": point.dimension,
                                "func": point.func.name,
                                "measureName": axisSystem.GetMeasureName(),
                                "dimensionName": axisSystem.GetDimensionName(),
                                "series": point.series,
                                "details": point.details
                            });
                            shape.push(res);
                        }
                    }
                }
            }
            return shape;
        }

        createAreas(layer: Layer, drawMargins: any) {
            var shape = [];
            var axisSystems = this.axisSystems.GetSystems();
            for (var k = 0; k < axisSystems.length; k++) {
                var axisSystem = axisSystems[k];
                var series = axisSystem.GetSeries();
                for (var i = series.length - 1; i >= 0; i--) {
                    var func = series[i];
                    var axisSystem: AxisSystem = this.axisSystems.GetById(func.axisSystemID);
                    var brush = null; //func.brush;
                    for (var j = 0; j < func.points.length; j++) {
                        var point = func.points[j];
                        var pos = axisSystem.GetPointPosition(point);
                        brush = point.getBrush();
                        var size = point.getSize();
                        var spline = new linearTrend();
                        if (j < func.points.length - 1) {
                            var nextPnt = func.points[j + 1];
                            var nextPos = axisSystem.GetPointPosition(nextPnt);
                            spline.BuildFunc([pos.left, nextPos.left],
                                [
                                    pos.top,
                                    nextPos.top
                                ],
                                2);
                            shape.push(new Area(
                                new Descriptor(pos, size, brush),
                                nextPos));
                        }
                    }
                }
            }

            return shape;
        }

        createStepLines(layer: Layer, drawMargins: any) {
            var shape = [];
            var axisSystems = this.axisSystems.GetSystems();
            for (var k = 0; k < axisSystems.length; k++) {
                var axisSystem = axisSystems[k];
                var series = axisSystem.GetSeries();
                for (var i = 0; i < series.length; i++) {
                    var func = series[i];
                    var axisSystem: AxisSystem = this.axisSystems.GetById(func.axisSystemID);
                    var brush = null;
                    var grd = func.gradientBrush;
                    for (var j = 0; j < func.points.length; j++) {
                        var point = func.points[j];
                        var pos = axisSystem.GetPointPosition(point);
                        brush = point.getBrush();
                        var size = point.getSize();
                        var spline = new linearTrend();
                        if (j < func.points.length - 1) {
                            var nextPnt = func.points[j + 1];

                            var nextPos = axisSystem.GetPointPosition(nextPnt);
                            var tmpPos = new Position(pos.top, nextPos.left);
                            var tmpSpline = new linearTrend();
                            tmpSpline.BuildFunc([pos.left, tmpPos.left],
                                [
                                    pos.top, tmpPos.top
                                ],
                                2);
                            shape.push(new PolyLine(
                                new Descriptor(pos, size, brush),
                                tmpSpline,
                                tmpPos));

                            spline.BuildFunc([tmpPos.left, nextPos.left],
                                [
                                    tmpPos.top, nextPos.top
                                ],
                                2);
                            shape
                                .push(new PolyLine(
                                    new Descriptor(tmpPos,
                                        size,
                                        brush),
                                    spline,
                                    nextPos));
                            var tmpRes = new Point(this.hidePoints,
                                new Descriptor(tmpPos,
                                    size,
                                    brush,
                                    null,
                                    grd),
                                func.shapeInfo.Shape,
                                this.hidePoints);
                            shape.push(tmpRes);
                        }
                        var res = new Point(this.hidePoints,
                            new Descriptor(
                                pos,
                                size,
                                brush,
                                null,
                                grd),
                            func.shapeInfo.Shape,
                            this.hidePoints);
                        res.SetData({
                            "measure": point.measure,
                            "dimension": point.dimension,
                            "func": point.func.name,
                            "measureName": axisSystem.GetMeasureName(),
                            "dimensionName": axisSystem.GetDimensionName(),
                            "series": point.series,
                            "details": point.details
                        });
                        shape.push(res);
                    }
                }
            }
            return shape;
        }

        createBars(layer: Layer, drawMargins: any, useOffset: boolean) {
            var shape = [];
            var systems = this.axisSystems.GetSystems();
            for (var i = 0; i < systems.length; i++) {
                var axisSystem = systems[i];
                var groups = axisSystem.GroupPoints();
                var dimensions = axisSystem.GetDimensionAxis().GetMarks();
                for (var j = 0; j < dimensions.length; j++) {
                    var dimension = dimensions[j];
                    if (groups[dimension]) {
                        var points = groups[dimension];
                        var barWidth = axisSystem.GetColumnWidth();
                        if (useOffset) {
                            barWidth = Math.round(barWidth / points.length);
                        }

                        for (var k = points.length - 1; k >= 0; k--) {
                            var pnt = points[k];
                            var func = pnt.func;
                            var brush = pnt.getBrush(); //func.brush;
                            var grd = func.gradientBrush;
                            var pos = axisSystem.GetPointPosition(pnt);
                            var usedPos;
                            if (k > 0) {
                                usedPos = axisSystem
                                    .GetPointPosition(points[k - 1]);
                            }
                            if (useOffset) {
                                pos.left += barWidth * k;
                            }

                            var width = 0;
                            var height = 0;
                            switch (axisSystem.measureOrientation) {
                            case Orientation.verticalOrientation:
                                width = barWidth;
                                height = (this.size.height - pos.top) - drawMargins.yMarginBottom;
                                break;
                            case Orientation.horizontalOrientation:
                                width = (this.size.height - pos.top) - drawMargins.yMarginBottom;
                                height = barWidth;
                                break;
                            }
                            var size = new Size(width, height);
                            //?
                            var res = new Bar(new Descriptor(pos, size, brush, null, grd));//, this.ChartManager);
                            res.SetData({
                                "measure": pnt.measure,
                                "dimension": pnt.dimension,
                                "func": pnt.func.name,
                                "measureName": axisSystem.GetMeasureName(),
                                "dimensionName": axisSystem.GetDimensionName(),
                                "series": pnt.series,
                                "details": pnt.details
                            });
                            shape.push(res);
                        }
                    }
                }
            }
            return shape;
        }

        createPolyLines(layer: Layer, drawMargins: any) {
            var shape = [];
            var axisSystems = this.axisSystems.GetSystems();
            for (var k = 0; k < axisSystems.length; k++) {
                var axisSystem = axisSystems[k];
                var series = axisSystem.GetSeries();
                for (var i = 0; i < series.length; i++) {
                    var func = series[i];
                    var axisSystem: AxisSystem = this.axisSystems.GetById(func.axisSystemID);
                    var brush = null;
                    var grd = func.gradientBrush;
                    for (var j = 0; j < func.points.length; j++) {
                        var point = func.points[j];
                        var pos = axisSystem.GetPointPosition(point);
                        brush = point.getBrush();
                        var size = point.getSize();
                        var spline: any = new quadraticTrend();
                        if (j < func.points.length - 2) {
                            var pnt2 = func.points[j + 1];
                            var pos2 = axisSystem.GetPointPosition(pnt2);
                            var pnt3 = func.points[j + 2];
                            var pos3 = axisSystem.GetPointPosition(pnt3);
                            spline.BuildFunc([pos.left, pos2.left, pos3.left],
                                [
                                    pos.top, pos2.top, pos3.top
                                ],
                                3);
                            shape.push(new PolyLine(
                                new Descriptor(pos, size, brush),
                                spline,
                                pos2));
                        } else if ((j < func.points.length - 1) && (j - 1 >= 0)) {
                            var pnt2 = func.points[j - 1];
                            var pos2 = axisSystem.GetPointPosition(pnt2);
                            var pnt3 = func.points[j + 1];
                            var pos3 = axisSystem.GetPointPosition(pnt3);
                            spline.BuildFunc([pos2.left, pos.left, pos3.left],
                                [
                                    pos2.top, pos.top, pos3.top
                                ],
                                3);
                            shape.push(new PolyLine(
                                new Descriptor(pos, size, brush),
                                spline,
                                pos3));
                        } else if (j < func.points.length - 1) {
                            var pnt2 = func.points[j + 1];
                            var pos2 = axisSystem.GetPointPosition(pnt2);
                            spline = new linearTrend();
                            spline.BuildFunc([pos.left, pos2.left],
                                [
                                    pos.top,
                                    pos2.top
                                ],
                                2);
                            shape.push(new PolyLine(
                                new Descriptor(pos, size, brush),
                                spline,
                                pos2));
                        }

                        var res = new Point(this.hidePoints,
                            new Descriptor(
                                pos,
                                size,
                                brush,
                                null,
                                grd),
                            func.shapeInfo.Shape,
                            this.hidePoints);
                        res.SetData({
                            "measure": point.measure,
                            "dimension": point.dimension,
                            "func": point.func.name,
                            "measureName": axisSystem.GetMeasureName(),
                            "dimensionName": axisSystem.GetDimensionName(),
                            "series": point.series,
                            "details": point.details
                        });
                        shape.push(res);
                    }
                }
            }
            return shape;
        }

        createSplines(layer: Layer, drawMargins: any): any[] {
            let shape = [];
            var axisSystems = this.axisSystems.GetSystems();
            for (var k = 0; k < axisSystems.length; k++) {
                var axisSystem = axisSystems[k];
                var series = axisSystem.GetSeries();
                for (var i = 0; i < series.length; i++) {
                    var func = series[i];
                    var brush = null;
                    var grd = func.gradientBrush;
                    for (var j = 0; j < func.points.length; j++) {
                        var point = func.points[j];
                        var pos = axisSystem.GetPointPosition(point);
                        brush = point.getBrush();
                        var size = point.getSize();
                        var spline = new linearTrend();
                        if (j < func.points.length - 1) {
                            var nextPnt = func.points[j + 1];
                            var nextPos = axisSystem.GetPointPosition(nextPnt);
                            spline.BuildFunc([pos.left, nextPos.left],
                                [
                                    pos.top,
                                    nextPos.top
                                ],
                                2);
                            shape.push(new PolyLine(
                                new Descriptor(pos, size, brush),
                                spline,
                                nextPos));
                        }

                        var res = new Point(this.hidePoints,
                            new Descriptor(
                                pos,
                                size,
                                brush,
                                null,
                                grd),
                            func.shapeInfo.Shape,
                            this.hidePoints);
                        res.SetData({
                            "measure": point.measure,
                            "dimension": point.dimension,
                            "func": point.func.name,
                            "measureName": axisSystem.GetMeasureName(),
                            "dimensionName": axisSystem.GetDimensionName(),
                            "series": point.series,
                            "details": point.details
                        });
                        shape.push(res);
                    }
                }
            }

            return shape;
        }

        createPoints(layer: Layer, drawMargins: any) {
            var shape = [];
            var axisSystems = this.axisSystems.GetSystems();
            for (var k = 0; k < axisSystems.length; k++) {
                var axisSystem = axisSystems[k];
                var series = axisSystem.GetSeries();
                for (var i = 0; i < series.length; i++) {
                    var func = series[i];
                    var brush = null; //func.brush;
                    var grd = func.gradientBrush;
                    for (var j = 0; j < func.points.length; j++) {
                        var point = func.points[j];
                        var pos = axisSystem.GetPointPosition(point);
                        brush = point.getBrush();
                        var size = point.getSize();
                        //var hidePoints = (this.type == ChartTypes.points) ? false : this.hidePoints;
                        var res = new Point(this.hidePoints,
                            new Descriptor(
                                pos,
                                size,
                                brush,
                                null,
                                grd),
                            func.shapeInfo.Shape);
                        res.SetData({
                            "measure": point.measure,
                            "dimension": point.dimension,
                            "func": point.func.name,
                            "measureName": axisSystem.GetMeasureName(),
                            "dimensionName": axisSystem.GetDimensionName(),
                            "series": point.series,
                            "details": point.details
                        });
                        shape.push(res);
                    }
                }
            }
            return shape;
        }

        SetSeries(series: DataFunction[]) {
            //this.series = cpy(series);
            this.series = series;

            for (var i = 0; i < this.series.length; i++) {
                var axSyst = this.axisSystems.GetById(this.series[i].axisSystemID);
                if (axSyst) {
                    axSyst.AddSeries(this.series[i]);
                }
            }
        }

        GetContainerPosition() {
            var offs = this.chartManager.jqRS_OG("#" + this.container.id).offset();
            return {
                "left": offs ? offs.left : 0,
                "top": offs ? offs.top : 0
            };

        }

        clearSelection() {
            for (var i = 0; i < this.selectedShapes.length; i++) {
                if (this.selectedShapes[i].Unselect)
                    this.selectedShapes[i].Unselect(this.selectionLayer);
            }
            this.selectionLayer.Clear();
            this.selectedShapes = [];
        }

        SelectShape(shapes: DrawableObject[]) {
            if (shapes.length == 0) {
                return;
            }

            for (var k = 0; k < shapes.length; k++) {
                var idx = this.selectedShapes.indexOf(shapes[k]);
                if (idx < 0) {
                    this.selectedShapes.push(shapes[k]);
                } else if ((<Shape>shapes[k]).Unselect) {
                    (<Shape>shapes[k]).Unselect(this.selectionLayer);
                    this.selectedShapes.splice(idx, 1);
                }
            }
            this.selectionLayer.Clear();


            for (var i = 0; i < this.selectedShapes.length; i++) {
                if (this.selectedShapes[i].Select)
                    this.selectedShapes[i].Select(this.selectionLayer);
            }
        }

        selectShapes(e: BaseJQueryEventObject) {
            var sI = this.GetSelectionInfo();
            if (sI.active) {
                var scrollX = this.chartManager.jqRS_OG("#olapgrid_IG").scrollLeft();
                var scrollY = this.chartManager.jqRS_OG("#olapgrid_IG").scrollTop();
                this.glassLayer.Clear();
                var offset = this.GetContainerPosition();
                var canvasY = e.pageY - offset.top;
                var canvasX = e.pageX - offset.left;
                var x1 = sI.firstPoint.left - offset.left - scrollX;
                var y1 = sI.firstPoint.top - offset.top - scrollY;
                var x2 = canvasX;
                var y2 = canvasY;
                var w = Math.abs(x1 - x2);
                var h = Math.abs(y1 - y2);
                var x = x1;
                if (x2 < x1) {
                    x = x2;
                }
                var y = y1;
                if (y2 < y1) {
                    y = y2;
                }
                var rect = {
                    "x": x,
                    "y": y,
                    "w": w,
                    "h": h
                };
                var pnts = this.GetPointsAtRect(rect);
                var pnt = this.GetPointsAtMouse({ "x": canvasX, "y": canvasY }, false);
                if (pnt.length > 0)
                    pnts.push(pnt[pnt.length - 1]);
                this.SelectShape(pnts);
            }
        }

        redrawSelectionArea(e: BaseJQueryEventObject) {
            var offset = this.GetContainerPosition();
            var scrollX = this.chartManager.jqRS_OG("#olapgrid_IG").scrollLeft();
            var scrollY = this.chartManager.jqRS_OG("#olapgrid_IG").scrollTop();
            var canvasY = e.pageY - offset.top;
            var canvasX = e.pageX - offset.left;
            var layer = this.glassLayer;
            var sI = this.GetSelectionInfo();
            if (sI.active) {
                var x1 = sI.firstPoint.left - offset.left - scrollX;
                var y1 = sI.firstPoint.top - offset.top - scrollY;
                var x2 = canvasX;
                var y2 = canvasY;
                var w = Math.abs(x1 - x2);
                var h = Math.abs(y1 - y2);
                var x = x1;
                if (x2 < x1) {
                    x = x2;
                }
                var y = y1;
                if (y2 < y1) {
                    y = y2;
                }
                layer.Clear();
                var ctx = layer.GetContext();
                ctx.strokeRect(x, y, w, h);
            }
        }

        doStartSelect(e: BaseJQueryEventObject) {
            var chart = e.data.chart;
            var sI = chart.GetSelectionInfo();
            var scrollX = this.chartManager.jqRS_OG("#olapgrid_IG").scrollLeft();
            var scrollY = this.chartManager.jqRS_OG("#olapgrid_IG").scrollTop();

            if (!this.chartManager.multiSelect) {
                this.chartManager.clearSelection();
                sI.Activate(e.pageX + scrollX, e.pageY + scrollY, chart.column, chart.row);
                sI.Update({
                    "chart": chart
                });
            } else {
                sI.Update({
                    "firstPoint": new Position(e.pageY + scrollY, e.pageX + scrollX),
                    "chart": chart,
                    "active": true,
                    "firstCell": new CellCoordinates(chart.column, chart.row)
                });
            }
        }

        canvasMouseUp(e: BaseJQueryEventObject) {
            var chart = e.data.chart;
            if (chart.chartManager.selectionInfo.active == false)
                return true;

            if (chart.chartManager.Enabled) {
                switch (e.which) {
                case 1:
                    chart.chartManager.selectShapes(e);
                    break;
                case 3:
                    var offset = chart.GetContainerPosition();
                    var canvasY = e.pageY - offset.top;
                    var canvasX = e.pageX - offset.left;
                    var pnts = chart.GetPointsAtMouse({
                        "x": canvasX,
                        "y": canvasY
                    });

                    if (pnts.length > 0) {
                        chart.doStartSelect(e);
                        chart.chartManager.selectShapes(e);
                    }
                    break;
                }
            }
            return false;
        }

        setOnMouseUp() {
            var canvas: any = this.glassLayer.GetCanvas();
            $("body")
                .undelegate("#" + this.chartManager.tOLAPChart._settings.cid + " #" + canvas.id,
                    "mouseup",
                    this.canvasMouseUp);
            canvas.layer = this.glassLayer;
            $("body")
                .delegate("#" + this.chartManager.tOLAPChart._settings.cid + " #" + canvas.id,
                    "mouseup",
                    {
                        "chart": this
                    },
                    this.canvasMouseUp);
        }

        canvasMouseDown(e: BaseJQueryEventObject) {
            var chart = e.data.chart;
            if (chart.chartManager.Enabled) {
                switch (e.which) {
                case 1:
                    chart.doStartSelect(e);
                    break;
                }
            }
            return false;
        }

        setOnMouseDown() {
            var canvas = this.glassLayer.GetCanvas();
            $("body")
                .undelegate("#" + this.chartManager.tOLAPChart._settings.cid + " #" + canvas.id,
                    "mousedown",
                    this.canvasMouseDown);
            $("body")
                .delegate("#" + this.chartManager.tOLAPChart._settings.cid + " #" + canvas.id,
                    "mousedown",
                    {
                        "chart": this
                    },
                    this.canvasMouseDown);
        }

        setOnContextMenu() {
        }

        doShowMenus(e: BaseJQueryEventObject) {
            if (!this.chartManager.Enabled)
                return;
            var offset = this.GetContainerPosition();
            var minX = this.drawArea.descriptor.position.left + offset.left;
            var maxX = minX + this.drawArea.descriptor.size.width;
            var minY = this.drawArea.descriptor.position.top + offset.top;
            var maxY = minY + this.drawArea.descriptor.size.height;
            var canvasY = e.pageY - offset.top;
            var canvasX = e.pageX - offset.left;
            var pnts = this.GetPointsAtMouse({
                "x": canvasX,
                "y": canvasY
            });

            if (e.pageX <= maxX && e.pageX >= minX && e.pageY >= minY && e.pageY < minY + 20 && e.pageX < minX + 20) {
                var menu = this.chartManager.CreateMainMenu(this);
                this.deleteOnMouseMove();

                this.container.appendChild(menu);
                $("#" + menu.id).fadeIn();
            } else {
                var pnts = this.GetPointsAtMouse({
                    "x": canvasX,
                    "y": canvasY
                });
                if (pnts.length > 0) {
                    if (e.pageX <= maxX && e.pageX >= minX && e.pageY >= minY && e.pageY <= maxY) {
                        var shp = pnts[pnts.length - 1];
                        var selection = [];
                        selection.push({
                            "index": this.index,
                            "row": this.row,
                            "col": this.column,
                            "measure": shp.data.measure,
                            "dimension": shp.data.dimension,
                            "series": shp.data.func,
                            "ser": shp.data.series,
                            "details": shp.data.details
                        });
                        var popup = this.chartManager.CreatePopUp(e.pageX + 10,
                            e.pageY,
                            this.chartManager.renderDetailsTable(selection));
                        $('body').append(popup);
                        $(popup).show();
                    }
                } else {
                    this.chartManager.HidePopup();
                }
            }
        }

        canvasMouseMove(e: BaseJQueryEventObject) {
            var chart = e.data.chart;
            if (chart.chartManager.Enabled) {

                var sI = chart.GetSelectionInfo();
                if (sI.active) {
                    if (!sI.charts[chart.id]) {
                        sI.charts[chart.id] = chart;
                    }
                    chart.chartManager.redrawSelectionArea(e);
                } else {
                    chart.doShowMenus(e);
                }
            }

            return false;
        }

        deleteOnMouseMove() {
            var canvas = this.glassLayer.GetCanvas();
            $("body")
                .undelegate("#" + this.chartManager.tOLAPChart._settings.cid + " #" + canvas.id,
                    "mousemove",
                    this.canvasMouseMove);
        }

        setOnMouseMove() {
            var canvas: any = this.glassLayer.GetCanvas();
            $("body")
                .undelegate("#" + this.chartManager.tOLAPChart._settings.cid + " #" + canvas.id,
                    "mousemove",
                    this.canvasMouseMove);
            canvas.layer = this.glassLayer;
            $("body")
                .delegate("#" + this.chartManager.tOLAPChart._settings.cid + " #" + canvas.id,
                    "mousemove",
                    {
                        "chart": this
                    },
                    this.canvasMouseMove);
        }

        createGlassLayer() {
            var glassLayer = new ServiceLayer("glassLayer");
            var canvas: any = glassLayer.GetCanvas();
            canvas.style.zIndex = 1;
            this.AddServiceLayer(glassLayer);
            return glassLayer;
        }

        createAxis() {
            var axis = this.axisSystems.GetAxis();
            for (var i = 0; i < axis.length; i++) {
                this.axisLayer.AddShape(axis[i]);
            }
        }

        createDrawArea(xMarginLeft: any, xMarginRight: any, yMarginTop: any, yMarginBottom: any) {
            if (this.drawArea) {
                this.drawAreaLayer.RemoveShape(this.drawArea);
                this.drawAreaLayer.Clear();
            }

            var drawPosition = new Position(yMarginTop, xMarginLeft);
            var drawSize = new Size(this.size.width - xMarginLeft - xMarginRight,
                this.size.height - yMarginTop - yMarginBottom);

            var strokeColor = this.chartManager.tOLAPChart.getBorderColor();
            var fillColor = this.chartManager.tOLAPChart.getOddRowColor();
            var evenFillColor = this.chartManager.tOLAPChart.getEvenRowColor();
            var drawBrush = new Brush(strokeColor, fillColor);

            var drawEvenRowStyle = new Brush(strokeColor, evenFillColor);
            var drawOddRowStyle = new Brush(strokeColor, fillColor);
            var drawColumnStyle = new Brush(strokeColor, null);
            this.drawArea = new DrawArea(this,
                drawPosition,
                drawSize,
                drawBrush,
                drawOddRowStyle,
                drawEvenRowStyle,
                drawColumnStyle);
            var layer = this.drawAreaLayer;
            layer.AddShape(this.drawArea);
        }

        CreateAxisSystem(id?: string) {
            var axSystem = new AxisSystem(
                this.chartManager.measureOrientation,
                this,
                id);
            this.axisSystems.AddSystem(axSystem);
            return axSystem;
        }

        correctDrawingLayersSize(drawMargins: any) {
            var newSize = new Size(this.size.width - drawMargins.xMarginLeft - drawMargins.xMarginRight,
                this.size.height - drawMargins.yMarginTop - drawMargins.yMarginBottom);
            for (var i = 0; i < this.drawingLayers.length; i++) {
                this.drawingLayers[i].size = cpy(newSize);
                this.drawingLayers[i].position.top = drawMargins.yMarginTop;
                this.drawingLayers[i].position.left = drawMargins.xMarginLeft;
            }
        }

        beforeDraw() {
            this.correctScale();
            this.removeShapes();
            this.createAxis();
            var ctx = this.glassLayer.GetContext();
            var drawMargins = this.axisSystems.correctAxisSize(ctx, this.areaMargin);
            this.createDrawArea(drawMargins.xMarginLeft,
                drawMargins.xMarginRight,
                drawMargins.yMarginTop,
                drawMargins.yMarginBottom);
            this.createShapes(drawMargins);
            this.correctDrawingLayersSize(drawMargins);
        }

        Draw() {
            this.beforeDraw();
            var i = 0;
            var maxLoop = this.drawingLayers.length;
            for (i = 0; i < maxLoop; i++) {
                this.drawingLayers[i].Draw();
            }
            i = 0;
            maxLoop = this.serviceLayers.length;
            for (i = 0; i < maxLoop; i++) {
                this.serviceLayers[i].Draw();
            }
        }

        SetType(chartType: ChartTypes) {
            var usePercents = (chartType == ChartTypes.percentBar) ||
                (chartType == ChartTypes.percentArea) ||
                (chartType == ChartTypes.percentSpline) ||
                (chartType == ChartTypes.pie);
            var isPercents = (this.type == ChartTypes.percentBar) ||
                (this.type == ChartTypes.percentArea) ||
                (this.type == ChartTypes.percentSpline) ||
                (this.type == ChartTypes.pie);
            this.type = chartType;
            //		if (!(usePercents == isPercents)) {
            //			var axisSystems = this.axisSystems.GetSystems();
            //			for ( var i = 0; i < axisSystems.length; i++) {
            //				var axSyst = axisSystems[i];
            //				axSyst.SetPercentUsage(usePercents);
            //			}
            //		}
        }

        AddServiceLayer(layer: Layer) {
            var canvas = layer.GetCanvas();
            var lName = layer.name ? layer.name : "ServiceLayer";
            canvas.id = this.container.id + lName + (this.serviceLayers.length + 1);
            this.serviceLayers.push(layer);
            this.container.appendChild(canvas);
            canvas.width = this.size.width;
            canvas.height = this.size.height;
            if (layer.name == "drawAreaLayer") {
                canvas.width++;
                canvas.height++;
            }
            layer.chart = this;
        }

        AddDrawingLayer(layer: Layer) {
            var canvas = layer.GetCanvas();
            canvas.id = this.container.id + "DrawingLayer" + (this.drawingLayers.length + 1);
            layer.name = canvas.id;
            this.drawingLayers.push(layer);
            this.container.appendChild(canvas);
            canvas.width = this.size.width;
            canvas.height = this.size.height;
            layer.chart = this;
        }

        createAxisContainer() {
            var xSize = {
                "width": this.size.width,
                "height": this.areaMargin
            };
            var ySize = {
                "width": this.areaMargin,
                "height": this.size.height
            };
            var yPositionLeft = {
                "top": 0,
                "left": 0
            };
            var yPositionRight = {
                "top": 0,
                "left": this.size.width - ySize.width
            };
            var xPositionBottom = {
                "top": this.size.height - xSize.height,
                "left": 0
            };
            var xPositionTop = {
                "top": 0,
                "left": 0
            };

            return new AxisSystemDrawer(xPositionBottom,
                xPositionTop,
                xSize,
                yPositionLeft,
                yPositionRight,
                ySize);
        }

        getChartImage() {
            var canvas = this.drawAreaLayer.canvas;
            var area = canvas.toDataURL();
            var w = canvas.width;
            var h = canvas.height;
            canvas = this.drawingLayers[0].canvas;
            var graph = canvas.toDataURL();

            var chartImage = { background: area, image: graph, width: w, height: h };

            return chartImage;
        }
    }
}