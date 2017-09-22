namespace RadarSoft {
    export class OlapChartBase extends OlapGridBase {
        _chartType: ChartTypes;
        hidePoints: boolean[];
        _yMarkCount: number;
        _scaleX: number;
        _scaleY: number;
        _legendCount: number;
        _currentColorModifForPie: any;
        _dropColumn: any;
        _serriesInfo: any;
        _cells2D: any[];

        constructor() {
            super();
            this.chartManager = this._isCanvasSupported ? new ChartManager() : null,
            this._cells2D = null,
            this._serriesInfo = null,
            this._dropColumn = null,
            this._currentColorModifForPie = null,
            this._colorCount = 10,
            this._legendCount = 7,
            //this.docHeight = $(document).height(),
            //this.docWidth = $(document).width(),
            this._scaleY = 1,
            this._scaleX = 1,
            this._yMarkCount = 8,
            //this._xMarkCount  = 10,
            this.chartTypes = [],
            this.hidePoints = [],
            this.legend = null;
        }

        drill(event: any) {
            if (event.data.grid.getAnalysisType() === "grid") {
                super.drill(event);
                return;
            }
            if (event.which > 1)
                return;
            var cellid = $(event.target).findAttr("cellid");
            if (!cellid)
                return;
            event.stopPropagation();
            var actionString = "drill|" + event.data.arg + "|" + cellid;
            if (event.data.grid.chartManager.chartType == ChartTypes.pie)
                actionString += "|" + "piemode";

            event.data.grid.callbackDataGrid(actionString);
            event.data.grid.disableGrid();
        }

        onDocumentSizeChanged(e: any) {
            var grid = e.data.grid;
            if ($(document).height() != grid.docHeight || $(document).width() != grid.docWidth) {
                grid.resizeIG();
                //            grid.applyInternalGrid();
                grid.doSetFixedPosition();
                setTimeout($.proxy(grid.doSetFixedPosition, grid), 800);
                grid.docWidth = $(document).width();
                grid.docHeight = $(document).height();

                //alert(grid.docWidth + "; " + grid.docHeight);
            }
        }

        doScroll(event?: any) {
            var grid = (event) ? event.data.grid : this;
            var rh = grid.jqRS_OG("#olapgrid_FR");
            if (!rh.length)
                return;

            var ig = grid.jqRS_IG();

            var _cols = grid.jqRS_OG("#olapgrid_IG_cols");
            var _rows = grid.jqRS_OG("#olapgrid_IG_rows");

            var _cols_axis_main = grid.jqRS_OG("#olapgrid_IG_cols_axis_main");
            var _cols_axis_secondary = grid.jqRS_OG("#olapgrid_IG_cols_axis_secondary");
            var _rows_axis_main = grid.jqRS_OG("#olapgrid_IG_rows_axis_main");

            var t = ig.scrollTop();
            var g = ig.data("topleft");
            _cols.css({
                'top': g.top - t + "px",
                'clip': "rect(" + t + "px, auto, auto, auto)"
            });
            _cols.height(ig[0].clientHeight + t);

            _cols_axis_main.css({
                'top': g.top - t + "px",
                'clip': "rect(" + t + "px, auto, auto, auto)"
            });
            _cols_axis_main.height(ig[0].clientHeight + t);
            _cols_axis_secondary.css({
                'top': g.top - t + "px",
                'clip': "rect(" + t + "px, auto, auto, auto)"
            });
            _cols_axis_secondary.height(ig[0].clientHeight + t);
            t = ig.scrollLeft();
            _rows.css({
                'left': g.left - t + "px",
                'clip': "rect(auto, auto, auto, " + t + "px)"
            });
            _rows.width(ig[0].clientWidth + t);
            _rows_axis_main.css({
                'left': g.left - t + "px",
                'clip': "rect(auto, auto, auto, " + t + "px)"
            });
            _rows_axis_main.width(ig[0].clientWidth + t);
        }

        doSetFixedPosition() {
            if (this.getAnalysisType() === "grid") {
                super.doSetFixedPosition();
                return;
            }

            if (this._isCanvasSupported == false)
                return;

            var ig = this.jqRS_IG();

            function fixedRestrictSize(item: any, g: any) {
                if (item.width() > g[0].clientWidth)
                    item.width(g[0].clientWidth);
                if (item.height() > g[0].clientHeight)
                    item.height(g[0].clientHeight);
                return item;
            }

            var table = ig.children("table");
            var _levels = this.jqRS_OG("#olapgrid_IG_levels");
            var _rows = this.jqRS_OG("#olapgrid_IG_rows");
            var _cols = this.jqRS_OG("#olapgrid_IG_cols");
            var _cols_axis_main = this.jqRS_OG("#olapgrid_IG_cols_axis_main");
            var _cols_axis_secondary = this.jqRS_OG("#olapgrid_IG_cols_axis_secondary");
            var _rows_axis_main = this.jqRS_OG("#olapgrid_IG_rows_axis_main");

            fixedRestrictSize(_levels, ig);

            fixedRestrictSize(_cols, ig).height(ig[0].clientHeight);

            fixedRestrictSize(_rows, ig).width(ig[0].clientWidth);

            fixedRestrictSize(_cols_axis_main, ig).height(ig[0].clientHeight);
            fixedRestrictSize(_cols_axis_secondary, ig).height(ig[0].clientHeight);

            fixedRestrictSize(_rows_axis_main, ig).width(ig[0].clientWidth);

            var g = ig.offset();
            g.left += 1;
            g.top += 1;
            var p = ig.offsetParent();
            if (p.length) {
                var po = p.offset();
                g.left -= po.left;
                g.top -= po.top;
            }
            ig.data("topleft", g);

            var cw = 0;
            table.find("td[fixedcol=1]").each(function () {
                cw += $(this).outerWidth();
            });
            var rh = 0;
            table.find("td[fixedrow=1]").each(function () {
                rh += $(this).outerHeight();
            });

            _levels.css({
                'width': cw + "px",
                'height': rh + "px",
                'left': g.left + "px",
                'top': g.top + "px"
            });
            _cols.css({
                'width': cw + "px",
                'left': g.left + "px",
                'top': g.top + "px"
            });
            _rows.css({
                'height': rh + "px",
                'left': g.left + "px",
                'top': g.top + "px"
            });

            var width = 0;
            var canvases = _cols_axis_main.find("canvas");
            canvases.each(function () {
                if (width < $(this).width())
                    width = $(this).width();
            });
            _cols_axis_main.css({
                'width': width + "px", // _cols_axis_main.find('canvas').width() + 'px',
                'left': g.left + cw + 3 + "px",
                'top': g.top + "px"
            });
            this.jqRS_OG("#olapgrid_IG_cols_axis_primary_tmpl").width(
                _cols_axis_main.width());

            _cols_axis_secondary.css({
                'width': _cols_axis_secondary.find("canvas").width() + "px",
                'top': g.top + "px"
            });
            this.jqRS_OG("#olapgrid_IG_cols_axis_secondary_tmpl").width(
                _cols_axis_secondary.width());

            var left = (table[0].clientWidth < ig[0].clientWidth ? table[0].clientWidth
                    : ig[0].clientWidth)
                + g.left - _cols_axis_secondary.width();
            _cols_axis_secondary.css({
                'left': left + "px"
            });

            _rows_axis_main.css({
                'height': _rows_axis_main.find("canvas").height() + "px",
                'left': g.left + "px"
            });

            this.jqRS_OG("#olapgrid_IG_rows_axis_primary_tmpl").height(_rows_axis_main.height());

            var bottom = (table[0].clientHeight < ig[0].clientHeight ? table[0].clientHeight
                    : ig[0].clientHeight)
                + g.top - _rows_axis_main.height() - 3;

            _rows_axis_main.css({
                'top': bottom + "px"
            });

            table.find(".rc_membercell").each(function () {
                var w = $(this).width();
                var h = $(this).height();
                _rows.find("#" + this.id).children("div").width(w);
                _rows.find("#" + this.id).children("div").height(h);

                _cols.find("#" + this.id).children("div").width(w);
                _cols.find("#" + this.id).children("div").height(h);

                _levels.find("#" + this.id).children("div").width(w);
                _levels.find("#" + this.id).children("div").height(h);
            });

            var legends = this.jqRS_OG("#all_legends");
            var legendsOffsetTop = legends.offset() == null ? 0 : legends.offset().top;
            var newH = this.jqRS_IG().height() - Math.abs((this.jqRS_IG().offset().top - legendsOffsetTop));
            legends.css({
                'overflow': "auto",
                'height': Math.ceil(newH) + "px"
            });

            this.chartManager.doSetFixedAxisPosition(table.offset(), _cols_axis_main.width());
            this.doScroll();
        }

        applyInternalGrid(isCallback = true) {
            if (this.getAnalysisType() === "grid") {
                super.applyInternalGrid(isCallback);
                return;
            }
        }

        applyInternalChart(isCallback = true) {
            //        if (this._isCanvasSupported == false || typeof (rsOlapChart) == "undefined") {
            if (this._isCanvasSupported == false) {
                this.jqRS_IG().html("It is not possible to display the data. This version of the browser does not support HTML 5 canvas element. Please use the following browsers: Internet Explorer 9+, Mozilla Firefox 3.6+, Opera 12+, Safari 6+, Google Chrome.");
                return;
            }
            this.jqRS_IG("[valuesort]").css("cursor", "pointer").unbind(
                "click").click(
                {
                    grid: this
                },
                function (event) {
                    event.data.grid.callbackDataGrid("valuesort|"
                        + $(event.target).findAttr("valuesort"));
                    event.data.grid.disableGrid();
                });
            this.jqRS_OG("#olapgrid_IG").unbind("contextmenu").bind("contextmenu", { grid: this }, this.createPopup);
            this.jqRS_OG("#olapgrid_IG .rs_nextlevel").css("cursor", "pointer").unbind("click").click({ grid: this, arg: "l" }, this.drill);
            this.jqRS_OG("#olapgrid_IG .rs_nexthier").css("cursor", "pointer").unbind("click").click({ grid: this, arg: "h" }, this.drill);
            this.jqRS_OG("#olapgrid_IG .rs_collapse").css("cursor", "pointer").unbind("click").click({ grid: this, arg: "c" }, this.drill);
            this.jqRS_OG("#olapgrid_IG .rs_parentchild").css("cursor", "pointer").unbind("click").click({ grid: this, arg: "p" }, this.drill);

            this.jqRS_OG("#olapgrid_PIVOT td.rs_create_chart").css({
                'border-top-color': this.getBorderColor()
            });

            var p = this.jqRS_IG("div[pagercell] span").css("cursor",
                "pointer").unbind("click").click(
                {
                    grid: this
                },
                function (event) {
                    var o = $(this);
                    var arg = o.text();
                    if (arg == "...") {
                        arg = window.prompt(
                            event.data.grid._settings.pagePrompt, "1");

                        event.data.grid.prompt(
                            event.data.grid._settings.pagePrompt, "1", {
                                grid: event.data.grid
                            }, function (data: any, s: string) {
                                data.grid.callbackDataGrid("page|" + s
                                    + "|" + o.findAttr("pagercell"));
                                data.grid.disableGrid();
                            });
                    } else {
                        event.data.grid.callbackDataGrid("page|" + arg + "|"
                            + o.findAttr("pagercell"));
                        event.data.grid.disableGrid();
                    }
                });

            var ig = this.jqRS_IG();
            ig.children("#olapgrid_IG_levels").remove();
            ig.children("#olapgrid_IG_cols").remove();
            ig.children("#olapgrid_IG_rows").remove();
            ig.children("#olapgrid_IG_rows_axis_main").remove();
            ig.children("#olapgrid_IG_cols_axis_main").remove();
            ig.children("#olapgrid_IG_cols_axis_secondary").remove();


            if (!this.jqRS_OG("#olapgrid_FR").length)
                return;

            //?
            if (this.jqRS_OG(".rc_levelcell [display!=none]").length === 0) {

                this.jqRS_OG(".rc_membercell").css(
                {
                    'border-width': "0px",
                    'padding': "0px"
                }).children().remove();
            }

            let z  = this.jqRS_OG().css("z-index");
            
            if (z == "auto")
                z = "0";
            var table = ig.children("table");
            var cw = 0;
            ig.find("td[fixedcol=1]").each(function () {
                cw += $(this).outerWidth();
            });
            var rh = 0;
            ig.find("td[fixedrow=1]").each(function () {
                rh += $(this).outerHeight();
            });

            var rc = table.children("tbody").children("tr").length;
            table.children("tbody").children("tr:first").each(function () {
                var td;
                var div;
                var axis = ig.find("#olapgrid_IG_cols_axis_primary_tmpl");
                if (axis.length == 0) {
                    td = document.createElement("TD");
                    div = document.createElement("DIV");
                    div.style.width = "50px";
                    div.id = "olapgrid_IG_cols_axis_primary_tmpl";
                    td.appendChild(div);
                    td.setAttribute("rowspan", rc.toString());
                    $(this).children(".rc_membercell:last").after(td);
                }

                axis = ig.find("#olapgrid_IG_cols_axis_secondary_tmpl");
                if (axis.length == 0) {
                    td = document.createElement("TD");
                    div = document.createElement("DIV");
                    div.style.width = "50px";
                    div.id = "olapgrid_IG_cols_axis_secondary_tmpl";
                    td.appendChild(div);
                    td.setAttribute("rowspan", rc.toString());
                    $(this).append(td);
                }
            });

            var axis = ig.find("#olapgrid_IG_rows_axis_primary_tmpl");
            if (axis.length == 0) {

                var colc = table.children("tbody").children("tr:first").children("td").length;
                var td = document.createElement("td");
                var div = document.createElement("DIV");
                div.style.height = "50px";
                div.id = "olapgrid_IG_rows_axis_primary_tmpl";
                td.appendChild(div);
                td.colSpan = colc;
                var tr = document.createElement("tr");
                tr.appendChild(td);
                table.children("tbody").append(tr);
            }

            if (isCallback) {
                table.children("thead").children("tr").each(function () {
                    $(this).children(".rc_membercell:first").each(function () {
                        if (this.colSpan > 1) {
                            this.colSpan += 1;
                        } else
                            this.colSpan = 2;
                    });

                    $(this).children(".rc_membercell:last").each(function () {
                        if (this.colSpan > 1) {
                            this.colSpan += 1;
                        } else
                            this.colSpan = 2;
                    });
                });
            }
            var _levels = table.clone(true).wrap(document.createElement("div"))
                .parent().attr("id", "olapgrid_IG_levels").css({
                    'position': "absolute",
                    'overflow': "hidden",
                    'z-index': parseInt(z) + 4
                });
            var _cols = table.clone(true).wrap(document.createElement("div"))
                .parent().attr("id", "olapgrid_IG_cols").css({
                    'position': "absolute",
                    'overflow': "hidden",
                    'z-index': parseInt(z) + 3
                });
            var _rows = table.clone(true).wrap(document.createElement("div"))
                .parent().attr("id", "olapgrid_IG_rows").css({
                    'position': "absolute",
                    'overflow': "hidden",
                    'z-index': parseInt(z) + 2
                });

            ig.append(_levels);
            ig.append(_cols);
            ig.append(_rows);

            var d = document.createElement("div");
            ig.append(d);
            var _cols_axis_main = $(d).attr("id", "olapgrid_IG_cols_axis_main")
                .css({
                    'position': "absolute",
                    'overflow': "hidden",
                    'z-index': parseInt(z) + 1
                });

            d = document.createElement("div");
            ig.append(d);
            var _rows_axis_main = $(d).attr("id", "olapgrid_IG_rows_axis_main")
                .css({
                    'position': "absolute",
                    'overflow': "hidden",
                    'z-index': parseInt(z) + 2
                });

            d = document.createElement("div");
            ig.append(d);
            var _cols_axis_secondary = $(d).attr("id",
                "olapgrid_IG_cols_axis_secondary").css({
                'position': "absolute",
                'overflow': "hidden",
                'z-index': parseInt(z) + 4
            });

            table.find(".rc_membercell").each(function () {
                var w = $(this).width();
                var h = $(this).height();
                var d = document.createElement("DIV");
                $(d).width(w);
                $(d).height(h);
                _rows.find("#" + this.id).wrapInner(d);
                _cols.find("#" + this.id).wrapInner(d);
                _levels.find("#" + this.id).wrapInner(d);
            });

            this.fillCells2D();

            this.fillChartCells();
            if (this.chartManager.chartType != ChartTypes.pie && !(this.chartManager.chartsCount == 1 && this.chartManager.charts[0].series.length == 0))
                this.fillAxis();
            this.chartManager.Redraw();

            this.doSetFixedPosition();
        }

        initAfterAllCalback() {
            if (this.getAnalysisType() === "grid") {
                super.initAfterAllCalback();
                return;
            }

            this.jqRS_OG(".rs_img_del").hide();
            this.jqRS_OG(".rs_img_filter").hide();
            this.applyPivot();
            this.jqRS_OG(".rs_img_del").show();
            this.jqRS_OG(".rs_img_filter").show();
            this.applyInternalChart();
            this.jqRS_OG("#olapgrid_IG").scroll({ grid: this }, this.doScroll);
            this.jqRS_OG().bind("selectstart", function (event) {
                event.preventDefault();
                return false;
            });
            this.initAllAreasResizing();
            this.initToolbox();
        }

        hideModificationAreas() {
            var arg = "hidemodificationareas|" + this.parsChartTypes();
            this.postback(arg);
        }

        showModificationAreas() {
            var arg = "showmodificationareas|" + this.parsChartTypes();
            this.postback(arg);
        }

        showAllAreas() {
            var arg = "showallareas|" + this.parsChartTypes();
            this.postback(arg);
        }

        showOnlyData() {
            var arg = "showonlydata|" + this.parsChartTypes();
            this.postback(arg);
        }

        showPivotAreas() {
            var arg = "showpivotareas|" + this.parsChartTypes();
            this.postback(arg);
        }

        clearLayout() {
            var arg = "clearlayout|" + this.parsChartTypes();
            this.postback(arg);
        }

        exportToCsv(fileName: string): void {
            return null;
        }

        exportToJpeg(fileName: string) {
            var arg = "exporttojpg|" + fileName + "|" + this.parsChartTypes() + "|" + this.chartManager.GetExportData();
            this.postback(arg);
        }

        exportToHtml(fileName: string) {
            var arg = "exporttohtml|" + fileName + "|" + this.parsChartTypes() + "|" + this.chartManager.GetExportData();
            this.postback(arg);
        }

        exportToXlsx(fileName: string) {
        }

        exportToXls(fileName: string) {
        }

        exportToPdf(fileName: string) {
            var arg = "exporttopdf|" + fileName + "|" + this.parsChartTypes() + "|" + this.chartManager.GetExportData();
            this.postback(arg);
        }

        createPopup3(event: any) {
            event.data.grid.hidePopup();
            var uid = $(event.target).findAttr("uid");
            if (!uid)
                return;

            if (event.preventDefault)
                event.preventDefault();
            event.returnValue = false;

            var popup = $("#olapgrid_rsPopup");
            popup.html(event.data.grid._settings.popupLoading);

            popup.css({
                'z-index': event.data.grid.get_element().style.zIndex + 4,
                'display': "block"
            }).position({
                of: event,
                my: "left top",
                collision: "fit"
                }).offset({ top:2, left: 2});

            $(document).bind("click", {
                grid: event.data.grid
            }, event.data.grid.hidePopup);

            event.data.grid.callback("createpopup3|" + uid, "popup");
        }

        applyPivot() {
            if (this.getAnalysisType() === "grid") {
                super.applyPivot();
                return;
            }
            this.structureLayout();
            this.initSeriesInfo();
            this.initLegend();

            var tv = this.items(".rs_treeview");
            tv.unbind("contextmenu").bind("contextmenu", {
                grid: this
            }, this.createPopup2);

            var panels = this
                .items(
                    "#pivot_filterarea, #pivot_columnarea, #pivot_rowarea, #pivot_valuearea")
                .unbind("contextmenu").bind("contextmenu", {
                    grid: this
                }, this.createPopup2);

            if (!tv.hasClass("treeview")) {
                tv = tv.treeview({
                    grid: this
                }).bind("selectstart", false).addClass("rs_unselectable");
                var chk = tv.find("li[checked]");
                $(document.createElement("input")).attr({
                    'type': "checkbox"
                }).insertBefore(chk.children("span"));
                tv.find("li[checked=True] input").attr("checked", "checked");
                chk.find("input").css("cursor", "pointer").click(
                    {
                        grid: this
                    },
                    function (event) {
                        var uid = $(event.target).findAttr("uid");
                        var area = (<HTMLInputElement>event.target).checked ? "grid" : event.data.grid.getArea(uid);

                        if ((<HTMLInputElement>event.target).checked)
                            event.data.grid.pivoting(uid, area, 999, "tree");
                        else
                            event.data.grid.pivoting(uid, "tree", 999, area);
                    });
            }

            if (this.isMobile()) {
                this.items("[drag]").draggable({ helper: "clone" });

                this.items("[drag]").on("dragstart", { grid: this }, this.doStartDrag2);

                this.items("[drag]").on("dragstop", { grid: this }, this.doEndDrag2);
            } else {
                this.items("[drag]").unbind("mousedown selectstart").bind("mousedown", { grid: this }, this.doStartDrag).bind("selectstart", false);
                this.items("[drag]").bind("mousedown", { grid: this }, this.doStartDrag);
            }

            var settings = this._settings;
            this.applyCheckedAndFiltered(null, settings.filtered);

            this.jqRS_OG(".rs_img_filter").css("cursor", "pointer").unbind("click").click({ grid: this }, function (event) {
                var q = $(this);
                var uid = q.findAttr("uid");
                var m = q.findAttr("measure");
                if (m == "true") {
                    event.data.grid.showDialog("showmfiltersettings|" + uid);
                } else {
                    event.data.grid.createHierarchyEditor(uid as string);
                }
            });

            if (this._settings.filterClientId) {
                this.jqRS_F(".rs_img_filter").css("cursor", "pointer").unbind("click").click({ grid: this }, function (event) {
                    var q = $(this);
                    var uid = q.findAttr("uid");
                    var m = q.findAttr("measure");
                    if (m == "true") {
                        event.data.grid.showDialog("showmfiltersettings|" + uid);
                    } else {
                        event.data.grid.createHierarchyEditor(uid as string);
                    }
                });
            }

            $(".rs_icon_cover").hover(function () {
                $(this).removeClass("ui-state-default");
                $(this).addClass("ui-state-hover");
            }, function () {
                $(this).removeClass("ui-state-hover");
                $(this).addClass("ui-state-default");
            });


            $(".rs_img_del").css("cursor", "pointer").unbind("click").click({ grid: this },
                function (event) {
                    event.data.grid.pivoting(
                        $(event.target).findAttr("uid"), "tree", 999, $(event.target).findAttr("area"));
                });

            $(".rs_img_del2").css("cursor", "pointer").unbind("click").click({ grid: this }, function (event) {
                event.data.grid.callbackAll("resetfilter|" + $(event.target).findAttr("uid"));
            });

            if (this.jqRS_F("#olapfilter_select").selectmenu("instance") == null) {
                this.jqRS_F("#olapfilter_select").selectmenu().off("selectmenuchange").on("selectmenuchange", { grid: this }, function (event, ui) {
                    event.data.grid.jqRS_F("#olapfilter_editnew_cover").css("display", (ui.item.value == "...") ? "none" : "");
                });
            }

            this.jqRS_F("#olapfilter_editnew").unbind("click").click({ grid: this }, function (event) {
                var uid = event.data.grid.jqRS_F("#olapfilter_select").val();
                if (uid.substr(0, 2) == "m:") {
                    event.data.grid.showDialog("showmfiltersettings|" + uid.substr(2));
                } else {
                    if (!event.data.grid.heditor) {
                        event.data.grid.createHierarchyEditor((uid as string).substr(2));

                    }
                }
            });

            var tree = this.jqRS_OG("#olapgrid_tdtree");
            tree.height(100);
            var h = this.jqRS_OG().height();
            var pivot = this.jqRS_OG("#olapgrid_PIVOT");
            if (tree.length) {
                var ph = (pivot.length) ? pivot.outerHeight(true) : 0;
                var th = tree.outerHeight(true);
                var thHeader = this.jqRS_OG("#olapgrid_tdtree_header").outerHeight(true);
                var delta = h - ph - th - thHeader;
                if (delta > 0)
                    tree.height(tree.height() + delta);
                else if (ph > 0)
                    pivot.height(h - th - thHeader);
            }

            this.resizeIG();

            $("#rsmdxbutton_ok, #rsmdxbutton_cancel").button();
            $("#rsloadlayoutbutton_ok, #rsloadlayoutbutton_cancel").button();
            $("#rsconnectionbutton_ok, #rsconnectionbutton_cancel").button();
        }

        protected initLegend() {
            if (this.getAnalysisType() === "grid") {
                super.initLegend();
                return;
            }

            var legendContainer = this.jqRS_OG('#all_legends').get(0);
            if (legendContainer != null) {
                if (this._isCanvasSupported) {
                    this.legend = new ChartLegend(this);
                    this.legend.initLegend();
                } else {
                    var container = RadarSoft.$(legendContainer);
                    container.empty();
                    if (RadarSoft.$.isEmptyObject(this._modifInfo) == false)
                        container.append("It is not possible to display a legend. This version of the browser does not support HTML 5 canvas element. Please use the following browsers: Internet Explorer 9+, Mozilla Firefox 3.6+, Opera 12+, Safari 6+, Google Chrome.");
                }
            }
        }

        trimEnd(str: string, simbol: string) {

            if (!str)
                return "";

            var last = str.charAt(str.length - 1);
            if (last == simbol) {
                str = str.substring(0, str.length - 1);
                str = this.trimEnd(str, simbol);
            } else
                return str;

            return str;
        }

        getMemberValue(UniqueName: string) {
            return this._members2[UniqueName];
        }

        structureLayout() {
            var layout = this.getLayout();
            var cellSet = this.getCellSet();
            this._measures = new Object();
            var i: any;
            for (i = 0; i < layout.Measures.length; i++) {
                var cm = layout.Measures[i];
                this._measures[cm.UniqueName] = cm;
            }

            this._hierarchies = new Object();
            this._levels = new Object();
            var j: any;
            for (i = 0; i < layout.Dimensions.length; i++) {
                var cd = layout.Dimensions[i];

                for (j = 0; j < cd.Hierarchies.length; j++) {
                    var ch = cd.Hierarchies[j];
                    this._hierarchies[ch.UniqueName] = ch;

                    if (ch.Levels) {
                        for (var k = 0; k < ch.Levels.length; k++) {
                            var cl = ch.Levels[k];
                            this._levels[cl.UniqueName] = cl;
                        }
                    }
                }
            }

            this._members = new Object();
            if (cellSet.RowChartMembers != null) {
                for (i in cellSet.RowChartMembers) {
                    var ll = cellSet.RowChartMembers[i];
                    for (j in ll) {
                        var cm = ll[j];
                        this._members[cm.UniqueName] = cm.DisplayName;
                    }
                }
            }
            if (cellSet.ColumnChartMembers != null) {
                for (i in cellSet.ColumnChartMembers) {
                    var ll = cellSet.ColumnChartMembers[i];
                    for (j in ll) {
                        var cm = ll[j];
                        this._members[cm.UniqueName] = cm.DisplayName;
                    }
                }
            }

            this._members2 = new Object();
            if (cellSet.Members2UniqueNames != null) {
                for (i in cellSet.Members2UniqueNames) {
                    this._members2[cellSet.Members2UniqueNames[i]] = cellSet.Members2DisplayNames[i];
                }
            }

        }

        initialize(settings = "") {
            if (settings != "")
                this.set_settings(settings);

            if (this.getAnalysisType() === "grid") {
                super.initialize();
                return;
            }

            this._scaleX = this._settings.scaleX;
            this._scaleY = this._settings.scaleY;

            if (this._isCanvasSupported) {
                this.chartManager.initialize(this);
            }

            super.initialize();

            for (var i in this._settings.chartsType) {
                var typeInt = this._settings.chartsType[i];
                this.chartTypes.push(chartTypeIntConverter(typeInt));
            }
            //this.chartTypes = this._settings.chartsType.slice();

            this.applyInternalChart();

            this.jqRS_IG().scroll({
                grid: this
            }, this.doScroll);
            $(window).load({
                grid: this
            }, this.doLoad);

            //        $(window).scroll({
            //			grid : this
            //		}, this.onDocumentSizeChanged);

            if (this.isAppleDevice() == false && this._isCanvasSupported) {
                $(window).resize({
                    grid: this
                }, this.onDocumentSizeChanged);
            }
        }

        fillCells2D() {
            var cells = this.getCellSet().Cells;
            this._cells2D = new Array();
            for (var i in cells) {
                var c = cells[i];
                if ((c.RowSpan > 1) || (c.ColSpan > 1))
                    continue;

                if (this._cells2D[c.Col] instanceof Array == false)
                    this._cells2D[c.Col] = new Array();

                this._cells2D[c.Col][c.Row] = c;
            }

            for (var i in cells) {
                var c = cells[i];
                if ((c.RowSpan == 1) && (c.ColSpan == 1))
                    continue;

                for (var i1 = 0; i1 < c.ColSpan; i1++)
                    for (var j1 = 0; j1 < c.RowSpan; j1++) {
                        if (this._cells2D[c.Col + i1] instanceof Array == false)
                            this._cells2D[c.Col + i1] = new Array();

                        this._cells2D[c.Col + i1][c.Row + j1] = c;
                    }

            }
        }

        filterSelected() {
            this.hidePopup();
            var points = this.chartManager.getSelectedPoints();
            var pointDetails = null;
            var filters = [];
            var fMembers = new Object();
            for (var i = 0; i < points.length; i++) {
                pointDetails = this.chartManager.getPointDetails(points[i]);


                for (var key in pointDetails.members) {

                    var filter = {
                        "key": key,
                        "filterValue": pointDetails.members[key].filterValue,
                        "hierarchy": this.findHierarchyByLevel(key)
                    };


                    if (filter.key && filter.filterValue && filter.hierarchy)
                        filters.push(filter);
                    else
                        continue;

                    if (fMembers[filter.hierarchy.UniqueName]) {
                        var oldLevelIndex = this.getLevelIndex(fMembers[filter.hierarchy.UniqueName]);
                        var currentLevelIndex = this.getLevelIndex(filter.key);
                        if (oldLevelIndex < currentLevelIndex)
                            fMembers[filter.hierarchy.UniqueName] = filter.key;
                    } else {
                        fMembers[filter.hierarchy.UniqueName] = filter.key;
                    }

                }
            }

            if (filters.length == 0)
                return;

            var requestStr = "apllymemberfilter|";

            for (var i = 0; i < filters.length; i++) {

                if (fMembers[filters[i].hierarchy.UniqueName] != filters[i].key)
                    continue;

                requestStr += filters[i].key + "=" + filters[i].filterValue;

                if (i < filters.length - 1)
                    requestStr += "^";
            }

            requestStr = this.trimEnd(requestStr, "^");

            this.callbackAll(requestStr);
        }

        getLevelIndex(levelUniqName: string) {
            var levels = this.findHierarchyByLevel(levelUniqName).Levels;

            var index:any = -1;
            for (var i in levels) {
                if (levels[i].UniqueName === levelUniqName) {
                    index = i;
                    break;
                }
            }

            return index;
        }

        findHierarchyByLevel(levelUniqName: string): any {
            var hierarc = null;
            for (var i in this._hierarchies) {
                hierarc = this._hierarchies[i];
                if (hierarc.Levels == null)
                    continue;
                for (var j = 0; j < hierarc.Levels.length; j++) {
                    if (this._hierarchies[i].Levels[j].UniqueName === levelUniqName)
                        return this._hierarchies[i];
                }
            }
            return null;
        }

        showDetails() {
            this.hidePopup();

            var data = this.chartManager.GetSelectedPointsDetails();
            if (data == null)
                return;

            this.disableGrid();

            var div = document.createElement("DIV");
            div.style.overflow = "auto";
            div.style.maxHeight = "600px";
            div.style.maxWidth = "800px";
            document.body.appendChild(div);
            $(div).html(data);

            data = div.outerHTML;
            $(div).remove();

            this.receiveDialog({
                "title": this._settings.rsShowUnderlying,
                "data": data,
                "buttons": [{
                    "text": this._settings.rsClose,
                    "code": "$(this).dialog('close')"
                }]
            });
        }

        getDefaultSeriesColor() {
            return this.jqRS_OG(".rc_membercell").css("color");
        }

        getFontColor() {
            //        var fontColor = $('.rc_membercell').css('color');
            //            
            //        if (fontColor == "rgb(255, 255, 255)")

            var fontColor = this.jqRS_OG(".ui-widget-content").first().css("color"); //this.getBorderColor();

            return fontColor;
        }

        getEvenRowColor() {
            var evenRowColor = this.jqRS_OG(".rc_membercell").css("background-color");
            return evenRowColor;
        }

        getOddRowColor() {
            var oddRowColor = $("#serviceDiv").css("background-color");
            return oddRowColor;
        }

        getBorderColor() {
            var borderColor = this.jqRS_IG().css("border-top-color");
            return borderColor;
        }

        getXLevel() {
            var layout = this.getLayout();
            if (layout.ColumnArea.length > 0) {

                var level = this.chartManager.getLastVisibleLevel(this._hierarchies[layout.ColumnArea[layout.ColumnArea.length - 1]].Levels);
                return level;
            }
            return null;
        }

        createChart(chartArea: any, row: any, column: any, index: any, chartAreaIndex: any) {
            var cellSet = this.getCellSet();
            var layout = this.getLayout();
            var isXAxisMeasure = layout.XAxisMeasure != "";
            var div = document.createElement("DIV");
            var series = chartArea.Series;
            var chart: any = { funcs: [] };
            var measures = [];
            var pnt: DataPoint;
            var func: DataFunction;
            for (var k = 0; k < series.length; k++) {
                var details = series[k].Details;
                func = new DataFunction();
                for (var h = 0; h < details.length; h++) {
                    pnt = new DataPoint(this.chartManager);
                    var x = isXAxisMeasure ? details[h].XValue : this._members[details[h].XValue];
                    if (x == null) {
                        x = "Total";
                    }
                    pnt.dimension = x;
                    pnt.measure = details[h].YValue;
                    pnt.details = details[h];
                    pnt.series = series[k];
                    func.points.push(pnt);
                }
                chart.funcs.push(func);

                if (measures.indexOf(series[k].Measure) < 0)
                    measures.push(series[k].Measure);
            }

            if (this.chartTypes[chartAreaIndex] == null) {
                var chartType = null;
                var chartDefinitions = this._settings.chartDefinitions;
                var typeIndex = -1;
                if (chartDefinitions != null && chartDefinitions.TypeMeasures != null) {
                    for (var i = 0; i < measures.length; i++) {
                        if (measures[i]) {
                            this.hidePoints[chartAreaIndex] = !chartDefinitions.ShowPointsOnLines;
                            typeIndex = chartDefinitions.TypeMeasures.indexOf(measures[i]);
                            if (typeIndex >= 0) {
                                chartType = chartTypeStringConverter(chartDefinitions.TypeMeasureTypes[typeIndex]);
                                this.chartTypes[chartAreaIndex] = chartType;
                                break;
                            }

                            this.chartTypes[chartAreaIndex] = null;
                        }
                    }
                }
            }

            var funcs: any = chart.funcs;
            var data = [];
            var xAxis = [];
            var yAxis = [];
            var xAxisCreated = false;
            if (cellSet.ColumnChartMembers) {
                var colMembers = cellSet.ColumnChartMembers[column - cellSet.FixedCols];
                for (var j = 0; j < colMembers.length; j++) {
                    xAxis.push(colMembers[j].DisplayName);
                }
                xAxisCreated = true;
            }

            var groups = {};
            for (var j = 0; j < funcs.length; j++) {
                var serieId = series[j].ColorMember ? series[j].ColorMember
                    : "default";
                var serieInfo = this._seriesInfo[serieId].colorMember;
                func = new DataFunction(serieInfo.Color, serieInfo.Gradient,
                    null, serieId, "first");
                serieId = series[j].SizeMember ? series[j].SizeMember : "default";
                func.sizeInfo = this._seriesInfo[serieId].sizeMember;
                serieId = series[j].ShapeMember ? series[j].ShapeMember : "default";
                func.shapeInfo = this._seriesInfo[serieId].shapeMember;
                var pnts = [];
                for (var k = funcs[j].points.length - 1; k >= 0; k--) {
                    pnt = funcs[j].points[k];
                    if (groups[pnt.dimension]) {
                        groups[pnt.dimension]++;
                    } else {
                        groups[pnt.dimension] = 1;
                    }
                    pnt.func = func;
                    pnts.push(pnt);
                    //pnts.push(new DataPoint(this.chartManager, pnt.x, pnt.y, func, pnt.details, pnt.series));
                    if (!xAxisCreated) {
                        if (xAxis.indexOf(pnt.dimension) < 0) {
                            xAxis.push(pnt.dimension);
                        }
                    }
                    if (yAxis.indexOf(pnt.measure) < 0) {
                        yAxis.push(pnt.measure);
                    }
                }

                func.points = pnts; // cpy(pnts);
                //data.push(cpy(func));
                data.push(func);
            }

            yAxis.sort();
            var areaMargin = 0;
            var maxW = 0;
            var ctx = document.createElement("canvas").getContext("2d");
            for (var j = 0; j < xAxis.length; j++) {
                var currW = ctx.measureText(xAxis[j]).width;
                if (maxW < currW) {
                    maxW = currW;
                }
            }

            var minBarWidth = 12;
            var maxGroups = 0;
            for (var group in groups) {
                if (groups[group] > maxGroups) {
                    maxGroups = groups[group];
                }
            }

            var borderColor = this.getBorderColor();
            var fontColor = this.getFontColor();
            var xMargin = this._settings.fontProperties.fontSize * 2 * ((this._scaleX > 1) ? this._scaleX : 1);
            var yMargin = this._settings.fontProperties.fontSize * 1.5;
            var chartW = this.chartManager.defaultChartWidth * this._scaleX;
            var chartH = this.chartManager.defaultChartHeight * this._scaleY;

            if (this.chartTypes.indexOf(ChartTypes.pie) < 0) {
                var colH = (chartH - 1.5 * yMargin) / this._yMarkCount;

                while (colH > 1.5 * this._settings.fontProperties.fontSize) {
                    this._yMarkCount += 2;
                    colH = (chartH - 5 * yMargin) / this._yMarkCount;
                }

                while (colH < 2 * this._settings.fontProperties.fontSize && this._yMarkCount > 2) {
                    this._yMarkCount -= 2;
                    colH = (chartH - 5 * yMargin) / this._yMarkCount;
                }

                var xMarkCount = isXAxisMeasure ? this._yMarkCount : xAxis.length;
                var colW = (chartW - 2 * xMargin) / xMarkCount;
                if (colW < 2 * xMargin) {
                    chartW = xMarkCount * 2 * xMargin;
                    colW = 2 * xMargin;
                }

                if (this.chartTypes[chartAreaIndex] == ChartTypes.bar ||
                    this.chartTypes[chartAreaIndex] == ChartTypes.deltaBar ||
                    this.chartTypes[chartAreaIndex] == ChartTypes.percentBar) {

                    if (colW < maxGroups * minBarWidth) {
                        chartW = (xAxis.length - 1) * maxGroups * minBarWidth + colW;
                    }
                }
            }

            var cellChart = new Chart(this.chartManager, this.chartTypes[chartAreaIndex], div, areaMargin, (chartW < this.chartManager.defaultChartWidth) ? this.chartManager.defaultChartWidth : chartW);

            cellChart.hidePoints = this.hidePoints[chartAreaIndex] ? this.hidePoints[chartAreaIndex] : false;

            var axSyst = cellChart.CreateAxisSystem("first");

            var xAxisType = isXAxisMeasure ? AxisType.discreteAxis : AxisType.infinityAxis;

            var xLevel = this.getXLevel();
            var titleX = isXAxisMeasure ? this._measures[layout.XAxisMeasure].DisplayName : (xLevel != null ? xLevel.DisplayName : "");
            var titleY = "";

            for (var i = 0; i < measures.length; i++) {
                if (measures[i]) {
                    if (titleY)
                        titleY += ", ";
                    titleY += this._measures[measures[i]].DisplayName;
                }
            }

            axSyst.CreateDimensionAxis(xAxisType, this._settings.fontProperties.fontSize, xAxis, new Brush(borderColor, "#DEEBF3"), new FontProperties(this._settings.fontProperties.fontSize, fontColor, this.chartManager), xMargin, "dimension", titleX, this.chartManager);
            axSyst.CreateMeasureAxis(AxisType.discreteAxis, this._settings.fontProperties.fontSize, yAxis, new Brush(borderColor, "#DEEBF3"), new FontProperties(this._settings.fontProperties.fontSize, fontColor, this.chartManager), yMargin, "measure", titleY, this.chartManager);

            cellChart.SetSeries(data);
            cellChart.SetCellId(row, column, index, chartAreaIndex);
            return div;
        }

        fillChartCells() {

            var cellSet = this.getCellSet();

            if (!cellSet)
                return;

            this.chartManager.DestroyCharts();
            if (cellSet == null)
                return;

            var celDiv;
            var cell;
            var chartCell;
            var chart;
            var cells = cellSet.Cells;
            for (var cellIndex in cells) {
                cell = cells[cellIndex];

                if (cell == null || cell.CellType != 4)
                    continue;
                //            if (this.chartTypes == null)
                //                this.chartTypes = new Array(cell.ChartAreas.length);
                for (var chartAreaIndex = 0; chartAreaIndex < cell.ChartAreas.length; chartAreaIndex++) {
                    var chartArea = cell.ChartAreas[chartAreaIndex];
                    if (chartArea) {
                        //chartCell = this.jqRS_OG('#cell_' + cell.CellIndex);
                        chartCell = this.jqRS_IG().children("table").find("#cell_" + cell.CellIndex);
                        //chartCell = $('#cell_' + cell.CellIndex);
                        chart = this.createChart(chartArea, cell.Row, cell.Col, cell.CellIndex, chartAreaIndex);
                        chartCell.append(chart);
                    }
                }
            }

            var hasBar = (this.chartTypes.indexOf(ChartTypes.bar) >= 0 ||
                this.chartTypes.indexOf(ChartTypes.deltaBar) >= 0 ||
                this.chartTypes.indexOf(ChartTypes.percentBar) >= 0);


            this.chartManager.SetFixedScale();
            this.chartManager.correctInfinityAxis(hasBar);
            this.chartManager.HideAxis();
        }

        fillAxis() {
            var lChart = this.chartManager;
            lChart.initAxisList();
            var _cols_axis_main = this.jqRS_OG("#olapgrid_IG_cols_axis_main");
            var _cols_axis_secondary = this.jqRS_OG("#olapgrid_IG_cols_axis_secondary");
            var _rows_axis_main = this.jqRS_OG("#olapgrid_IG_rows_axis_main");
            var table = this.jqRS_IG().children("table");
            var rc = 0;
            this.jqRS_IG().children("table").children("tbody").children("tr")
                .each(function () {
                    if ($(this).find(".chartContainer").length > 0) {
                        rc++;
                    }
                });

            this.jqRS_IG().children("table").children("tbody").children("tr")
                .find(".chartContainer:first").parent().each(function () {
                    $(this).find(".chartContainer").each(function () {
                        var chart = $(this).data("chart");
                        var ax = lChart.CreateMainAxisY(chart);
                        var ofs = chart.GetContainerPosition();
                        var real = ofs.top - table.offset().top;

                        ax.style.top = real + "px";
                        ax.style.left = 0 + "px";
                        _cols_axis_main.append(ax);
                    });
                });

            this.jqRS_IG().children("table").children("tbody").children("tr")
                .has(".chartContainer").first().children("td").has(
                    ".chartContainer").find(".chartContainer:first").each(
                    function () {
                        var chart = $(this).data("chart");
                        var ax = lChart.CreateMainAxisX(chart);
                        var ofs = chart.GetContainerPosition();
                        var real = ofs.left - table.offset().left;

                        ax.style.left = real + "px";
                        ax.style.top = 0 + "px";
                        _rows_axis_main.append(ax);
                    });

        }

        pivotingtogroup(uid: string, area: string, areaindex: string, from: string) {
            if (!uid || !area)
                return;
            if (from)
                this.callback("pivotingtogroup|" + uid + "|" + areaindex + "|" + area
                    + "|" + from, "all");
            else
                this.callback("pivotingtogroup|" + uid + "|" + areaindex + "|" + area,
                    "all");
            this.disableGrid();
        }

        isAppleDevice() {
            return (
                (navigator.userAgent.toLowerCase().indexOf("ipad") > -1) ||
                    (navigator.userAgent.toLowerCase().indexOf("iphone") > -1) ||
                    (navigator.userAgent.toLowerCase().indexOf("ipod") > -1)
            );
        }

        findLastColumnHierarchy() {
            var layout = this.getLayout();

            var lastlevelname = layout.ColumnLevels[layout.ColumnLevels.length - 1];
            if ((this._dropColumn) && layout.ColumnLevels.length > 1) {
                var str = this._dropColumn.split("|");

                // if ((str[2] == "tree" || str[2] == "row") && str[4] == "col")
                // {
                // if (layout.ColumnArea.length > 1)
                // lastlevelname = layout.ColumnArea[layout.ColumnArea.length - 2];
                // //return lastlevelname;
                // }
                if (str[2] == "col")// && str[4] == "col")
                {
                    if (layout.ColumnArea.length > 1) {
                        lastlevelname = layout.ColumnLevels[layout.ColumnArea.length - 2];
                        return lastlevelname;
                    }
                }
            }
            var lastlevel = this._levels[lastlevelname];

            var foundres = null;

            for (var i in this._hierarchies) {
                var hierarchy = this._hierarchies[i];
                if (hierarchy.DisplayName == lastlevel.DisplayName) {
                    foundres = hierarchy;
                    break;
                }
            }
            if (foundres != null)
                lastlevelname = foundres.UniqueName;

            return lastlevelname;

        }

        prepearToPie() {
            var layout = this.getLayout();

            if (layout.ColumnLevels == null)
                return;
            if (layout.ColumnLevels.length == 0)
                return;

            if (layout.ColorAxisItem)
                return;

            this._chartType = ChartTypes.pie;

            if (layout.XAxisMeasure)
                return;

            this._currentColorModifForPie = this.findLastColumnHierarchy();

            this.pivoting(this._currentColorModifForPie, "colors", 999);
        }

        resetPieData() {
            var layout = this.getLayout();

            if (this._currentColorModifForPie && this._currentColorModifForPie === layout.ColorAxisItem) {
                this.pivoting(layout.ColorAxisItem, "tree", 999, "colors");
            }

            this._currentColorModifForPie = null;
        }

        rebuildFrozenCells() {
            var ig = this.jqRS_IG();
            ig.children("#olapgrid_IG_levels").remove();
            ig.children("#olapgrid_IG_cols").remove();
            ig.children("#olapgrid_IG_rows").remove();
            let z = this.jqRS_OG().css("z-index");
            
            if (z === "auto")
                z = "0";
            var table = ig.children("table");

            var _levels = table.clone(true).wrap(document.createElement("div"))
                .parent().attr("id", "olapgrid_IG_levels").css({
                    'position': "absolute",
                    'overflow': "hidden",
                    'z-index': parseInt(z) + 4
                });
            var _cols = table.clone(true).wrap(document.createElement("div"))
                .parent().attr("id", "olapgrid_IG_cols").css({
                    'position': "absolute",
                    'overflow': "hidden",
                    'z-index': parseInt(z) + 3
                });
            var _rows = table.clone(true).wrap(document.createElement("div"))
                .parent().attr("id", "olapgrid_IG_rows").css({
                    'position': "absolute",
                    'overflow': "hidden",
                    'z-index': parseInt(z) + 2
                });

            ig.append(_levels);
            ig.append(_cols);
            ig.append(_rows);

            this.doSetFixedPosition();

        }

        resetScale() {
            //        if (this._scaleX != this._settings.scaleX || this._scaleY != this._settings.scaleY) {
            //            this._scaleX = this._settings.scaleX;
            //            this._scaleY = this._settings.scaleY;
            //            this.applyInternalGrid();
            //        }

            if (this._scaleX != 1 && this._scaleY != 1) {
                this._scaleX = 1;
                this._scaleY = 1;
                this.applyInternalChart();
            }


        }

        decreaseScale() {
            if (this._scaleX > 0.5) {
                this._scaleX -= 0.1;
                this._scaleX = Math.round(this._scaleX * 100) / 100;
            }
            if (this._scaleY > 0.5) {
                this._scaleY -= 0.1;
                this._scaleY = Math.round(this._scaleY * 100) / 100;
            }
            if (this._scaleX > 0.5 || this._scaleY > 0.5) {
                this.applyInternalChart();
                this.rebuildFrozenCells();
            }
        }

        increaseScale() {
            this.chartManager.charts[0].getChartImage();

            if (this._scaleX < 5) {
                this._scaleX += 0.1;
                this._scaleX = Math.round(this._scaleX * 100) / 100;
            }

            if (this._scaleY < 5) {
                this._scaleY += 0.1;
                this._scaleY = Math.round(this._scaleY * 100) / 100;
            }
            if (this._scaleX < 5 || this._scaleY < 5)
                this.applyInternalChart();

        }

        tryGetColumn() {
            //        for (var i = 0; i < this._measures.length; i++) {
            //    if (this._measures[i].)
            //}
        }

        protected getArea(item: string): string {
            var l = this.getLayout();

            if (item == l.ColorAxisItem) return "colors";
            //        if (l.ColumnArea[item]) return null; //"col";
            //        if (l.ColumnLevels && l.ColumnLevels[item]) return "col";
            //        //if (l.DetailsArea[item]) return "details";
            //        if (l.PageArea[item]) return "page";
            //        if (l.RowArea[item]) return "row";
            //        if (l.RowLevels && l.RowLevels[item]) return "row";
            //        if (l.ShapeAxisItem == item) return "shape";
            if (l.SizeAxisItem == item) return "size";
            //        if (l.YAxisMeasures) return  "row";
            if (l.XAxisMeasure == item) return "col";

            var ms = this._measures[item];
            if (ms && ms.IsVisible)
                return "row";

            return null;
        }

        parsChartTypes() {
            //        var line = "";
            //        for (var i in this.chartTypes) {
            //            line += chartTypeIntInverter(this.chartTypes[i]);
            //            if (i < this.chartTypes.length - 1)
            //                line += "|";
            //        }
            //        return line;

            var types = [];
            for (var i in this.chartTypes) {
                types.push(chartTypeIntInverter(this.chartTypes[i]));
            }

            var chartTypesObject = { chartTypes: types };
            var jasonChartTypes = JSON.stringify(chartTypesObject);
            return jasonChartTypes;

        }

        loadLayout(layoutXml: string) {
            var requestStr = "loadclientlayout|" + layoutXml;
            this.callbackAll(requestStr);
        }

        initChartShapes() {
            var shapeTypes = new pointTypeManager();
            var layout = this.getLayout();
            var cellset = this.getCellSet();
            var shapeChartMembers = cellset.ShapeChartMembers;
            if (shapeChartMembers) {
                var sm;
                for (var i = 0; i < shapeChartMembers.length; i++) {
                    sm = shapeChartMembers[i];
                    if (!this._seriesInfo[sm.UniqueName]) {
                        this._seriesInfo[sm.UniqueName] = {};
                    }
                    this._seriesInfo[sm.UniqueName].shapeMember = (this.chartManager.chartType != ChartTypes.pie) ? {
                            "DisplayName": sm.DisplayName,
                            "UniqueName": sm.UniqueName,
                            'Shape': shapeTypes.next(),
                            "GroupUniqName": layout.ShapeAxisItem
                        }
                        : this._seriesInfo["default"].shapeMember;
                }
            } else {
                this.jqRS_OG("#shape_legend").children().remove();
            }
        }

        getColorByMeasureValue(value: number): any {
            value = Math.round(value);
            var layout = this.getLayout();
            var colorMembers = this._seriesInfo[layout.ColorAxisItem].colorMembers;
            var minVal = colorMembers.ColorMinValue;
            var maxVal = colorMembers.ColorMaxValue;
            var valStep = Math.ceil((maxVal - minVal) / (this._colorCount - 1));
            for (var i = 0; i < this._colorCount; i++) {
                if (value >= minVal && value <= Math.ceil(minVal + valStep)) {
                    return colorMembers.ColorsInfo[i];
                }

                minVal += valStep;
            }

            return null;
        }

        initChartColors() {
            var clrManager = new ColorManager();
            var layout = this.getLayout();
            var cellset = this.getCellSet();
            var colorChartMembers = cellset.ColorChartMembers;

            if (colorChartMembers) {
                var colorsInfo = clrManager.CreateGradients(colorChartMembers.length);
                var clr;
                var fBrush;
                var fGrBrush;
                var cm;
                for (var i = 0; i < colorsInfo.length; i++) {
                    clr = colorsInfo[i];

                    //				fBrush = new Brush(clr.color, clr.color, null, null, 3, null,
                    //						"black", 1.5, 1.5, 0, 0.2, 0.8);
                    //				fGrBrush = clr.grdBrush;

                    fBrush = new Brush(clr.borderColor, clr.color, { lineWidth: 1, opacity: 0.5 });

                    cm = colorChartMembers[i];
                    if (!this._seriesInfo[cm.UniqueName]) {
                        this._seriesInfo[cm.UniqueName] = {};
                    }

                    this._seriesInfo[cm.UniqueName].colorMember = {
                        "DisplayName": cm.DisplayName,
                        "UniqueName": cm.UniqueName,
                        "Color": fBrush,
                        //"Gradient" : fGrBrush,
                        'BaseColor': clr.color,
                        "GroupUniqName": layout.ColorAxisItem
                    };
                }
            } else if (layout.ColorAxisItem) {
                if (!this._seriesInfo[layout.ColorAxisItem]) {
                    this._seriesInfo[layout.ColorAxisItem] = {};
                }

                if (cellset.ColorAxis) {
                    this._seriesInfo[layout.ColorAxisItem].colorMembers = {
                        "ColorsInfo": clrManager.CreateGradients(this._colorCount),
                        "ColorMaxValue": ciel10(cellset.ColorAxis.Max),
                        "ColorMinValue": floor10(cellset.ColorAxis.Min)
                    };
                }
            } else {
                this.jqRS_OG("#color_legend").children().remove();
            }
        }

        initChartSizes() {
            var layout = this.getLayout();
            var cellset = this.getCellSet();

            if (layout.SizeAxisItem) {
                var sizeChartMembers = cellset.SizeChartMembers;
                if (sizeChartMembers) {
                    var sm;
                    var sizeStep = (this.chartManager.maxMultiplier - this.chartManager.minMultiplier)
                        / sizeChartMembers.length;
                    for (var i = 0; i < sizeChartMembers.length; i++) {
                        sm = sizeChartMembers[i];
                        if (!this._seriesInfo[sm.UniqueName]) {
                            this._seriesInfo[sm.UniqueName] = {};
                        }
                        this._seriesInfo[sm.UniqueName].sizeMember = (this.chartManager.chartType != ChartTypes.pie) ? {
                                "DisplayName": sm.DisplayName,
                                "UniqueName": sm.UniqueName,
                                "SizeMultiplier": this.chartManager.minMultiplier + i * sizeStep,
                                "GroupUniqName": layout.SizeAxisItem
                            }
                            : this._seriesInfo["default"].sizeMember;
                    }
                } else {
                    if (!this._seriesInfo[layout.SizeAxisItem]) {
                        this._seriesInfo[layout.SizeAxisItem] = {};
                    }
                    if (cellset.SizeAxis) {
                        this._seriesInfo[layout.SizeAxisItem].sizeMembers = {
                            "SizeMaxValue": ciel10(cellset.SizeAxis.Max),
                            "SizeMinValue": floor10(cellset.SizeAxis.Min)
                        };
                    }
                }
            } else {
                this.jqRS_OG("#size_legend").children().remove();
            }
        }

        initSeriesInfoDefaults() {
            if (!this._seriesInfo["default"]) {
                this._seriesInfo["default"] = {};
            }
            this._seriesInfo["default"].sizeMember = {
                "DisplayName": "default",
                'SizeMultiplier': 0.7
            };

            var strokeColor = this.getDefaultSeriesColor(); //this.getBorderColor();	     
            var fillColor = this.getEvenRowColor(); //this.getOddRowColor();

            this._seriesInfo["default"].colorMember = {
                "DisplayName": "default",
                //			"Color" : new Brush('blue', 'blue', null, null, 3, null, "black",
                //					1.5, 1.5, 0, 0.2, 0.8),
                //			"Gradient" : new GradientBrush(new ColorStop(0.157, 'blue'),
                //					new ColorStop(1, 'lightblue')),

                "Color": new Brush(strokeColor, fillColor, { lineWidth: 1, opacity: 0.5 }),
                "Gradient": null,

                'BaseColor': strokeColor
            };
            var shapeTypes = new pointTypeManager();
            this._seriesInfo["default"].shapeMember = {
                "DisplayName": "default",
                'Shape': shapeTypes.defaultType
            };
        }

        hideModificators() {
            if (this.chartManager.chartType == ChartTypes.pie) {
                this.jqRS_OG("#pivot_sizearea").hide();
                this.jqRS_OG("#pivot_shapearea").hide();
                this.jqRS_OG("#pivot_sizeareaheader").hide();
                this.jqRS_OG("#pivot_shapeareaheader").hide();
            }
        }

        initSeriesInfo() {
            if (this._isCanvasSupported == false)
                return;

            this._seriesInfo = new Object();
            this.initSeriesInfoDefaults();
            this.initChartColors();
            this.initChartSizes();
            this.initChartShapes();
            this.hideModificators();
        }

        setChartType(newType: ChartTypes, chartAreaIndex: number, hidePoints: boolean) {
            if (this.chartManager != null)
                this.chartManager.SetSeriesType(newType, chartAreaIndex, hidePoints);
        }
    }
}
   
