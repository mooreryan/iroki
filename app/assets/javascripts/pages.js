/*
# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
*/

$(document).ready(function () {
    $("#min_lumin").change(function () {
        var min_val = parseInt($('#min_lumin').val(), 10);
        var max_val = parseInt($("#max_lumin").val(), 10);
        var new_val = (min_val + 1).toString();

        if (min_val > max_val) {
            var num_opts = $("#max_lumin option").length;
            var selected = $("#max_lumin option:selected")[0];
            var selected_val = selected.value;
            selected.removeAttribute("selected");

            var idx = 0;
            if (min_val == num_opts) {
                idx = min_val - 1;
            } else {
                idx = min_val;
            }
            document.getElementById("max_lumin")[idx].setAttribute("selected", "selected");
        }
    });
});

$(document).ready(function () {
    $("#max_lumin").change(function () {
        var min_val = parseInt($('#min_lumin').val(), 10);
        var max_val = parseInt($("#max_lumin").val(), 10);
        var new_val = (min_val + 1).toString();

        if (min_val > max_val) {
            var num_opts = $("#min_lumin option").length;
            var selected = $("#min_lumin option:selected")[0];
            var selected_val = selected.value;
            selected.removeAttribute("selected");

            var idx = 0;
            if (max_val == 1) {
                idx = max_val - 1;
            } else {
                idx = max_val - 2;
            }
            document.getElementById("min_lumin")[idx].setAttribute("selected", "selected");
        }
    });
});
/*
$(document).ready(function() {
    $("#max_lumin").change(function () {
        var min_val = parseInt($('#min_lumin').val(), 10);
        var max_val = parseInt($("#max_lumin").val(), 10);
        var new_val = (max_val - 1).toString();

        $("#max_lumin_val").html(max_val);

        if (min_val > max_val) {
            console.log("hey");
            var old_slider = $("#min_lumin").clone();
            $("#min_lumin").remove();

            old_slider.appendTo("#max_lumin_container");
            document.getElementById("min_lumin").setAttribute("value", new_val);

            $("#min_lumin_val").html(new_val);
        }
    });
});*/



// Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js
function parseNewick(a){for(var e=[],r={},s=a.split(/\s*(;|\(|\)|,|:)\s*/),t=0;t<s.length;t++){var n=s[t];switch(n){case"(":var c={};r.branchset=[c],e.push(r),r=c;break;case",":var c={};e[e.length-1].branchset.push(c),r=c;break;case")":r=e.pop();break;case":":break;default:var h=s[t-1];")"==h||"("==h||","==h?r.name=n:":"==h&&(r.length=parseFloat(n))}}return r}









