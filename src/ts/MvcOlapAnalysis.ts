namespace RadarSoft {
    export class MvcOlapAnalysis extends OlapChartBase {

        constructor() {
            super();
            //    this.docHeight = $(document).height();
            //    this.docWidth = $(document).width();
        }

        protected createHierarchyEditor(hierarchy: string): HierarchyEditor {
            var he = new MvcHierarchyEditor(hierarchy, this as OlapGridBase);
            he.callback(`init|${hierarchy}`);
            this.disableGrid();
            return he;
        }

        relativeUrl(path:string) {
            return window.location.protocol + "//" + window.location.host + path;
        }

        postback(arg:any) {
            if (this.jqRS_OG().attr('disabled')) return;

            this.mvcCallback(this, arg, "toolbox", null, "POST");
            this.disableGrid();
        }

        dataCallback(arg:string, data:any, context: string) {
            if (this.jqRS_OG().attr('disabled')) return;
            this.mvcDataCallback(this, arg, data, context);
            this.disableGrid();
        }

        callback(arg?:string, context?:string, callback?: () => void) {
            if (this.jqRS_OG().attr('disabled')) return;

            this.mvcCallback(this, arg, context, callback, "POST");
        }

        initialize(settings = "") {
            if (settings != "")
                this.set_settings(settings);

            if (this.getAnalysisType() === "grid" && this._settings.allowSelectionFormatting) {
                this._conditionFormat = new ConditionFormating(this);
            }
            super.initialize();
            this.initLoadLayoutDialog();
            this.initLoadSettingsDialog();
        }

        initLoadLayoutDialog() {
            var clickFunc = function () {
                var grid = $(this).data('grid');
                var formSelector = "#loadLayoutForm_" + grid._settings.cid;
                $(formSelector).submit();
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

            var formSelector = "#loadLayoutForm_" + this._settings.cid;
            $(formSelector).submit(
                { 'grid': this, 'dialog': this.jqRS_D_Loadlayout() },
                function (e) {
                    e.preventDefault();
                    var grid = e.data.grid;
                    var fdata = new FormData($(this)[0] as HTMLFormElement);
                    grid.loadSettings(fdata);
                    e.data.dialog.dialog("close");
                }
            );
        }

        initLoadSettingsDialog() {
            var clickFunc = function () {
                var grid = $(this).data('grid');
                var formSelector = "#loadSettingsForm_" + grid._settings.cid;
                $(formSelector).submit();
            };

            this.jqRS_D_LoadSettings().data('grid', this).dialog(
                {
                    title: this._settings.loadsettingsTitle,
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

            var formSelector = "#loadSettingsForm_" + this._settings.cid;
            $(formSelector).submit(
                { 'grid': this, 'dialog': this.jqRS_D_LoadSettings() },
                function (e) {
                    e.preventDefault();
                    var grid = e.data.grid;
                    var fdata = new FormData($(this)[0] as HTMLFormElement);
                    grid.loadSettings(fdata);
                    e.data.dialog.dialog("close");
                }
            );
        }

        export(arg:string|number) {
            var form = $('<form></form>');
            form.attr("method", "post");
            form.attr("action", "/" + this._settings.exportController + "/" + this._settings.exportAction);
            var field = $('<input></input>');
            field.attr("type", "hidden");
            field.attr("name", "olapexportarg");
            field.attr("value", arg);
            form.append(field);
            $(document.body).append(form);
            form.submit();
            $(document.body).find(form).remove();
        }

        editOlapAnalysis() {
            this.callbackSettings('giveolapanalysis');
        }

        editToolboxButtons() {
            this.callbackSettings('givetoolboxbuttons');
        }

        editCustomButtons() {
            this.callbackSettings('givecustombuttons');
        }

        editXlsxExportOptions() {
            this.callbackSettings('givexlsxoptions');
        }

        editXlsExportOptions() {
            this.callbackSettings('givexlsoptions');
        }

        editPdfExportOptions() {
            this.callbackSettings('givepdfoptions');
        }

        editHtmlExportOptions() {
            this.callbackSettings('givehtmloptions');
        }

        editCsvExportOptions() {
            this.callbackSettings('givecsvoptions');
        }

        editJpegExportOptions() {
            this.callbackSettings('givejpegoptions');
        }

        editCommonExportOptions() {
            this.callbackSettings('giveoptions');
        }

        renderSettingsMenu() {
            var menu = "<div class='rs_menubox'>";
            menu += "<ul class='rs_menu'>";
            //Toolbox settings
            menu += "<li><div>";
            menu += `<a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editOlapAnalysis(); }">`;
            menu += "<span>Olap Analysis settings</span></a></div>";
            menu += "</li>";
            //Export settings
            menu += "<li><div>";
            menu += "<span>Export settings</span></div>";
            menu += "<ul class='rc_shadow'>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editCommonExportOptions(); }">`;
            menu += "<span>Common options</span></a></div></li>";
            //menu += "<li><a href=\"{RadarSoft.$('#" + this._settings.cid + "').data('grid').editJpegExportOptions(); }\">";
            //menu += "<span>JPEG options</span></a></li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editXlsExportOptions(); }">`;
            menu += "<span>XLS options</span></a></div></li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editHtmlExportOptions(); }">`;
            menu += "<span>HTML options</span></a></div></li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editPdfExportOptions(); }">`;
            menu += "<span>PDF options</span></a></div></li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editCsvExportOptions(); }">`;
            menu += "<span>CSV options</span></a></div></li>";
            //menu += "<li><a href=\"{RadarSoft.$('#" + this._settings.cid + "').data('grid').editXlsxExportOptions(); }\">";
            //menu += "<span>XLSX options</span></a></li>";
            menu += "</ul></li>";
            //Toolbox settings
            menu += "<li><div>";
            menu += "<span>Toolbox settings</span></div>";
            menu += "<ul class='rc_shadow'>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editToolboxButtons(); }">`;
            menu += "<span>Toolbox buttons</span></a></div></li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editCustomButtons(); }">`;
            menu += "<span>Custom buttons</span></a></div></li>";
            menu += "</ul></li>";

            //save and open settingsRadarSoft.
            menu += "<li></li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').saveSettings('rc_settings'); }">`;
            menu += "<span>Save all settings</span></a></div>";
            menu += "</li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').showLoadSettingsDialog(); }">`;
            menu += "<span>Load external settings</span></a></div>";
            menu += "</li>";
            menu += "</ul></div>";
            return menu;
        }

        openSettingsMenu() {
            var popup = $('#olapgrid_rsPopup');
            popup.html(this.renderSettingsMenu());
            this.applyMenu();

            var settingsIcon = this.jqRS_OG('.rc-grid-settings');
            popup.css({
                'z-index': parseInt(this.jqRS_OG().css("z-index")) + 3000,
                'display': 'block'
            }).position({
                my: "left top",
                at: "right bottom",
                of: $(settingsIcon)
            });
        }

        createSettingsMenu() {
            var settingsIcon = this.jqRS_OG('.rc-grid-settings');
            settingsIcon.off('click').on('click', { grid: this }, event => {
                if ($('#olapgrid_rsPopup').is(":visible")) {
                    event.data.grid.hidePopup();
                } else {
                    event.stopPropagation();
                    event.data.grid.openSettingsMenu();
                    $(document).unbind("click").click({ grid: event.data.grid }, event.data.grid.hidePopup);
                }
            });
        }

        saveSettings(fileName:string) {
            var form = $('<form></form>');
            form.attr("method", "post");
            form.attr("action", "/" + this._settings.exportController + "/" + this._settings.exportAction);
            var field = $('<input></input>');
            field.attr("type", "hidden");
            field.attr("name", "olapexportarg");
            field.attr("value", `savesettings|${fileName}`);
            form.append(field);
            $(document.body).append(form);
            form.submit();
            $(document.body).find(form).remove();
        }

        loadSettings(data: any) {
            if (this.jqRS_OG().attr('disabled')) return;
            this.disableGrid();
            $.ajax({
                url: this.relativeUrl("/" + this._settings.callbackController + "/" + this._settings.callbackAction),
                data: data,
                processData: false,
                contentType: false,
                dataType: 'json',
                type: "POST",
                context: this
            })
                .done(function (response) {
                    this.receiveCallback(response, "all");
                });
        }

        showLoadSettingsDialog() {
            var dlg = this.jqRS_D_LoadSettings();
            dlg.dialog('open');
        }

        mvcCallback(grid: OlapGridBase, data: Object, context: any, callback: () => void, verb:string) {
            if (context == "heditortree")
                data = (data as string).replace(/\&/gi, "@@@");

            $.ajax({
                    url: this
                        .relativeUrl("/" + this._settings.callbackController + "/" + this._settings.callbackAction),
                    data: 'olapcallbackarg=' + data + '&context=' + context,
                    beforeSend: function() {

                    },
                    dataType: 'json',
                    type: verb,
                    context: grid
                })
                .done(response => {
                    grid.receiveCallback(response, context, callback);
                });
        }

        mvcDataCallback(grid: OlapGridBase, args: string, data: Object, context: any) {
            var dataObj = { olapcallbackarg: args, data: data}
            $.ajax({
                url: this.relativeUrl("/" + this._settings.callbackController + "/" + this._settings.callbackAction),
                data: dataObj,
                dataType: 'json',
                type: "POST",
                context: grid
            })
            .done(function(response) {
                grid.receiveCallback(response, context, null);
            });
        }

        receiveCallback(response: any, context: string, callback: () => void) {
            if (context != 'heditortree')
                this.hidePopup();
            if (this._conditionFormat)
                this._conditionFormat.deleteAllFormat();

            var data = response.data;

            if (response.exception) {
                this.enableGrid();

                if (response.errorHandler) {
                    if (this.tryShowClientMessage(response.errorHandler, response.errorClientData) == false)
                        this.receiveDialog(response.exception);
                } else
                    this.receiveDialog(response.exception);

                return;
            }

            switch (context) {
            case 'settings':
                this.set_settings(response);
                break;
            case 'popup':
                this.receivePopupCallback(data);
                $(document).bind('click', { grid: this }, this.hidePopup);
                break;
            case 'heditor':
            case 'dialog':
                this.receiveDialog(response.dialog);
                if (context === 'heditor') {
                    this.applyMenu();

                    if (callback) {
                        callback();
                    }
                }
                break;
            case 'heditortree':
                this.heditor.receiveCallbackTree(data);
                if (callback) {
                    callback();
                }
                break;
            case 'datagrid':
            case 'all':
            case 'toolbox':
                this.receiveAllCallback(response);
                break;
            case 'changesn':
            case 'changedb':
                this.OLAPTlb_parsecallback(response.resultString, context);
                this.enableConnectionDialog();
                break;
            default:
                break;
            }

            this.applyCheckedAndFiltered(response.treechecked, response.filtered);

            if (response.callbackScript)
                eval(response.callbackScript);


            if (response.messageHandler && response.clientMessage) {
                this.tryShowClientMessage(response.messageHandler, response.clientMessage);
            }

            setTimeout($.proxy(this.enableGrid, this), 100);
        }
    }
}