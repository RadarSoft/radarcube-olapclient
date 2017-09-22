namespace RadarSoft {
    export class ServiceLayer extends Layer {

        afterDraw() {
        }

        sortFunc(a: any, b: any) {
            var res = 0;
            if (!b.descriptor) {
                res = 1;
            } else if (!a.descriptor) {
                res = -1;
            } else if (b.descriptor.size && a.descriptor.size) {
                if (b.descriptor.size.height && a.descriptor.size.height) {
                    res = b.descriptor.size.width - a.descriptor.size.width;
                }
            }
            return res;
        }

        constructor(name?: string) {
            super(name);
        }
    }
}