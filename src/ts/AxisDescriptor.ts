namespace RadarSoft {
    export class AxisDescriptor extends Descriptor {

        constructor(type: AxisType, orientation: Orientation, markerSize: number, marks: string[],
            brush: Brush, font: FontProperties, margin: number, axisName: string, title: string) {
            super(new Position(0, 0), new Size(0, 0), brush, font);
            this.type = type;
            this.orientation = orientation;
            this.markerSize = markerSize;
            this.margin = margin;
            this.name = axisName ? axisName : "Axis";
            this.title = title;
            this.titleMargin = 10;
            switch (this.orientation) {
                case Orientation.verticalOrientation:
                this.dock = DockStyle.left;
                break;
                case Orientation.horizontalOrientation:
                this.dock = DockStyle.bottom;
                break;
            }

            this.SetMarks(marks);
        }

        sortAsc(a: string, b: string) {
            var res = 0;
            var a_int = parseInt(a);
            var b_int = parseInt(b);
            if (a_int && b_int) {
                res = parseInt(a) - parseInt(b);
            }
            return res;
        }

        sortDesc(a: string, b: string) {
            return parseInt(b) - parseInt(a);
        }

        SetMarks(marks: string[]) {
            if ((this.type == AxisType.discreteAxis) && (marks.length == 1)) {
                marks = [
                    (parseInt(marks[0]) * 0.8).toString(),
                    (parseInt(marks[0]) * 1.2).toString()
                ];
            }
            this.marks = cpy(marks);
        }

    }
}