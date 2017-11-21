namespace RadarSoft {
    export class HierarchyEditor {
        private hierarchyName: string;
        protected grid: OlapGridBase;
        protected scrollTop: number;

        constructor(hierarchy: string, grid: OlapGridBase) {
            this.scrollTop = 0;
            this.grid = grid;
            this.hierarchyName = hierarchy;
            grid.heditor = this;
        }

        applyTree = () => {
            var tree = $("#heditor_TREE");
            tree.find("[expandable=true]").unbind("click").click(
                { heditor: this.grid.heditor },
                event => event.data.heditor.expand(event)).css("cursor", "pointer");
            tree.find("[type=checkbox]").unbind("click").click(
                { heditor: this.grid.heditor },
                event => event.data.heditor.check(event));

            if ($("#heditor_selectlevel").selectmenu("instance") == null) {
                $("#heditor_selectlevel").selectmenu().off("selectmenuchange").on("selectmenuchange",
                    { heditor: this.grid.heditor }, (event, ui) => {
                    event.data.heditor.callback("chlevel|" + ui.item.value);
                });
            } else
                $("#heditor_selectlevel").selectmenu("enable");


            if ($("#olapgrid_HFilter_btn").button("instance") == null) {
                $("#olapgrid_HFilter_btn").button().unbind("click").click(
                    { heditor: this.grid.heditor }, event => {
                        //?
                        event.data.heditor.filter($("#olapgrid_HFilter").val() +
                            "|" +
                            (<HTMLInputElement>$("#heditor_exactmatching")[0]).checked);
                    });
            } else
                $("#olapgrid_HFilter_btn").button("enable");


            if ($("#btnApplyFilter, #btnCancelResetFilter").button("instance") == null) {
                $("#btnApplyFilter, #btnCancelResetFilter").button().unbind("click").click(
                    { heditor: this.grid.heditor }, event => {
                        event.data.heditor.apply(event.data.heditor.grid._settings.loading);
                        event.data.heditor.grid.heditor = null;
                    });
            } else
                $("#btnApplyFilter, #btnCancelResetFilter").button("enable");

            if ($("#btnResetFilter, #btnCancelFilter").button("instance") == null) {
                $("#btnResetFilter, #btnCancelFilter").button().unbind("click").click(
                    { heditor: this.grid.heditor }, event => {
                        event.data.heditor.cancel(event.data.heditor.grid._settings.loading);
                        event.data.heditor.grid.heditor = null;
                    });
            } else
                $("#btnResetFilter, #btnCancelFilter").button("enable");

            this.grid.jqRS_D("td[member] span.pager").css("cursor", "pointer").unbind("click").click(
                { heditor: this.grid.heditor }, event => {
                var o = $(event.target);
                event.data.heditor.page(o.findAttr("member"), o.findAttr("page-value"));
                event.stopPropagation();
            });
        }

        callbackTree(params: string) {
            this.grid.disableGrid();
            this.grid.callback("heditor|" + params, "heditortree", this.applyTree);
        }

        callback(params: string) {
            var tree = $("#heditor_TREE");
            if (tree.length) this.scrollTop = tree.scrollTop();
            this.grid.callback("heditor|" + params, "heditor", this.applyTree);
        }

        receiveCallbackTree(data: string) {
            var tree = $("#heditor_TREE");
            tree.html(data);
            var heditor = this.grid.jqRS_D();
            heditor.find("input").prop("disabled", false);
        }
        receiveCallback(data: string) {
            var dlg = this.grid.jqRS_D().html(data);
            if (!dlg.dialog("isOpen")) dlg.dialog("open");
            $("#heditor_TREE").scrollTop(this.scrollTop);
        }
        errorCallback(data: string) {
            this.grid.jqRS_D().html(data);
        }
        expand(event: any) {
            event.data.heditor.callbackTree("expand|" + $(event.target).findAttr("membername"));
        }
        check(event: any) {
            event.data.heditor.callbackTree("check|" + $(event.target).findAttr("membername"));
            var heditor = event.data.heditor.grid.jqRS_D();
            heditor.find("input").prop("disabled", true);
            $("#olapgrid_HFilter_btn").button("disable");
            $("#btnApplyFilter, #btnCancelResetFilter").button("disable");
            $("#btnResetFilter, #btnCancelFilter").button("disable");
            $("#heditor_selectlevel").selectmenu("disable");
            event.stopPropagation();
        }
        page(member: any, p: string) {
            if (p == "...") {
                this.grid.prompt2(this.grid.get_settings().pagePrompt, "1",
                    { hed: this, member: member }, (data: any, s: string) => {
                        data.hed.callbackTree("page|" + data.member + "|" + s);
                    });
            } else this.callbackTree("page|" + member + "|" + p);
        }
        filter(s: string) {
            if (s == null) s = "";
            this.callbackTree("filter|" + s);
        }
        cancel(s: string) {
            $(".rs_opened_submenu").detach();
            var dlg = this.grid.jqRS_D();
            if (dlg.dialog("isOpen")) {
                dlg.empty().append(s).dialog("close");
            }
        }
        cancel2(s: string) {
            $(".rs_opened_submenu").detach();
            this.grid.jqRS_D().html(s).dialog("close");
        }
        apply(s: string) {
            $(".rs_opened_submenu").detach();
            this.grid.callback("heditor|apply", "all");
            this.grid.disableGrid();
            this.grid.heditor = null;
            this.grid.jqRS_D().html(s).dialog("close");
        }

    }
}