namespace RadarSoft {
    export class OlapGridBase {
        legend: Legend;
        _conditionFormat: ConditionFormating;
        eventPopup: any;
        isPivoting: boolean;
        resizedCells: Object;
        isResizing: boolean;
        _colorCount: number;
        _IG_id: string;
        _modifInfo: Object;
        _members2: Object;
        _members: Object;
        _levels: Object;
        _hierarchies: Object;
        _measures: Object;
        _settings: any;
        _response: any;
        _rightResizingStarted = false;
        _leftResizingStarted = false;
        _rightAreaWidth = 0;
        _leftAreaWidth = 0;
        _isCanvasSupported: boolean;
        heditor: HierarchyEditor;
        chartManager: ChartManager;
        chartTypes: ChartTypes[];
        _seriesInfo: Object;

        constructor() {
            if (createCanvas() !== null) {
                this._isCanvasSupported = true;
            }
            this._response = null;
            this._settings = null;
            this._measures = null;
            this._hierarchies = null;
            this._levels = null;
            this._members = null;
            this._members2 = null;
            this._modifInfo = null;
            this._IG_id = "olapgrid_IG";
            this._colorCount = 7;
            this.isResizing = false;
            this.resizedCells = {};
            this.isPivoting = false;
            this.eventPopup = null;
            this._conditionFormat = null;
        }

        set_settings(value:any) {
            this._settings = value;
        }

        get_settings() {
            return this._settings;
        }

        errorCallback(arg:string, context:string) {
        }

        disableGrid() {
            var g = this.jqRS_OG();
            //if (g.attr('disabled') != 'disabled') {
            //    g.attr('disabled', 'disabled');
            //    this.addOverlay(g, true);
            //}
            this.addOverlay(g, true);
        }

        drill(event: JQueryEventObject) {
            if (event.which > 1) return;
            var cellid = $(event.target).findAttr('cellid');
            if (!cellid) return;
            event.stopPropagation();
            event.data.grid.callbackDataGrid('drill|' + event.data.arg + '|' + cellid);
            event.data.grid.disableGrid();
        }

        protected createHierarchyEditor(hierarchy: string): HierarchyEditor {
            var he = new HierarchyEditor(hierarchy, this);
            he.callback(`init|${hierarchy}`);
            this.disableGrid();
            return he;
        }

        clearMeasureFilter(measure:string) {
            this.callbackDataGrid('resetcmfilter|' + measure);
            this.disableGrid();
            this.hidePopup();
            this.jqRS_D().dialog('close');
        }

        applyMeasureFilter(conditions:string) {
            var firstValue = '';
            var srcFirst = this.jqRS_D('#ODLG_tbFirst');
            if (srcFirst.length) firstValue = srcFirst.val();

            var secondValue = '';
            var srcSecond = this.jqRS_D('#ODLG_tbSecond');
            if (srcSecond.length) secondValue = srcSecond.val();

            var restrictionType = 0;
            //var srcRestriction = WebForm_GetElementById('ODLG_RestrictsFacts');
            var srcRestriction = this.jqRS_D('#ODLG_RestrictsFacts');
            if ((srcRestriction.length > 0) && (<HTMLInputElement>srcRestriction.get(0)).checked)
                restrictionType = 1;

            this.callbackDataGrid(conditions + '|' + this.jqRS_D('#ODLG_cond').val() + '|' + firstValue + '|' + secondValue + '|' + restrictionType);
            this.disableGrid();
            this.hidePopup();
            this.jqRS_D().dialog('close');
        }

        applyContextFilter(conditions:string) {
            var firstValue = '';
            var srcFirst = this.jqRS_D('#ODLG_tbFirst');
            if (srcFirst.length) firstValue = srcFirst.val();

            var measure = '';
            var srcMeasures = this.jqRS_D('#ODLG_cbMeasures');
            if (srcMeasures.length) measure = srcMeasures.val();

            var secondValue = '';
            var srcSecond = this.jqRS_D('#ODLG_tbSecond');
            if (srcSecond.length) secondValue = srcSecond.val();
            var srcTopBottom = this.jqRS_D('#ODLG_cbTopBottom');
            var srcCondition2 = this.jqRS_D('#ODLG_cbCondition2');
            if ((srcTopBottom.length) && (srcCondition2.length))
                secondValue = srcTopBottom.val() + '.' + srcCondition2.val();

            this.callbackAll(conditions + '|' + firstValue + '|' + measure + '|' + secondValue);
            this.disableGrid();
            this.hidePopup();
            this.jqRS_D().dialog('close');
        }

        executeMenuAction(args: any) {
            this.callbackDataGrid(args);
            this.disableGrid();
            this.hidePopup();
        }

        executeMenuActionAll(args: any) {
            this.callbackAll(args);
            this.disableGrid();
            this.hidePopup();
        }

        fixedRestrictSize(item: any, g: any) {
            if (item.width() > g[0].clientWidth) item.width(g[0].clientWidth);
            if (item.height() > g[0].clientHeight) item.height(g[0].clientHeight);
            return item;
        }

        doSetFixedPosition() {
            var ig = this.jqRS_OG('#olapgrid_IG');

            this.fixedRestrictSize(this.jqRS_OG('#olapgrid_IG_levels'), ig);
            this.fixedRestrictSize(this.jqRS_OG('#olapgrid_IG_cols'), ig).height(ig[0].clientHeight);
            this.fixedRestrictSize(this.jqRS_OG('#olapgrid_IG_rows'), ig).width(ig[0].clientWidth);
            var g = ig.offset();
            g.left += 1;
            g.top += 1;
            var p = ig.offsetParent();
            if (p.length) {
                var po = p.offset();
                g.left -= po.left;
                g.top -= po.top;
            }
            ig.data('topleft', g);
            this.jqRS_OG('#olapgrid_IG_levels').css({ 'left': g.left + 'px', 'top': g.top + 'px', 'display': "block" });
            this.jqRS_OG('#olapgrid_IG_cols').css({ 'left': g.left + 'px', 'top': g.top + 'px', 'display': "block" });
            this.jqRS_OG('#olapgrid_IG_rows').css({ 'left': g.left + 'px', 'top': g.top + 'px', 'display': "block" });

            //ig.children("table").children("thead").find("th").css({ 'left': g.left + 'px', 'top': g.top + 'px', 'position': 'absolute', 'z-index': 4 });

            this.doScroll();
        }

        freezeFixedCells(isCallback: boolean) {
            var ig = this.jqRS_OG('#olapgrid_IG');
            ig.children('#olapgrid_IG_levels').remove();
            ig.children('#olapgrid_IG_cols').remove();
            ig.children('#olapgrid_IG_rows').remove();

            var z = this.jqRS_OG().css("z-index");
            
            if (z == "auto") {
                z = "0";
                this.jqRS_OG().css("z-index", "0");
            }
            var table = ig.children('table');
            var cw = 0;
            ig.find('td[fixedcol=1]').each(function () {
                cw += $(this).outerWidth();
            });
            var rh = 0;
            ig.find('td[fixedrow=1]').each(function () {
                rh += $(this).outerHeight();
            });

            var _levels = table.clone(true).wrap($('<div>')).parent().attr('id', 'olapgrid_IG_levels').css(
            {
                    'position': 'absolute', 'overflow': 'hidden', 'width': cw + 'px', 'height': rh + 'px',
                    'z-index': parseInt(z) + 2,
                    'display': 'none'
            });
            var _cols = table.clone(true).wrap($('<div>')).parent().attr('id', 'olapgrid_IG_cols').css(
            {
                    'position': 'absolute', 'overflow': 'hidden', 'width': cw + 'px',
                    'z-index': parseInt(z) + 1,
                    'display': 'none'
            });
            //var hTable = $('<table style="vertical-align: top;" cellspacing=0></table>');
            //var _rows = hTable.append(table.children('thead').clone(true)).wrap(document.createElement("div")).parent().attr('id', 'olapgrid_IG_rows').css(
            //    { 'position': 'absolute', 'overflow': 'hidden', 'height': rh + 'px', 'z-index': z + 2 });
            var _rows = table.clone(true).wrap($('<div>')).parent().attr('id', 'olapgrid_IG_rows').css(
            {
                    'position': 'absolute', 'overflow': 'hidden', 'height': rh + 'px',
                    'z-index': parseInt(z) + 1,
                    'display': 'none'
            });
            ig.append(_levels);
            ig.append(_cols);
            ig.append(_rows);

            if (isCallback)
                this.doSetFixedPosition();
            else
                setTimeout($.proxy(this.doSetFixedPosition, this), 800);
        }

        doScroll(event?: JQueryEventObject) {
            var grid = (event) ? event.data.grid : this;
            var rh = grid.jqRS_OG('#olapgrid_FR');
            if (!rh.length) return;

            var ig = grid.jqRS_OG('#olapgrid_IG');

            var _cols = grid.jqRS_OG('#olapgrid_IG_cols');
            var _rows = grid.jqRS_OG('#olapgrid_IG_rows');

            var t = ig.scrollTop();
            var g = ig.data('topleft');

            _cols.css({ 'top': g.top - t + 'px', 'clip': 'rect(' + t + 'px, auto, auto, auto)' });
            _cols.height(ig[0].clientHeight + t);

            var l = ig.scrollLeft();

            _rows.css({ 'left': g.left - l + 'px', 'clip': 'rect(auto, auto, auto, ' + l + 'px)' });
            _rows.width(ig[0].clientWidth + l);
        }

        stopResizing(cell: any, size: number) {
            this.resizedCells[cell.attr('cellid')] = size;
            this.isResizing = false;
        }

        startResizing() {
            this.isResizing = true;
        }

        initResize() {
            var table = this.jqRS_OG('#olapgrid_IG table');

            $.each(this.resizedCells, function (cellId, size) {
                table.find("th[cellid='" + cellId + "']").width(size.width).height(size.height);
            });

            var ths = table.find("td.rc_th");

            ths.resizable();

            ths.on("resizestart", { grid: this }, function (event, ui) {
                event.data.grid.startResizing();
                event.stopPropagation();
            });

            ths.on("resizestop", { grid: this }, function (event, ui) {
                event.stopPropagation();
                setTimeout($.proxy(event.data.grid.stopResizing, event.data.grid, ui.element, ui.size), 100);
            });

        }

        applyInternalGrid(isCallback = true) {
            this.jqRS_OG('#olapgrid_IG [valuesort]').css('cursor', 'pointer').unbind('click').click({ grid: this }, function (event) {
                if (event.data.grid.isResizing)
                    return;
                event.data.grid.callbackDataGrid('valuesort|' + $(event.target).findAttr('valuesort'));
                event.data.grid.disableGrid();
            });
            this.jqRS_OG('#olapgrid_IG').unbind('contextmenu').bind('contextmenu', { grid: this }, this.createPopup);
            this.jqRS_OG('#olapgrid_IG .rs_nextlevel').css('cursor', 'pointer').unbind('click').click({ grid: this, arg: 'l' }, this.drill);
            this.jqRS_OG('#olapgrid_IG .rs_nexthier').css('cursor', 'pointer').unbind('click').click({ grid: this, arg: 'h' }, this.drill);
            this.jqRS_OG('#olapgrid_IG .rs_collapse').css('cursor', 'pointer').unbind('click').click({ grid: this, arg: 'c' }, this.drill);
            this.jqRS_OG('#olapgrid_IG .rs_parentchild').css('cursor', 'pointer').unbind('click').click({ grid: this, arg: 'p' }, this.drill);

            var p = this.jqRS_OG('#olapgrid_IG div[pagercell] span').css('cursor', 'pointer').unbind('click').click({ grid: this }, function (event) {
                var o = $(this);
                var arg = o.text();
                if (arg == '...') {
                    //arg = window.prompt(event.data.grid._settings.pagePrompt, '1');

                    event.data.grid.prompt(event.data.grid._settings.pagePrompt, '1',
                        { grid: event.data.grid }, function (data: any, s: string) {
                            data.grid.callbackDataGrid('page|' + s + '|' + o.findAttr('pagercell'));
                            data.grid.disableGrid();
                        });
                } else {
                    event.data.grid.callbackDataGrid('page|' + arg + '|' + o.findAttr('pagercell'));
                    event.data.grid.disableGrid();
                }
            });

            if (this.jqRS_OG('#olapgrid_FR').length)
                this.freezeFixedCells(isCallback);
            else if (this._settings.allowResizing)
                this.initResize();

            this.applyColorModification();
        }

        enableConnectionDialog() {
            this.jqRS_D('#olaptlw_servername').prop('disabled', false);
            this.jqRS_D('#olaptlw_db').selectmenu("enable").selectmenu("destroy").selectmenu();
            this.jqRS_D('#olaptlw_cb').selectmenu("enable").selectmenu("destroy").selectmenu();
            $(".ui-dialog-buttonpane button").button("enable");
        }

        disableConnectionDialog() {
            this.jqRS_D('#olaptlw_servername').prop('disabled', true);
            this.jqRS_D('#olaptlw_db').selectmenu("disable");
            this.jqRS_D('#olaptlw_cb').selectmenu("disable");
            $(".ui-dialog-buttonpane button").button("disable");
        }

        receiveDialog(dialog: any) {
            this.enableGrid();
            var dlg = this.jqRS_D();
            dlg.html(dialog.data).dialog('option', 'title', dialog.title);

            if (dialog.buttons != null)
                dlg.dialog("option", "buttons", $.map(dialog.buttons, function (item) { return { text: item.text, click: function () { eval(item.code); } }; }));

            if (dialog.resizable)
                dlg.dialog('option', 'resizable', dialog.resizable);

            dlg.dialog('option', 'minHeight', dialog.height);

            dlg.dialog('option', 'width', dialog.width > 0 ? dialog.width : 'auto');

            dlg.dialog('open');
            $('#rs_uibtn').button();

            $('#OCM_tbFormat').selectmenu();
            $('#OCM_tbMeasures').selectmenu();

            $('#ODLG_cond').selectmenu().on("selectmenuchange", function (event, ui) {
                if (ui.item.value.indexOf('Between') > 0) {
                    $('#ODLG_lbAnd').show();
                    $('#ODLG_tbSecond').show();
                } else {
                    $('#ODLG_lbAnd').hide();
                    $('#ODLG_tbSecond').hide();
                }
            });

            this.jqRS_D('.rc_tbl th').addClass("ui-widget-header");
            this.jqRS_D('.rc_tbl .rc_tbloddrow').addClass("ui-state-default");
            this.jqRS_D('.rc_tbl .rc_tblevenrow').addClass("ui-widget-content");
            this.jqRS_D('#olaptlw_servername').addClass("ui-widget-content").
                on("change", { grid: this }, function (event) {
                    event.data.grid.OLAPTlb_lock();
                    event.data.grid.callback('changesn|' + this.value, "changesn");
                    event.data.grid.disableConnectionDialog();
                });
            this.jqRS_D('#olaptlw_db').selectmenu().on("selectmenuchange", { grid: this }, function (event, ui) {
                if (event.data.grid.OLAPTlb_clearcube().value != '') {
                    event.data.grid.OLAPTlb_lock();
                    event.data.grid.callback('changedb|' + ui.item.value, "changedb");
                    event.data.grid.disableConnectionDialog();
                }
            });

            this.jqRS_D('#olaptlw_cb').selectmenu();


            //Property grid dialog
            if (dialog.json) {
                switch (dialog.target) {
                case "options":
                    this.jqRS_D('#rc_property_grid').jqPropertyGrid(dialog.json[0].values, dialog.json[0].metadata);
                    this.jqRS_D('#rc_property_grid').find('tr.grand-parent').removeClass('ui-state-default');
                    if (dialog.json[0].showButtons) {
                        this.jqRS_D('.pg-buttons').show();
                    }
                    this.jqRS_D('.pgTable').treegrid({
                        expanderExpandedClass: 'ui-icon ui-icon-triangle-1-se',
                        expanderCollapsedClass: 'ui-icon ui-icon-triangle-1-e'
                    }).treegrid('collapseAll');
                    break;
                case "custombuttons":
                case "toolboxbuttons":
                    this.jqRS_D("#rs-toolboxbuttons").accordion({
                        header: "> div > h3",
                        heightStyle: "content",
                        collapsible: true
                    }).sortable({
                        axis: "y",
                        handle: "h3",
                        stop: function (event: any, ui: any) {
                            ui.item.children("h3").triggerHandler("focusout");
                            $(this).accordion("refresh");
                        }
                    });
                    for (var button_i in dialog.json) {
                        var button_settings = dialog.json[button_i];
                        this.jqRS_D('#rc_property_grid_' + button_settings.values.ButtonID).jqPropertyGrid(button_settings.values, button_settings.metadata);
                    }
                    if (dialog.target === "custombuttons") {
                        this.jqRS_D('.pg-button-delete').unbind("click").click({ dialog: this.jqRS_D() }, function (event) {
                            $(this).closest("div.rs-tbbutton-group").remove();
                            $(event.data.dialog).find('#rs-toolboxbuttons').accordion("refresh");
                        });
                    }
                    break;
                default:
                    break;
                }
            }
        }

        receiveAllCallback(response: any) {
            this._response = response;
            if (response.filtergrid != null)
                this.jqRS_F().html(response.filtergrid);
            if (response.pivot) {
                this.jqRS_OG('#olapgrid_PIVOT').html(response.pivot);
                this.isPivoting = false;
            }
            if (response.datagrid)
                this.jqRS_OG('#olapgrid_IG').html(response.datagrid);
            if (response.treearea) {
                this.jqRS_OG('.rs_cubestructuretree_container').html(response.treearea);
            }
            if (response.modifiersarea)
                this.jqRS_OG('#olapgrid_modifiers').html(response.modifiersarea);

            if (response.toolbox != null)
                this.jqRS_OG('.rs_toolbox_buttons_container').html(response.toolbox);
            

            if (response.olapgridcontainer)
                this.jqRS_OG('.rc_olapgrid_table tr:first').html(response.olapgridcontainer);

            if (response.settings) {
                this.initialize(response.settings);
                this.moveButtonsToMenu();
                return;
            }

            this.initAfterAllCalback();
        }

        receiveCallback(response: any, context: string, callback: () => void): void;
        receiveCallback(json: string, caller: any): void {
            if (caller.context != 'heditortree')
                caller.grid.hidePopup();
            if (caller.grid._conditionFormat !== null)
                caller.grid._conditionFormat.deleteAllFormat();
            var response = JSON.parse(json);//eval('(' + json + ')');
            var data = response.data;
            if (response.exception) {
                caller.grid.enableGrid();

                if (response.errorHandler) {
                    if (caller.grid.tryShowClientMessage(response.errorHandler, response.errorClientData) == false)
                        caller.grid.receiveDialog(response.exception);
                } else
                    caller.grid.receiveDialog(response.exception);

                return;
            }
            //  if (response.target == "#ERROR#")
            //  {
            //    olapgrid_manager.enableGrid();
            //    olapgrid_callbackvaRia = null;
            //    alert(response.data);
            //    return;
            //  }

            if (caller.context === "toolbox") {
                if (response.toolbox) {
                    caller.grid.jqRS_OG('.rs_toolbox_buttons_container').html(response.toolbox);
                }
            }

            if (caller.context == 'popup') {
                caller.grid.receivePopupCallback(data);
                $(document).unbind('click').bind('click', { grid: caller.grid }, caller.grid.hidePopup);
            }
            //  if (data != '') 
            //  {
            if ((caller.context == 'heditor') || (caller.context == 'dialog')) {
                caller.grid.receiveDialog(response.dialog);
                if (caller.context == 'heditor') {
                    caller.grid.applyMenu();
                    $(document).unbind('click').bind('click', { grid: caller.grid }, function () { $('.rs_opened_submenu').fadeOut('fast'); });
                    if (caller.grid._settings.filterClientId &&
                        caller.grid.jqRS_F('#olapfilter_select').selectmenu("instance") != null) {
                        caller.grid.jqRS_F('#olapfilter_select').selectmenu("destroy");
                        caller.grid.jqRS_F('#olapfilter_select').selectmenu().on("selectmenuchange", { grid: caller.grid }, function (event: JQueryEventObject, ui: any) {
                            event.data.grid.jqRS_F('#olapfilter_editnew').css('display', (ui.item.value == '...') ? 'none' : '');
                        });
                    }
                }
            }

            if (caller.context == 'heditortree')
                caller.grid.heditor.receiveCallbackTree(data);
            //    if (context == 'pivot') olapgrid_manager.receivePivotCallback(data);
            if ((caller.context == 'datagrid') || (caller.context == 'all')) {
                //olapgrid_manager.removeFixedParts();
                caller.grid.receiveAllCallback(response);
            }
            if (caller.context == "changesn" || caller.context == "changedb") {
                caller.grid.OLAPTlb_parsecallback(response.resultString, caller.context);
                caller.grid.enableConnectionDialog();
            }
            //  }  
            //  olapgrid_manager.enableGrid();
            //  olapgrid_callbackvaRia = null;
            caller.grid.applyCheckedAndFiltered(response.treechecked, response.filtered);
            if (caller.callback) caller.callback();

            if (response.callbackScript)
                eval(response.callbackScript);


            if (response.messageHandler && response.clientMessage) {
                caller.grid.tryShowClientMessage(response.messageHandler, response.clientMessage);
            }

            setTimeout($.proxy(caller.grid.enableGrid, caller.grid), 100);
        }

        receivePopupCallback(data: string) {
            if (data == '')
                this.hidePopup();
            else {
                $('#olapgrid_rsPopup').html(data);
                this.applyMenu();

                var z = this.jqRS_OG().css("z-index");

                if (z == "auto") {
                    z = "0";
                    this.jqRS_OG().css("z-index", "0");
                }

                var popup = $('#olapgrid_rsPopup');
                popup.css({
                    'z-index': parseInt(z) + 3000,
                        'display': 'block'
                    })
                    .position({
                        of: this.eventPopup,
                        my: "left top",
                        //offset: '2 2',
                        collision: "fit"
                    });//.offset({ top: 2, left: 2 });

                this.eventPopup = null;
            }
        }

        getToolboxButtonId(): string {
            let rand: string = Math.random().toString(36);
            return rand.substr(2, 8);
        }

        addCustomButton(dialog: any, settings: any) {
            var settingsObj = JSON.parse(settings);
            var buttonId = this.getToolboxButtonId();
            settingsObj.values.ButtonID = buttonId;
            var htmlButton = "<div class=\"rs-tbbutton-group\">";
            htmlButton += "<h3>Button #" + buttonId;
            htmlButton += "<div class=\"pg-button pg-button-delete ui-state-default ui-corner-all\" style=\"float:right\" title=\"Delete button\">";
            htmlButton += "<span class=\"ui-icon ui-icon-close\"></span>";
            htmlButton += "</div>";
            htmlButton += "</h3>";
            htmlButton += "<div>";
            htmlButton += "<div id=\"rc_property_grid_" + buttonId + "\" style=\"height: 260px\"></div>";
            htmlButton += "</div>";
            htmlButton += "</div>";
            $(dialog).find('#rs-toolboxbuttons').append(htmlButton);
            let buttonSelector: string = '#rc_property_grid_' + buttonId;
            $(dialog).find(buttonSelector).jqPropertyGrid(settingsObj.values, settingsObj.metadata);
            $(dialog).find('#rs-toolboxbuttons').accordion("refresh");
            var activIndex = $(dialog).find('div.rs-tbbutton-group').length - 1;
            $(dialog).find('#rs-toolboxbuttons').accordion({ active: activIndex });
            $(dialog).find('.pg-button-delete').unbind("click").click({ dialog: dialog }, function (event) {
                $(this).closest("div.rs-tbbutton-group").remove();
                $(event.data.dialog).find('#rs-toolboxbuttons').accordion("refresh");
            });

        }

        applySettings(dialog: any, action?: string) {
            let settings: any;
            switch (action) {
            case "saveolapanalysis":
                settings = JSON.stringify($(dialog).find('#rc_property_grid').jqPropertyGrid('get'));
                this.dataCallback(action, settings, "all");
                break;
            case "saveoptions":
            case "savejpegoptions":
            case "savepdfoptions":
            case "savexlsoptions":
            case "savexlsxoptions":
            case "savecsvoptions":
            case "savehtmloptions":
                settings = JSON.stringify($(dialog).find('#rc_property_grid').jqPropertyGrid('get'));
                this.dataCallback(action, settings);
                //this.dataCallback(action, settings, "all");
                break;
            case "savecustombuttons":
            case "savetoolboxbuttons":
                settings = [];
                $(dialog).find("div[id^='rc_property_grid']").each(function () {
                    var setting = $(this).jqPropertyGrid('get');
                    settings.push(setting);
                });
                this.dataCallback(action, JSON.stringify(settings), "toolbox");
                break;
            default:
                break;
            }
        }

        showLoadlayoutDialog() {
            var dlg = this.jqRS_D_Loadlayout();
            dlg.dialog('open');
        }

        enableGrid() {
            //this.jqRS_OG().removeAttr('disabled');
            this.removeOverlays();
        }

        callbackDataGrid(arg:any) {
            this.callback(arg, 'datagrid');
            this.disableGrid();
        }
        
        callbackSettings(arg: any) {
            this.callback(arg, 'dialog');
            this.disableGrid();
        }

        callback(arg?: any, context?:string, callback?: () => void) {
            if (this.jqRS_OG().attr('disabled')) return;

            //WebForm_DoCallback(this._settings.uid, arg, this.receiveCallback, { grid: this, context: context, callback: callback },
            //    this.errorCallback, true);
        }

        dataCallback(action?: any, settings?: string, p2?: string) {
        }

        postback(arg: any) {
            //__doPostBack(this._settings.uid, arg);
        }

        hideModificationAreas() {
            this.postback("hidemodificationareas");
        }

        showModificationAreas() {
            this.postback("showmodificationareas");
        }

        showAllAreas() {
            this.postback("showallareas");
        }

        showOnlyData() {
            this.postback("showonlydata");
        }

        showPivotAreas() {
            this.postback("showpivotareas");
        }

        clearLayout() {
            this.postback("clearlayout");
        }

        exportToCsv(fileName: string) {
            var arg = "exporttocsv|" + fileName;
            this.postback(arg);
        }

        exportToJpeg(fileName: string) {
            var arg = "exporttojpg|" + fileName;
            this.postback(arg);
        }

        exportToHtml(fileName: string) {
            var arg = "exporttohtml|" + fileName;
            this.postback(arg);
        }

        exportToXlsx(fileName: string) {
            var arg = "exporttoxlsx|" + fileName;
            this.postback(arg);
        }

        exportToXls(fileName: string) {
            var arg = "exporttoxls|" + fileName;
            this.postback(arg);
        }

        exportToPdf(fileName: string) {
            var arg = "exporttopdf|" + fileName;
            this.postback(arg);
        }

        dispose() {
            // $clearHandlers(this.get_element());
            $(window).unbind('load', this.doLoad);
            this.jqRS_IG().parents().andSelf()
                .unbind('scroll', this.doScroll);
        }

        hidePopup(event?: JQueryEventObject) {
            if (event != null && $(event.target).parent().hasClass("rs_menuitem"))
                return;
            $('.rs_menubox').detach();
            $('#olapgrid_rsPopup').css('display', 'none');
            if (event) {
                $(document).unbind('click', event.data.grid.hidePopup);
                if (event.data.grid._conditionFormat !== null)
                    event.data.grid.clearGridSelection();
            } else {
                $(document).unbind('click', this.hidePopup);
                if (this._conditionFormat !== null)
                    this.clearGridSelection();
            }

        }

        createPopup2(event: JQueryEventObject) {
            var grid = event.data.grid;
            grid.hidePopup();
            var uid = $(event.target).findAttr('uid');
            if (!uid) return;

            if (event.preventDefault)
                event.preventDefault();
            event.returnValue = false;

            grid.eventPopup = event;

            grid.disableGrid();
            $(".olapgrid_lable").empty();
            $(".olapgrid_lable").append(grid._settings.popupLoading);

            $(document).bind('click', { grid: event.data.grid }, event.data.grid.hidePopup);

            event.data.grid.callback('createpopup2|' + uid, 'popup');
        }

        createPopup(event: JQueryEventObject) {
            var grid = event.data != null ? event.data.grid : this;
            grid.hidePopup();
            var cellid = $(event.target).findAttr('cellid');
            if (!cellid) return;

            if (event.preventDefault)
                event.preventDefault();
            event.returnValue = false;

            grid.eventPopup = event;

            grid.disableGrid();
            $(".olapgrid_lable").empty();
            $(".olapgrid_lable").append(grid._settings.popupLoading);

            grid.callback('createpopup|' + cellid, 'popup');
        }

        pivoting(uid: any, area: any, areaindex: any, from?: any, toGroup?: boolean) {

            if (!uid || !area)
                return;

            var pivotAction = toGroup ?
                'pivotingtogroup|' + uid + '|' + areaindex + '|' + area :
                'pivoting|' + uid + '|' + area + '|' + areaindex;

            this.isPivoting = true;
            if (from)
                this.callback(pivotAction + '|' + from, 'all');
            else
                this.callback(pivotAction, 'all');

            this.disableGrid();
        }

        items(selector: any) {
            //return $(this.get_element()).find(selector);
            return this.jqRS_OG(selector);

        }

        applyCalculated(conditions: string) {
            var displayName = '|';
            var srcdisplayName = $('#OCM_tbDisplayName');
            if (srcdisplayName.length) displayName = srcdisplayName.val() + '|';

            var format = '|';
            var srcFormat = $('#OCM_tbFormat');
            if (srcFormat.length) format = srcFormat.val() + '|';

            var expression = '';
            var srcExpression = $('#OCM_tbExpression');
            if (srcExpression.length) expression = srcExpression.val();

            if (conditions.substr(0, 16) == 'applycalcmember|')
                this.callbackDataGrid(conditions + '|' + displayName + format + expression);
            else
                this.callbackAll(conditions + '|' + displayName + format + expression);
            this.disableGrid();
            this.hidePopup();
            this.jqRS_D().dialog('close');
        }

        insertMeasure() {
            var srcExpression = $('#OCM_tbExpression');
            var srcMeasures = $('#OCM_tbMeasures option:selected').val();

            srcExpression.val(srcExpression.val() + srcMeasures + ' ');
        }

        filterDialog(uid: string) {
            if (uid.substr(0, 2) == 'm:') {
                this.showDialog('showmfiltersettings|' + uid.substr(2));
            } else {
                this.hidePopup();
                if (!this.heditor)
                    this.createHierarchyEditor(uid.substr(2));
            }
        }

        protected getArea(item: any): string {
            var l = this.getLayout();

            if (item == l.ColorAxisItem) return "colors";
            //        if (l.ColumnArea[item]) return null; //"col";
            //        if (l.ColumnLevels && l.ColumnLevels[item]) return "col";
            //        //if (l.DetailsArea[item]) return "details";
            //        if (l.PageArea[item]) return "page";
            //        if (l.RowArea[item]) return "row";
            //        if (l.RowLevels && l.RowLevels[item]) return "row";
            //        if (l.ShapeAxisItem == item) return "shape";
            if (l.ForeColorAxisItem == item) return "colorfore";
            //        if (l.YAxisMeasures) return  "row";
            if (l.XAxisMeasure == item) return "col";

            var ms = this._measures != null ? this._measures[item] : null;
            if (ms && ms.IsVisible)
                return "row";

            return null;
        }

        resizeIG() {
            var toolbox = this.jqRS_OG('.rs_toolbox');
            var filtergrid = this.jqRS_F();

            var g = this.jqRS_OG();
            var gContainer = this.jqRS_OG('.rc_olapgrid_container');
            var ig = this.jqRS_IG();

            var tree = this.jqRS_OG('#olapgrid_tdtree');
            let _minTreeHeight = 100;
            let _minLegendHeight = 100;
           var pivot = this.jqRS_OG('#olapgrid_PIVOT');

            var modifiers = this.jqRS_OG('#olapgrid_modifiers');
            var legends = this.jqRS_OG('#olapgrid_legends');
            var legendsHeader = legends.find('div.rc_pivotheader');
            var legendsContainer = this.jqRS_OG('#all_legends');

            var leftAreaContainer = this.jqRS_OG('.rc_leftarea_container');
            var rightAreaContainer = this.jqRS_OG('.rc_rightarea_container');
            var leftArea = this.jqRS_OG('.rc_leftarea');
            var rightArea = this.jqRS_OG('.rc_rightarea');

            var igWidth = this.jqRS_OG().width();
            if (leftArea.length)
                igWidth -= leftAreaContainer.outerWidth();
            if (rightArea.length)
                igWidth -= rightAreaContainer.outerWidth();

            ig.outerWidth(igWidth);


            var gcHeight = g.height();
            if (toolbox.length) {
                var tbButtonH = toolbox.outerHeight(true);
                gcHeight -= tbButtonH;
            }
            if (filtergrid.length && !filtergrid.is(':hidden'))
                gcHeight -= filtergrid.outerHeight();

            gContainer.height(gcHeight);

            leftAreaContainer.height(gContainer.height());
            rightAreaContainer.height(gContainer.height());
            ig.height(gContainer.height());

            var thHeader = this.jqRS_OG('#olapgrid_tdtree_header').outerHeight();

            if (tree.length && pivot.length) {
                if (pivot.height() !== 0) {
                    var psh = pivot[0].scrollHeight;
                    var delta = leftArea.outerHeight() - psh - thHeader;
                    if (delta <= _minTreeHeight) {
                        pivot.height(leftArea.outerHeight() - _minTreeHeight - thHeader);
                    } else {
                        pivot.height('');
                    }
                }
                tree.height(leftArea.outerHeight() - pivot.height() - thHeader);
            }
            else if (pivot.length)
                pivot.height(leftArea.outerHeight());
            else
                tree.height(leftArea.outerHeight() - thHeader);


            if (legends.length) {
                let legH: number;
                if (modifiers.length > 0)
                {
                    legH = leftArea.outerHeight() - modifiers.outerHeight() - legendsHeader.outerHeight();
                    if (legH < _minLegendHeight) {
                        legH = _minLegendHeight;
                        modifiers.height(leftArea.outerHeight() - legH - legendsHeader.outerHeight());
                   }
                }
                else
                    legH = leftArea.outerHeight() - legendsHeader.outerHeight();

                legendsContainer.height(legH);

                legendsContainer.width(rightAreaContainer.width());
            }
        }

        doDrop(event: JQueryEventObject) {
            var tgt = $(event.target).parents().andSelf().filter('.rs_droptarget2');
            if (!tgt.length) tgt = $(event.target).data('src_obj');
            var area = tgt.findAttr('area');
            var idx = tgt.findAttr('areaindex');
            if (idx == undefined) idx = '999';
            var uid = $(event.data.src).findAttr('uid');
            var from = $(event.data.src).findAttr('area');
            if (area === 'tree' && from === 'tree') {
                event.data.grid.isPivoting = false;
                return;
            }
            event.data.grid.pivoting(uid, area, idx, from, tgt.hasClass("rs_pivotarea_measure"));
            setTimeout($.proxy(event.data.grid.disableGrid, event.data.grid), 150);

        }

        doEndDrag(event: JQueryEventObject) {
            event.data.grid.items('.rs_droptarget').unbind('mouseup', event.data.grid.doDrop);
            $('#OLAPGrid_draghelper').css('display', 'none');
            $(document).unbind('mouseup mouseleave', event.data.grid.doEndDrag).unbind('mousemove', event.data.grid.doDrag);
            if (event.data.grid.isPivoting === false)
                event.data.grid.removeOverlays();
        }

        doDrag(event: JQueryEventObject) {
            $('#OLAPGrid_draghelper')
                .css({
                    'z-index': parseInt(event.data.grid.jqRS_OG().css("z-index")) + 10000,
                    'display': 'block'
                })
                .position({
                    of: event,
                    my: 'left top'
                });//.offset({ top: 1, left: 1 });
        }

        doDragOver(event: JQueryEventObject) {
            event.preventDefault ? event.preventDefault() : event.returnValue = false;
        }

        doStartDrag(event: JQueryEventObject) {
            if (event.which != 1) return;
            if (event.target.tagName == 'INPUT') return;
            if ($(event.target).css('cursor') == 'pointer') return;
            $('#OLAPGrid_draghelper').css('opacity', '0.8').html($(event.target).parents('[drag]').andSelf().filter(
                '[drag]').html()).find('.rc_pivotpanel').css({ 'filter': '', 'background': '', 'border-width': '0px' });
            $('#OLAPGrid_draghelper table, #OLAPGrid_draghelper td').removeAttr('width');
            event.data.grid.doDrag(event);
            $(document).mousemove({ grid: event.data.grid }, event.data.grid.doDrag);
            $(document).bind('mouseup mouseleave', { grid: event.data.grid }, event.data.grid.doEndDrag);

            event.data.grid.items('.rs_droptarget').mouseup({ grid: event.data.grid, src: event.target }, event.data.grid.doDrop);

            event.data.grid.items('.rs_droptarget2').each($.proxy(function (i, item) {
                this.data.grid.addOverlay($(item), false).mouseup({ grid: this.data.grid, src: this.target }, this.data.grid.doDrop);
            }, event));

            //mouseup({ grid: event.data.grid, src: event.target }, event.data.grid.doDrop)

            event.preventDefault ? event.preventDefault() : event.returnValue = false;

            document.body.focus();

            // prevent text selection in IE
            document.onselectstart = function () { return false; };
            // prevent IE from trying to drag an image
            //event.target.ondragstart = function () { return false; };

            // prevent text selection (except IE)
            return false;
        }

        doDrop2(event: JQueryEventObject, ui: any) {
            var tgt = $(event.target).parents().andSelf().filter('.rs_droptarget2');
            if (!tgt.length) tgt = $(event.target).data('src_obj');
            var area = tgt.findAttr('area');
            var idx = tgt.findAttr('areaindex');
            if (idx == undefined) idx = '999';
            var uid = $(ui.draggable).attr('uid');
            var from = $(ui.draggable).findAttr('area');
            if (area === 'tree' && from === 'tree')
                return;
            event.data.grid.pivoting(uid, area, idx, from, tgt.hasClass("rs_pivotarea_measure"));
            setTimeout($.proxy(event.data.grid.disableGrid, event.data.grid), 150);
        }

        doEndDrag2(event: JQueryEventObject) {
            if (event.data.grid.isPivoting === false)
                event.data.grid.removeOverlays();
        }

        doStartDrag2(event: JQueryEventObject, ui: any) {

            //$(ui.helper).width(0);

            event.data.grid.items('.rs_droptarget2').each($.proxy(function (i, item) {
                var overlay = this.data.grid.addOverlay($(item), false);

                $(overlay).droppable();

                $(overlay).on("drop", { grid: this.data.grid }, this.data.grid.doDrop2);

            }, event));
        }

        finishPreviewConditionFormat() {
            this._conditionFormat.finishPreviewFormat(this._SelectingCells);
        }

        applyConditionFormat(conditionFormat: cFormat, koef: number) {
            this._conditionFormat.applyFormat(this._SelectingCells, conditionFormat, koef);
        }

        previewConditionFormat(conditionFormat: any, koef: number) {
            this._conditionFormat.doFormat(this._SelectingCells, conditionFormat, koef, true);
        }

        clearGridSelection() {
            $('#olapgrid_menu').off('mouseenter').off('mouseleave');
            this._conditionFormat.lightOffFormatedArea(this._SelectingCells);
            for (var cellid in this._SelectingCells) {
                if (!this._conditionFormat.isCellFormated(cellid))
                    this._conditionFormat.unbindFormatMenu(this._SelectingCells);
            }
            this._SelectingCells = [];
            this.jqRS_IG('.ui-selected').removeClass('ui-selected');

            this._conditionFormat.refreshAllFormat();
            this._conditionFormat.unbindAllFormatMenu();
            this._conditionFormat.bindAllFormatMenu();
        }

        convertStrCondFormatToEnum(condFormatStr: string): cFormat {
            switch (condFormatStr) {
                case "belowthan":
                    return cFormat.cfBelowThan;
                case "morethan":
                    return cFormat.cfMoreThan;
                case "belowaverage":
                    return cFormat.cfBelowAverage;
                case "moreaverage":
                    return cFormat.cfMoreAverage;
                case "nearaverage":
                    return cFormat.cfNearAvarage;
                case "faraverage":
                    return cFormat.cfFarAverage;
                default:
                    return cFormat.none;
            }
        }

        applySelectMenu() {
            $('.rs_menu span.rs_cf_menu').css({ 'padding': '3px 5px' });

            $('#olapgrid_menu')
                .on("mouseenter", { grid: this }, function (event) {
                    event.data.grid._conditionFormat.lightOnFormatedArea(event.data.grid._SelectingCells);

                    if (event.data.grid.popupTimerId) {
                        clearTimeout(event.data.grid.popupTimerId);
                        event.data.grid.popupTimerId = null;
                    }
                })
                .on("mouseleave", { grid: this }, function (event) {
                    event.data.grid._conditionFormat.lightOffFormatedArea(event.data.grid._SelectingCells);
                    event.data.grid.closePopup();
                });

            $('.rs_menubox[embedded!=true]').addClass('rc_shadow');
            $('span.rs_cf_menu')
                .on("mouseenter", { grid: this }, function (event) {
                    var koef = parseFloat($(this).attr('value'));
                    if (!koef)
                        return;

                    var condFormatStr = $(this).attr('cf');
                    var condFormat = event.data.grid.convertStrCondFormatToEnum(condFormatStr);

                    event.data.grid._conditionFormat.lightOffFormatedArea(event.data.grid._SelectingCells);
                    event.data.grid._conditionFormat.startPreviewFormat();
                    event.data.grid.previewConditionFormat(condFormat, koef);

                })
                .on("mouseout", { grid: this }, function (event) {
                    event.data.grid._conditionFormat.lightOnFormatedArea(event.data.grid._SelectingCells);
                    event.data.grid.finishPreviewConditionFormat();
                })
                .on("click", { grid: this }, function (event) {
                    var condFormatStr = $(this).attr('cf');
                    var condFormat = event.data.grid.convertStrCondFormatToEnum(condFormatStr);
                    var koef = parseFloat($(this).attr('value'));
                    event.data.grid.applyConditionFormat(condFormat, koef);
                    event.data.grid.finishPreviewConditionFormat();
                });

            $('.rs_menu').menu();
            $('.rs_menu #rs_stat').parent('li').css('list-style-image', 'none');
            //$(document).unbind("click").bind('click', { grid: this }, function (event) { event.data.grid.hidePopup(event); });
        }

        fillSelectionPopupContent() {
            var res = "";

            var menu =
                "<div class='rs_menubox' id='olapgrid_menu'>" +
                    "<ul class='rs_menu rs_cf_menu'>" +
                    "<li>" +
                    //"<li class='ui-state-disabled'>" +
                    "<table id='rs_stat' width='100%' border='0'><tr><td>" +
                    this._settings.rsAverage +
                    ":</td><td class='rs_avg'></td></tr><tr><td>" +
                    this._settings.rsCount +
                    ":</td><td class='rs_count'></td></tr><tr><td>" +
                    this._settings.rsSumma +
                    ":</td><td class='rs_sum'></td></tr></table>" +
                    "</li>" +
                    "<li></li>" +
                    "<li><div>" +
                    "<span class='ui-icon rs_cf_below_than rs_cf_menu_icon'>&nbsp;</span>" +
                    "<span class='rs_cf_menu'>" +
                    this._settings.rsBelowThan +
                    "</span></div>" +
                    "<ul class='rc_shadow'>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowthan' value='0.1'>10%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowthan' value='0.2'>20%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowthan' value='0.3'>30%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowthan' value='0.4'>40%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowthan' value='0.5'>50%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowthan' value='0.6'>60%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowthan' value='0.7'>70%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowthan' value='0.8'>80%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowthan' value='0.9'>90%</span></div></li>" +
                    "</ul>" +
                    "</li>" +
                    "<li><div>" +
                    "<span class='ui-icon rs_cf_more_than rs_cf_menu_icon'>&nbsp;</span>" +
                    "<span class='rs_cf_menu'>" +
                    this._settings.rsMoreThan +
                    "</span></div>" +
                    "<ul class='rc_shadow'>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='morethan' value='0.1'>10%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='morethan' value='0.2'>20%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='morethan' value='0.3'>30%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='morethan' value='0.4'>40%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='morethan' value='0.5'>50%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='morethan' value='0.6'>60%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='morethan' value='0.7'>70%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='morethan' value='0.8'>80%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='morethan' value='0.9'>90%</span></div></li>" +
                    "</ul>" +
                    "</li>" +
                    "<li><div>" +
                    "<span class='ui-icon rs_cf_below_average rs_cf_menu_icon'>&nbsp;</span>" +
                    "<span class='rs_cf_menu'>" +
                    this._settings.rsBelowAverage +
                    "</span></div>" +
                    "<ul class='rc_shadow'>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowaverage' value='0.1'>10%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowaverage' value='0.2'>20%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowaverage' value='0.3'>30%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowaverage' value='0.4'>40%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowaverage' value='0.5'>50%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowaverage' value='0.6'>60%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowaverage' value='0.7'>70%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowaverage' value='0.8'>80%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='belowaverage' value='0.9'>90%</span></div></li>" +
                    "</ul>" +
                    "</li>" +
                    "<li><div>" +
                    "<span class='ui-icon rs_cf_more_average rs_cf_menu_icon'>&nbsp;</span>" +
                    "<span class='rs_cf_menu'>" +
                    this._settings.rsMoreAverage +
                    "</span></div>" +
                    "<ul class='rc_shadow'>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='moreaverage' value='0.1'>10%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='moreaverage' value='0.2'>20%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='moreaverage' value='0.3'>30%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='moreaverage' value='0.4'>40%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='moreaverage' value='0.5'>50%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='moreaverage' value='0.6'>60%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='moreaverage' value='0.7'>70%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='moreaverage' value='0.8'>80%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='moreaverage' value='0.9'>90%</span></div></li>" +
                    "</ul>" +
                    "</li>" +
                    "<li><div>" +
                    "<span class='ui-icon rs_cf_near_average rs_cf_menu_icon'>&nbsp;</span>" +
                    "<span class='rs_cf_menu'>" +
                    this._settings.rsNearAverage +
                    "</span></div>" +
                    "<ul class='rc_shadow'>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='nearaverage' value='0.1'>10%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='nearaverage' value='0.2'>20%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='nearaverage' value='0.3'>30%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='nearaverage' value='0.4'>40%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='nearaverage' value='0.5'>50%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='nearaverage' value='0.6'>60%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='nearaverage' value='0.7'>70%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='nearaverage' value='0.8'>80%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='nearaverage' value='0.9'>90%</span></div></li>" +
                    "</ul>" +
                    "</li>" +
                    "<li><div>" +
                    "<span class='ui-icon rs_cf_far_average rs_cf_menu_icon'>&nbsp;</span>" +
                    "<span class='rs_cf_menu'>" +
                    this._settings.rsFarAverage +
                    "</span></div>" +
                    "<ul class='rc_shadow'>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='faraverage' value='0.1'>10%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='faraverage' value='0.2'>20%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='faraverage' value='0.3'>30%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='faraverage' value='0.4'>40%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='faraverage' value='0.5'>50%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='faraverage' value='0.6'>60%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='faraverage' value='0.7'>70%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='faraverage' value='0.8'>80%</span></div></li>" +
                    "<li><div><span class='ui-icon ui-icon-check'></span><span class='rs_cf_menu' cf='faraverage' value='0.9'>90%</span></div></li>" +
                    "</ul>" +
                    "</li>" +
                    "<li></li>" +
                    "<li class='rs_cf_menu_delete_li ui-state-disabled'><div><span class='ui-icon ui-icon-trash'></span><span>" + this._settings.rsRemove + "</span></div></li>" +
                    "</ul>" +
                    "</div>";
            res = menu;
            $('#olapgrid_rsPopup').html(res);
        }

        closePopupInner() {
            var popup = $('#olapgrid_rsPopup');
            popup.hide("fade", "slow");
            this.popupTimerId = null;
        }

        closePopup() {
            if (this.popupTimerId)
                clearTimeout(this.popupTimerId);

            this.popupTimerId = setTimeout(this.closePopupInner, 1000);
        }

        popupTimerId: NodeJS.Timer = null;

        movePopup(cell: any) {
            var popup = $('#olapgrid_rsPopup');
            popup.position({
                my: "left top",
                at: "right bottom",
                of: $(cell)
            });
        }

        openPopup(cells?: any[]) {
            if (cells)
                this._conditionFormat.lightOnFormatedArea(cells);

            var z = this.jqRS_OG().css("z-index");
            if (z == "auto") {
                z = "0";
                this.jqRS_OG().css("z-index", "0");
            }

            var popup = $('#olapgrid_rsPopup');
            popup.css({
                'z-index': parseInt(z) + 3000,
                'display': 'block'
            });
        }

        showSelectingCellMenu(cell: any[]) {
            var cellID = $(cell).attr("cellid");
            if (cellID in this._SelectingCells)
                return;

            this._SelectingCells[cellID] = cell;

            this.openPopup();
            this.fillSelectionPopupContent();
            this._conditionFormat.makeStatistic(this._SelectingCells);
            this.applySelectMenu();

            $(cell).on("mouseenter", { grid: this }, function (event) {
                event.data.grid.movePopup(this, event);
            }).on("mousemove", { grid: this }, function (event) {
                event.data.grid.openPopup();
            });
        }

        _SelectingCells: any[] = [];

        applyPivot() {
            var settings = this._settings;
            if (settings.exception) {
                this.enableGrid();
                this.receiveDialog(settings.exception);
                return;
            }

            this.structureLayout();
            this.initModifications();
            this.initLegend();

            var tv = this.items('.rs_treeview');
            tv.unbind('contextmenu').bind('contextmenu', { grid: this }, this.createPopup2);

            var panels = this.items('#pivot_filterarea, #pivot_columnarea, #pivot_rowarea, #pivot_valuearea').
                unbind('contextmenu').bind('contextmenu', { grid: this }, this.createPopup2);

            if (!tv.hasClass('treeview')) {
                tv = tv.treeview({ grid: this }).bind('selectstart', false).addClass('rs_unselectable');
                var chk = tv.find('li[checked]');
                $(document.createElement('input')).attr({ 'type': 'checkbox' }).insertBefore(chk.children('span'));
                tv.find('li[checked=True] input').prop('checked', true);
                chk.find('input').css('cursor', 'pointer').unbind("click").click({ grid: this }, function (event) {
                    var uid = $(event.target).findAttr('uid');
                    var area = (<HTMLInputElement>event.target).checked ? "grid" : event.data.grid.getArea(uid);

                    if ((<HTMLInputElement>event.target).checked)
                        event.data.grid.pivoting(uid, area, 999, 'tree');
                    else
                        event.data.grid.pivoting(uid, 'tree', 999, area);
                });
            }

            if (this.isMobile()) {
                this.items('[drag]').draggable({ helper: 'clone' });

                this.items('[drag]').on("dragstart", { grid: this }, this.doStartDrag2);

                this.items('[drag]').on("dragstop", { grid: this }, this.doEndDrag2);
            } else {
                this.items('[drag]').unbind('mousedown selectstart').bind('mousedown', { grid: this }, this.doStartDrag).bind('selectstart', false);
            }


            this.applyCheckedAndFiltered(null, settings.filtered);
            this.jqRS_OG('.rs_img_filter').css("cursor", "pointer").unbind('click').click({ grid: this }, function (event) {
                var q = $(this);
                var uid = q.findAttr('uid');
                var m = q.findAttr('measure');
                if (m == 'true') {
                    event.data.grid.showDialog("showmfiltersettings|" + uid);
                } else {
                    event.data.grid.createHierarchyEditor(uid as string);
                }
            });

            if (this._settings.filterClientId) {
                this.jqRS_F('.rs_img_filter').css("cursor", "pointer").unbind('click').click({ grid: this }, function (event) {
                    var q = $(this);
                    var uid = q.findAttr('uid');
                    var m = q.findAttr('measure');
                    if (m == 'true') {
                        event.data.grid.showDialog("showmfiltersettings|" + uid);
                    } else {
                        event.data.grid.createHierarchyEditor(uid as string);
                    }
                });
            }

            $('.rs_icon_cover').hover(function () {
                $(this).removeClass("ui-state-default");
                $(this).addClass("ui-state-hover");
            }, function () {
                $(this).removeClass("ui-state-hover");
                $(this).addClass("ui-state-default");
            });


            $('.rs_img_del').css('cursor', 'pointer').unbind('click').click({ grid: this },
                function (event) {
                    event.data.grid.pivoting(
                        $(event.target).findAttr('uid'), 'tree', 999, $(event.target).findAttr('area'));
                });

            $('.rs_img_del2').css('cursor', 'pointer').unbind('click').click({ grid: this }, function (event) {
                event.data.grid.callbackAll('resetfilter|' + $(event.target).findAttr('uid'));
            });

            if (this._settings.filterClientId) {
                if (this.jqRS_F('#olapfilter_select').selectmenu("instance") == null) {
                    this.jqRS_F('#olapfilter_select').selectmenu().off("selectmenuchange").on("selectmenuchange", { grid: this }, function (event, ui) {
                        event.data.grid.jqRS_F('#olapfilter_editnew_cover').css('display', (ui.item.value == '...') ? 'none' : '');
                    });
                }

                this.jqRS_F('#olapfilter_editnew').unbind('click').click({ grid: this }, function (event) {
                    var uid = event.data.grid.jqRS_F('#olapfilter_select').val();
                    if (uid.substr(0, 2) == 'm:') {
                        event.data.grid.showDialog('showmfiltersettings|' + uid.substr(2));
                    } else {
                        if (!event.data.grid.heditor)
                            event.data.grid.createHierarchyEditor(uid.substr(2));
                    }
                });
            }

            $('#rsmdxbutton_ok, #rsmdxbutton_cancel').button();
            $('#rsloadlayoutbutton_ok, #rsloadlayoutbutton_cancel').button();
            $('#rsconnectionbutton_ok, #rsconnectionbutton_cancel').button();
            this.jqRS_IG('table').selectable({
                filter: ".rc_datacell",
                cancel: "td.rc_levelcell, td.rc_membercell"
            });

            if (this._conditionFormat !== null) {
                this.jqRS_IG('table').on("selectablestart", { grid: this }, function (event, ui) {
                    if (event.data.grid._conditionFormat === null)
                        event.data.grid.hidePopup();
                    event.data.grid._SelectingCells = [];
                    event.data.grid._conditionFormat.startPreviewFormat();
                });

                this.jqRS_IG('table').on("selectableselecting", { grid: this }, function (event, ui) {
                    var cell = ui.selecting;
                    if (cell) {
                        var selectedCells = event.data.grid.jqRS_IG('.ui-selected');
                        if (selectedCells.length === 1) {
                            event.data.grid.clearGridSelection();
                            return;
                        }
                        event.data.grid.showSelectingCellMenu(cell);
                    }
                });
                this.jqRS_IG('table').on("selectablestop", { grid: this }, function (event, ui) {
                    var selectedCells = event.data.grid.jqRS_IG('.ui-selected');
                    if (selectedCells.length === 1) {
                        event.data.grid.hidePopup(event);
                        event.data.grid.finishPreviewConditionFormat();
                    }
                });
                this.jqRS_IG('table').on("selectableunselecting", { grid: this }, function (event, ui) {
                    var cell = ui.unselecting;
                    if (cell) {
                        var cellID = $(cell).attr("cellid");
                        if (cellID in event.data.grid._SelectingCells)
                            delete event.data.grid._SelectingCells[cellID];
                        else
                            return;

                        event.data.grid.fillSelectionPopupContent();
                        event.data.grid._conditionFormat.makeStatistic(event.data.grid._SelectingCells);
                        event.data.grid.applySelectMenu();

                        $(cell).off("mouseenter").off("mousemove");
                    }
                });
            }

            setTimeout(this.resizeIG(), 1000, this);
        }

        applyCheckedAndFiltered(checked: boolean, filtered: any) {
            if (filtered) {
                $('.rs_img_filter').each(function () {
                    var o = $(this);
                    var uid = o.findAttr('uid');
                    var flt = $.inArray(uid, filtered) >= 0;
                    o.attr('filtered', flt.toString());
                    //o.attr({ 'src': flt ? settings.url_filterover : settings.url_filter });
                });
            }
            if (checked) {
                this.items('.rs_treeview input').prop('checked', false);
                var tv = this.items('.rs_treeview');
                $.each(checked, function () {
                    tv.find('[uid="' + this + '"] input').prop('checked', true);
                });
            }
        }

        showDialog(args: any) {
            this.callback(args, 'dialog');
            this.disableGrid();
            this.hidePopup();
        }

        callbackAll(params: any) {
            this.callback(params, 'all');
            this.disableGrid();
        }

        setMeasuresPosition(isFirst: string) {
            this.callback('measposition|' + isFirst, "all");
            this.disableGrid();
        }

        setMeasuresArea(isColumn: string) {
            this.callback('measlayout|' + isColumn, "all");
            this.disableGrid();
        }

        writeback(cell: any, prompt_: any, defname: any) {
            this.prompt(prompt_, defname, { grid: this, cell: cell }, function (data: any, s: any) {
                if ((s != defname) && (s != null)) {
                    data.grid.callbackDataGrid('writeback|' + data.cell + '|' + s);
                    data.grid.disableGrid();
                }
            });
        }

        renameGroup(cell: any, prompt_: any, defname:any) {
            this.prompt(prompt_, defname, { grid: this, cell: cell }, function (data: any, s: any) {
                if ((s != defname) && (s != null)) {
                    data.grid.callbackDataGrid('renamegroup|' + data.cell + '|' + s);
                    data.grid.disableGrid();
                }
            });
        }

        customThreshold(title: string, prompt_: any, action: any, row: any, column: any) {
            this.prompt(title, prompt_, { grid: this }, function (data: any, s: any) {
                if ((prompt_ != s) && (s != null)) {
                    data.grid.executeMenuAction(action + '|' + s + '|' + column + '|' + row);
                }
            });
        }

        createGroup(cell: any, prompt_: any, defname: any) {
            this.prompt(prompt_, defname, { grid: this, cell: cell }, function (data: any, s: any) {
                if ((s != defname) && (s != null)) {
                    data.grid.callbackDataGrid('creategroup|' + data.cell + '|' + s);
                    data.grid.disableGrid();
                }
            });
        }

        modifyComment(cell: any, prompt_: any, defname: any) {
            this.prompt(prompt_, defname, { grid: this, cell: cell }, function (data: any, s: any) {
                if ((s != defname) && (s != null)) {
                    data.grid.callbackDataGrid('modifycomment|' + data.cell + '|' + s);
                    data.grid.disableGrid();
                }
            });
        }

        doLoad(event: any) {
            event.data.grid.applyPivot();
            event.data.grid.applyInternalGrid();
        }

        applyMenu() {
            $('.rs_menu').menu();
            $('.rs_menubox[embedded!=true]').addClass('rc_shadow');
            $('.rs_menubox li[separator!=true]').unbind("click").click(function (event) {
                var link = $(this).find('a').attr('href');
                if (link) {
                    link = link.replace('javascript:', '');
                    link = "(function()" + link + "())";
                    eval(link);
                    event.preventDefault();
                    return false;
                }
            });
            $('.rs_menuitem span').css({ 'margin-right': '25px', 'cursor': 'default' });
        }

        removeOverlays() {
            $('.rs_overlay').each(function (i, item) {
                $(item).stop();
            }).remove();

            if (this.jqRS_D_Wait().dialog("isOpen")) {
                this.jqRS_D_Wait().dialog("close");
              //try {
              //      this.jqRS_D_Wait().dialog("close");
              //  }
              //  catch (e) {
              //  }
            }
        }

        addOverlay(obj: any, isAjax: boolean) {
            var ofs = obj.offset();
            var settings = this._settings;
            var ol = $("<DIV></DIV>");

            if (isAjax) {
                $(".olapgrid_lable").empty();
                $(".olapgrid_lable").append(this._settings.processing);
                $(".olapgrid_progressbar").progressbar({ value: false });
                this.jqRS_D_Wait().dialog('open');

            } else {
                ol.css({
                    position: "absolute",
                    left: ofs.left,
                    top: ofs.top,
                    width: obj.width(),
                    height: obj.height(),
                    "z-index": 10000,
                    opacity: 0.4,
                    cursor: "move",
                    "border": "3px solid #0967c4"
                });
            }
            ol.addClass("rs_overlay").data("src_obj", obj);
            $("body").append(ol);

            if (!isAjax) {
                var f1 = function () {
                    var o = $(this);
                    var f2 = o.data('anim2');
                    o.animate({ opacity: 0.2 }, 700, null, f2);
                };
                var f2 = function () {
                    var o = $(this);
                    var f1 = o.data('anim1');
                    o.animate({ opacity: 0.4 }, 700, null, f1);
                };
                ol.data({ anim1: f1, anim2: f2 });
                $.proxy(f1, ol)();
            }

            return ol;
        }

        doGridResizing(isSizeIncreased: boolean, size: any) {
            var _minSideSize = 150;
            var grid = this.jqRS_IG();
            var leftAreaContainer = this.jqRS_OG('.rc_leftarea_container');
            var rightAreaContainer = this.jqRS_OG('.rc_rightarea_container');

            var leftPanelWidth = 0;
            if (leftAreaContainer.length)
                leftPanelWidth = leftAreaContainer.width();

            var rightPanelWidth = 0;
            if (rightAreaContainer.length)
                rightPanelWidth = rightAreaContainer.width();


            if (this._leftResizingStarted) {
                var leftPanelCollapsed = false;
                var leftAreaHider = this.jqRS_OG('.rc_olapgrid_table').find('div.ui-resizable-w').children('span');
                var delta = this.jqRS_OG().width() - size.width - rightPanelWidth;
                if (size.width < _minSideSize) {
                    grid.width(_minSideSize);
                    if (leftAreaContainer.length)
                        leftAreaContainer.width(this.jqRS_OG().width() - _minSideSize - rightPanelWidth);
                } else if (delta < _minSideSize) {
                    if (isSizeIncreased) {
                        leftAreaHider.removeClass("ui-icon-circle-arrow-w");
                        leftAreaHider.addClass("ui-icon-circle-arrow-e");
                        this._leftAreaWidth = _minSideSize;
                        leftAreaContainer.width(0);
                        leftAreaContainer.hide();
                        grid.width(this.jqRS_OG().width() - rightPanelWidth);
                        leftPanelCollapsed = true;
                    } else {
                        grid.width(this.jqRS_OG().width() - _minSideSize - rightPanelWidth);
                        leftAreaContainer.width(_minSideSize);
                    }
                } else {
                    grid.width(size.width);
                    leftAreaContainer.width(delta);
                }

                if (leftAreaHider.hasClass("ui-icon-circle-arrow-e") && !leftPanelCollapsed) {
                    leftAreaHider.removeClass("ui-icon-circle-arrow-e");
                    leftAreaHider.addClass("ui-icon-circle-arrow-w");
                    leftAreaContainer.show();
                }

            }

            if (this._rightResizingStarted) {
                var rightPanelCollapsed = false;
                var rightAreaHider = this.jqRS_OG('.rc_olapgrid_table').find('div.ui-resizable-e').children('span');
                var delta = this.jqRS_OG().width() - size.width - leftPanelWidth;
                if (size.width < _minSideSize) {
                    grid.width(_minSideSize);
                    var delta2 = this.jqRS_OG().width() - _minSideSize - leftPanelWidth;
                    if (rightAreaContainer.length)
                        rightAreaContainer.width(delta2);
                } else if (delta < _minSideSize) {
                    if (isSizeIncreased) {
                        rightAreaHider.removeClass("ui-icon-circle-arrow-e");
                        rightAreaHider.addClass("ui-icon-circle-arrow-w");
                        this._rightAreaWidth = _minSideSize;
                        rightAreaContainer.width(0);
                        rightAreaContainer.hide();
                        grid.width(this.jqRS_OG().width() - leftPanelWidth);
                        rightPanelCollapsed = true;
                    } else {
                        grid.width(this.jqRS_OG().width() - leftPanelWidth);
                        if (rightAreaContainer.length)
                            rightAreaContainer.width(_minSideSize);
                    }
                } else {
                    grid.width(size.width);
                    if (rightAreaContainer.length)
                        rightAreaContainer.width(delta);
                }


                if (rightAreaHider.hasClass("ui-icon-circle-arrow-w") && !rightPanelCollapsed) {
                    rightAreaHider.removeClass("ui-icon-circle-arrow-w");
                    rightAreaHider.addClass("ui-icon-circle-arrow-e");
                    rightAreaContainer.show();
                }

            }

            this.resizeIG();
        }

        initAreasResizing() {
            var timerId: NodeJS.Timer;
            var resizehandles = "e, w";
            var gridArea = this.jqRS_OG('.rc_gridarea');
            var leftArea = this.jqRS_OG('.rc_leftarea');
            var rightArea = this.jqRS_OG('.rc_rightarea');
            if (leftArea.length === 0 && rightArea.length === 0)
                return;

            if (leftArea.length === 0)
                resizehandles = "e";

            if (rightArea.length === 0)
                resizehandles = "w";

            if (gridArea.length !== 0) {
                gridArea.resizable({
                        handles: resizehandles,
                        helper: "rc_content_resizer"
                    })
                    .on("resizestart", { grid: this }, function (event, ui) {
                        event.stopPropagation();
                        var resizer = $('body').find('div.rc_content_resizer');
                        var resizeSplitter = $('<div></div>');
                        resizeSplitter.addClass('ui-widget-header ui-state-default rc_resize_vsplitter');
                        if ($(event.originalEvent.target).hasClass('ui-resizable-e')) {
                            resizeSplitter.css('float', 'right');
                            event.data.grid._rightResizingStarted = true;
                        } else {
                            event.data.grid._leftResizingStarted = true;
                        }
                        resizer.empty().append(resizeSplitter);
                    })
                    .on("resizestop", { grid: this }, function (event, ui) {
                        event.stopPropagation();
                        $(ui.element).css('left', '').css('right', '');
                        var isSizeIncreased = (ui.originalSize.width - ui.size.width) < 0;
                        event.data.grid.doGridResizing(isSizeIncreased, ui.size);
                        event.data.grid._leftResizingStarted = false;
                        event.data.grid._rightResizingStarted = false;
                    });
            }
            var igLeftResizer = this.jqRS_OG('.rc_olapgrid_table').find('div.ui-resizable-w')
                .addClass('ui-widget-header ui-state-default')
                .css({ 'opacity': 0 })
                .hover(
                    function () {
                        timerId = setTimeout(function (obj) {
                            $(obj).css('opacity', 1);
                        }, 250, this);
                    },
                    function () {
                        clearTimeout(timerId);
                        $(this).css('opacity', 0);
                        timerId = null;
                    }
                );
            var leftAreaHider = $('<span></span>');
            leftAreaHider
                .addClass('ui-icon ui-icon-circle-arrow-w rc_content_vresizer_icon')
                .css({ 'cursor': 'pointer' })
                .unbind("click").click({ grid: this }, function (event) {
                    var grid = event.data.grid;
                    var leftAreaContainer = grid.jqRS_OG('.rc_leftarea_container');
                    var rightAreaContainer = grid.jqRS_OG('.rc_rightarea_container');

                    if ($(this).hasClass("ui-icon-circle-arrow-w")) {
                        $(this).removeClass("ui-icon-circle-arrow-w");
                        $(this).addClass("ui-icon-circle-arrow-e");
                        grid._leftAreaWidth = leftAreaContainer.width();
                        rightAreaContainer.width(rightAreaContainer.width());
                        leftAreaContainer.width(0);
                        leftAreaContainer.hide();
                    } else {
                        $(this).removeClass("ui-icon-circle-arrow-e");
                        $(this).addClass("ui-icon-circle-arrow-w");
                        leftAreaContainer.width(grid._leftAreaWidth);
                        event.data.grid.resizeIG();
                        leftAreaContainer.show();
                    }
                    event.data.grid.resizeIG();
                });

            igLeftResizer.empty().append(leftAreaHider);//html(leftAreaHider.html());

            var igRightResizer = this.jqRS_OG('.rc_gridarea').children('div.ui-resizable-e');

            igRightResizer.addClass('ui-widget-header ui-state-default')
                .css({ 'opacity': 0 })
                .hover(
                    function () {
                        timerId = setTimeout(function (obj) {
                            $(obj).css('opacity', 1);
                        }, 250, this);
                    },
                    function () {
                        clearTimeout(timerId);
                        $(this).css('opacity', 0);
                        timerId = null;
                    }
                );
            var rightAreaHider = $('<span></span>')
                .addClass('ui-icon ui-icon-circle-arrow-e rc_content_vresizer_icon')
                .css({ 'cursor': 'pointer' })
                .unbind("click").click({ grid: this }, function (event) {
                    var grid = event.data.grid;
                    var leftAreaContainer = grid.jqRS_OG('.rc_leftarea_container');
                    var rightAreaContainer = grid.jqRS_OG('.rc_rightarea_container');

                    if ($(this).hasClass("ui-icon-circle-arrow-e")) {
                        $(this).removeClass("ui-icon-circle-arrow-e");
                        $(this).addClass("ui-icon-circle-arrow-w");
                        grid._rightAreaWidth = rightAreaContainer.width();
                        leftAreaContainer.width(leftAreaContainer.width());
                        rightAreaContainer.width(0);
                        rightAreaContainer.hide();
                    } else {
                        $(this).removeClass("ui-icon-circle-arrow-w");
                        $(this).addClass("ui-icon-circle-arrow-e");
                        rightAreaContainer.width(grid._rightAreaWidth);
                        event.data.grid.resizeIG();
                        rightAreaContainer.show();
                    }
                    event.data.grid.resizeIG();
                    //event.data.grid.applyInternalGrid();
                });

            igRightResizer.empty().append(rightAreaHider);
        }

        doRightAreaInnerResizing(isSizeIncreased: boolean) {
            var modifsArea = this.jqRS_OG('#olapgrid_modifiers');
            var legendsArea = this.jqRS_OG('#olapgrid_legends');
            var hider = legendsArea.find('div.ui-resizable-n').children('span');

            legendsArea.width('');

            if (modifsArea.is(':hidden')) {
                modifsArea.show();
                legendsArea.height('');
                modifsArea.height('');
                hider.removeClass("ui-icon-circle-arrow-s");
                hider.addClass("ui-icon-circle-arrow-n");
            }
            else if (isSizeIncreased) {
                modifsArea.height(0);
                modifsArea.hide();
                hider.removeClass("ui-icon-circle-arrow-n");
                hider.addClass("ui-icon-circle-arrow-s");
            }

            legendsArea.css('top', 0);

            this.resizeIG();
        }

        initRightAreaInnerResizing() {
            var timerId: NodeJS.Timer;
            var modifsArea = this.jqRS_OG('#olapgrid_modifiers');
            var legendsArea = this.jqRS_OG('#olapgrid_legends');

            if (modifsArea.length === 0 || legendsArea.length === 0)
                return;

            legendsArea.resizable({
                    handles: 'n',
                    helper: "rc_rightarea_inner_resizer"
                })
                .on("resizestart", { grid: this }, function (event, ui) {
                    event.stopPropagation();
                    var resizer = $('body').find('div.rc_rightarea_inner_resizer');
                    var resizeSplitter = $('<div></div>');
                    resizeSplitter.addClass('ui-widget-header ui-state-default rc_rightarea_resize_hsplitter');
                    resizer.html(resizeSplitter.html());
                })
                .on("resizestop", { grid: this }, function (event, ui) {
                    event.stopPropagation();
                    var isSizeIncreased = (ui.originalSize.height - ui.size.height) < 0;
                    event.data.grid.doRightAreaInnerResizing(isSizeIncreased);
                });

            var resizer = this.jqRS_OG('.rc_rightarea').find('div.ui-resizable-n')
                .addClass('ui-widget-header ui-state-default')
                .css({
                    'opacity': 0,
                    'top': 0,
                    'text-align': 'center'
                })
                .hover(
                    function () {
                        timerId = setTimeout(function (obj) {
                            $(obj).css('opacity', 1);
                        }, 250, this);
                    },
                    function () {
                        clearTimeout(timerId);
                        $(this).css('opacity', 0);
                        timerId = null;
                    }
                );
            var areaHider = $('<span></span>')
                .addClass('ui-icon ui-icon-circle-arrow-n rc_content_hresizer_icon')
                .css({ 'cursor': 'pointer' })
                .unbind("click").click({ grid: this }, function (event) {
                    var grid = event.data.grid;
                    var modifsArea = grid.jqRS_OG('#olapgrid_modifiers');
                    var legendsArea = grid.jqRS_OG('#olapgrid_legends');

                    if ($(this).hasClass("ui-icon-circle-arrow-n")) {
                        $(this).removeClass("ui-icon-circle-arrow-n");
                        $(this).addClass("ui-icon-circle-arrow-s");
                        modifsArea.height(0);
                        modifsArea.hide();
                    } else {
                        $(this).removeClass("ui-icon-circle-arrow-s");
                        $(this).addClass("ui-icon-circle-arrow-n");
                        modifsArea.show();
                        legendsArea.height("");
                        modifsArea.height("");
                    }
                    event.data.grid.resizeIG();
                });

            resizer.empty().append(areaHider);
        }

        doLeftAreaInnerResizing(isSizeIncreased: boolean) {
            var treeArea = this.jqRS_OG('#olapgrid_tdtree');
            var pivotArea = this.jqRS_OG('#olapgrid_PIVOT');
            var hider = treeArea.find('div.ui-resizable-s').children('span');

            treeArea.width('');

            if (pivotArea.is(':hidden')) {
                pivotArea.show();
                treeArea.height('');
                pivotArea.height('');
                hider.removeClass("ui-icon-circle-arrow-n");
                hider.addClass("ui-icon-circle-arrow-s");
            }
            else if (isSizeIncreased) {
                pivotArea.height(0);
                pivotArea.hide();
                hider.removeClass("ui-icon-circle-arrow-s");
                hider.addClass("ui-icon-circle-arrow-n");
            }

            this.resizeIG();
        }

        initLeftAreaInnerResizing() {
            var timerId: NodeJS.Timer;
            var treeArea = this.jqRS_OG('#olapgrid_tdtree');
            var pivotArea = this.jqRS_OG('#olapgrid_PIVOT');

            if (treeArea.length === 0 || pivotArea.length === 0)
                return;

            treeArea.resizable({
                    handles: 's',
                    helper: "rc_leftarea_inner_resizer"
                })
                .on("resizestart", { grid: this }, function (event, ui) {
                    event.stopPropagation();
                    var resizer = $('body').find('div.rc_leftarea_inner_resizer');
                    var resizeSplitter = $('<div></div>');
                    resizeSplitter.addClass('ui-widget-header ui-state-default rc_resize_hsplitter');
                    resizer.empty().append(resizeSplitter);

                })
                .on("resizestop", { grid: this }, function (event, ui) {
                    event.stopPropagation();
                    var isSizeIncreased = (ui.originalSize.height - ui.size.height) < 0;
                    event.data.grid.doLeftAreaInnerResizing(isSizeIncreased);
                });

            var resizer = this.jqRS_OG('.rc_leftarea').find('div.ui-resizable-s')
                .addClass('ui-widget-header ui-state-default')
                .css({
                    'opacity': 0,
                    'left': -1,
                    'text-align': 'center'
                })
                .hover(
                    function () {
                        timerId = setTimeout(function (obj) {
                            $(obj).css('opacity', 1);
                        }, 250, this);
                    },
                    function () {
                        clearTimeout(timerId);
                        $(this).css('opacity', 0);
                        timerId = null;
                    }
                );
            var areaHider = $('<span></span>')
                .addClass('ui-icon ui-icon-circle-arrow-s rc_content_hresizer_icon')
                .css({ 'cursor': 'pointer' })
                .unbind("click").click({ grid: this }, function (event) {
                    var grid = event.data.grid;
                    var treeArea = grid.jqRS_OG('#olapgrid_tdtree');
                    var pivotArea = grid.jqRS_OG('#olapgrid_PIVOT');

                    if ($(this).hasClass("ui-icon-circle-arrow-s")) {
                        $(this).removeClass("ui-icon-circle-arrow-s");
                        $(this).addClass("ui-icon-circle-arrow-n");
                        pivotArea.height(0);
                        pivotArea.hide();
                    } else {
                        $(this).removeClass("ui-icon-circle-arrow-n");
                        $(this).addClass("ui-icon-circle-arrow-s");
                        pivotArea.show();
                        treeArea.height("");
                        pivotArea.height("");
                    }
                    event.data.grid.resizeIG();
                });

            resizer.empty().append(areaHider);
        }

        doFilterGridResizing(isSizeIncreased: boolean) {
            var olapGrid = this.jqRS_OG('.rc_olapgrid_container');
            var filterGrid = this.jqRS_OG('.rc_filtergrid');
            var hider = olapGrid.children('div.ui-resizable-n').children('span');

            olapGrid.width('');
            olapGrid.css('top', 0);

            if (filterGrid.is(':hidden')) {
                filterGrid.show();

                hider.removeClass("ui-icon-circle-arrow-s");
                hider.addClass("ui-icon-circle-arrow-n");
            }
            else if (isSizeIncreased) {
                filterGrid.hide();
                hider.removeClass("ui-icon-circle-arrow-n");
                hider.addClass("ui-icon-circle-arrow-s");
            } else
                return;

            this.resizeIG();
            //this.applyInternalGrid();
        }

        initFilterGridResizing() {
            var timerId: NodeJS.Timer;
            var olapGrid = this.jqRS_OG('.rc_olapgrid_container');
            var filterGrid = this.jqRS_OG('.rc_filtergrid');

            if (filterGrid.length === 0)
                return;

            olapGrid.resizable({
                    handles: 'n',
                    helper: "rc_filtergrid_resizer"
                })
                .on("resizestart", { grid: this }, function (event, ui) {
                    event.stopPropagation();
                    var resizer = $('body').find('div.rc_filtergrid_resizer');
                    var resizeSplitter = $('<div></div>')
                        .addClass('ui-widget-header ui-state-default rc_filtergrid_resize_hsplitter');
                    resizer.empty().append(resizeSplitter);
                })
                .on("resizestop", { grid: this }, function (event, ui) {
                    event.stopPropagation();
                    var isSizeIncreased = (ui.originalSize.height - ui.size.height) < 0;
                    event.data.grid.doFilterGridResizing(isSizeIncreased);
                });

            var resizer = olapGrid.find('div.ui-resizable-n')
                .addClass('ui-widget-header ui-state-default')
                .css({
                    'opacity': 0,
                    'top': -6,
                    'text-align': 'center'
                })
                .hover(
                    function () {
                        timerId = setTimeout(function (obj) {
                            $(obj).css('opacity', 1);
                        }, 250, this);
                    },
                    function () {
                        clearTimeout(timerId);
                        $(this).css('opacity', 0);
                        timerId = null;
                    }
                );
            var areaHider = $('<span></span>')
                .addClass('ui-icon ui-icon-circle-arrow-n rc_content_hresizer_icon')
                .css({ 'cursor': 'pointer' })
                .unbind("click").click({ grid: this }, function (event) {
                    var filterGrid = event.data.grid.jqRS_OG('.rc_filtergrid');
                    var olapGrid = event.data.grid.jqRS_OG('.rc_olapgrid_container');

                    if ($(this).hasClass("ui-icon-circle-arrow-n")) {
                        $(this).removeClass("ui-icon-circle-arrow-n");
                        $(this).addClass("ui-icon-circle-arrow-s");
                        filterGrid.hide();
                    } else {
                        $(this).removeClass("ui-icon-circle-arrow-s");
                        $(this).addClass("ui-icon-circle-arrow-n");
                        filterGrid.show();
                    }

                    olapGrid.width('');
                    event.data.grid.resizeIG();
                });

            resizer.empty().append(areaHider);
        }

        renderToolboxMenu(menuButtons: HTMLElement[]) {
            var menu = "<div class='rs_menubox'>" +
                "<ul class='rs_menu'>";
            $.each(menuButtons, function (i: number, obj: HTMLElement) {
                if (i > 0 && $(this).hasClass('ui-icon')) {
                    menu += "<li></li>";
                }

                if ($(this).hasClass('rs_measureplace_toolbox_button')) {
                    menu += "<li>";
                    menu += '<div>';
                    menu += $(this).children("span").first().html();
                    menu += '</div>';
                    menu += "<ul class='rc_shadow'>";
                    $(this).parent().children('.rs_measureplace_menu').find('label.ui-button').each(function () {
                        var clickSelector = "#" + $(this).attr('for');
                        //                    var liClass = "";
                        //                    if ($(this).hasClass('ui-state-active'))
                        //                        liClass = "ui-state-disabled";
                        //                    menu += "<li class='" + liClass + "'>" +
                        menu += "<li><div>" +
                            "<a href=\"{" + $(clickSelector).attr('onclick') + "}\">" +
                            "<span>" + $(this).html() + "</span></a></div></li>";
                    });
                    menu += "</ul></li>";
                    return;
                }

                if ($(this).hasClass('rs_export_toolbox_button')) {
                    menu += "<li>";
                    menu += '<div>';
                    menu += $(this).children("span").first().html();
                    menu += '</div>';
                    menu += "<ul class='rc_shadow'>";

                    $(this).parent().children('.rs_export_menu').find('li').each(function () {
                        menu += "<li><div>";
                        menu += '<img class="ui-icon rs_menu_icon" src="' + $(this).find('img').attr('src') + '">';
                        menu += "<a href=\"{" + $(this).attr('onclick') + "}\">";
                        menu += "<span>" + $(this).find("span").html() + "</span>";
                        menu += "</a></div ></li>";
                    });
                    menu += "</ul></li>";
                    return;
                }

                if ($(this).hasClass('ui-button')) {
                    menu += "<li><div>";
                    if ($(this).find('img').length !== 0)
                        menu += '<img class="ui-icon rs_menu_icon" src="' + $(this).find('img').attr('src') + '">';

                    menu += "<a href=\"{" + $(this).attr('onclick') + "}\">";
                    if ($(this).attr('title'))
                        menu += "<span>" + $(this).attr('title') + "</span>";
                    else
                        menu += "<span>" + $(this).html() + "</span>";

                    menu += "</a></div></li>";
                }

                if ($(this).hasClass('ui-controlgroup')) {
                    $(this).children('label').each(function () {
                        var liClass = "";
                        if ($(this).hasClass('ui-state-active'))
                            liClass = "ui-state-disabled";
                        menu += "<li class='" + liClass + "'><div>";
                        menu += '<img class="ui-icon rs_menu_icon" src="' + $(this).find('img').attr('src') + '">';
                        menu += "<a href=\"{" + $(this).attr('onclick') + "}\">";
                        menu += "<span>";
                        menu += $(this).attr('title');
                        menu += "</span></a><div></li>";
                    });
                }
            });
            menu += "</ul></div>";
            return menu;
        }

        openToolboxMenu(menuButtons: HTMLElement[]) {
            var popup = $('#olapgrid_rsPopup');
            popup.html(this.renderToolboxMenu(menuButtons));
            this.applyMenu();

            var z = this.jqRS_OG().css("z-index");
            if (z == "auto") {
                z = "0";
                this.jqRS_OG().css("z-index", "0");
            }

            var menuIcon = this.jqRS_OG('.rc_toolox_menu_icon');
            popup.css({
                'z-index': parseInt(z) + 3000,
                'display': 'block'
            }).position({
                my: "left top",
                at: "right bottom",
                of: $(menuIcon)
            });
        }

        moveButtonsToMenu() {
            var menuButtons: any[] = [];
            var menuIcon = this.jqRS_OG('.rc_toolox_menu_icon');
            var toolbox = this.jqRS_OG('.rs_toolbox').children('div');
            var tbWidth = toolbox.innerWidth();
            var lastVisible = null;

            toolbox.children(":not('.rs_export_menu, .rs_measureplace_menu')").show().each(function () {
                var rightLim = $(this).position().left + $(this).width();
                if (rightLim > tbWidth) {
                    menuButtons.push(this);
                } else {
                    lastVisible = this;
                }
            });

            if (menuButtons.length > 0) {
                menuIcon.show();
                menuIcon.off('click').on('click', { grid: this, buttons: menuButtons }, function (event) {
                    if ($('#olapgrid_rsPopup').is(":visible")) {
                        event.data.grid.hidePopup();
                    } else {
                        event.stopPropagation();
                        event.data.grid.openToolboxMenu(event.data.buttons);
                        $(document).unbind("click").click({ grid: event.data.grid }, event.data.grid.hidePopup);
                    }
                });
                $.each(menuButtons, function () {
                    $(this).hide();
                });

                if ($(lastVisible).hasClass("ui-icon")) {
                    $(lastVisible).hide();
                }
            } else {
                menuIcon.hide();
            }

            this.jqRS_OG('.rc-grid-settings').css("right", menuButtons.length > 0 ? 25 : 5);
        }

        initToolbox() {
            this.jqRS_OG('.rs_toolbox_button').button();
            this.jqRS_OG('.rs_toolbox_button').filter(".ui-state-active").addClass("ui-state-active").button("disable");
            this.jqRS_OG('.rs_toolbox_buttonset').find("input").checkboxradio({
                icon: false
            });
            this.jqRS_OG('.rc_measuresplace').find("input").checkboxradio({
                icon: false
            });
            this.jqRS_OG('.rs_toolbox_buttonset').controlgroup();
            this.jqRS_OG('.rc_measuresplace').buttonset().find('label').css('min-width', 150);
            this.jqRS_OG('.rs_measureplace_toolbox_button').button({
                icons: {
                    secondary: "ui-icon-triangle-1-s"
                }
            }).unbind("click").click({ grid: this }, function (event) {
                var menu = event.data.grid.jqRS_OG(".rs_measureplace_menu");
                if (menu.css('display') === 'none') {
                    menu.show().position({
                        my: "left top",
                        at: "left bottom",
                        of: this
                    });
                } else {
                    menu.hide();
                }
                $(document).one("click", function () {
                    menu.hide();
                });
                event.data.grid.jqRS_OG(".rs_export_menu").hide();
                return false;
            });

            this.jqRS_OG('.rs_export_toolbox_menu').menu();

            this.jqRS_OG('.rs_export_toolbox_button').button({
                icons: {
                    secondary: "ui-icon-triangle-1-s"
                }
            }).unbind("click").click({ grid: this }, function (event) {
                var menu = event.data.grid.jqRS_OG(".rs_export_menu");
                if (menu.css('display') === 'none') {
                    menu.show().position({
                        my: "left top",
                        at: "left bottom",
                        of: this
                    });
                } else {
                    menu.hide();
                }
                $(document).one("click", function () {
                    menu.hide();
                });
                event.data.grid.jqRS_OG(".rs_measureplace_menu").hide();
                return false;
            });

            this.createSettingsMenu();

            this.moveButtonsToMenu();

            ////$(window).load({ grid: this }, function (event) {
            ////    event.data.grid.moveButtonsToMenu();
            ////    //event.data.grid.resizeIG();
            ////});

            //        var toolbox = this.jqRS_OG('.rs_toolbox').children('div');
            //        var buttons = toolbox.children(".ui-button, .ui-buttonset");
            //        this.jqRS_OG(buttons.get(buttons.length)).on("buttonsetcreate", { grid: this }, function (event) {
            //            event.data.grid.moveButtonsToMenu();
            //        });
        }

        createSettingsMenu() {
        }

        initAllAreasResizing() {
            this.initFilterGridResizing();
            this.initRightAreaInnerResizing();
            this.initAreasResizing();
            this.initLeftAreaInnerResizing();
        }

        initAfterAllCalback() {
            this.applyPivot();
            this.applyInternalGrid();
            this.jqRS_OG('#olapgrid_IG').scroll({ grid: this }, this.doScroll);
            this.jqRS_OG().bind('selectstart', function (event) {
                event.preventDefault();
                return false;
            });
            this.initAllAreasResizing();
            this.initToolbox();
        }

        commonInit(settings = "") {
            if (settings != "")
                this._settings = settings;

            this.jqRS_OG().width(this._settings.width);
            this.jqRS_OG().height(this._settings.height);
            this.jqRS_OG().data('grid', this);
            this.jqRS_D().data('grid', this).dialog(
            {
                autoOpen: false,
                modal: true,
                open: function (event: Event, ui: any) {
                    var grid = $(this).data('grid');
                    if (grid.heditor) {
                        $(this).dialog({
                            resizable: grid._settings.heditorResizable,
                            height: 'auto',
                            width: grid._settings.heditorWidth,
                            minWidth: grid._settings.heditorWidth
                        });
                    } else {
                        $(this).dialog({
                            height: 'auto',
                            minWidth: 100
                        });
                    }
                },
                close: function () {
                    $('.rs_opened_submenu').detach();
                    var grid = $(this).data('grid');
                    if (grid.heditor) {
                        grid.callback('heditor|cancel', '');
                        grid.disableGrid();
                        grid.heditor = null;
                        $(this).dialog({
                            width: grid._settings.heditorWidth,
                            height: 'auto'
                        });
                    }
                }
            });
            this.jqRS_D2().data('grid', this).dialog({ autoOpen: false, modal: true, resizable: false, width: 'auto', height: 'auto' });
            this.jqRS_D_Wait().data('grid', this).dialog({ autoOpen: false, modal: true, resizable: false, width: 'auto', height: 'auto', minHeight: 0 }).siblings('.ui-dialog-titlebar').remove();

            var tree = this.jqRS_OG('#olapgrid_tdtree');
            if (tree.length !== 0)
                tree.height(100);

            this.applyPivot();
            this.applyInternalGrid(false);
            this.jqRS_OG('#olapgrid_IG').scroll({ grid: this }, this.doScroll);
            //$(window).load({ grid: this }, this.doLoad);

            this.jqRS_OG().bind('selectstart', function (event) {
                event.preventDefault();
                return false;
            });

            this.initAllAreasResizing();

            this.initToolbox();
        }

        initialize(settings = "") {
            this.commonInit(settings);
        }

        initLoadLayoutDialog() {

            var clickFunc = function () {
                $(this).data('grid').postback("upload_");
                return false;
            };
            this.jqRS_D_Loadlayout().data('grid', this).dialog(
                {
                    title: this._settings.loadlayoutTitle,
                    autoOpen: false,
                    modal: true,
                    resizable: false,
                    width: 'auto',
                    height: 'auto',
                    minHeight: 0,
                    appendTo: "#" + this._settings.cid
                }).
                dialog("option", "buttons",
                [
                    {
                        text: this._settings.rsOk,
                        click: clickFunc
                    },
                    {
                        text: this._settings.rsCancel,
                        click: function () {
                            $(this).dialog("close");
                        }
                    }
                ]);
        }

        prompt2(text: string, value: any, data: any, callback: any) {
            this.hidePopup();
            var s = "<br /><input id='olapgrid_DLG_prompt' style='width: 200px' ";
            if (value) s += "value='" + value + "' ";
            s += "/>";
            this.jqRS_D2().html(s).dialog({
                autoOpen: false,
                modal: true,
                resizable: false,
                width: 'auto',
                height: 'auto',
                title: text,
                buttons: [
                    {
                        text: this._settings.rsOk,
                        click: function () {
                            callback(data, $(this).children('#olapgrid_DLG_prompt').val());
                            $(this).dialog("close");
                        }
                    },
                    {
                        text: this._settings.rsCancel,
                        click: function () { $(this).dialog("close"); }
                    }
                ]
            }).dialog('open');
        }

        prompt(text:string, value: any, data: any, callback: any) {
            this.hidePopup();
            var s = "<br /><input class='ui-widget-content' id='olapgrid_DLG_prompt' style='width: 200px' ";
            if (value) s += "value='" + value + "' ";
            s += "/>";
            this.jqRS_D().html(s).dialog({
                title: text,
                buttons: [
                    {
                        text: this._settings.rsOk,
                        click: function () {
                            callback(data, $(this).children('#olapgrid_DLG_prompt').val());
                            $(this).dialog("close");
                        }
                    },
                    {
                        text: this._settings.rsCancel,
                        click: function () { $(this).dialog("close"); }
                    }
                ]
            }).dialog('open');
        }

        loadLayout(layoutXml: string) {
            var requestStr = "loadclientlayout|" + layoutXml;
            this.callbackAll(requestStr);
        }

        jqRS_D_Loadlayout(selector?: any): JQuery {
            var dSelector = "#olapgrid_DLG_loadlayout_" + this._settings.cid;
            if (selector) {
                if (typeof selector == 'string')
                    dSelector = dSelector + " " + selector;
                else
                    return $(selector);
            }

            return $(dSelector);
        }

        jqRS_D_LoadSettings(selector?: any): JQuery {
            var dSelector = "#olapgrid_DLG_loadsettings_" + this._settings.cid;
            if (selector) {
                if (typeof selector == 'string')
                    dSelector = dSelector + " " + selector;
                else
                    return $(selector);
            }

            return $(dSelector);
        }

        jqRS_D_Wait(selector?: any): JQuery {
            var dSelector = "#olapgrid_DLG_wait_" + this._settings.cid;
            if (selector) {
                if (typeof selector == 'string')
                    dSelector = dSelector + " " + selector;
                else
                    return $(selector);
            }

            return $(dSelector);
        }

        jqRS_D2(selector?: any): JQuery {
            var dSelector = "#olapgrid_DLG2_" + this._settings.cid;
            if (selector) {
                if (typeof selector == 'string')
                    dSelector = dSelector + " " + selector;
                else
                    return $(selector);
            }

            return $(dSelector);
        }

        jqRS_D(selector?: any): JQuery {
            var dSelector = "#olapgrid_DLG_" + this._settings.cid;
            if (selector) {
                if (typeof selector == 'string')
                    dSelector = dSelector + " " + selector;
                else
                    return $(selector);
            }

            return $(dSelector);
        }

        jqRS_F(selector?: any): JQuery {
            var fSelector = ".rc_filtergrid";
            if (selector) {
                if (typeof selector == 'string')
                    fSelector += (" " + selector);
            }

            return this.jqRS_OG(fSelector);
        }

        jqRS_IG(selector?: any): JQuery {
            var igSelector = "#" + this._settings.cid + " #" + this._IG_id;
            if (selector) {
                if (typeof selector == 'string')
                    igSelector = igSelector + " " + selector;
                else
                    return $(selector);
            }
            return $(igSelector);
        }

        jqRS_OG(selector?: any): JQuery {
            var ogSelector = "#" + this._settings.cid;
            if (selector) {
                if (typeof selector == 'string')
                    ogSelector = ogSelector + " " + selector;
                else
                    return $(selector);
            }

            return $(ogSelector);
        }

        getLayout() {
            if (this._response && this._response.Cellset)
                return this._response.Layout;

            if (this._settings)
                return this._settings.Layout;
        }

        getCellSet() {
            if (this._response && this._response.Cellset)
                return this._response.Cellset;

            if (this._settings)
                return this._settings.Cellset;
        }

        getColorByRank(colorMeasure: any, rank: number) {
            var value = rank * this._colorCount;

            var minVal = 0;

            var valStep = 1;

            for (var i = 0; i < this._colorCount; i++) {
                if (value >= minVal && value <= minVal + valStep) {
                    return colorMeasure.ColorsInfo[i];
                }

                minVal += valStep;
            }

            return null;
        }

        applyColorModification() {
            var layout = this.getLayout();
            var cellset = this.getCellSet();
            var memberModifier;
            var measureModifier;
            var dataCell;
            var selector = "";
            var viewCell;
            if (layout == null)
                return;
            //Background modification
            if (layout.ColorAxisItem && cellset.ColorChartMembers != null && cellset.ColorChartMembers.length > 0) {
                for (var i in cellset.ColorChartMembers) {
                    memberModifier = this._modifInfo[cellset.ColorChartMembers[i].UniqueName].colorMember;
                    for (var j in memberModifier.DataCells) {
                        dataCell = memberModifier.DataCells[j];
                        selector = "td[cellid='" + dataCell.CellIndex + "']";
                        viewCell = this.jqRS_OG('#olapgrid_IG').find(selector);
                        viewCell.css('background-color', memberModifier.Color.fillStyle);
                    }
                }

            } else if (layout.ColorAxisItem) {
                measureModifier = this._modifInfo[layout.ColorAxisItem].colorMeasure;
                for (var j in measureModifier.DataCells) {
                    dataCell = measureModifier.DataCells[j];
                    selector = "td[cellid='" + dataCell.CellIndex + "']";
                    viewCell = this.jqRS_OG('#olapgrid_IG').find(selector);
                    if (dataCell.BgColor != null)
                        viewCell.css('background-color', dataCell.BgColor.color);
                }
            }

            //Foreground modification
            if (layout.ForeColorAxisItem && cellset.ForeColorGridMembers != null && cellset.ForeColorGridMembers.length > 0) {
                for (var i in cellset.ForeColorGridMembers) {
                    memberModifier = this._modifInfo[cellset.ForeColorGridMembers[i].UniqueName].foreColorMember;
                    for (var j in memberModifier.DataCells) {
                        dataCell = memberModifier.DataCells[j];
                        selector = "td[cellid='" + dataCell.CellIndex + "']";
                        viewCell = this.jqRS_OG('#olapgrid_IG').find(selector);
                        viewCell.css('color', memberModifier.Color.fillStyle);
                    }
                }

            } else if (layout.ForeColorAxisItem) {
                measureModifier = this._modifInfo[layout.ForeColorAxisItem].foreColorMeasure;
                for (var j in measureModifier.DataCells) {
                    dataCell = measureModifier.DataCells[j];
                    selector = "td[cellid='" + dataCell.CellIndex + "']";
                    viewCell = this.jqRS_OG('#olapgrid_IG').find(selector);
                    if (dataCell.ForeColor != null)
                        viewCell.css('color', dataCell.ForeColor.color);
                }
            }
        }

        initDataCells_ColorMember(member: any, isBackground: boolean) {

            var colorMember = isBackground ? this._modifInfo[member].colorMember : this._modifInfo[member].foreColorMember;
            var cellset = this.getCellSet();
            var cells = cellset.Cells;
            var cell = null;

            for (var cellIndex in cells) {
                cell = cells[cellIndex];

                if (cell.CellType != CellType.data) //|| cell.IsTotal == true
                    continue;

                if (cell.MemberBackground == member || cell.MemberForeground == member)
                    colorMember.DataCells.push(cell);
            }
        }

        initDataCells_ColorMeasure(measure: any, isBackground: boolean) {
            var layout = this.getLayout();
            var cellset = this.getCellSet();
            var colorMeasure = isBackground ? this._modifInfo[layout.ColorAxisItem].colorMeasure :
                this._modifInfo[layout.ForeColorAxisItem].foreColorMeasure;
            var cells = cellset.Cells;
            var cell = null;

            for (var cellIndex in cells) {
                cell = cells[cellIndex];

                if (cell.CellType != CellType.data || cell.Data == null) // || cell.IsTotal == true)
                    continue;

                //if (cell.Measure != null  && cell.Measure.UniqueName == measure) {
                if (isBackground)
                    cell.BgColor = this.getColorByRank(colorMeasure, cell.RankBackground);
                else
                    cell.ForeColor = this.getColorByRank(colorMeasure, cell.RankForeground);

                colorMeasure.DataCells.push(cell);
                //}
            }
        }

        cutText(source: string, maxLength: number) {
            var result = source;
            if (source.length <= maxLength)
                return result;

            var p = maxLength - 1;
            for (var i = p; i > p - 5; i--) {
                if (source[i] == ' ') {
                    p = i - 1;
                    break;
                }
            }
            return source.substring(0, p) + "...";
        }

        ciel10(value: number) {
            var tmp = 0;

            if ((tmp = value % 10) != 0)
                value += value > -1 ? (10 - tmp) : -tmp;

            return value;
        }

        floor10(value: number) {
            var tmp = 0;

            if ((tmp = value % 10) != 0)
                value += value > -1 ? -tmp : -(10 + tmp);

            return value;
        }

        initColorModification() {
            var clrManager = new ColorManager();
            var layout = this.getLayout();
            var cellset = this.getCellSet();
            var colorGridMembers = cellset.ColorChartMembers;
            var foreColorGridMembers = cellset.ForeColorGridMembers;

            //Init background modification 
            if (colorGridMembers) {
                var colorsInfo = clrManager.CreateGradients(colorGridMembers.length);
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

                    cm = colorGridMembers[i];
                    if (!this._modifInfo[cm.UniqueName]) {
                        this._modifInfo[cm.UniqueName] = {};
                    }

                    this._modifInfo[cm.UniqueName].colorMember = {
                        "DisplayName": cm.DisplayName,
                        "UniqueName": cm.UniqueName,
                        "Color": fBrush,
                        //"Gradient" : fGrBrush,
                        'BaseColor': clr.color,
                        "GroupUniqName": layout.ColorAxisItem,
                        'DataCells': []
                    };

                    this.initDataCells_ColorMember(cm.UniqueName, true);

                }
            } else if (layout.ColorAxisItem) {
                if (!this._modifInfo[layout.ColorAxisItem]) {
                    this._modifInfo[layout.ColorAxisItem] = {};
                }

                this._modifInfo[layout.ColorAxisItem].colorMeasure = {
                    "ColorsInfo": clrManager.CreateGradients(this._colorCount),
                    "DataCells": []
                };

                this.initDataCells_ColorMeasure(layout.ColorAxisItem, true);

            }

            //Init foreground modification
            if (foreColorGridMembers) {
                var colorsInfo = clrManager.CreateGradients(foreColorGridMembers.length);
                var clr;
                var fBrush;
                var cm;

                for (var i = 0; i < colorsInfo.length; i++) {
                    clr = colorsInfo[i];

                    fBrush = new Brush(clr.borderColor, clr.color, { lineWidth: 1, opacity: 0.5 });

                    cm = foreColorGridMembers[i];
                    if (!this._modifInfo[cm.UniqueName]) {
                        this._modifInfo[cm.UniqueName] = {};
                    }

                    this._modifInfo[cm.UniqueName].foreColorMember = {
                        "DisplayName": cm.DisplayName,
                        "UniqueName": cm.UniqueName,
                        "Color": fBrush,
                        //"Gradient" : fGrBrush,
                        'BaseColor': clr.color,
                        "GroupUniqName": layout.ForeColorAxisItem,
                        'DataCells': []
                    };

                    this.initDataCells_ColorMember(cm.UniqueName, false);

                }
            } else if (layout.ForeColorAxisItem) {
                if (!this._modifInfo[layout.ForeColorAxisItem]) {
                    this._modifInfo[layout.ForeColorAxisItem] = {};
                }

                this._modifInfo[layout.ForeColorAxisItem].foreColorMeasure = {
                    "ColorsInfo": clrManager.CreateGradients(this._colorCount),
                    "DataCells": []
                };

                this.initDataCells_ColorMeasure(layout.ForeColorAxisItem, false);

            }

            //        else {
            //            this.jqRS_OG('#color_legend').children().remove();
            //        }
        }

        initModifications() {
            this._modifInfo = {};
            this.initColorModification();
        }

        getFirstVisibleLevel(hierarchy: string) {
            var levels = this._hierarchies[hierarchy].Levels;
            var levelsCount = Object.keys(levels).length;

            var cl = null;
            for (var i = 0; i < levelsCount; i++) {
                cl = levels[i];
                if (cl.Visible == true)
                    return cl;
            }

            return null;
        }

        getLastVisibleLevel(hierarchy: string) {
            var levels = this._hierarchies[hierarchy].Levels;
            var levelsCount = Object.keys(levels).length;

            var cl = null;
            for (var i = levelsCount; i > 0; i--) {
                cl = levels[i - 1];
                if (cl.Visible == true)
                    return cl;
            }

            return null;
        }

        getMemberValue(UniqueName: string) {
            return this._members2[UniqueName];
        }

        structureLayout() {
            var layout = this.getLayout();
            if (layout == null)
                return;
            var cellSet = this.getCellSet();
            this._measures = new Object();
            var i: any;
            var j: any;
            for (i = 0; i < layout.Measures.length; i++) {
                var cm = layout.Measures[i];
                this._measures[cm.UniqueName] = cm;
            }

            this._hierarchies = new Object();
            this._levels = new Object();
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

        tryShowClientMessage(func: string, message: string) {
            if (typeof window[func] != 'function')
                return false;

            try {
                window[func](message);
            } catch (e) {
                return false;
            }

            return true;

        }

        isMobile() {
            var isM = navigator.userAgent.match(/Android/i)
                || navigator.userAgent.match(/BlackBerry/i)
                || navigator.userAgent.match(/iPhone|iPad|iPod/i)
                || navigator.userAgent.match(/Opera Mini/i)
                || navigator.userAgent.match(/IEMobile/i);

            return isM ? isM : false;
        }

        parsChartTypes() {
            var chartTypesObject = { chartTypes: this._settings.chartsType };
            var jasonChartTypes = JSON.stringify(chartTypesObject);
            return jasonChartTypes;
        }

        OLAPTlb_clearcube() {
            var sel = this.jqRS_D('#olaptlw_cb');
            sel.empty();
            return sel;
        }

        OLAPTlb_clearcataloge() {
            var sel = this.jqRS_D('#olaptlw_db');
            sel.empty();
            return sel;
        }

        OLAPTlb_parsecallback(arg: string, context: string) {
            this.jqRS_D('#olaptlw_connect').removeAttr('disabled');
            if (arg.substr(0, 2) == 'e|') {
                $('#olaptlw_err').show().find("#olaptlw_err_text").html(arg.substr(2));
                this.OLAPTlb_clearcataloge();
                this.OLAPTlb_clearcube();
                return;
            }

            if (context == 'changesn') {
                var sel = this.OLAPTlb_clearcataloge();
                this.OLAPTlb_clearcube();
                var bases = arg.substr(2).split('|');
                sel.append($("<option></option>"));
                for (var i = 0; i < bases.length; i++) {
                    sel.append($("<option></option>").attr("value", bases[i]).text(bases[i]));

                }
            }

            if (context == 'changedb') {
                var sel = this.OLAPTlb_clearcube();
                var bases = arg.substr(2).split('|');
                this.OLAPTlb_clearcube();
                for (var i = 0; i < bases.length; i++) {
                    sel.append($("<option></option>").attr("value", bases[i]).text(bases[i]));
                }
            }
        }

        getAnalysisType() {
            return this._settings.analysisType;
        }

        OLAPTlb_lock() {
            this.jqRS_D('#olaptlw_err').hide().find("#olaptlw_err_text").html('');
            this.jqRS_D('#olaptlw_connect').attr('disabled', 'disabled');
        }

        protected initLegend() {
            var legendContainer = this.jqRS_OG('#all_legends').get(0);
            if (legendContainer != null) {
                if (this._isCanvasSupported) {
                    this.legend = new Legend(this);
                    this.legend.initLegend();
                } else {
                    var container = RadarSoft.$(legendContainer);
                    container.empty();
                    if (RadarSoft.$.isEmptyObject(this._modifInfo) == false)
                        container.append("It is not possible to display a legend. This version of the browser does not support HTML 5 canvas element. Please use the following browsers: Internet Explorer 9+, Mozilla Firefox 3.6+, Opera 12+, Safari 6+, Google Chrome.");
                }
            }
        }

        getColorByMeasureValue(value: any): any {
            return null;
        }
    }
}
