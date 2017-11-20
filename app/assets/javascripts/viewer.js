
// Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js
function parseNewick(a){for(var e=[],r={},s=a.split(/\s*(;|\(|\)|,|:)\s*/),t=0;t<s.length;t++){var n=s[t];switch(n){case"(":var c={};r.branchset=[c],e.push(r),r=c;break;case",":var c={};e[e.length-1].branchset.push(c),r=c;break;case")":r=e.pop();break;case":":break;default:var h=s[t-1];")"==h||"("==h||","==h?r.name=n:":"==h&&(r.length=parseFloat(n))}}return r}

// load dataset and create table
function load_dataset(file) {
    // Clear the current svg if it is there
    chart_elem = document.getElementById("svg-tree")
    if (chart_elem) {
        // d3.select("#apple-chart").transition().remove();
        chart_elem.parentNode.removeChild(chart_elem);
    }
    lalala(file);
}

// handle upload button
function upload_button(el, callback) {
    var uploader = document.getElementById(el);
    var reader = new FileReader();

    reader.onload = function(e) {
        var contents = e.target.result;
        callback(contents);
    };

    uploader.addEventListener("change", handleFiles, false);

    function handleFiles() {
        d3.select("#table").text("loading...");
        var file = this.files[0];
        reader.readAsText(file);
    };
};



// This deals with drawing the tree and handling user input for
// changing the tree.
function lalala(tree_input) {
    // SVG size
    var width = 500;
    var height = 500;

    // Leaf label size
    var leaf_label_size = 16

    var svg = d3.select("#tree-div")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "svg-tree")
        .style("background-color", "white");

    var chart = svg.append("g").attr("id", "apple-chart");
    //     .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    var cluster = d3.cluster() // this adds the x and y attrs
        .size([width-50, height-50]) // adjust the 360 if you want to have a partial circle
        .separation(function(a, b) { return 1; });

    // sliders
    var font_size_slider = document.getElementById("font-size-slider")
    var branch_width_slider = document.getElementById("branch-width-slider");

    // Defaults for up and down
    var the_x = "x";
    var the_y = "radius"; // document.getElementById("variable-length").checked ? "radius" : "y";
    var setRadius = set_radius_up_and_down;

    // Check default radio buttons
    var variable_length_button = document.getElementById("variable-length");
    var constant_length_button = document.getElementById("constant-length");
    variable_length_button.checked = true;

    var rectangle_type_button = document.getElementById("rectangle-type");
    var straight_type_button  = document.getElementById("straight-type");
    rectangle_type_button.checked = true;

    var show_labels_button = document.getElementById("show-labels");
    d3.select("input#show-labels").on("change", function() {
        if (show_labels_button.checked) {
            labels.attr("opacity", "1");
        } else {
            labels.attr("opacity", "0");
        }
    });

    var current_link_function = rectangle_link;

    // the size of the circle
    var outerRadius = 960 / 2,
        innerRadius = outerRadius - 170;

    var labels;
    var links;
    var circles;

    // Here is the actual tree making
    var root = d3.hierarchy(parseNewick(tree_input), function(d) { return d.branchset; })
    // // if it is a leave node, then it will have a node.value == 1
        .sum(function(d) { return d.branchset ? 0 : 1; })
        .sort(function(a, b) { return (a.value - b.value) || d3.ascending(a.data.length, b.data.length); });

    // console.log(parseNewick(life).branchset);

    // For some reason this works
    cluster(root);
    // but this d3.cluster(root) does not


    setRadius(root, root.data.length = 0, (height-50) / maxLength(root));


    root.each(function(d) { console.log("hi " + d.data.name);
                            console.log("x: " + d["x"] + " y: " + d["y"] + " radius: " + d["radius"]) } );

    // var linkExtension = chart.append("g")
    //     .attr("class", "links")
    //     .selectAll("path")
    //     .data(root.links().filter(function(d) { return !d.target.children; }))
    //     .enter().append("path")
    //     .style("stroke", "orange")
    //     .each(function(d) { d.target.linkExtensionNode = this; })
    //         .attr("d", function(d) { return
    //                                  "M " + d.source["x"] + " " + d.source["y"] +
    //                                  " L " + d.target["x"] + " " + d.target["y"] });

    links = chart.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(root.links())
        .enter().append("path")
        .attr("stroke-width", function() { return branch_width_slider.value + "px"; } )
        .style("stroke", "brown")
        .each(function(d) { d.target.linkExtensionNode = this; })
            .attr("d", rectangle_link);


    circles = chart.append("g")
        .attr("class", "circles")
        .selectAll("circle")
        .data(root.links()) // just links to leaves
        .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return d.source["x"]; } )
        .attr("cy", function(d) { return d.source["radius"]; } )
        .style("fill", "black");

    // chart.append("g")
    //     .selectAll("text")
    //     .data(root.links().filter(function(d) { return !d.target.children; }))
    //     .enter().append("text")
    //     .attr("dx", function(d) { return d.source["x"]; } )
    //     .attr("dy", function(d) { return d.source["y"]; } )
    //     .text(function(d) { return d.source.data.name + " -> " + d.target.data.name; });

    labels = chart.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .attr("class", "leaf-labels")
        .attr("dx", function(d) { return d["x"] + label_offset_horizontal(); } )
    // offset the y by label size to keep label from running into the branch
        .attr("dy", function(d) { return d["radius"] + label_offset_vertical(); } )
        .attr("text-anchor", "middle")
        .attr("font-size", leaf_label_size + "px")
        .text(function(d) { return d.data.name; })



    branch_length_listener(links, labels, circles);





    // Utils
    function rand_num_under(val) {
        return Math.floor(Math.random() * val);
    }

    function circle_data(color) {
        return [
            {
                "x": rand_num_under(width),
                "y": rand_num_under(height),
                "color": color
            },
            {
                "x": rand_num_under(width),
                "y": rand_num_under(height),
                "color": color
            },
            {
                "x": rand_num_under(width),
                "y": rand_num_under(height),
                "color": color
            },
            {
                "x": rand_num_under(width),
                "y": rand_num_under(height),
                "color": color
            }
        ];
    }

    function change_color(color) {
        var t = d3.transition().duration(250).ease(d3.easeSin);

        // Svg background
        d3.select("svg").transition(t).style("background-color", color);

        // Label background
        d3.select("#color-select p").transition(t).style("color", color);
    }

    function add_circle(color) {
        var t = d3.transition().duration(1550).ease(d3.easeSin);

        var circle = svg.selectAll("circle")
            .data(circle_data(color));

        // What to do if there is extra data
        circle.exit().transition(t).attr("r", 0).remove();

        // What to do when adding new data
        circle.enter().append("circle")
            .attr("r", 0)
            .transition(t)
            .attr("r", 10)
            .attr("cx", function(d) { return d["x"]; })
            .attr("cy", function(d) { return d["y"]; })
            .style("fill", function(d) { return d.color; });

        // What to do when merging data
        circle
            .merge(circle)
            .transition(t)
            .attr("cx", function(d) { return d["x"]; })
            .attr("cy", function(d) { return d["y"]; })
            .style("fill", function(d) { return d.color; });
    }

    function set_radius_up_and_down(d, y0, k) {
        d["radius"] = (y0 += d.data.length) * k;
        if (d.children) d.children.forEach(function(d) { setRadius(d, y0, k); });
    }

    function set_radius_side_to_side(d, x0, k) {
        d["radius"] = (x0 += d.data.length) * k;
        if (d.children) d.children.forEach(function(d) { setRadius(d, x0, k); });
    }


    // These two are for staight lines
    function straight_link(d) {
        set_x_and_y();
        return "M " + d.source[the_x] + " " + d.source[the_y] + " L " + d.target[the_x] + " " + d.target[the_y];
    }

    function rectangle_link(d) {
        set_x_and_y();

        start_point = d.source[the_x] + " " + d.source[the_y]
        end_point   = d.target[the_x] + " " + d.target[the_y]

        if (document.getElementById("up-and-down").checked) {
            mid_point = d.target[the_x] + " " + d.source[the_y];
        } else {
            mid_point = d.source[the_x] + " " + d.target[the_y];
        }


        return "M " + start_point + " L " + mid_point + " L " + end_point;
    }


    function set_x_and_y() {
        is_variable_length_checked = document.getElementById("variable-length").selected;
        new_y_val = is_variable_length_checked ? "radius" : "y";


        if (document.getElementById("side-to-side").checked) {
            // Do side to side
            the_x =  new_y_val;
            the_y = "x";
            // setRadius = set_radius_side_to_side;
        } else {
            // Do up and down
            the_x = "x";
            the_y = new_y_val;
            // setRadius = set_radius_up_and_down;
        }

    }

    function update_angle() {
        tr = d3.transition().duration(750);
        set_x_and_y();

        circles.transition(tr).attr("cy", function (d) {
            return d.source[the_y];
        }).transition(tr).attr("cx", function(d) {
            return d.source[the_x];
        });

        labels
            .transition(tr).attr("dx", function(d) { return d[the_x] + label_offset_horizontal(); })
            .transition(tr).attr("dy", function(d) { return d[the_y] + label_offset_vertical(); })
            .attr("text-anchor", function(d) { return document.getElementById("side-to-side").checked ? "start" : "middle"; });

        links.transition(tr).attr("d", rectangle_type_button.checked ? rectangle_link : straight_link);


    }

    function label_offset_vertical() {
        current_leaf_label_size = parseInt(font_size_slider.value)

        // // divide by three centers it on the branch
        return document.getElementById("side-to-side").checked ? Math.floor(current_leaf_label_size / 3) : current_leaf_label_size;
    }

    function label_offset_horizontal() {
        current_leaf_label_size = parseInt(font_size_slider.value)

        return document.getElementById("side-to-side").checked ? Math.floor(current_leaf_label_size / 2) : 0;

        return 0;
    }

    function branch_length_listener(links, labels, circles) {
        // TODO this timer doesn't seem to work?
        var tr = d3.transition().duration(250)


        // normal gram vs cladogram
        d3.select("#branch-length-select")
            .on("change", function() {
                set_x_and_y();

                if (rectangle_type_button.checked) {
                    current_link_function = rectangle_link;
                    links.transition(tr).attr("d", rectangle_link);
                } else if (straight_type_button.checked) {
                    current_link_function = straight_link;
                    links.transition(tr).attr("d", straight_link);
                } else {
                    //TODO
                }

                labels.transition(tr).attr("dx", function(d) { return d[the_x] + label_offset_horizontal(); })
                    .attr("dy", function(d) { return d[the_y] + label_offset_vertical() ; });
                circles.transition(tr).attr("cx", function(d) { return d.source[the_x]; } )
                    .attr("cy", function(d) { return d.source[the_y]; } );

            });

        d3.select("#branch-type-select").
            on("change", function() {
                set_x_and_y();

                if (rectangle_type_button.checked) {
                    current_link_function = rectangle_link;
                    links.transition(tr).attr("d", rectangle_link);
                } else if (straight_type_button.checked) {
                    current_link_function = straight_link;
                    links.transition(tr).attr("d", straight_link);
                } else {
                    //TODO
                }

                labels.transition(tr).attr("dx", function(d) { return d[the_x] + label_offset_horizontal();  })
                    .transition(tr).attr("dy", function(d) { return d[the_y] + label_offset_vertical(); });
                circles.transition(tr).attr("cx", function(d) { return d.source[the_x]; } )
                    .transition(tr).attr("cy", function(d) { return d.source[the_y]; } );
            });
    }

    // Compute the maximum cumulative length of any node in the tree.
    function maxLength(d) {
        return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
    }


    // Set the color of each node by recursively inheriting.
    function setColor(d) {
        var name = d.data.name;
        d.color = color.domain().indexOf(name) >= 0 ? color(name) : d.parent ? d.parent.color : null;
        if (d.children) d.children.forEach(setColor);
    }

    /*
      function linkVariable(d) {
      return linkStep(d.source["x"], d.source["radius"], d.target["x"], d.target["radius"]);
      }

      function linkConstant(d) {
      return linkStep(d.source["x"], d.source["y"], d.target["x"], d.target["y"]);
      }

      function linkExtensionVariable(d) {
      return linkStep(d.target["x"], d.target["radius"], d.target["x"], innerRadius);
      }

      function linkExtensionConstant(d) {
      return linkStep(d.target["x"], d.target["y"], d.target["x"], innerRadius);
      }

      // Like d3.svg.diagonal.radial, but with square corners.
      function linkStep(startAngle, startRadius, endAngle, endRadius) {
      var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
      s0 = Math.sin(startAngle),
      c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
      s1 = Math.sin(endAngle);
      return "M" + startRadius * c0 + "," + startRadius * s0
      + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
      + "L" + endRadius * c1 + "," + endRadius * s1;
      }
    */










    // Listeners

    // background color
    d3.select("#color-select #black")
        .on("change", function() { change_color("black") });
    d3.select("#color-select #white")
        .on("change", function() { change_color("white") });
    d3.select("#color-select #blue")
        .on("change", function() { change_color("blue") });
    d3.select("#color-select #red")
        .on("change", function() { change_color("red") });

    // circle adder
    d3.select("#add-circles #green")
        .on("click", function() { add_circle("green") });
    d3.select("#add-circles #purple")
        .on("click", function() { add_circle("purple") });


    // font size
    d3.select("#font-size-select label").html("Size: " + font_size_slider.value);
    d3.select("input#font-size-slider").on("change", function() {
        // Set the label
        d3.select("#font-size-select label").html("Size: " + font_size_slider.value);

        // Update the font size
        labels.transition()
            .attr("font-size", font_size_slider.value + "px")
            .attr("dx", function(d) { return d[the_x] + label_offset_horizontal(); })
            .attr("dy", function(d) { return d[the_y] + label_offset_vertical(); });

    });

    // branch width
    d3.select("#branch-width-select label").html("Width: " + branch_width_slider.value);
    d3.select("input#branch-width-slider").on("change", function() {
        // Set the label
        d3.select("#branch-width-select label").html("Width: " + branch_width_slider.value);

        // Update the branch width
        links.transition()
            .attr("stroke-width", branch_width_slider.value + "px");
    });

    // Up and down or side to side?
    d3.select("form#angle-select-form").on("change", update_angle);










}
