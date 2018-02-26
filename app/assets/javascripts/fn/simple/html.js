fn.html.tag = function (tag, str, attr) {
  if (attr !== undefined) {
    return "<" + tag + " " + attr + ">" + str + "</" + tag + ">";
  }
  else {
    return "<" + tag + ">" + str + "</" + tag + ">";
  }
};
