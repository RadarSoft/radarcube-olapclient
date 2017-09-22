namespace RadarSoft {
    export class Shape extends SelectableObject {
        data: any;

        constructor(descriptor: Descriptor) {
            super(descriptor);
        }

        GetData() {
            var res = null;
            if (this.data) {
                res = this.data;
            }

            return res;
        }

        SetData(data: any) {
            this.data = cpy(data);
        }

    }
}