fn.palette = {};

/**
 * Draw the palette as a Canvas.
 *
 * @param data
 */
fn.palette.draw2 = function (data) {
  var chart = d3.select("#apple");

  var context  = chart.node().getContext("2d");
  var data_min = fn.ary.min(data);
  var data_max = fn.ary.max(data);

  var left_offset = 10;

  var scale = function (val) {
    return fn.math.scale(val, data_min, data_max, left_offset, 790);
  };

  var bg_height   = 50;
  var total_width = 790;
  var steps       = 200;

  // With the rounding, if you have enough steps you can exceed the width on the right hand side.
  var bg_width = fn.math.round(total_width / steps, 0);

  console.log(bg_width);

  var color_scale = chroma.scale("Spectral");


  fn.ary.range(steps).map(function (idx) {
    var start = fn.math.round(bg_width * idx + left_offset, 0);
    var min   = left_offset;
    var max   = bg_width * (steps - 1) + left_offset;

    var scaled_start = fn.math.scale(start, min, max, 0, 1);


    console.log("width: " + bg_width + ", start: " + start + ", scaled start: " + scaled_start + ", color: " + color_scale(scaled_start).hex());

    context.beginPath();
    context.rect(start, 50, bg_width / 1, bg_height);
    context.fillStyle = color_scale(scaled_start).hex();
    context.fill();
    context.closePath();
  });

  var func = function (datum, idx) {
    function x_val(idx) {
      if (idx === 0) {
        var val = scale(datum);
      }
      else if (idx === data.length - 1) {
        console.log("hey");
        var val = scale(datum) + bg_width + left_offset + mark_width;
      }
      else {
        var val = scale(datum) - (mark_width / 2);
      }

      console.log(scale(datum) + " " + val);
      return val;
    }

    var mark_width  = 3;
    var mark_height = bg_height / 7;

    context.beginPath();
    context.rect(x_val(idx), 50 + bg_height - mark_height, mark_width, mark_height);
    context.fillStyle = "black";
    context.fill();
    context.closePath();
  };

  data.forEach(func);
};


/**
 * Draw the palette as an SVG.
 *
 * @param data
 */
fn.palette.draw = function (params) {
  var chart_id    = params.chart_id || "#palette-preview";
  var color_scale = params.color_scale || chroma.scale("GnBu");
  var data        = params.data || [];
  var steps       = params.steps || 200;
  var names       = params.names || [];


  var chart_jq     = jq(chart_id);
  var chart_height = chart_jq.height();
  var chart_width  = chart_jq.width();

  // If you want more steps than pixels, switch it to the total number of pixels.
  steps = steps > chart_width ? chart_width : steps;

  var chart = d3.select("#" + chart_id);

  if (data.length > 0) {
    var data_min = fn.ary.min(data);
    var data_max = fn.ary.max(data);
  }

  // We take the floor to avoid those yucky no color lines.  But because of this, we need to make sure the gradient is centered in the svg area.
  if (chart_width % steps === 0) {
    // Divides evenly so there will be no padding.  Remove 1 pixel.  If it would be zero, bump it up to 1.
    var grad_rect_width = (chart_width / steps) - 1 || 1;
  }
  else {
    var grad_rect_width = Math.floor(chart_width / steps);
  }
  var grad_width = grad_rect_width * steps;

  var chart_width_padding_pixels = chart_width - grad_width;

  var grad_rect_height = chart_height / 2;
  var grad_rect_y      = grad_rect_height / 2;
  var total_width      = chart_width - chart_width_padding_pixels;

  // var scale = function (val) {
  //   return fn.math.scale(val, data_min, data_max, chart_width_padding_pixels, total_width);
  // };

  var grad_rect_min_x = (chart_width_padding_pixels / 2);
  var grad_rect_max_x = grad_rect_width * (steps - 1) + (chart_width_padding_pixels / 2);

  var whole_grad_min_x = grad_rect_min_x;
  var whole_grad_max_x = grad_rect_max_x + grad_rect_width;


  fn.ary.range(steps).map(function (idx) {
    var start = Math.floor(grad_rect_width * idx + (chart_width_padding_pixels / 2));

    var scaled_start = fn.math.scale(start, grad_rect_min_x, grad_rect_max_x, 0, 1);



    chart.append("rect")
         // If we are on the first rectangle, move it back 1 pixel to even it up as we add one pixel to each width.
         .attr("x", idx === 0 ? start - 1 : start)
         .attr("y", grad_rect_y)
         // Add one pixel to the width to avoid the little white overlap lines.  If it is the first one, add 2 pixels since we move the first one back one pixel.
         .attr("width", idx === 0 ? grad_rect_width + 2 : grad_rect_width + 1)
         .attr("height", grad_rect_height)
         .attr("fill", color_scale(scaled_start).hex());
  });

  var func = function (datum, idx) {
    var mark_width  = 2;
    var mark_height = grad_rect_height / 6;

    function x_val(idx) {
      var scaled_datum = fn.math.round(fn.math.scale(datum, data_min, data_max, whole_grad_min_x, whole_grad_max_x), 0);

      var start = null;
      if (idx === data.length - 1) {
        // The last element starts
        start = scaled_datum - mark_width;
      }
      else if (idx === 0) {
        // The first element
        start = scaled_datum;
      }
      else {
        start = scaled_datum - (mark_width / 2);
      }

      return start;
    }

    chart.append("rect")
         .attr("x", x_val(idx))
         .attr("y", grad_rect_y + grad_rect_height - (mark_height / 2))
         .attr("width", mark_width)
         .attr("height", mark_height)
         .attr("fill", "black");

    chart.append("text")
         .attr("x", x_val(idx))
         .attr("y", grad_rect_y + grad_rect_height + (mark_height) + 8)
         .attr("text-anchor", "middle")
         .style("font-size", "0.75em")
         .html(names[idx][0]); // just the first letter
  };

  if (data.length > 0) {
    data.forEach(func);
  }
};
