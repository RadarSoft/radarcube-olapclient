($ => {
    $.fn.findAttr = function (elements: any) {
        var res = this.parents(`[${elements}]`).andSelf().attr(elements);
        if (res != null) return res;
        $.each(this, (i, item) => {
            var a = $(item).attr(elements);
            if (a != null) res = a;
        });
        return res;
    };
})(jQuery);
namespace RadarSoft {
    export var $ = jQuery.noConflict(true);
    export var __namespace = true;

    //export function $(selector: string): JQuery { throw new Error("Not implemented"); }
    export function cpy(obj: any) {
        //?
        //return;

        if (typeof obj !== 'object' || obj == null) {
            return obj;
        }

        var c = obj instanceof Array ? [] : {};

        for (var i in obj) {
            var prop = obj[i];

            if (typeof prop == 'object') {
                if (prop instanceof Array) {
                    c[i] = [];

                    for (var j = 0; j < prop.length; j++) {
                        if (typeof prop[j] != 'object') {
                            c[i].push(prop[j]);
                        } else {
                            c[i].push(cpy(prop[j]));
                        }
                    }
                } else {
                    c[i] = cpy(prop);
                }
            } else {
                c[i] = prop;
            }
        }

        return c;
    };

    export function createCanvas(): HTMLCanvasElement {
        var canvasEl: HTMLCanvasElement = document.createElement('canvas');
        if (canvasEl.getContext) {
            return canvasEl;
        }

        return null;
    }

    export function floor10(value: number) {
        var tmp = 0;

        if ((tmp = value % 10) != 0)
            value += value > -1 ? -tmp : -(10 + tmp);

        return value;
    }

    export function ciel10(value: number) {
        var tmp = 0;

        if ((tmp = value % 10) != 0)
            value += value > -1 ? (10 - tmp) : -tmp;

        return value;
    }

    export function cutText(source: string, maxLength: number) {
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

    //?
    export function chartTypeStringConverter(typeSting: string): ChartTypes {
        switch (typeSting) {
            case ("Scatter"):
                return ChartTypes.points;
            case ("StackedBar100"):
                return ChartTypes.percentBar;
            case ("StackedArea100"):
                return ChartTypes.percentArea;
            case ("StackedArea"):
                return ChartTypes.deltaArea;
            case ("Area"):
                return ChartTypes.area;
            case ("Step"):
                return ChartTypes.stepLine;
            case ("Pie"):
                return ChartTypes.pie;
            case ("Spline"):
            case ("Line"):
                return ChartTypes.spline;
            case ("Bar"):
            case ("Column"):
                return ChartTypes.bar;
            case ("StackedColumn100"):
                return ChartTypes.percentSpline;
            case ("StackedLine100"):
                return ChartTypes.percentArea;
            case ("StackedBar"):
                return ChartTypes.deltaBar;
            case ("StackedColumn"):
                return ChartTypes.polyLine;
            case ("StackedLine"):
                return ChartTypes.deltaSpline;
        }

        return ChartTypes.points;
    }

    //convert client chart type to server chart type
    export function chartTypeIntInverter(clientChartType: ChartTypes) {

        var chartType: ServerChartTypes = ServerChartTypes.Scatter;

        switch (clientChartType) {
            case ChartTypes.spline:
                chartType = ServerChartTypes.Line;
                break;
            case ChartTypes.points:
                chartType = ServerChartTypes.Scatter;
                break;
            case ChartTypes.deltaBar:
                chartType = ServerChartTypes.StackedBar;
                break;
            case ChartTypes.bar:
                chartType = ServerChartTypes.Bar;
                break;
            case ChartTypes.area:
                chartType = ServerChartTypes.Area;
                break;
            case ChartTypes.deltaSpline:
                chartType = ServerChartTypes.StackedLine;
                break;
            case ChartTypes.deltaArea:
                chartType = ServerChartTypes.StackedArea;
                break;
            case ChartTypes.percentBar:
                chartType = ServerChartTypes.StackedBar100;
                break;
            case ChartTypes.percentArea:
                chartType = ServerChartTypes.StackedArea100;
                break;
            case ChartTypes.percentSpline:
                chartType = ServerChartTypes.StackedLine100;
                break;
            case ChartTypes.pie:
                chartType = ServerChartTypes.Pie;
                break;
            case ChartTypes.polyLine:
                chartType = ServerChartTypes.Spline;
                break;
            case ChartTypes.stepLine:
                chartType = ServerChartTypes.Step;
                break;
        }

        return chartType;
    }

    //convert server chart type to client chart type
    export function chartTypeIntConverter(serverChartType: ServerChartTypes) {
        var chartType = ChartTypes.spline;

        switch (serverChartType) {
            case ServerChartTypes.Line:
                chartType = ChartTypes.spline;
                break;
            case ServerChartTypes.Scatter:
                chartType = ChartTypes.points;
                break;
            case ServerChartTypes.StackedBar:
                chartType = ChartTypes.deltaBar;
                break;
            case ServerChartTypes.Bar:
                chartType = ChartTypes.bar;
                break;
            case ServerChartTypes.Area:
                chartType = ChartTypes.area;
                break;
            case ServerChartTypes.StackedLine:
                chartType = ChartTypes.deltaSpline;
                break;
            case ServerChartTypes.StackedArea:
                chartType = ChartTypes.deltaArea;
                break;
            case ServerChartTypes.StackedBar100:
                chartType = ChartTypes.percentBar;
                break;
            case ServerChartTypes.StackedArea100:
                chartType = ChartTypes.percentArea;
                break;
            case ServerChartTypes.StackedLine100:
                chartType = ChartTypes.percentSpline;
                break;
            case ServerChartTypes.Pie:
                chartType = ChartTypes.pie;
                break;
            case ServerChartTypes.Spline:
                chartType = ChartTypes.polyLine;
                break;
            case ServerChartTypes.Step:
                chartType = ChartTypes.stepLine;
                break;
        }       

        return chartType;
    };

}