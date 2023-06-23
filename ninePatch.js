var ninePatch = (function () {
    var bin = {
        readUint: function (buff, p) {
            return (
                buff[p] * (256 * 256 * 256) +
                ((buff[p + 1] << 16) | (buff[p + 2] << 8) | buff[p + 3])
            );
        },
        readASCII: function (buff, p, l) {
            var s = "";
            for (var i = 0; i < l; i++) {
                s += String.fromCharCode(buff[p + i])
            };
            return s;
        }
    };
    function decode(buff) {
        var data = new Uint8Array(buff),
            offset = 8;
        var out = {};

        var mgck = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        for (var i = 0; i < 8; i++)
            if (data[i] != mgck[i]) throw "The input is not a PNG file!";

        while (offset < data.length) {
            var len = bin.readUint(data, offset);
            offset += 4;
            var type = bin.readASCII(data, offset, 4);
            offset += 4;

            if (type == "npTc") {
                out.wasDeserialized = data[offset + 1];
                out.numXDivs = data[offset + 2];
                out.numYDivs = data[offset + 3];
                out.numColors = data[offset + 4];
                break;
            } else if (type == "IEND") {
                break;
            }
            offset += len;
            // skip crc
            offset += 4;
        }
        return out;
    }
    return {
        decode: decode
    }
})();
