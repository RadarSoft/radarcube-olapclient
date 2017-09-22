namespace RadarSoft {
    export class StandaloneAxis extends DrawableObject {
        layer: Layer;
        visible: boolean;
        container: HTMLElement;
        chart: Chart;
        isX: boolean;
        axSyst: AxisSystem;

        constructor(container: HTMLElement, chart: Chart, axSyst: AxisSystem, isX: boolean) {
            super();
            this.axSyst = axSyst;
            this.isX = isX;
            this.chart = chart;
            this.container = container;
            this.visible = (chart.chartManager.chartType != ChartTypes.pie);
            this.layer = new ServiceLayer();
            var canvas = this.layer.GetCanvas();
            container.appendChild(canvas);
            container.style.position = 'absolute';
            canvas.width = chart.size.width;
            canvas.height = chart.size.height;
            chart.chartManager.standaloneAxisList.push(this);
        }

        getAxisImage() {
            var canvas = this.layer.GetCanvas();
            var axis = canvas.toDataURL();
            var w = canvas.width;
            var h = canvas.height;
            var axisImage: any = { background: null, image: axis, width: w, height: h };
            return axisImage;
        }

        Draw(layer?: Layer) {
            var l = this.layer;
            var ctx = l.GetContext();
            var c = l.GetCanvas();
            ctx.clearRect(0, 0, c.width, c.height);
            var axis = (this.isX) ? this.axSyst.GetAxisX() : this.axSyst.GetAxisY();
            var x = (this.isX) ? 0 : -axis.descriptor.position.left;
            var y = (this.isX) ? -axis.descriptor.position.top : 0;
            this.container.style.width = axis.descriptor.size.width + "px";
            this.container.style.height = axis.descriptor.size.height + "px";
            c.width = axis.descriptor.size.width;
            c.height = axis.descriptor.size.height;
            ctx.translate(x, y);
            if (this.visible) {
                axis.drawAxis(l);
            }
        }
    }
}