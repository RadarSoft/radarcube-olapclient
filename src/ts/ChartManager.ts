namespace RadarSoft {
    export class ChartManager {
        charts: Chart[];
        chartsCount: number;
        tOLAPChart: OlapChartBase;
        settings: any = null;
        Enabled = true;
        defaultChartWidth = 220;
        defaultChartHeight = 180;
        maxMultiplier = 1.5;
        minMultiplier = 0.5;
        chartType: ChartTypes = ChartTypes.points;
        trendType: TrendType = TrendType.noTrends;
        standaloneAxisList: StandaloneAxis[] = [];
        isFixedScale: boolean;
        multiSelect = false;
        selectionInfo = new SelectionInfo(this);
        measureOrientation = Orientation.verticalOrientation;
        hidePoints: boolean;

        constructor() {
            this.tOLAPChart = null;
            this.settings = null;
            this.chartsCount = 0;
            this.charts = [];
        }

        jqRS_OG(selector: any) {
            return this.tOLAPChart.jqRS_OG(selector);
        }

        getRowCountForExport() {
                var cellSet = this.tOLAPChart.getCellSet();
                var layout = this.tOLAPChart.getLayout();
                var rowcount = cellSet.RowCount - cellSet.FixedRows + 1;
                var measuresCount = 1;

                if (layout.YAxisMeasures != null && layout.YAxisMeasures.length > 0)
                    measuresCount = layout.YAxisMeasures.length;

                if (measuresCount > 1)
                    rowcount = (cellSet.RowCount - cellSet.FixedRows) * measuresCount + 1;

                return rowcount;
            }

        GetExportData() {
            var cellSet = this.tOLAPChart.getCellSet();
            var colCount = cellSet.ColCount - cellSet.FixedCols + 1;
            var rowCount = this.getRowCountForExport();
            var xAxis = this.GetXAxis();
            var yAxis = this.GetYAxis();
            var exportCells2D = [];
            var exportCells1D = [];
            var exportRow;
            var chartIndex = 0;
            for (var i = 0; i < colCount; i++) {
                exportRow = [];
                for (var j = 0; j < rowCount; j++) {
                    //insert Y axis
                    if (i == 0) {
                        if (j == rowCount - 1) {
                            //insert Legend
                            if (this.tOLAPChart.legend)
                                exportRow[j] = this.tOLAPChart.legend.getLegendImage();
                        } else
                            exportRow[j] = yAxis[j].getAxisImage();
                    }
                    //insert X axis
                    else if (j == rowCount - 1)
                        exportRow[j] = xAxis[i - 1].getAxisImage();
                    //insert chart
                    else {
                        chartIndex = (i - 1) + j * (colCount - 1);
                        exportRow[j] = this.charts[chartIndex].getChartImage();
                    }
                }
                exportCells2D[i] = exportRow;
            }

            for (var i = 0; i < colCount; i++) {
                for (var j = 0; j < rowCount; j++) {
                    exportCells1D.push(exportCells2D[i][j]);
                }
            }

            var jsonExportData = JSON.stringify(exportCells1D);

            return jsonExportData;

        }

        GetXAxis() {
            var xAxis = [];
            for (var i in this.standaloneAxisList) {
                if (this.standaloneAxisList[i].isX)
                    xAxis.push(this.standaloneAxisList[i]);
            }

            return xAxis;
        }

        GetYAxis() {
            var yAxis = [];
            for (var i in this.standaloneAxisList) {
                if (this.standaloneAxisList[i].isX == false)
                    yAxis.push(this.standaloneAxisList[i]);
            }

            return yAxis;
        }



        HideMenu() {
            $('#' + 'chart_main_menu_menu').remove();
        }

        initialize(tOLAPChart: OlapChartBase) {
            this.tOLAPChart = tOLAPChart;
            this.settings = tOLAPChart._settings;
            //this.initChartType();
            this.initFont();
            $(document).keydown({ chart: this }, this.onKeyDown);
            $(document).keyup({ chart: this }, this.onKeyUp);
        }

        initFont() {
            var contentStyle = this.tOLAPChart.jqRS_OG(".ui-widget-content").first();
            this.settings.fontProperties.html5Font = contentStyle.css("font-size") +
                " " +
                contentStyle.css("font-family");
            this.settings.fontProperties.fontSize = 9; //contentStyle.css("font-size");
        }

        CreateMainMenu(chart: Chart) {
            var lChart = chart.chartManager;
            var chartTypes = lChart.tOLAPChart.chartTypes;
            var hidePoints = lChart.tOLAPChart.hidePoints;
            this.HideMenu();
            var menu = new MenuGroup("chart_main_menu",
                "mainMenu.png",
                chart);
            var groups = [
                "pointsMenu", "barsMenu", "linesMenu", "areasMenu",
                "piesMenu", "trendsMenu"
            ];
            var items = [
                ["holes", "points"],
                ["bars", "deltaBars", "percentBars"],
                ["lines", "polylines", "stepLines", "deltaLines", "percentLines"],
                ["areas", "deltaAreas", "percentAreas"], ["pies"],
                ["noTrends", "linTrends", "quadTrends", "cubicTrends"]
            ];

            var clicks = [
                [
                    function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.points;
                        hidePoints[chart.chartAreaIndex] = true;
                        lChart.SetChartType(ChartTypes.points, chart.chartAreaIndex, true);
                    }, function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.points;
                        hidePoints[chart.chartAreaIndex] = false;
                        lChart.SetChartType(ChartTypes.points, chart.chartAreaIndex, false);
                    }
                ], [
                    function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.bar;
                        lChart.SetChartType(ChartTypes.bar, chart.chartAreaIndex);
                    }, function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.deltaBar;
                        lChart.SetChartType(ChartTypes.deltaBar, chart.chartAreaIndex);
                    }, function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.percentBar;
                        lChart.SetChartType(ChartTypes.percentBar, chart.chartAreaIndex);
                    }
                ], [
                    function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.spline;
                        lChart.SetChartType(ChartTypes.spline, chart.chartAreaIndex);
                    }, function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.polyLine;
                        lChart.SetChartType(ChartTypes.polyLine, chart.chartAreaIndex);
                    }, function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.stepLine;
                        lChart.SetChartType(ChartTypes.stepLine, chart.chartAreaIndex);
                    }, function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.deltaSpline;
                        lChart.SetChartType(ChartTypes.deltaSpline, chart.chartAreaIndex);
                    }, function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.percentSpline;
                        lChart.SetChartType(ChartTypes.percentSpline, chart.chartAreaIndex);
                    }
                ], [
                    function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.area;
                        lChart.SetChartType(ChartTypes.area, chart.chartAreaIndex);
                    }, function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.deltaArea;
                        lChart.SetChartType(ChartTypes.deltaArea, chart.chartAreaIndex);
                    }, function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.percentArea;
                        lChart.SetChartType(ChartTypes.percentArea, chart.chartAreaIndex);
                    }
                ], [
                    function () {
                        chartTypes[chart.chartAreaIndex] = ChartTypes.pie;
                        lChart.SetChartType(ChartTypes.pie, chart.chartAreaIndex);
                    }
                ], [
                    function () {
                        //chartTypes[chart.chartAreaIndex] = ChartTypes.points;
                        lChart.SetTrendType(TrendType.noTrends, chart.chartAreaIndex);
                    }, function () {
                        //chartTypes[chart.chartAreaIndex] = ChartTypes.points;
                        lChart.SetTrendType(TrendType.linTrend, chart.chartAreaIndex);
                    }, function () {
                        //chartTypes[chart.chartAreaIndex] = ChartTypes.points;
                        lChart.SetTrendType(TrendType.quadTrend, chart.chartAreaIndex);
                    }, function () {
                        //chartTypes[chart.chartAreaIndex] = ChartTypes.points;
                        lChart.SetTrendType(TrendType.cubicTrend, chart.chartAreaIndex);
                    },
                ]
            ];
            for (var i = 0; i < groups.length; i++) {
                var imgSrc = groups[i] + ".png";
                if (this.settings) {
                    imgSrc = this.settings["url_" + groups[i]];
                }
                var gr = new MenuGroup(groups[i] + chart.container.id,
                    imgSrc,
                    chart);
                gr.layout = MenuLayout.vertical;
                var curr_items = items[i];
                var curr_clicks: any[] = clicks[i];
                for (var j = 0; j < curr_items.length; j++) {
                    var imgSrc = curr_items[j] + ".png";
                    if (this.settings) {
                        imgSrc = this.settings["url_" + curr_items[j] + "Btn"];
                    }
                    var itm = new MenuItem(curr_items[j],
                        imgSrc,
                        curr_clicks[j]);
                    gr.AddItem(itm);
                }

                menu.AddItem(gr);
            }

            return menu.Expand();
        }

        getLastVisibleLevel(levels: any) {
            var levelsCount = Object.keys(levels).length;

            var cl = null;
            for (var i = levelsCount; i > 0; i--) {
                cl = levels[i - 1];
                if (cl.Visible == true)
                    return cl;
            }
        }

        getFirstVisibleLevel(levels: any) {
            var levelsCount = Object.keys(levels).length;

            var cl = null;
            for (var i = 0; i < levelsCount; i++) {
                cl = levels[i];
                if (cl.Visible == true)
                    return cl;
            }
        }


        getPointDetails(point: SelectedPoint) {
            var cells2D = this.tOLAPChart._cells2D;
            var details = point.details;
            var series = point.ser;
            var layout = this.tOLAPChart.getLayout();
            var cellSet = this.tOLAPChart.getCellSet();
            var dict = { measures: {}, members:{} };

            var dicMeas = dict.measures;
            var dicMemb = dict.members;

            if (layout.YAxisMeasures != null && layout.YAxisMeasures.length > 0) {
                dicMeas[series.Measure] = {
                    displayName: this.tOLAPChart._measures[series.Measure].DisplayName,
                    value: details.YValueFormatted
                };
            } else {
                if (layout.RowArea.length > 0) {
                    var level = this
                        .getLastVisibleLevel(this.tOLAPChart._hierarchies[layout.RowArea[layout.RowArea.length - 1]].Levels);
                    if (level) {
                        dicMemb[level.UniqueName] = {
                            displayName: level.DisplayName,
                            value: this.tOLAPChart.getMemberValue(details.YValue),
                            filterValue: details.YValue
                        };
                    }
                }
            }

            if (layout.XAxisMeasure) {
                dicMeas[layout.XAxisMeasure] = {
                    displayName: this.tOLAPChart._measures[layout.XAxisMeasure].DisplayName,
                    value: details.XValueFormatted
                };
            } else {
                if (layout.ColumnArea.length > 0) {

                    var level = this
                        .getLastVisibleLevel(this.tOLAPChart._hierarchies[layout.ColumnArea[layout.ColumnArea.length - 1]]
                            .Levels);
                    if (level) {
                        dicMemb[level.UniqueName] = {
                            displayName: level.DisplayName,
                            value: this.tOLAPChart.getMemberValue(details.XValue),
                            filterValue: details.XValue
                        };
                    }
                }
            }

            for (var i = 0; i < details.DetailMembers.length; i++) {
                var level = this.getFirstVisibleLevel(this.tOLAPChart._hierarchies[layout.DetailsArea[i]].Levels);
                if (level) {
                    dicMemb[level.UniqueName] = {
                        displayName: level.DisplayName,
                        value: this.tOLAPChart.getMemberValue(details.DetailMembers[i]),
                        filterValue: details.DetailMembers[i]
                    };
                }
            }

            for (var k = 0; k < cellSet.FixedCols; k++) {
                var c1 = cells2D[k][point.row];
                if (c1.MemberData != null) {
                    if (c1.MemberData.LevelUniqueName) {
                        var level = this.tOLAPChart._levels[c1.MemberData.LevelUniqueName];
                        if (level) {
                            dicMemb[level.UniqueName] = {
                                displayName: level.DisplayName,
                                value: this.tOLAPChart.getMemberValue(c1.UniqueName),
                                filterValue: c1.UniqueName
                            };
                        }
                    }
                }
            }

            for (var k = 0; k < cellSet.FixedRows; k++) {
                var c1 = cells2D[point.col][k];
                if (c1.MemberData != null) {
                    if (c1.MemberData.LevelUniqueName) {
                        var level = this.tOLAPChart._levels[c1.MemberData.LevelUniqueName];
                        if (level) {
                            dicMemb[level.UniqueName] = {
                                displayName: level.DisplayName,
                                value: this.tOLAPChart.getMemberValue(c1.UniqueName),
                                filterValue: c1.UniqueName
                            };

                        }
                    }
                }
            }

            if (series.ColorMember) {
                if (layout.ColorAxisItem) {
                    var cm = this.tOLAPChart._seriesInfo[series.ColorMember].colorMember;
                    var level = this.getFirstVisibleLevel(this.tOLAPChart._hierarchies[layout.ColorAxisItem].Levels);
                    //var level = this.tOLAPChart._levels[layout.ColorAxisItem];
                    if (level) {
                        dicMemb[level.UniqueName] = {
                            displayName: level.DisplayName,
                            value: cm.DisplayName,
                            filterValue: series.ColorMember
                        };
                    }
                }
            }

            if (details.ColorValueFormatted) {
                var cm = this.tOLAPChart._measures[layout.ColorAxisItem];
                if (cm != null) {
                    dicMemb[cm.UniqueName] = {
                        displayName: cm.DisplayName,
                        value: details.ColorValueFormatted

                    };
                }
            }


            //    if (series.ColorValueFormatted) {
            //        dicMeas[page.measures[layout.ColorAxisItem]] = {
            //            "displayName": series.ColorValueFormatted,
            //            "value": cm.DisplayName
            //        };
            //    };


            if (series.SizeMember) {
                if (layout.SizeAxisItem) {
                    var cm = this.tOLAPChart._seriesInfo[series.SizeMember].sizeMember;
                    if (cm != null) {
                        //var level = this.tOLAPChart._levels[layout.SizeAxisItem];
                        var level = this.getFirstVisibleLevel(this.tOLAPChart._hierarchies[layout.SizeAxisItem].Levels);
                        if (level) {
                            dicMemb[level.UniqueName] = {
                                displayName: level.DisplayName,
                                value: cm.DisplayName,
                                filterValue: series.SizeMember
                            };

                        }
                    }
                }
            }

            if (details.SizeValueFormatted) {
                var cm = this.tOLAPChart._measures[layout.SizeAxisItem];
                if (cm != null) {
                    dicMemb[cm.UniqueName] = {
                        displayName: cm.DisplayName,
                        value: details.SizeValueFormatted

                    };
                }
            }


            if (series.ShapeMember) {
                if (layout.ShapeAxisItem) {
                    var cm = this.tOLAPChart._seriesInfo[series.ShapeMember].shapeMember;
                    var level = this.getFirstVisibleLevel(this.tOLAPChart._hierarchies[layout.ShapeAxisItem].Levels);
                    //var level = this.tOLAPChart._levels[layout.ShapeAxisItem];
                    if (level) {
                        dicMemb[level.UniqueName] = {
                            displayName: level.DisplayName,
                            value: cm.DisplayName,
                            filterValue: series.ShapeMember
                        };
                    }
                }
            }

            return dict;
        }

        renderDetailsTable(points: SelectedPoint[]) {
        if (points.length == 0)
            return null;

        var startTable = "<table class=rc_tbl>";
        var endTable = "</table>";
        var startRow = "<tr>";
        var endRow = "</tr>";
        var startHeadCell = "<th class=ui-widget-header>";
        var endHeadCell = "</th>";
        var startOddRowCell = "<td class='rc_tbloddrow ui-state-default'>";
        var startEvenRowCell = "<td class='rc_tblevenrow ui-widget-content'>";
        var endCell = "</td>";

        var table = startTable;
        var pointDetails = null;
        if (points.length == 1) {
            pointDetails = this.getPointDetails(points[0]);
            for (var j in pointDetails.measures) {
                table += startRow;
                table += startHeadCell +
                    pointDetails.measures[j].displayName +
                    ' : ' +
                    endHeadCell +
                    startEvenRowCell +
                    pointDetails.measures[j].value +
                    endCell;
                table += endRow;
            }
            for (var j in pointDetails.members) {
                table += startRow;
                table += startHeadCell +
                    pointDetails.members[j].displayName +
                    ' : ' +
                    endHeadCell +
                    startEvenRowCell +
                    pointDetails.members[j].value +
                    endCell;
                table += endRow;
            }
        } else {
            var header = {
                'members': {},
                'measures': {}
            };
            var pd = [];
            for (var i = 0; i < points.length; i++) {
                pointDetails = this.getPointDetails(points[i]);
                for (var j in pointDetails.measures) {
                    if (!header.measures[j]) {
                        header.measures[j] = pointDetails.measures[j];
                    }
                }
                for (var j in pointDetails.members) {
                    if (!header.members[j]) {
                        header.members[j] = pointDetails.members[j];
                    }
                }

                var added = false;
                for (var k = 0; k < pd.length; k++) {
                    var matched = true;
                    var pdMembers = pd[k].members;
                    for (var membInd in pointDetails.members) {
                        if (!(membInd in pdMembers)) {
                            matched = false;
                            break;
                        } else {
                            if (pdMembers[membInd].value != pointDetails.members[membInd].value) {
                                matched = false;
                                break;
                            }
                        }
                    }
                    if (matched) {
                        var pdMeasures = pd[k].measures;
                        for (var measInd in pointDetails.measures) {
                            if (!(measInd in pdMeasures)) {
                                pdMeasures[measInd] = pointDetails.measures[measInd];
                                added = true;
                            }
                        }
                    }
                }

                if (!added)
                    pd.push(pointDetails);
            }

            table += startRow;
            for (var j in header.measures) {
                table += startHeadCell + header.measures[j].displayName + endHeadCell;
            }
            for (var j in header.members) {
                table += startHeadCell + header.members[j].displayName + endHeadCell;
            }
            table += endRow;

            for (var i = 0; i < pd.length; i++) {
                pointDetails = pd[i];
                table += startRow;
                var startCell = (i % 2 == 0) ? startEvenRowCell : startOddRowCell;
                for (var j in header.measures) {
                    var val = '';
                    if (j in pointDetails.measures)
                        val = pointDetails.measures[j].value;
                    table += startCell + val + endCell;
                }
                for (var j in header.members) {
                    var val = '';
                    if (j in pointDetails.members)
                        val = pointDetails.members[j].value;
                    table += startCell + val + endCell;
                }
                table += endRow;
            }
        }
        table += endTable;
        return table;
    }

        GetDefaultPointSize() {
        return new Size(this.defaultChartWidth * 0.05, // * tOLAPChart._scale,
            this.defaultChartHeight * 0.05); // * tOLAPChart._scale);
    }

        GetSelectedPointsDetails() {
            return this.renderDetailsTable(this.getSelectedPoints());
        }

        CreatePopUp(x: number, y: number, text: string) {
            this.HidePopup();
            var div = document.createElement("DIV");
            div.className = "ui-widget ui-widget-content ui-corner-all";
            div.style.padding = "5px";
            div.style.position = "absolute";
            div.style.zIndex = "50000";
            div.style.top = y + "px";
            div.style.left = x + "px";
            div.style.boxShadow = "3px 3px 3px #888888";
            div.innerHTML = text;
            div.style.display = "none";
            div.id = "hintLabel";
            return div;
        }

        HidePopup() {
        $('#' + "hintLabel").remove();
    }

    SetSeriesType(chartType: ChartTypes, chartAreaIndex: number, hidePoints?: boolean) {
        var newType = chartType;
        if (typeof chartAreaIndex != "undefined") {
            this.tOLAPChart.chartTypes[chartAreaIndex] = newType;
            if (typeof hidePoints != "undefined")
                this.tOLAPChart.hidePoints[chartAreaIndex] = hidePoints;
        }
        this.SetChartType(newType, chartAreaIndex, hidePoints);
    };

    SetChartType(newType: ChartTypes, chartAreaIndex: number, hidePoints?: boolean) {
        var oldType = this.chartType;

        this.chartType = newType;

        if (newType == ChartTypes.pie) {
            this.chartType = ChartTypes.pie;
            this.tOLAPChart.prepearToPie();
        }

        if (oldType == ChartTypes.pie && newType != oldType) {
            this.tOLAPChart.resetPieData();
        }

        var hasBar = false;

        for (var i = 0; i < this.charts.length; i++) {
            if (chartAreaIndex >= 0) {
                if (this.charts[i].chartAreaIndex == chartAreaIndex) {
                    this.charts[i].SetType(newType);
                    //if (newType == ChartTypes.points)
                    if (typeof hidePoints != "undefined")
                        this.charts[i].hidePoints = hidePoints ? true : false;
                }
            } else {
                this.charts[i].SetType(newType);
                //if (newType == ChartTypes.points)
                if (typeof hidePoints != "undefined")
                    this.charts[i].hidePoints = hidePoints ? true : false;
            }

            if (this.charts[i].type == ChartTypes.bar ||
                this.charts[i].type == ChartTypes.deltaBar ||
                this.charts[i].type == ChartTypes.percentBar)
                hasBar = true;
        }

        var isOldDelta = oldType == ChartTypes.deltaSpline ||
            oldType == ChartTypes.deltaBar ||
            oldType == ChartTypes.deltaArea;

        var isNewDelta = this.chartType == ChartTypes.deltaSpline ||
            this.chartType == ChartTypes.deltaBar ||
            this.chartType == ChartTypes.deltaArea;

        if (isOldDelta != isNewDelta) {
            this.SetFixedScale();
        }

        var isOldBar = oldType == ChartTypes.bar ||
            oldType == ChartTypes.deltaBar ||
            oldType == ChartTypes.percentBar;

        var isNewBar = this.chartType == ChartTypes.bar ||
            this.chartType == ChartTypes.deltaBar ||
            this.chartType == ChartTypes.percentBar;

        if (isOldBar != isNewBar) {
            this.correctInfinityAxis(hasBar);
        }

        this.Redraw();

        if (this.tOLAPChart.legend)
            this.tOLAPChart.legend.initLegend();
        //this.tOLAPChart.applyLegend();

    }

    correctInfinityAxis(hasBar: boolean) {
        for (var i = 0; i < this.charts.length; i++) {
            var chart = this.charts[i];

            var axSystems = chart.axisSystems.GetSystems();
            for (var j = 0; j < axSystems.length; j++) {
                var axSystem = axSystems[j];
                if (!axSystem.IsMeasureAttached) {
                    var ax = axSystem.GetMeasureAxis();
                    if (ax.descriptor.type === AxisType.infinityAxis) {
                        if (hasBar) {
                            ax.pushVoidMeasure();
                        } else {
                            ax.popVoidMeasure();
                        }
                    }
                }
                if (!axSystem.IsDimensionAttached) {
                    var ax = axSystem.GetDimensionAxis();
                    if (ax.descriptor.type === AxisType.infinityAxis) {
                        if (hasBar) {
                            ax.pushVoidMeasure();
                        } else {
                            ax.popVoidMeasure();
                        }
                    }
                }
            }
        }
    }

    SetTrendType(trType: TrendType, chartAreaIndex: number) {
        for (var i = 0; i < this.charts.length; i++) {
            this.charts[i].SetTrendType(trType);
        }
        this.Redraw();
    }

    HideAxis() {
        for (var i = 0; i < this.charts.length; i++) {
            var chart = this.charts[i];
            var axSystems = chart.axisSystems.GetSystems();
            for (var j = 0; j < axSystems.length; j++) {
                axSystems[j].Hide();
            }

        }
    }

    ShowAxis() {
        for (var i = 0; i < this.charts.length; i++) {
            var chart = this.charts[i];
            var axSystems = chart.axisSystems.GetSystems();
            for (var j = 0; j < axSystems.length; j++) {
                axSystems[j].Show();
            }
        }
    }

    SetFixedScaleMeasure(charts: Chart[]) {
        var axisScales: any[] = [];
        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];

            if (chart == null)
                continue;

            var axSystems = chart.axisSystems.GetSystems();
            for (var j = 0; j < axSystems.length; j++) {
                var axSyst = axSystems[j];
                if (!axisScales[axSyst.id]) {
                    axisScales[axSyst.id] = {};
                }

                if (!axisScales[axSyst.id]["row" + chart.row]) {
                    axisScales[axSyst.id]["row" + chart.row] = [];
                }

                axSyst.ForceCorrectMeasureScale();

                let y = axSyst.GetMeasureAxis();
                let yType = y.GetType();
                if (yType === AxisType.infinityAxis) {
                    var marks = axisScales[axSyst.id]["row" + chart.row];
                    var tmp: string[] = cpy(y.GetMarks());
                    for (var k = 0; k < tmp.length; k++) {
                        var ind = marks.indexOf(tmp[k]);
                        if (ind < 0) {
                            marks.push(tmp[k]);
                        }
                    }
                } else {
                    var marks = axisScales[axSyst.id]["row" + chart.row];

                    var res_min = "0";
                    var res_max = "0";
                    var tmp: string[] = y.GetMarks()
                        .sort((a: string, b: string): number => {
                            return parseInt(b) - parseInt(a);
                        });
                    var tmp_min = tmp[tmp.length - 1];
                    var tmp_max = tmp[0];
                    if (marks.length != 0) {
                        var sorted = marks.sort(function (a: number, b: number) {
                            return b - a;
                        });

                        var min = sorted[sorted.length - 1];
                        var max = sorted[0];

                        res_min = parseInt(min) < parseInt(tmp_min) ? min : tmp_min;
                        res_max = parseInt(max) > parseInt(tmp_max) ? max : tmp_max;
                    } else {
                        res_min = tmp_min;
                        res_max = tmp_max;
                    }

                    axisScales[axSyst.id]["row" + chart.row] = [res_min, res_max];
                }
            }
        }

        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];

            if (chart == null)
                continue;

            var axSystems = chart.axisSystems.GetSystems();
            for (var j = 0; j < axSystems.length; j++) {
                var axSyst = axSystems[j];
                let y: any = axisScales[axSyst.id]["row" + chart.row];
                axSyst.SetFixedMeasure(y);
            }

        }
    }

    SetFixedScaleDimension(charts: Chart[]) {
        var axisScales: any[] = [];
        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];
            var axSystems = chart.axisSystems.GetSystems();
            for (var j = 0; j < axSystems.length; j++) {
                var axSyst = axSystems[j];
                if (!axisScales[axSyst.id]) {
                    axisScales[axSyst.id] = {
                        "column": []
                    };
                }
                if (!axisScales[axSyst.id].column["column" + chart.column]) {
                    axisScales[axSyst.id].column["column" + chart.column] = [];
                }

                axSyst.ForceCorrectDimensionScale();
                var x = axSyst.GetDimensionAxis();
                var xType = x.GetType();
                if (xType === AxisType.infinityAxis) {
                    var marks = axisScales[axSyst.id].column["column" + chart.column];
                    var tmp = cpy(x.GetMarks());
                    for (var k = 0; k < tmp.length; k++) {
                        var ind = marks.indexOf(tmp[k]);
                        if (ind < 0) {
                            marks.push(tmp[k]);
                        }
                    }
                } else {
                    var marks = axisScales[axSyst.id].column["column" + chart.column];
                    var res_min = "0";
                    var res_max = "0";
                    let tmp = x.GetMarks()
                        .sort((a: string, b: string): number => {
                            return parseInt(b) - parseInt(a);
                        });
                    var tmp_min = tmp[tmp.length - 1];
                    var tmp_max = tmp[0];
                    if (marks.length != 0) {
                        var sorted = marks.sort(function (a: number, b: number) {
                            return b - a;
                        });

                        var min = sorted[sorted.length - 1];
                        var max = sorted[0];

                        res_min = parseInt(min) < parseInt(tmp_min) ? min : tmp_min;
                        res_max = parseInt(max) > parseInt(tmp_max) ? max : tmp_max;
                    } else {
                        res_min = tmp_min;
                        res_max = tmp_max;
                    }

                    axisScales[axSyst.id].column["column" + chart.column] = [
                        res_min, res_max
                    ];
                }
            }
        }

        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];
            var axSystems = chart.axisSystems.GetSystems();
            for (var j = 0; j < axSystems.length; j++) {
                var axSyst = axSystems[j];
                let x = axisScales[axSyst.id].column["column" + chart.column];
                axSyst.SetFixedDimension(x);
            }

        }
    }

    SetFixedScaleY(charts: Chart[]) {
        switch (this.measureOrientation) {
            case Orientation.verticalOrientation:
                this.SetFixedScaleMeasure(charts);
                break;
            case Orientation.horizontalOrientation:
                this.SetFixedScaleDimension(charts);
                break;
        }
    }

    SetFixedScaleX(charts: Chart[]) {
        switch (this.measureOrientation) {
            case Orientation.verticalOrientation:
                this.SetFixedScaleDimension(charts);
                break;
            case Orientation.horizontalOrientation:
                this.SetFixedScaleMeasure(charts);
                break;
        }
    }

    SetFixedScale() {
        this.isFixedScale = true;
        var chartManager = this;
        this.tOLAPChart.jqRS_IG()
            .children('table')
            .children('tbody')
            .children('tr')
            .has('.chartContainer')
            .each(
            function () {
                var cells = $(this)
                    .children('td')
                    .has(
                    '.chartContainer');
                var count = cells.first().find('.chartContainer').length;
                for (var i = 0; i < count; i++) {
                    var charts: Chart[] = [];
                    cells.each(function () {
                        charts.push($(this)
                            .find('.chartContainer')
                            .eq(i)
                            .data('chart'));
                    });
                    chartManager.SetFixedScaleY(charts);
                }
            });

        var rowCnt = this.tOLAPChart.jqRS_IG()
            .children('table')
            .children('tbody')
            .children('tr')
            .has('.chartContainer')
            .length;

        var colCount = this.tOLAPChart.jqRS_IG()
            .children('table')
            .children('tbody')
            .children('tr')
            .has('.chartContainer')
            .first()
            .children('td')
            .has(
            '.chartContainer')
            .length;

        for (var i = 0; i < colCount; i++) {
            var charts: Chart[] = [];
            this.tOLAPChart.jqRS_IG()
                .children('table')
                .children('tbody')
                .children('tr')
                .has('.chartContainer')
                .each(
                function () {
                    $(this)
                        .children('td')
                        .has('.chartContainer')
                        .eq(i)
                        .find('.chartContainer')
                        .each(
                        function () {
                            charts.push($(this)
                                .data(
                                'chart'));
                        });
                });
            this.SetFixedScaleX(charts);
        }
    }

    DestroyCharts() {
        for (var i = 0; i < this.charts.length; i++) {
            var chart = this.charts[i]; //.pop();
            chart.Destroy();
        }
        this.charts = [];
        this.chartsCount = 0;
    }

    // Points selection
    // ************************************************************************
    SetMultiSelect() {
        this.multiSelect = true;
    }

    UnsetMultiSelect() {
        this.multiSelect = false;
    }

    onKeyUp(e: any) {
        if (e.which === 17) {
            e.data.chart.UnsetMultiSelect();
        }
    }

    onKeyDown(e: any) {
        if (e.which === 17) {
            e.data.chart.SetMultiSelect();
        }
    }

    getChartsInCell(col: number, row: number) {
        var charts = [];
        var chart;
        for (var i = 0; i < this.charts.length; i++) {
            chart = this.charts[i];
            if (chart.column == col && chart.row == row)
                charts.push(chart);
        }

        return charts;
    }


    redrawSelectionArea(e: any) {
        this.selectionInfo.Update({
            "chart": e.data.chart
        });

        var charts = this.selectionInfo.charts;

        for (var id = 0; id < charts.length; id++) {
            charts[id].redrawSelectionArea(e);
        }
    }

    getChartById(id: string) {
        for (var i = 0; i < this.charts.length; i++) {
            if (this.charts[i].id == id)
                return this.charts[i];
        }

        return null;
    }

    selectShapes(e: any) {
        var charts = this.selectionInfo.charts;
        for (var id = 0; id < charts.length; id++) {
            charts[id].selectShapes(e);
        }
        this.selectionInfo.Deactivate();
    }

    clearSelection() {
        var charts = this.selectionInfo.charts;
        for (var id = 0; id < charts.length; id++) {
            charts[id].clearSelection();
        }
    }

    getSelectedPoints() {
        var selection = [];
        let pnt: SelectedPoint;
        for (var i = 0; i < this.charts.length; i++) {
            var chart = this.charts[i];
            if (chart.selectedShapes.length > 0) {
                for (var j = 0; j < chart.selectedShapes.length; j++) {
                    var shp = chart.selectedShapes[j];
                    if (shp.data) {
                        pnt = new SelectedPoint;
                        pnt.index = chart.index;
                        pnt.row = chart.row;
                        pnt.col = chart.column;
                        pnt.measure = shp.data.measure;
                        pnt.dimension = shp.data.dimension;
                        pnt.series = shp.data.func;
                        pnt.ser = shp.data.series;
                        pnt.details = shp.data.details;
                        selection.push(pnt);
                    }
                }
            }
        }
        return selection;
    }
    // ******************************************************************************

    Disable() {
        this.HidePopup();
        this.HideMenu();
        this.Enabled = false;
    }

    Enable() {
        this.Enabled = true;
    }

    initAxisList() {
        this.standaloneAxisList = [];
    }

    SetGlobalAxisVisibility(isVisible: boolean) {
        for (var i = 0; i < this.standaloneAxisList.length; i++) {
            this.standaloneAxisList[i].visible = isVisible;
        }
    }
    CreateMainAxisX(chart: Chart) {
        var div = document.createElement('DIV');
        var axSystems = chart.axisSystems.GetSystems();
        var ax = new StandaloneAxis(div, chart, axSystems[0], true);
        return div;
    }

    CreateMainAxisY(chart: Chart) {
        var div = document.createElement('DIV');
        var axSystems = chart.axisSystems.GetSystems();
        var ax = new StandaloneAxis(div, chart, axSystems[0], false);
        return div;
    }


    doSetFixedAxisPosition(baseOffs: JQueryCoordinates, columnWidth: number) {
        for (var i = 0; i < this.standaloneAxisList.length; i++) {
            var ax = this.standaloneAxisList[i];
            var chartOffs = ax.chart.GetContainerPosition();
            var realX = 0 + columnWidth - $(ax.container).width();
            var realY = 0;
            if (ax.isX) {
                var realX = chartOffs.left - baseOffs.left;
            } else {
                var realY = chartOffs.top - baseOffs.top;
            }
            ax.container.style.top = realY + 'px';
            ax.container.style.left = realX + 'px';
        }
    }
    Redraw() {
        for (var i = 0; i < this.charts.length; i++) {
            try {
                this.charts[i].Draw();
            } catch (err) {
                alert(err);
            }

        }

        for (var i = 0; i < this.standaloneAxisList.length; i++) {
            this.standaloneAxisList[i].Draw();
        }
    }

    initChartType() {
        if (this.settings.chartDefinitions != null && this.settings.chartDefinitions.TypeMeasureTypes != null) {
            this.hidePoints = !this.settings.chartDefinitions.ShowPointsOnLines;
            var chartType = this.settings.chartDefinitions.TypeMeasureTypes[0];
            this.chartType = chartTypeStringConverter(chartType);
        }
    }
    }
}