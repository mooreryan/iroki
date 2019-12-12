/*
  # Place all the behaviors and hooks related to the matching controller here.
  # All this logic will automatically be available in application.js.
  # You can use CoffeeScript in this file: http://coffeescript.org/
*/

var mouseout_shadow_color = "rgba(0,0,0,0.25)";
var mouseover_shadow_color = "rgba(0,0,0,0.5)";
var spash_wiki_button_shadow = "splash-wiki-button-shadow";
var spash_viewer_button_shadow = "splash-viewer-button-shadow";
var spash_wiki_button_box = "splash-wiki-button-box";
var spash_viewer_button_box = "splash-viewer-button-box";

var mouseover_box_color = "#cde3f8"; // that's 10% lighter as SCSS would lighten it.
var mouseout_box_color = "#A1CAF1";

// TODO technically there is an extra mouseout when you roll over the
// letters.  You don't notics it but it would be nice to fix it.
//
// This makes the shadow a little more solid when the user mouses over
// the buttons.
$(document).on('ready', function() {
  $("#splash-wiki-button").mouseover(function () {
    $("#" + spash_wiki_button_shadow).attr("fill", mouseover_shadow_color);
    $("#" + spash_wiki_button_box).attr("fill", mouseover_box_color);
  });

  $("#splash-wiki-button").mouseout(function () {
    $("#" + spash_wiki_button_shadow).attr("fill", mouseout_shadow_color);
    $("#" + spash_wiki_button_box).attr("fill", mouseout_box_color);
  });

  $("#splash-viewer-button").mouseover(function () {
    $("#" + spash_viewer_button_shadow).attr("fill", mouseover_shadow_color);
    $("#" + spash_viewer_button_box).attr("fill", mouseover_box_color);
  });

  $("#splash-viewer-button").mouseout(function () {
    $("#" + spash_viewer_button_shadow).attr("fill", mouseout_shadow_color);
    $("#" + spash_viewer_button_box).attr("fill", mouseout_box_color);
  });
});
