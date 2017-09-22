namespace RadarSoft {
    export class MenuItem {
        group: MenuGroup;
        click: () => {};
        imgSrc: string;
        id: string;
        type: string;

        constructor(id: string, imgSrc: string, click: () => {}) {
            this.type = "item";
            this.id = id;
            this.imgSrc = imgSrc;
            this.click = click;
            this.group = null;
        }

        Build() {
            var img = document.createElement("IMG");
            (<HTMLImageElement>img).src = this.imgSrc;
            img.id = this.id;
            $("body").undelegate("#" + this.id, "click");
            $("body").delegate("#" + this.id, "click", this, this.onclick);
            return img;
        }

        onclick(e: BaseJQueryEventObject) {
            var itm = e.data;
            while (itm.group) {
                itm.group.Collapse();
                itm = itm.group;
            }
            if (e.data.click) {
                e.data.click(e);
            }
        }

       Destroy(body: JQuery) {
           body.undelegate("#" + this.id, "click");
        }
    }


    export class MenuGroup extends MenuItem {
        mnuId: string;
        btnId: string;
        items: MenuItem[];
        layout: any;
        chart: Chart;
        chartManager: ChartManager;

        constructor(id: string, imgSrc: string, chart: Chart) {
            super(id, imgSrc, null);
            this.type = "group";
            this.chartManager = chart.chartManager;
            this.chart = chart;
            this.layout = MenuLayout.horizontal;
            this.items = [];
            this.btnId = id + "_btn";
            this.mnuId = id + "_menu";
            this.group = null;
        }


        AddItem(item: MenuItem) {
            item.group = this;
            this.items.push(item);
        }

        Expand() {
            var table = document.createElement("TABLE");
            table.style.backgroundColor = this.chartManager.tOLAPChart.getBorderColor();//"silver";
            switch (this.layout) {
            case MenuLayout.vertical:
                for (var i = 0; i < this.items.length; i++) {
                    var tr = document.createElement("TR");
                    var td = document.createElement("TD");
                    tr.appendChild(td);
                    var mi = this.items[i].Build();
                    td.appendChild(mi);
                    table.appendChild(tr);
                }
                break;
            case MenuLayout.horizontal:
                var tr = document.createElement("TR");
                for (var i = 0; i < this.items.length; i++) {
                    var td = document.createElement("TD");
                    tr.appendChild(td);
                    var mi = this.items[i].Build();
                    td.appendChild(mi);
                }
                table.appendChild(tr);
                break;
            }

            var div = document.createElement("DIV");
            div.appendChild(table);
            div.id = this.mnuId;

            $("body").undelegate("#" + this.mnuId, "mouseleave");
            $("body").delegate("#" + this.mnuId, "mouseleave", this, function (e) {
                var menu = e.data;
                menu.Collapse();
            });
            div.style.zIndex = "50000";
            div.style.position = "absolute";

            return div;
        }

        Collapse() {
            $("body").undelegate("#" + this.mnuId, "mouseleave");
            $("#" + this.mnuId).fadeOut(function () {
                $("#" + this.id).remove();
            });
            if (this.chart) {
                this.chart.setOnMouseMove();
            }
        }

        Destroy() {
            $("body").undelegate("#" + this.btnId, "mouseenter");
            $("body").undelegate("#" + this.btnId, "mouseleave");
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].Destroy($("body"));
            }
        }

        mouseleave(e: BaseJQueryEventObject) {
            var gr = e.data;
            gr.Collapse();
        }

        mouseenter(e: BaseJQueryEventObject) {
            var gr = e.data;
            var submenu = gr.Expand();
            $("#" + gr.btnId).append(submenu);
        }

        Build() {
            var img = document.createElement("IMG");
            (<HTMLImageElement>img).src = this.imgSrc;
            var td = document.createElement("TD");
            td.appendChild(img);
            td.id = this.btnId;
            $("body").undelegate("#" + this.btnId, "mouseenter");
            $("body")
                .delegate("#" + this.btnId, "mouseenter", this, this.mouseenter);
            $("body").undelegate("#" + this.btnId, "mouseleave");
            $("body")
                .delegate("#" + this.btnId, "mouseleave", this, this.mouseleave);
            return td;
        }
    }
}