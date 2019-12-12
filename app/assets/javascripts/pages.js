/*
  # Place all the behaviors and hooks related to the matching controller here.
  # All this logic will automatically be available in application.js.
  # You can use CoffeeScript in this file: http://coffeescript.org/
*/

var mouseout_shadow_color = "rgba(0,0,0,0.25)";
var mouseover_shadow_color = "rgba(0,0,0,0.5)";

var wiki_splash_button_shadow = "wiki-splash-button-shadow";
var viewer_splash_button_shadow = "viewer-splash-button-shadow";
var cite_splash_button_shadow = "cite-splash-button-shadow";

var wiki_splash_button_box = "wiki-splash-button-box";
var viewer_splash_button_box = "viewer-splash-button-box";
var cite_splash_button_box = "cite-splash-button-box";

var mouseover_box_color = "#cde3f8"; // that's 10% lighter as SCSS would lighten it.
var mouseout_box_color = "#A1CAF1";

// TODO technically there is an extra mouseout when you roll over the
// letters.  You don't notics it but it would be nice to fix it.
//
// This makes the shadow a little more solid when the user mouses over
// the buttons.
$(document).on('ready', function() {
  $("#wiki-splash-button").mouseover(function () {
    $("#" + wiki_splash_button_shadow).attr("fill", mouseover_shadow_color);
    $("#" + wiki_splash_button_box).attr("fill", mouseover_box_color);
  });

  $("#wiki-splash-button").mouseout(function () {
    $("#" + wiki_splash_button_shadow).attr("fill", mouseout_shadow_color);
    $("#" + wiki_splash_button_box).attr("fill", mouseout_box_color);
  });

  $("#viewer-splash-button").mouseover(function () {
    $("#" + viewer_splash_button_shadow).attr("fill", mouseover_shadow_color);
    $("#" + viewer_splash_button_box).attr("fill", mouseover_box_color);
  });

  $("#viewer-splash-button").mouseout(function () {
    $("#" + viewer_splash_button_shadow).attr("fill", mouseout_shadow_color);
    $("#" + viewer_splash_button_box).attr("fill", mouseout_box_color);
  });

  $("#cite-splash-button").mouseover(function () {
    $("#" + cite_splash_button_shadow).attr("fill", mouseover_shadow_color);
    $("#" + cite_splash_button_box).attr("fill", mouseover_box_color);
  });

  $("#cite-splash-button").mouseout(function () {
    $("#" + cite_splash_button_shadow).attr("fill", mouseout_shadow_color);
    $("#" + cite_splash_button_box).attr("fill", mouseout_box_color);
  });
});
