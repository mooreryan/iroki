var PAPA_CONFIG = {
  delimiter: "\t",
  header: true,
  // See GitHub Issue #64
  dynamicTyping: function(col_name){ return col_name !== "name"; },
  // worker: true,
  skipEmptyLines: true
};

var LEAF_DOT_OPTIONS = [
  "leaf_dot_color",
  "leaf_dot_size"
];

var LEAF_LABEL_OPTIONS = [
  "leaf_label_color",
  "leaf_label_font",
  "leaf_label_size",
  "new_name"
];

var BRANCH_OPTIONS = [
  "branch_width",
  "branch_color"
];

var valid_colors = {
  // These are the Kelly colors by number.
  "1": "#875692",
  "2": "#F38400",
  "3": "#A1CAF1",
  "4": "#BE0032",
  "5": "#C2B280",
  "6": "#848482",
  "7": "#008856",
  "8": "#E68FAC",
  "9": "#0067A5",
  "10": "#F99379",
  "11": "#604E97",
  "12": "#F6A600",
  "13": "#B3446C",
  "14": "#882D17",
  "15": "#8DB600",
  "16": "#654522",
  "17": "#E25822",
  "18": "#2B3D26",
  "19": "#F3C300",

  // Kelly colors by name.
  "k_purple": "#875692",
  "k_orange": "#F38400",
  "k_light_blue": "#A1CAF1",
  "k_red": "#BE0032",
  "k_buff": "#C2B280",
  "k_grey": "#848482",
  "k_green": "#008856",
  "k_purplish_pink": "#E68FAC",
  "k_blue": "#0067A5",
  "k_yellowish_pink": "#F99379",
  "k_violet": "#604E97",
  "k_orange_yellow": "#F6A600",
  "k_purplish_red": "#B3446C",
  "k_reddish_brown": "#882D17",
  "k_yellow_green": "#8DB600",
  "k_yellowish_brown": "#654522",
  "k_reddish_orange": "#E25822",
  "k_olive_green": "#2B3D26",
  "k_yellow": "#F3C300",

  // These are the R colors by name.
  "r_white": "#FFFFFF",
  "r_aliceblue": "#F0F8FF",
  "r_antiquewhite": "#FAEBD7",
  "r_antiquewhite1": "#FFEFDB",
  "r_antiquewhite2": "#EEDFCC",
  "r_antiquewhite3": "#CDC0B0",
  "r_antiquewhite4": "#8B8378",
  "r_aquamarine": "#7FFFD4",
  "r_aquamarine1": "#7FFFD4",
  "r_aquamarine2": "#76EEC6",
  "r_aquamarine3": "#66CDAA",
  "r_aquamarine4": "#458B74",
  "r_azure": "#F0FFFF",
  "r_azure1": "#F0FFFF",
  "r_azure2": "#E0EEEE",
  "r_azure3": "#C1CDCD",
  "r_azure4": "#838B8B",
  "r_beige": "#F5F5DC",
  "r_bisque": "#FFE4C4",
  "r_bisque1": "#FFE4C4",
  "r_bisque2": "#EED5B7",
  "r_bisque3": "#CDB79E",
  "r_bisque4": "#8B7D6B",
  "r_black": "#000000",
  "r_blanchedalmond": "#FFEBCD",
  "r_blue": "#0000FF",
  "r_blue1": "#0000FF",
  "r_blue2": "#0000EE",
  "r_blue3": "#0000CD",
  "r_blue4": "#00008B",
  "r_blueviolet": "#8A2BE2",
  "r_brown": "#A52A2A",
  "r_brown1": "#FF4040",
  "r_brown2": "#EE3B3B",
  "r_brown3": "#CD3333",
  "r_brown4": "#8B2323",
  "r_burlywood": "#DEB887",
  "r_burlywood1": "#FFD39B",
  "r_burlywood2": "#EEC591",
  "r_burlywood3": "#CDAA7D",
  "r_burlywood4": "#8B7355",
  "r_cadetblue": "#5F9EA0",
  "r_cadetblue1": "#98F5FF",
  "r_cadetblue2": "#8EE5EE",
  "r_cadetblue3": "#7AC5CD",
  "r_cadetblue4": "#53868B",
  "r_chartreuse": "#7FFF00",
  "r_chartreuse1": "#7FFF00",
  "r_chartreuse2": "#76EE00",
  "r_chartreuse3": "#66CD00",
  "r_chartreuse4": "#458B00",
  "r_chocolate": "#D2691E",
  "r_chocolate1": "#FF7F24",
  "r_chocolate2": "#EE7621",
  "r_chocolate3": "#CD661D",
  "r_chocolate4": "#8B4513",
  "r_coral": "#FF7F50",
  "r_coral1": "#FF7256",
  "r_coral2": "#EE6A50",
  "r_coral3": "#CD5B45",
  "r_coral4": "#8B3E2F",
  "r_cornflowerblue": "#6495ED",
  "r_cornsilk": "#FFF8DC",
  "r_cornsilk1": "#FFF8DC",
  "r_cornsilk2": "#EEE8CD",
  "r_cornsilk3": "#CDC8B1",
  "r_cornsilk4": "#8B8878",
  "r_cyan": "#00FFFF",
  "r_cyan1": "#00FFFF",
  "r_cyan2": "#00EEEE",
  "r_cyan3": "#00CDCD",
  "r_cyan4": "#008B8B",
  "r_darkblue": "#00008B",
  "r_darkcyan": "#008B8B",
  "r_darkgoldenrod": "#B8860B",
  "r_darkgoldenrod1": "#FFB90F",
  "r_darkgoldenrod2": "#EEAD0E",
  "r_darkgoldenrod3": "#CD950C",
  "r_darkgoldenrod4": "#8B6508",
  "r_darkgray": "#A9A9A9",
  "r_darkgreen": "#006400",
  "r_darkgrey": "#A9A9A9",
  "r_darkkhaki": "#BDB76B",
  "r_darkmagenta": "#8B008B",
  "r_darkolivegreen": "#556B2F",
  "r_darkolivegreen1": "#CAFF70",
  "r_darkolivegreen2": "#BCEE68",
  "r_darkolivegreen3": "#A2CD5A",
  "r_darkolivegreen4": "#6E8B3D",
  "r_darkorange": "#FF8C00",
  "r_darkorange1": "#FF7F00",
  "r_darkorange2": "#EE7600",
  "r_darkorange3": "#CD6600",
  "r_darkorange4": "#8B4500",
  "r_darkorchid": "#9932CC",
  "r_darkorchid1": "#BF3EFF",
  "r_darkorchid2": "#B23AEE",
  "r_darkorchid3": "#9A32CD",
  "r_darkorchid4": "#68228B",
  "r_darkred": "#8B0000",
  "r_darksalmon": "#E9967A",
  "r_darkseagreen": "#8FBC8F",
  "r_darkseagreen1": "#C1FFC1",
  "r_darkseagreen2": "#B4EEB4",
  "r_darkseagreen3": "#9BCD9B",
  "r_darkseagreen4": "#698B69",
  "r_darkslateblue": "#483D8B",
  "r_darkslategray": "#2F4F4F",
  "r_darkslategray1": "#97FFFF",
  "r_darkslategray2": "#8DEEEE",
  "r_darkslategray3": "#79CDCD",
  "r_darkslategray4": "#528B8B",
  "r_darkslategrey": "#2F4F4F",
  "r_darkturquoise": "#00CED1",
  "r_darkviolet": "#9400D3",
  "r_deeppink": "#FF1493",
  "r_deeppink1": "#FF1493",
  "r_deeppink2": "#EE1289",
  "r_deeppink3": "#CD1076",
  "r_deeppink4": "#8B0A50",
  "r_deepskyblue": "#00BFFF",
  "r_deepskyblue1": "#00BFFF",
  "r_deepskyblue2": "#00B2EE",
  "r_deepskyblue3": "#009ACD",
  "r_deepskyblue4": "#00688B",
  "r_dimgray": "#696969",
  "r_dimgrey": "#696969",
  "r_dodgerblue": "#1E90FF",
  "r_dodgerblue1": "#1E90FF",
  "r_dodgerblue2": "#1C86EE",
  "r_dodgerblue3": "#1874CD",
  "r_dodgerblue4": "#104E8B",
  "r_firebrick": "#B22222",
  "r_firebrick1": "#FF3030",
  "r_firebrick2": "#EE2C2C",
  "r_firebrick3": "#CD2626",
  "r_firebrick4": "#8B1A1A",
  "r_floralwhite": "#FFFAF0",
  "r_forestgreen": "#228B22",
  "r_gainsboro": "#DCDCDC",
  "r_ghostwhite": "#F8F8FF",
  "r_gold": "#FFD700",
  "r_gold1": "#FFD700",
  "r_gold2": "#EEC900",
  "r_gold3": "#CDAD00",
  "r_gold4": "#8B7500",
  "r_goldenrod": "#DAA520",
  "r_goldenrod1": "#FFC125",
  "r_goldenrod2": "#EEB422",
  "r_goldenrod3": "#CD9B1D",
  "r_goldenrod4": "#8B6914",
  "r_gray": "#BEBEBE",
  "r_gray0": "#000000",
  "r_gray1": "#030303",
  "r_gray2": "#050505",
  "r_gray3": "#080808",
  "r_gray4": "#0A0A0A",
  "r_gray5": "#0D0D0D",
  "r_gray6": "#0F0F0F",
  "r_gray7": "#121212",
  "r_gray8": "#141414",
  "r_gray9": "#171717",
  "r_gray10": "#1A1A1A",
  "r_gray11": "#1C1C1C",
  "r_gray12": "#1F1F1F",
  "r_gray13": "#212121",
  "r_gray14": "#242424",
  "r_gray15": "#262626",
  "r_gray16": "#292929",
  "r_gray17": "#2B2B2B",
  "r_gray18": "#2E2E2E",
  "r_gray19": "#303030",
  "r_gray20": "#333333",
  "r_gray21": "#363636",
  "r_gray22": "#383838",
  "r_gray23": "#3B3B3B",
  "r_gray24": "#3D3D3D",
  "r_gray25": "#404040",
  "r_gray26": "#424242",
  "r_gray27": "#454545",
  "r_gray28": "#474747",
  "r_gray29": "#4A4A4A",
  "r_gray30": "#4D4D4D",
  "r_gray31": "#4F4F4F",
  "r_gray32": "#525252",
  "r_gray33": "#545454",
  "r_gray34": "#575757",
  "r_gray35": "#595959",
  "r_gray36": "#5C5C5C",
  "r_gray37": "#5E5E5E",
  "r_gray38": "#616161",
  "r_gray39": "#636363",
  "r_gray40": "#666666",
  "r_gray41": "#696969",
  "r_gray42": "#6B6B6B",
  "r_gray43": "#6E6E6E",
  "r_gray44": "#707070",
  "r_gray45": "#737373",
  "r_gray46": "#757575",
  "r_gray47": "#787878",
  "r_gray48": "#7A7A7A",
  "r_gray49": "#7D7D7D",
  "r_gray50": "#7F7F7F",
  "r_gray51": "#828282",
  "r_gray52": "#858585",
  "r_gray53": "#878787",
  "r_gray54": "#8A8A8A",
  "r_gray55": "#8C8C8C",
  "r_gray56": "#8F8F8F",
  "r_gray57": "#919191",
  "r_gray58": "#949494",
  "r_gray59": "#969696",
  "r_gray60": "#999999",
  "r_gray61": "#9C9C9C",
  "r_gray62": "#9E9E9E",
  "r_gray63": "#A1A1A1",
  "r_gray64": "#A3A3A3",
  "r_gray65": "#A6A6A6",
  "r_gray66": "#A8A8A8",
  "r_gray67": "#ABABAB",
  "r_gray68": "#ADADAD",
  "r_gray69": "#B0B0B0",
  "r_gray70": "#B3B3B3",
  "r_gray71": "#B5B5B5",
  "r_gray72": "#B8B8B8",
  "r_gray73": "#BABABA",
  "r_gray74": "#BDBDBD",
  "r_gray75": "#BFBFBF",
  "r_gray76": "#C2C2C2",
  "r_gray77": "#C4C4C4",
  "r_gray78": "#C7C7C7",
  "r_gray79": "#C9C9C9",
  "r_gray80": "#CCCCCC",
  "r_gray81": "#CFCFCF",
  "r_gray82": "#D1D1D1",
  "r_gray83": "#D4D4D4",
  "r_gray84": "#D6D6D6",
  "r_gray85": "#D9D9D9",
  "r_gray86": "#DBDBDB",
  "r_gray87": "#DEDEDE",
  "r_gray88": "#E0E0E0",
  "r_gray89": "#E3E3E3",
  "r_gray90": "#E5E5E5",
  "r_gray91": "#E8E8E8",
  "r_gray92": "#EBEBEB",
  "r_gray93": "#EDEDED",
  "r_gray94": "#F0F0F0",
  "r_gray95": "#F2F2F2",
  "r_gray96": "#F5F5F5",
  "r_gray97": "#F7F7F7",
  "r_gray98": "#FAFAFA",
  "r_gray99": "#FCFCFC",
  "r_gray100": "#FFFFFF",
  "r_green": "#00FF00",
  "r_green1": "#00FF00",
  "r_green2": "#00EE00",
  "r_green3": "#00CD00",
  "r_green4": "#008B00",
  "r_greenyellow": "#ADFF2F",
  "r_grey": "#BEBEBE",
  "r_grey0": "#000000",
  "r_grey1": "#030303",
  "r_grey2": "#050505",
  "r_grey3": "#080808",
  "r_grey4": "#0A0A0A",
  "r_grey5": "#0D0D0D",
  "r_grey6": "#0F0F0F",
  "r_grey7": "#121212",
  "r_grey8": "#141414",
  "r_grey9": "#171717",
  "r_grey10": "#1A1A1A",
  "r_grey11": "#1C1C1C",
  "r_grey12": "#1F1F1F",
  "r_grey13": "#212121",
  "r_grey14": "#242424",
  "r_grey15": "#262626",
  "r_grey16": "#292929",
  "r_grey17": "#2B2B2B",
  "r_grey18": "#2E2E2E",
  "r_grey19": "#303030",
  "r_grey20": "#333333",
  "r_grey21": "#363636",
  "r_grey22": "#383838",
  "r_grey23": "#3B3B3B",
  "r_grey24": "#3D3D3D",
  "r_grey25": "#404040",
  "r_grey26": "#424242",
  "r_grey27": "#454545",
  "r_grey28": "#474747",
  "r_grey29": "#4A4A4A",
  "r_grey30": "#4D4D4D",
  "r_grey31": "#4F4F4F",
  "r_grey32": "#525252",
  "r_grey33": "#545454",
  "r_grey34": "#575757",
  "r_grey35": "#595959",
  "r_grey36": "#5C5C5C",
  "r_grey37": "#5E5E5E",
  "r_grey38": "#616161",
  "r_grey39": "#636363",
  "r_grey40": "#666666",
  "r_grey41": "#696969",
  "r_grey42": "#6B6B6B",
  "r_grey43": "#6E6E6E",
  "r_grey44": "#707070",
  "r_grey45": "#737373",
  "r_grey46": "#757575",
  "r_grey47": "#787878",
  "r_grey48": "#7A7A7A",
  "r_grey49": "#7D7D7D",
  "r_grey50": "#7F7F7F",
  "r_grey51": "#828282",
  "r_grey52": "#858585",
  "r_grey53": "#878787",
  "r_grey54": "#8A8A8A",
  "r_grey55": "#8C8C8C",
  "r_grey56": "#8F8F8F",
  "r_grey57": "#919191",
  "r_grey58": "#949494",
  "r_grey59": "#969696",
  "r_grey60": "#999999",
  "r_grey61": "#9C9C9C",
  "r_grey62": "#9E9E9E",
  "r_grey63": "#A1A1A1",
  "r_grey64": "#A3A3A3",
  "r_grey65": "#A6A6A6",
  "r_grey66": "#A8A8A8",
  "r_grey67": "#ABABAB",
  "r_grey68": "#ADADAD",
  "r_grey69": "#B0B0B0",
  "r_grey70": "#B3B3B3",
  "r_grey71": "#B5B5B5",
  "r_grey72": "#B8B8B8",
  "r_grey73": "#BABABA",
  "r_grey74": "#BDBDBD",
  "r_grey75": "#BFBFBF",
  "r_grey76": "#C2C2C2",
  "r_grey77": "#C4C4C4",
  "r_grey78": "#C7C7C7",
  "r_grey79": "#C9C9C9",
  "r_grey80": "#CCCCCC",
  "r_grey81": "#CFCFCF",
  "r_grey82": "#D1D1D1",
  "r_grey83": "#D4D4D4",
  "r_grey84": "#D6D6D6",
  "r_grey85": "#D9D9D9",
  "r_grey86": "#DBDBDB",
  "r_grey87": "#DEDEDE",
  "r_grey88": "#E0E0E0",
  "r_grey89": "#E3E3E3",
  "r_grey90": "#E5E5E5",
  "r_grey91": "#E8E8E8",
  "r_grey92": "#EBEBEB",
  "r_grey93": "#EDEDED",
  "r_grey94": "#F0F0F0",
  "r_grey95": "#F2F2F2",
  "r_grey96": "#F5F5F5",
  "r_grey97": "#F7F7F7",
  "r_grey98": "#FAFAFA",
  "r_grey99": "#FCFCFC",
  "r_grey100": "#FFFFFF",
  "r_honeydew": "#F0FFF0",
  "r_honeydew1": "#F0FFF0",
  "r_honeydew2": "#E0EEE0",
  "r_honeydew3": "#C1CDC1",
  "r_honeydew4": "#838B83",
  "r_hotpink": "#FF69B4",
  "r_hotpink1": "#FF6EB4",
  "r_hotpink2": "#EE6AA7",
  "r_hotpink3": "#CD6090",
  "r_hotpink4": "#8B3A62",
  "r_indianred": "#CD5C5C",
  "r_indianred1": "#FF6A6A",
  "r_indianred2": "#EE6363",
  "r_indianred3": "#CD5555",
  "r_indianred4": "#8B3A3A",
  "r_ivory": "#FFFFF0",
  "r_ivory1": "#FFFFF0",
  "r_ivory2": "#EEEEE0",
  "r_ivory3": "#CDCDC1",
  "r_ivory4": "#8B8B83",
  "r_khaki": "#F0E68C",
  "r_khaki1": "#FFF68F",
  "r_khaki2": "#EEE685",
  "r_khaki3": "#CDC673",
  "r_khaki4": "#8B864E",
  "r_lavender": "#E6E6FA",
  "r_lavenderblush": "#FFF0F5",
  "r_lavenderblush1": "#FFF0F5",
  "r_lavenderblush2": "#EEE0E5",
  "r_lavenderblush3": "#CDC1C5",
  "r_lavenderblush4": "#8B8386",
  "r_lawngreen": "#7CFC00",
  "r_lemonchiffon": "#FFFACD",
  "r_lemonchiffon1": "#FFFACD",
  "r_lemonchiffon2": "#EEE9BF",
  "r_lemonchiffon3": "#CDC9A5",
  "r_lemonchiffon4": "#8B8970",
  "r_lightblue": "#ADD8E6",
  "r_lightblue1": "#BFEFFF",
  "r_lightblue2": "#B2DFEE",
  "r_lightblue3": "#9AC0CD",
  "r_lightblue4": "#68838B",
  "r_lightcoral": "#F08080",
  "r_lightcyan": "#E0FFFF",
  "r_lightcyan1": "#E0FFFF",
  "r_lightcyan2": "#D1EEEE",
  "r_lightcyan3": "#B4CDCD",
  "r_lightcyan4": "#7A8B8B",
  "r_lightgoldenrod": "#EEDD82",
  "r_lightgoldenrod1": "#FFEC8B",
  "r_lightgoldenrod2": "#EEDC82",
  "r_lightgoldenrod3": "#CDBE70",
  "r_lightgoldenrod4": "#8B814C",
  "r_lightgoldenrodyellow": "#FAFAD2",
  "r_lightgray": "#D3D3D3",
  "r_lightgreen": "#90EE90",
  "r_lightgrey": "#D3D3D3",
  "r_lightpink": "#FFB6C1",
  "r_lightpink1": "#FFAEB9",
  "r_lightpink2": "#EEA2AD",
  "r_lightpink3": "#CD8C95",
  "r_lightpink4": "#8B5F65",
  "r_lightsalmon": "#FFA07A",
  "r_lightsalmon1": "#FFA07A",
  "r_lightsalmon2": "#EE9572",
  "r_lightsalmon3": "#CD8162",
  "r_lightsalmon4": "#8B5742",
  "r_lightseagreen": "#20B2AA",
  "r_lightskyblue": "#87CEFA",
  "r_lightskyblue1": "#B0E2FF",
  "r_lightskyblue2": "#A4D3EE",
  "r_lightskyblue3": "#8DB6CD",
  "r_lightskyblue4": "#607B8B",
  "r_lightslateblue": "#8470FF",
  "r_lightslategray": "#778899",
  "r_lightslategrey": "#778899",
  "r_lightsteelblue": "#B0C4DE",
  "r_lightsteelblue1": "#CAE1FF",
  "r_lightsteelblue2": "#BCD2EE",
  "r_lightsteelblue3": "#A2B5CD",
  "r_lightsteelblue4": "#6E7B8B",
  "r_lightyellow": "#FFFFE0",
  "r_lightyellow1": "#FFFFE0",
  "r_lightyellow2": "#EEEED1",
  "r_lightyellow3": "#CDCDB4",
  "r_lightyellow4": "#8B8B7A",
  "r_limegreen": "#32CD32",
  "r_linen": "#FAF0E6",
  "r_magenta": "#FF00FF",
  "r_magenta1": "#FF00FF",
  "r_magenta2": "#EE00EE",
  "r_magenta3": "#CD00CD",
  "r_magenta4": "#8B008B",
  "r_maroon": "#B03060",
  "r_maroon1": "#FF34B3",
  "r_maroon2": "#EE30A7",
  "r_maroon3": "#CD2990",
  "r_maroon4": "#8B1C62",
  "r_mediumaquamarine": "#66CDAA",
  "r_mediumblue": "#0000CD",
  "r_mediumorchid": "#BA55D3",
  "r_mediumorchid1": "#E066FF",
  "r_mediumorchid2": "#D15FEE",
  "r_mediumorchid3": "#B452CD",
  "r_mediumorchid4": "#7A378B",
  "r_mediumpurple": "#9370DB",
  "r_mediumpurple1": "#AB82FF",
  "r_mediumpurple2": "#9F79EE",
  "r_mediumpurple3": "#8968CD",
  "r_mediumpurple4": "#5D478B",
  "r_mediumseagreen": "#3CB371",
  "r_mediumslateblue": "#7B68EE",
  "r_mediumspringgreen": "#00FA9A",
  "r_mediumturquoise": "#48D1CC",
  "r_mediumvioletred": "#C71585",
  "r_midnightblue": "#191970",
  "r_mintcream": "#F5FFFA",
  "r_mistyrose": "#FFE4E1",
  "r_mistyrose1": "#FFE4E1",
  "r_mistyrose2": "#EED5D2",
  "r_mistyrose3": "#CDB7B5",
  "r_mistyrose4": "#8B7D7B",
  "r_moccasin": "#FFE4B5",
  "r_navajowhite": "#FFDEAD",
  "r_navajowhite1": "#FFDEAD",
  "r_navajowhite2": "#EECFA1",
  "r_navajowhite3": "#CDB38B",
  "r_navajowhite4": "#8B795E",
  "r_navy": "#000080",
  "r_navyblue": "#000080",
  "r_oldlace": "#FDF5E6",
  "r_olivedrab": "#6B8E23",
  "r_olivedrab1": "#C0FF3E",
  "r_olivedrab2": "#B3EE3A",
  "r_olivedrab3": "#9ACD32",
  "r_olivedrab4": "#698B22",
  "r_orange": "#FFA500",
  "r_orange1": "#FFA500",
  "r_orange2": "#EE9A00",
  "r_orange3": "#CD8500",
  "r_orange4": "#8B5A00",
  "r_orangered": "#FF4500",
  "r_orangered1": "#FF4500",
  "r_orangered2": "#EE4000",
  "r_orangered3": "#CD3700",
  "r_orangered4": "#8B2500",
  "r_orchid": "#DA70D6",
  "r_orchid1": "#FF83FA",
  "r_orchid2": "#EE7AE9",
  "r_orchid3": "#CD69C9",
  "r_orchid4": "#8B4789",
  "r_palegoldenrod": "#EEE8AA",
  "r_palegreen": "#98FB98",
  "r_palegreen1": "#9AFF9A",
  "r_palegreen2": "#90EE90",
  "r_palegreen3": "#7CCD7C",
  "r_palegreen4": "#548B54",
  "r_paleturquoise": "#AFEEEE",
  "r_paleturquoise1": "#BBFFFF",
  "r_paleturquoise2": "#AEEEEE",
  "r_paleturquoise3": "#96CDCD",
  "r_paleturquoise4": "#668B8B",
  "r_palevioletred": "#DB7093",
  "r_palevioletred1": "#FF82AB",
  "r_palevioletred2": "#EE799F",
  "r_palevioletred3": "#CD6889",
  "r_palevioletred4": "#8B475D",
  "r_papayawhip": "#FFEFD5",
  "r_peachpuff": "#FFDAB9",
  "r_peachpuff1": "#FFDAB9",
  "r_peachpuff2": "#EECBAD",
  "r_peachpuff3": "#CDAF95",
  "r_peachpuff4": "#8B7765",
  "r_peru": "#CD853F",
  "r_pink": "#FFC0CB",
  "r_pink1": "#FFB5C5",
  "r_pink2": "#EEA9B8",
  "r_pink3": "#CD919E",
  "r_pink4": "#8B636C",
  "r_plum": "#DDA0DD",
  "r_plum1": "#FFBBFF",
  "r_plum2": "#EEAEEE",
  "r_plum3": "#CD96CD",
  "r_plum4": "#8B668B",
  "r_powderblue": "#B0E0E6",
  "r_purple": "#A020F0",
  "r_purple1": "#9B30FF",
  "r_purple2": "#912CEE",
  "r_purple3": "#7D26CD",
  "r_purple4": "#551A8B",
  "r_red": "#FF0000",
  "r_red1": "#FF0000",
  "r_red2": "#EE0000",
  "r_red3": "#CD0000",
  "r_red4": "#8B0000",
  "r_rosybrown": "#BC8F8F",
  "r_rosybrown1": "#FFC1C1",
  "r_rosybrown2": "#EEB4B4",
  "r_rosybrown3": "#CD9B9B",
  "r_rosybrown4": "#8B6969",
  "r_royalblue": "#4169E1",
  "r_royalblue1": "#4876FF",
  "r_royalblue2": "#436EEE",
  "r_royalblue3": "#3A5FCD",
  "r_royalblue4": "#27408B",
  "r_saddlebrown": "#8B4513",
  "r_salmon": "#FA8072",
  "r_salmon1": "#FF8C69",
  "r_salmon2": "#EE8262",
  "r_salmon3": "#CD7054",
  "r_salmon4": "#8B4C39",
  "r_sandybrown": "#F4A460",
  "r_seagreen": "#2E8B57",
  "r_seagreen1": "#54FF9F",
  "r_seagreen2": "#4EEE94",
  "r_seagreen3": "#43CD80",
  "r_seagreen4": "#2E8B57",
  "r_seashell": "#FFF5EE",
  "r_seashell1": "#FFF5EE",
  "r_seashell2": "#EEE5DE",
  "r_seashell3": "#CDC5BF",
  "r_seashell4": "#8B8682",
  "r_sienna": "#A0522D",
  "r_sienna1": "#FF8247",
  "r_sienna2": "#EE7942",
  "r_sienna3": "#CD6839",
  "r_sienna4": "#8B4726",
  "r_skyblue": "#87CEEB",
  "r_skyblue1": "#87CEFF",
  "r_skyblue2": "#7EC0EE",
  "r_skyblue3": "#6CA6CD",
  "r_skyblue4": "#4A708B",
  "r_slateblue": "#6A5ACD",
  "r_slateblue1": "#836FFF",
  "r_slateblue2": "#7A67EE",
  "r_slateblue3": "#6959CD",
  "r_slateblue4": "#473C8B",
  "r_slategray": "#708090",
  "r_slategray1": "#C6E2FF",
  "r_slategray2": "#B9D3EE",
  "r_slategray3": "#9FB6CD",
  "r_slategray4": "#6C7B8B",
  "r_slategrey": "#708090",
  "r_snow": "#FFFAFA",
  "r_snow1": "#FFFAFA",
  "r_snow2": "#EEE9E9",
  "r_snow3": "#CDC9C9",
  "r_snow4": "#8B8989",
  "r_springgreen": "#00FF7F",
  "r_springgreen1": "#00FF7F",
  "r_springgreen2": "#00EE76",
  "r_springgreen3": "#00CD66",
  "r_springgreen4": "#008B45",
  "r_steelblue": "#4682B4",
  "r_steelblue1": "#63B8FF",
  "r_steelblue2": "#5CACEE",
  "r_steelblue3": "#4F94CD",
  "r_steelblue4": "#36648B",
  "r_tan": "#D2B48C",
  "r_tan1": "#FFA54F",
  "r_tan2": "#EE9A49",
  "r_tan3": "#CD853F",
  "r_tan4": "#8B5A2B",
  "r_thistle": "#D8BFD8",
  "r_thistle1": "#FFE1FF",
  "r_thistle2": "#EED2EE",
  "r_thistle3": "#CDB5CD",
  "r_thistle4": "#8B7B8B",
  "r_tomato": "#FF6347",
  "r_tomato1": "#FF6347",
  "r_tomato2": "#EE5C42",
  "r_tomato3": "#CD4F39",
  "r_tomato4": "#8B3626",
  "r_turquoise": "#40E0D0",
  "r_turquoise1": "#00F5FF",
  "r_turquoise2": "#00E5EE",
  "r_turquoise3": "#00C5CD",
  "r_turquoise4": "#00868B",
  "r_violet": "#EE82EE",
  "r_violetred": "#D02090",
  "r_violetred1": "#FF3E96",
  "r_violetred2": "#EE3A8C",
  "r_violetred3": "#CD3278",
  "r_violetred4": "#8B2252",
  "r_wheat": "#F5DEB3",
  "r_wheat1": "#FFE7BA",
  "r_wheat2": "#EED8AE",
  "r_wheat3": "#CDBA96",
  "r_wheat4": "#8B7E66",
  "r_whitesmoke": "#F5F5F5",
  "r_yellow": "#FFFF00",
  "r_yellow1": "#FFFF00",
  "r_yellow2": "#EEEE00",
  "r_yellow3": "#CDCD00",
  "r_yellow4": "#8B8B00",
  "r_yellowgreen": "#9ACD32",

  // These are the html colors
  "black": "#000000",
  "navy": "#000080",
  "darkblue": "#00008b",
  "mediumblue": "#0000cd",
  "blue": "#0000ff",
  "darkgreen": "#006400",
  "green": "#008000",
  "teal": "#008080",
  "darkcyan": "#008b8b",
  "deepskyblue": "#00bfff",
  "darkturquoise": "#00ced1",
  "mediumspringgreen": "#00fa9a",
  "lime": "#00ff00",
  "springgreen": "#00ff7f",
  "aqua": "#00ffff",
  "cyan": "#00ffff",
  "midnightblue": "#191970",
  "dodgerblue": "#1e90ff",
  "lightseagreen": "#20b2aa",
  "forestgreen": "#228b22",
  "seagreen": "#2e8b57",
  "darkslategray": "#2f4f4f",
  "darkslategrey": "#2f4f4f",
  "limegreen": "#32cd32",
  "mediumseagreen": "#3cb371",
  "turquoise": "#40e0d0",
  "royalblue": "#4169e1",
  "steelblue": "#4682b4",
  "darkslateblue": "#483d8b",
  "mediumturquoise": "#48d1cc",
  "indigo": "#4b0082",
  "darkolivegreen": "#556b2f",
  "cadetblue": "#5f9ea0",
  "cornflowerblue": "#6495ed",
  "rebeccapurple": "#663399",
  "mediumaquamarine": "#66cdaa",
  "dimgray": "#696969",
  "dimgrey": "#696969",
  "slateblue": "#6a5acd",
  "olivedrab": "#6b8e23",
  "slategray": "#708090",
  "slategrey": "#708090",
  "lightslategray": "#778899",
  "lightslategrey": "#778899",
  "mediumslateblue": "#7b68ee",
  "lawngreen": "#7cfc00",
  "chartreuse": "#7fff00",
  "aquamarine": "#7fffd4",
  "maroon": "#800000",
  "purple": "#800080",
  "olive": "#808000",
  "gray": "#808080",
  "grey": "#808080",
  "skyblue": "#87ceeb",
  "lightskyblue": "#87cefa",
  "blueviolet": "#8a2be2",
  "darkred": "#8b0000",
  "darkmagenta": "#8b008b",
  "saddlebrown": "#8b4513",
  "darkseagreen": "#8fbc8f",
  "lightgreen": "#90ee90",
  "mediumpurple": "#9370db",
  "darkviolet": "#9400d3",
  "palegreen": "#98fb98",
  "darkorchid": "#9932cc",
  "yellowgreen": "#9acd32",
  "sienna": "#a0522d",
  "brown": "#a52a2a",
  "darkgray": "#a9a9a9",
  "darkgrey": "#a9a9a9",
  "lightblue": "#add8e6",
  "greenyellow": "#adff2f",
  "paleturquoise": "#afeeee",
  "lightsteelblue": "#b0c4de",
  "powderblue": "#b0e0e6",
  "firebrick": "#b22222",
  "darkgoldenrod": "#b8860b",
  "mediumorchid": "#ba55d3",
  "rosybrown": "#bc8f8f",
  "darkkhaki": "#bdb76b",
  "silver": "#c0c0c0",
  "mediumvioletred": "#c71585",
  "indianred": "#cd5c5c",
  "peru": "#cd853f",
  "chocolate": "#d2691e",
  "tan": "#d2b48c",
  "lightgray": "#d3d3d3",
  "lightgrey": "#d3d3d3",
  "thistle": "#d8bfd8",
  "orchid": "#da70d6",
  "goldenrod": "#daa520",
  "palevioletred": "#db7093",
  "crimson": "#dc143c",
  "gainsboro": "#dcdcdc",
  "plum": "#dda0dd",
  "burlywood": "#deb887",
  "lightcyan": "#e0ffff",
  "lavender": "#e6e6fa",
  "darksalmon": "#e9967a",
  "violet": "#ee82ee",
  "palegoldenrod": "#eee8aa",
  "lightcoral": "#f08080",
  "khaki": "#f0e68c",
  "aliceblue": "#f0f8ff",
  "honeydew": "#f0fff0",
  "azure": "#f0ffff",
  "sandybrown": "#f4a460",
  "wheat": "#f5deb3",
  "beige": "#f5f5dc",
  "whitesmoke": "#f5f5f5",
  "mintcream": "#f5fffa",
  "ghostwhite": "#f8f8ff",
  "salmon": "#fa8072",
  "antiquewhite": "#faebd7",
  "linen": "#faf0e6",
  "lightgoldenrodyellow": "#fafad2",
  "oldlace": "#fdf5e6",
  "red": "#ff0000",
  "fuchsia": "#ff00ff",
  "magenta": "#ff00ff",
  "deeppink": "#ff1493",
  "orangered": "#ff4500",
  "tomato": "#ff6347",
  "hotpink": "#ff69b4",
  "coral": "#ff7f50",
  "darkorange": "#ff8c00",
  "lightsalmon": "#ffa07a",
  "orange": "#ffa500",
  "lightpink": "#ffb6c1",
  "pink": "#ffc0cb",
  "gold": "#ffd700",
  "peachpuff": "#ffdab9",
  "navajowhite": "#ffdead",
  "moccasin": "#ffe4b5",
  "bisque": "#ffe4c4",
  "mistyrose": "#ffe4e1",
  "blanchedalmond": "#ffebcd",
  "papayawhip": "#ffefd5",
  "lavenderblush": "#fff0f5",
  "seashell": "#fff5ee",
  "cornsilk": "#fff8dc",
  "lemonchiffon": "#fffacd",
  "floralwhite": "#fffaf0",
  "snow": "#fffafa",
  "yellow": "#ffff00",
  "lightyellow": "#ffffe0",
  "ivory": "#fffff0",
  "white": "#ffffff"
};

// Add one to account for the name column.
var MAX_NUM_COLS = LEAF_DOT_OPTIONS.length + LEAF_LABEL_OPTIONS.length + BRANCH_OPTIONS.length + 1;

// From tested parse functions
function push_unless_present(ary, item)
{
  if (ary.indexOf(item) === -1) {
    ary.push(item);
  }
}
function has_duplicates(ary)
{
  var tmp = [];
  ary.forEach(function(item) {
    push_unless_present(tmp, item);
  });

  return tmp.length !== ary.length;
}

function chomp(str)
{
  return str.replace(/\r?\n?$/, '');
}

// fn is a function that takes two arguments: 1. the json key, and 2. the json value for that key.
function json_each(json, fn)
{
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      fn(key, json[key]);
    }
  }
}

function json_keys(json)
{
  var keys = [];
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      keys.push(key);
    }
  }

  return keys;
}

function includes(ary, elem)
{
  return ary.indexOf(elem) !== -1;
}

function is_bad_col_header(str)
{
  return str !== "name" &&
    !(includes(LEAF_DOT_OPTIONS, str) ||
      includes(LEAF_LABEL_OPTIONS, str) ||
      includes(BRANCH_OPTIONS, str))
}

function parse_mapping_file(str)
{
  // Strip spaces from the start and end of all tokens.
  var stripped_str = str
    .replace(/\r?\n/g, "\n") // First make all newlines \n
    .replace(/^ +/g, "") // Then remove spaces at the front
    .replace(/\n +/g, "\n") // Spaces that follow a newline
    .replace(/ +\n/g, "\n") // Spaces right before a newline
    .replace(/\t +| +\t/g, "\t"); // Spaces just before and just after a \t

  // To hold messages about bad colors in the mapping file.
  var bad_color_errors = [];
  

  // Parse mapping string.
  var mapping_csv = Papa.parse(chomp(stripped_str), PAPA_CONFIG);

  // Check for erros
  if (has_papa_errors(mapping_csv)) {
    return null;
  }

  if (mapping_csv.meta.fields.indexOf("name") === -1) {
    alert("ERROR -- Missing the 'name' column header in the mapping file.");
    return null;
  }

  var bad_headers = mapping_csv.meta.fields.filter(function(header) {
    return is_bad_col_header(header);
  });

  if (bad_headers.length > 0) {
    alert("ERROR -- bad headers in mapping file: " + bad_headers.join(", "));
    return null;
  }

  var num_fields = mapping_csv.meta.fields.length;
  if (num_fields <= 1) {
    alert("ERROR -- Too few fields in mapping file!");
    return null;
  }

  if (num_fields > MAX_NUM_COLS) {
    alert("ERROR -- Too many fields in mapping file!");
    return null;
  }

  if (has_duplicates(mapping_csv.meta.fields)) {
    alert("ERROR -- One of the column headers is duplicated in the mapping file.");
    return null;
  }

  // Convert to name2md.
  var mapping = {};
  var mapping_duplicates = [];

  // Check for duplicated keys in the mapping file.
  mapping_csv.data.forEach(function(info) {
    if (mapping[info.name]) {
      alert("ERROR -- " + info.name + " is duplicated in the mapping file");

      mapping_duplicates.push(info.name);
    } else {
      mapping[info.name] = {};
    }
  });

  if (mapping_duplicates.length > 0) { // there were duplicated keys in the mapping file
    // TODO raise error?
    return null;
  }

  mapping_csv.data.forEach(function(info) {
    json_each(info, function(md_cat, val) {

      if (md_cat !== "name") {
        mapping[info.name][md_cat] = val;
      }
    });
  });

  // Check for valid named colors.
  var color_options = ["leaf_dot_color", "leaf_label_color", "branch_color"];
  json_each(mapping, function(name, md){
    color_options.forEach(function(option){
      if (md[option]) { // color option is present
        // Check that it is valid
        var color_val;
        color_val = md[option];

        // Since Kelly colors can be numbers 1-19, need to convert them.
        if ((typeof color_val) === "string") {
          color_val = color_val.toLowerCase();
        } else {
          color_val = color_val.toString();
        }

        // First check that it is not a hex code.
        if (!is_hex(color_val)) {
          if (valid_colors[color_val]) {
            // Replace it with the hexcode. TODO if the casing is wrong in user input will the browser care?
            md[option] = valid_colors[color_val];
          } else if (is_hex("#" + color_val)) {
            // It is a hex code but just missing the first # symbol, so pass it in with the # appended to the front.

            md[option] = ("#" + color_val);
          } else {
            bad_color_errors.push("WARNING -- there was an invalid color name in the mapping file: '" + color_val + "'.  The default color will be used instead.")

            // Set the color to the default color.
            md[option] = valid_colors["black"];
          }
        }
      }
    });
  });

  if (bad_color_errors.length > 0) {
    alert(bad_color_errors.join("\n"));
  }

  return mapping;
}

// Also returns the hex code
function is_hex(str)
{
  return str.match(/^#[0-9A-Fa-f]{6}$/);
}

// This should only be able to happen when it is not exact matching.
function has_non_specific_matching(root, name2md)
{
  var names_with_md = json_keys(name2md);
  var leaf_matches = {};
  root.leaves().forEach(function(leaf) {
    var leaf_name = leaf.data.name;

    // This assumes that the leaf names are unique.
    names_with_md.forEach(function(name_with_md) {
      if (leaf_name.indexOf(name_with_md) !== -1) { //match!
        if (leaf_matches[leaf_name]) {
          // Sometimes, if you have duplicate leaf names, you will match the exact same name_with_md multiple times and trigger a false positive on the error below.
          if (leaf_matches[leaf_name].indexOf(name_with_md) === -1) {
            leaf_matches[leaf_name].push(name_with_md);
          }
        } else {
          leaf_matches[leaf_name] = [name_with_md];
        }
      }
    });
  });


  var non_specific_matches = false;
  var error_string = "ERROR -- there were non-specific matches in the mapping fle.  ";
  json_each(leaf_matches, function(name, matches) {
    if (matches.length > 1) { // non specific matching
      error_string += name + " matched with: " + matches.join(', ') + ".  \n";
      // alert("ERROR -- '" + name + "' had multiple matches in the mapping file: '" + matches.join(', ') + "'.");
      non_specific_matches = true;
    }
  });
  
  if (non_specific_matches) {
    alert(error_string);
  }

  return non_specific_matches;
}

function has_papa_errors(name2md)
{
  if (name2md.errors.length > 0) {
    name2md.errors.forEach(function(error) {
      // TODO better alert
      alert("ERROR -- Parsing error on line " + (error.row + 2) + "!  Type -- " + error.type + ".  Code -- " + error.code + ".  Message -- " + error.message + ".");
    });

    return true;
  } else {
    return false;
  }
}


// TODO move to a ultils.js script.
function min_non_zero_len_in_tree(root)
{
  var min_length = undefined;
  root.descendants().map(function(d) {
    if ((min_length === undefined || d.data.length < min_length) && d.data.length !== 0) {
      min_length = d.data.length;
    }
  });

  return min_length;
}

// The tree file ends in a ';' so if you split on it and get more than one thing, you may have more than one tree.
function has_multiple_trees(tree_str)
{
  var splits = chomp(tree_str).split(";").filter(function(s) { return s; });

  return splits.length > 1;
}

function is_bad_newick(tree_str)
{
  var str_len = chomp(tree_str).length;

  var first_char = tree_str[0];
  var last_char = tree_str[str_len - 1];

  return !(first_char === "(" && last_char === ";");
}



// TODO move this to a utils file.
function leaf_names(tree)
{
  var names = [];
  function get_names(branchset)
  {
    branchset.forEach(function (set) {
      if (set.branchset) {
        // Not at a leaf yet, recurse
        get_names(set.branchset);
      } else {
        // it's a leaf, get the name
        names.push(set.name);
      }
    });
  }

  var branchset = tree.branchset;
  get_names(branchset);

  return names;
}

// Takes array of strings, returns false if no duplicates, array of duplicates otherwise.
function has_duplicate_strings(ary)
{
  var obj = {};
  var duplicates = {}; // track them for the error message.
  ary.forEach(function(str) {
    if (obj[str]) {
      if (duplicates[str]) {
        duplicates[str] += 1;
      } else {
        duplicates[str] = 2; // the second time we've seen it
      }
    }
    obj[str] = true;
  });

  if (json_keys(obj).length === ary.length) {
    return false
  } else {
    return duplicates;
  }
}