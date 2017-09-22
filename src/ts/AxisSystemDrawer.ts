namespace RadarSoft {
    export class AxisSystemDrawer extends DrawableObject {
        layer: Layer;
        mainSystem: AxisSystem;
        position: Position;
        size: Size;
        axisSystems: AxisSystem[];
        ySize: Size;
        xSize: Size;
        yPositionRight: Position;
        yPositionLeft: Position;
        xPositionTop: Position;
        xPositionBottom: Position;

        constructor(xPositionBottom: Position, xPositionTop: Position, xSize: Size, yPositionLeft: Position, yPositionRight: Position, ySize: Size) {
            super();
            this.xPositionBottom = cpy(xPositionBottom);
            this.xPositionTop = cpy(xPositionTop);
            this.yPositionLeft = cpy(yPositionLeft);
            this.yPositionRight = cpy(yPositionRight);
            this.xSize = cpy(xSize);
            this.ySize = cpy(ySize);
            this.axisSystems = [];
            this.size = new Size(1, 1);
            this.position = new Position(1, 1);
            this.mainSystem = null;
        }
        GetSystems() {
            return this.axisSystems;
        }

        GetById(id: string) {
            for (var i = 0; i < this.axisSystems.length; i++) {
                if (this.axisSystems[i].GetId() == id) {
                    return this.axisSystems[i];
                }
            }
        }

        CorrectScale() {
            for (var i = 0; i < this.axisSystems.length; i++) {
                this.axisSystems[i].CorrectScale();
            }
        }

        GetMainSystem() {
            return this.mainSystem;
        }

        AddSystem(axisSystem: AxisSystem) {
            axisSystem.xSize = cpy(this.xSize);
            axisSystem.ySize = cpy(this.ySize);
            axisSystem.xPositionBottom = cpy(this.xPositionBottom);
            axisSystem.xPositionTop = cpy(this.xPositionTop);
            axisSystem.yPositionLeft = cpy(this.yPositionLeft);
            axisSystem.yPositionRight = cpy(this.yPositionRight);
            axisSystem.layer = this.layer;
            this.axisSystems.push(axisSystem);
            if (!this.mainSystem) {
                this.mainSystem = axisSystem;
            }
        }

        GetAxis() {
            var axis = [];
            for (var i = 0; i < this.axisSystems.length; i++) {

                var ax = this.axisSystems[i].GetMeasureAxis();
                if (!this.axisSystems[i].IsMeasureAttached) {
                    axis.push(ax);
                }

                var ax = this.axisSystems[i].GetDimensionAxis();
                if (!this.axisSystems[i].IsDimensionAttached) {
                    axis.push(ax);
                }
            }
            return axis;
        }

        correctAxisSize(ctx: CanvasRenderingContext2D, defaultOffset: number) {
            var offsetYBottom = 0;
            var offsetYTop = 0;
            var offsetXLeft = 0;
            var offsetXRight = 0;
            for (var i = 0; i < this.axisSystems.length; i++) {
                var axisSystem = this.axisSystems[i];
                if (!axisSystem.IsAttachedX()) {
                    var xAxis = axisSystem.GetAxisX();
                    xAxis.correctSize(ctx);
                    var curXpos = xAxis.GetPosition();
                    switch (xAxis.descriptor.dock) {
                    case DockStyle.bottom:
                        curXpos.top = this.xPositionBottom.top + this.xSize.height
                            - xAxis.GetSize().height - (offsetYBottom);
                        curXpos.left = this.xPositionBottom.left;
                        offsetYBottom += !axisSystem.IsVisible() ? 0
                            : xAxis.GetSize().height;
                        break;
                    case DockStyle.top:
                        curXpos.top = this.xPositionTop.top + (offsetYTop);
                        curXpos.left = this.xPositionTop.left;
                        offsetYTop += !axisSystem.IsVisible() ? 0
                            : xAxis.GetSize().height;
                        break;
                    }

                    xAxis.SetPosition(curXpos);

                }
                if (!axisSystem.IsAttachedY()) {
                    var yAxis = axisSystem.GetAxisY();

                    yAxis.correctSize(ctx);

                    var curYpos = yAxis.GetPosition();
                    switch (yAxis.descriptor.dock) {
                    case DockStyle.left:
                        curYpos.left = this.yPositionLeft.left + (offsetXLeft);
                        curYpos.top = this.yPositionLeft.top;
                        offsetXLeft += !axisSystem.IsVisible() ? 0
                            : yAxis.GetSize().width;
                        break;
                    case DockStyle.right:
                        curYpos.left = this.yPositionRight.left + this.ySize.width
                            - yAxis.GetSize().width - (offsetXRight);
                        curYpos.top = this.yPositionRight.top;
                        offsetXRight += !axisSystem.IsVisible() ? 0
                            : yAxis.GetSize().width;
                        break;
                    }

                    yAxis.SetPosition(curYpos);
                }
            }

            offsetYBottom = (offsetYBottom != 0) ? offsetYBottom : 0;//defaultOffset;
            offsetYTop = (offsetYTop != 0) ? offsetYTop : 0;//defaultOffset;
            offsetXLeft = (offsetXLeft != 0) ? offsetXLeft : 0;//defaultOffset;
            offsetXRight = (offsetXRight != 0) ? offsetXRight : 0;//defaultOffset;

            for (var i = 0; i < this.axisSystems.length; i++) {
                var axisSystem = this.axisSystems[i];
                if (!axisSystem.IsAttachedX()) {
                    var xAxis = axisSystem.GetAxisX();
                    var currXsize = xAxis.GetSize();
                    currXsize.width = this.xSize.width - offsetXLeft - offsetXRight;
                    xAxis.SetSize(currXsize);

                    var curXpos = xAxis.GetPosition();
                    curXpos.left += offsetXLeft;
                    xAxis.SetPosition(curXpos);
                }
                if (!axisSystem.IsAttachedY()) {
                    var yAxis = axisSystem.GetAxisY();
                    var currYsize = yAxis.GetSize();
                    currYsize.height = this.ySize.height - offsetYBottom - offsetYTop;
                    yAxis.SetSize(currYsize);
                    var curYpos = yAxis.GetPosition();
                    curYpos.top += offsetYTop;
                    yAxis.SetPosition(curYpos);
                }
            }

            return {
                "yMarginTop": offsetYTop,
                "yMarginBottom": offsetYBottom,
                "xMarginLeft": offsetXLeft,
                "xMarginRight": offsetXRight
            };
        }
    }
}