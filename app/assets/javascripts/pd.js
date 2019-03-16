/**
 * Saves SVGs!
 *
 * @param id The ID of the svg element you want to save.
 */
global.pd.fn.save_svg = function (id, fname) {
  function svg_elem_to_string(id) {
    var svg_elem = document.getElementById(id);

    if (svg_elem) {
      return (new XMLSerializer()).serializeToString(svg_elem);
    }
    else {
      return null;
    }
  }

  var str = svg_elem_to_string(id);

  if (str !== null) {
    saveAs(
      new Blob(
        [str],
        { type: "application/svg+xml" }
      ),
      fname
    );
  }
};

/**
 * Call this function to convert the table data into a TSV and send it for download.
 *
 * @param table_data an array of arrays with table data
 */
global.pd.fn.save_table = function (table_data) {
  if (table_data.length > 0) {
    var header = [
      "Group",
      "NodeCount",
      "PairCount",
      "PairDistTotal",
      "PairDistMean",
      "Dispersion",
      "P",
    ].join("\t");

    // Note, all three p values will match.
    var pval;

    var table = table_data.map(function (row_data) {
      return row_data.join("\t");
      // var row = [];
      //
      // row_data.forEach(function (dat, i) {
      //   if (i < 3) {
      //     // First three columns don't have p values
      //     row.push(dat);
      //   }
      //   else {
      //     // vals are like 1231.32 (p = 0.0021)
      //     var m = dat.match(/^(.*) \(p = (.*)\)$/);
      //     if (m) {
      //       row.push(m[1]);
      //       if (pval === undefined) {
      //         pval = m[2];
      //       }
      //       else {
      //         console.log("WARNING -- p val mismatch encountered.");
      //       }
      //     }
      //     else {
      //       // just push the whole value as it doesn't have p value
      //       row.push(dat);
      //     }
      //   }
      // });
      //
      // row.push(pval);

      // return row.join("\t");
    }).join("\n");

    var table_str = [header, table].join("\n");

    var blob = new Blob(
      [table_str],
      { type: "text/plain;charset=utf-8" }
    );

    // Unicode standard does not recommend using the BOM for UTF-8, so pass in true to NOT put it in.
    saveAs(blob, "pd_table.txt", true);
  }
  else {
    alert("no data in the results table!");
  }
};

g = {};

/**
 *
 * @param tree_scatter this should be from the output of proj_scatter().  Is responds to names and svg.
 */
global.pd.fn.draw.color_points_by_name = function (tree_scatter, group_names) {

  g.tree_scatter = tree_scatter;
  g.group_names  = group_names;

  var circles = tree_scatter.svg
                            .selectAll("circle")
                            .data(tree_scatter.data);

  g.circles = circles;

  circles
    .enter().append("circle")
    .attr("cx", function (d) {
      return 250;
    })
    .attr("cy", function (d) {
      return 250;
    })
    .merge(circles)
    // You have to adjust the location of the nodes so that they are in the correct location for the correct data point.
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    })
    // Set the fill here so it will show up on save.
    .attr("fill", function (d) {
      if (group_names.includes(d.name)) {
        return "rgba(255,150,30, 0.95)";
      }
      else {
        return "rgba(10, 10, 10, 0.35)";
      }
    })
    .attr("class", function (d) {
      if (group_names.includes(d.name)) {
        return "in-current-group";
      }
      else {
        return "not-current-group";
      }
    });

  tree_scatter.svg
              .selectAll("circle.in-current-group")
              .raise();
};

/**
 * Draws and returns the svg and the data (x, y, name)
 *
 * @param group the name of the group (used for the title)
 * @param proj responds to mat (which is an array of arrays), var_exp (an array of var explained 2d), and names (which is a set)
 * @param id id for svg element
 */
global.pd.fn.draw.proj_scatter = function (group, proj, id) {
  d3.select("#" + global.pd.html.id.tree_scatter_svg).remove();

  var svg = d3.select("#" + global.pd.html.id.tree_scatter_container)
              .append("svg")
              .attr("width", 500)
              .attr("height", 500)
              .attr("id", global.pd.html.id.tree_scatter_svg)
              .classed("pd-svg", true);

  var xs = [],
      ys = [];

  proj.mat.forEach(function (row) {
    var x = row[0],
        y = row[1];

    xs.push(x);
    ys.push(y);
  });

  var xmin = d3.min(xs);
  var xmax = d3.max(xs);

  var ymin = d3.min(ys);
  var ymax = d3.max(ys);

  var x_scale = d3.scaleLinear()
                  .domain([xmin, xmax])
                  .range([
                    50,
                    450
                  ]);

  var y_scale = d3.scaleLinear()
                  .domain([ymin, ymax])
                  .range([
                    50,
                    450
                  ]);

  // Add x axis
  svg.append("g")
     .attr("class", "x axis")
     // Shove it to the bottom of the chart.
     .attr(
       "transform",
       "translate(0, " +
       Math.floor(
         450
       ) +
       ")"
     )
     .call(d3.axisBottom(x_scale));

  // X axis label
  var pc1_var_exp = fn.math.round(proj.var_exp[0], 1);
  svg.append("text")
     .attr("transform", "translate(250, 482)")
     .style("text-anchor", "middle")
     .text("PC1 (" + pc1_var_exp + "%)");

  // // Name
  // svg.append("g").append("text").text(group)
  //    .attr("transform", "translate(250, 25)");

  // Add y axis
  svg.append("g")
     .attr("class", "y axis")
     // Shove it to the bottom of the chart.
     .attr(
       "transform",
       "translate(50, 0)"
     )
     .call(d3.axisLeft(y_scale));

  // Y axis label
  var pc2_var_exp = fn.math.round(proj.var_exp[1], 1);
  svg.append("text")
     .attr("transform", "translate(20, 250) rotate(-90)")
     .style("text-anchor", "middle")
     .text("PC2 (" + pc2_var_exp + "%)");

  // .text("PC2");

  var names = Array.from(proj.names);
  var data  = proj.mat.map(function (row, i) {
    return {
      x: x_scale(row[0]),
      y: y_scale(row[1]),
      name: names[i]
    };
  });

  // var simulation =
  //       d3.forceSimulation(data)
  //         .force("collide", d3.forceCollide(function (d) {
  //           // give it a little padding so nodes aren't right up against each other
  //           return 1.5;
  //         }))
  //         .on("tick", draw_circles);


  function draw_circles() {
    var circles = svg.selectAll("circle").data(data);

    circles
      .enter().append("circle")
    // For the default non selected styling
      .attr("class", "not-current-group")
      .attr("r", function (d) {
        return isNaN(d.x) || isNaN(d.y) ? 15 : 5;
      })
      .attr("fill", "rgba(10, 10, 10, 0.35)")
      // .attr("fill", function (d) {
      //   return isNaN(d.x) || isNaN(d.y) ? "red" : "rgba(10, 10, 10, 0.35)";
      // })
      .merge(circles)
      .attr("cx", function (d, i) {
        return isNaN(d.x) ? x_scale(xmin) : (d.x);
      })
      .attr("cy", function (d) {
        return isNaN(d.y) ? y_scale(ymin) : (d.y);
      });

    circles.exit().remove();
  }

  draw_circles();

  return { svg: svg, data: data };
};

global.pd.fn.draw_jk_hist = function (stats, jk_stats, svg) {
  jq(global.pd.html.id.hist_svg).remove();

  // This svg will hold the histogram
  var svg = d3.select("#" + global.pd.html.id.hist_container)
              .append("svg")
              .attr("width", global.pd.hist.width)
              .attr("height", global.pd.hist.height)
              .attr("id", global.pd.html.id.hist_svg)
              .classed("pd-svg", true);


  // radius for the subsample dots
  var radius = 3;
  // actual data is a little bigger so we can see it
  stats.r    = radius * 2;

  stats.type = "actual";

  // this data array will hold actual data and subsamples
  var data = [];
  data.push(stats);

  jk_stats.forEach(function (st) {
    st.r = radius;
    data.push(st);
  });

  var xmin = d3.min(data.map(function (st) {
    return st.disp;
  }));

  var xmax = d3.max(data.map(function (st) {
    return st.disp;
  }));


  var x_scale = d3.scaleLinear()
                  .domain([xmin, xmax])
                  .range([
                    global.pd.hist.width_padding,
                    global.pd.hist.width - global.pd.hist.width_padding
                  ]);

  // Add x axis
  svg.append("g")
     .attr("class", "x axis")
     // Shove it to the bottom of the chart.
     .attr(
       "transform",
       "translate(0, " +
       Math.floor(
         global.pd.hist.height - global.pd.hist.height_padding
       ) +
       ")"
     )
     .call(d3.axisBottom(x_scale));

  // Add x axis label
  svg.append("text")
     .attr(
       "transform",
       "translate(" +
       (global.pd.hist.width / 2) +
       " ," +
       (Math.floor(global.pd.hist.height - (global.pd.hist.height_padding / 4))) +
       ")"
     )
     .style("text-anchor", "middle")
     .text("Dispersion");


  var simulation = d3.forceSimulation(data)
                     .force("x", d3.forceX(function (d) {
                       return x_scale(d.disp);
                     }).strength(1))
                     // Center the graph in the middle heightwise
                     .force("y", d3.forceY(Math.floor(global.pd.hist.height / 2)))
                     .force("collide", d3.forceCollide(function (d) {
                       // give it a little padding so nodes aren't right up against each other
                       return d.r + 1;
                     }))
                     .on("tick", ticked);
  //                    .stop();
  //
  // for (var i = 0; i < 500; ++i) {
  //   simulation.tick();
  // }

  // Note, if the number of jackknifes is big enough, we'd want to calculate the layout first and then just graph the result.  (using the simulation tick for loop above)

  function ticked() {
    var circles = svg.selectAll("circle").data(data);

    circles
      .enter().append("circle")
      .attr("r", function (d) {
        return d.r;
      })
      .attr("fill", function (d) {
        return d.type === "actual" ? global.pd.colors.blue : global.pd.colors.black;
      })
      .merge(circles)
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });

    circles.exit().remove();
  }
};

global.pd.fn.main = function () {
  var tree_uploader  =
        document.getElementById(global.pd.html.id.upload_tree_input);
  var group_uploader =
        document.getElementById(global.pd.html.id.upload_group_input);
  var submit_button  =
        document.getElementById(global.pd.html.id.upload_tree_submit);
  var tree_reader    =
        new FileReader();
  var group_reader   =
        new FileReader();

  var save_hist_button =
        document.getElementById(global.pd.html.id.hist_save);
  save_hist_button.addEventListener("click", function () {
    global.pd.fn.save_svg(global.pd.html.id.hist_svg, "jackknife_beeswarm.svg");
  });

  var save_table_button =
        document.getElementById(global.pd.html.id.results_save);
  save_table_button.addEventListener("click", function () {
    global.pd.fn.save_table(global.pd.all_table_data);
  });

  var save_scatter_button =
        document.getElementById(global.pd.html.id.tree_scatter_save);
  save_scatter_button.addEventListener("click", function () {
    global.pd.fn.save_svg(global.pd.html.id.tree_scatter_svg, "projection_scatter.svg");
  });

  tree_reader.onload = function tree_reader_onload(event) {
    var newick_string = event.target.result;
    var group_file    = group_uploader.files[0];
    if (group_file) {
      group_reader.readAsText(group_file);
    }
    else if (newick_string) {
      global.pd.fn.handle_data(newick_string, null);
    }
    else {
      alert("Something went wrong with the newick string!");
    }

    group_reader.onload = function (event) {
      var group_string = event.target.result;

      global.pd.fn.handle_data(newick_string, group_string);
    };
  };

  // For easier testing, this lets you just click submit and get some test data.
  submit_button.addEventListener("click", function () {
    // global.pd.fn.handle_data(silly.tree, silly.name_graph);
    global.pd.fn.handle_data(silly.weird2, silly.weird2_groups);
  });

  // submit_button.addEventListener("click", function pd_submit_handler() {
  //   var tree_file = tree_uploader.files[0];
  //
  //   if (tree_file) {
  //     tree_reader.readAsText(tree_file);
  //   }
  //   else {
  //     alert("Don't forget a tree file!");
  //   }
  // });
};

/**
 * Returns an object with keys being group name and values being an array of node names in that group.
 *
 * @param group_string
 * @returns {null}
 */
global.pd.fn.parse_group_membership = function (group_string) {
  if (group_string) {
    var lines = group_string.split("\n");

    var group_membership = {};

    lines.forEach(function (line) {
      var ary = line.split("\t");

      var name  = ary[0];
      var group = ary[1];

      if (name && group) {
        if (group_membership[group] === undefined) {
          group_membership[group] = [name];
        }
        else {
          group_membership[group].push(name);
        }
      }
    });

    return group_membership;
  }
  else {
    alert("Upload a group file!");
    return null;
  }
};

global.pd.fn.handle_data = function (newick_string, group_string) {
  $("#" + global.pd.html.id.results_status).text("Calculating stats! (could take a while...)");

  setTimeout(function () {
    // Reset the table data
    global.pd.all_table_data = [];

    var group_membership = global.pd.fn.parse_group_membership(group_string);
    var parsed_newick    = newick__parse(newick_string);

    var tree =
          d3.hierarchy(parsed_newick, function hiearchy_from_newick(d) {
            return d.branchset;
          })
            .sum(function (d) {
              return d.branchset ? 0 : 1;
            })
            .sort(sort_ascending);

    // Set x, y, r
    global.pd.fn.set_up_hierarchy(tree);
    global.pd.fn.draw.tree(tree);

    t                = tree;
    l                = tree.leaves();
    global.pd.tree   = tree;
    global.pd.leaves = tree.leaves();

    var results = $("#" + global.pd.html.id.results);
    results.empty();

    results.append(
      "<tr>" +
      "<th>Group</th>" +
      "<th>Node Count</th>" +
      "<th>Pair Count</th>" +
      "<th>Pair Dist Total</th>" +
      "<th>Pair Dist Mean</th>" +
      "<th>Dispersion</th>" +
      "<th>P Value</th>" +
      "</tr>"
    );

    var leaves    = tree.leaves();
    var group_idx = 0;

    // Whole tree stats
    var whole_tree_stats = global.pd.fn.stats.calc_stats(leaves, true);
    var whole_tree_proj  = global.pd.fn.stats.project_pairs(whole_tree_stats.pairs);

    var tree_scatter = global.pd.fn.draw.proj_scatter("Whole Tree", whole_tree_proj);


    fn.obj.each(group_membership, function (group, names) {
      group_idx++;

      var group_nodes = leaves.filter(function (node) {
        return names.includes(node.data.name);
      });

      // false says don't keep the pair data
      var stats = global.pd.fn.stats.calc_stats(group_nodes, false);

      // var proj = global.pd.fn.stats.project_pairs(stats.pairs);

      // var group_scatter = global.pd.fn.draw.proj_scatter(group, proj, global.pd.html.id.group_scatter);


      // var name_count = 0;
      // proj.names.forEach(function (name) {
      //   // console.log(name, name_count, proj.mat[name_count]);
      //
      //   name_count++;
      // })

      var jackknife_stats = global.pd.fn.stats.jackknife_stats(leaves, group_nodes.length, global.pd.hist.jackknife_iters);


      var pvals = global.pd.fn.stats.compare_to_jackknife_stats(stats, jackknife_stats);

      var table_row_data = global.pd.fn.make_table_row_data(group, stats, pvals);

      global.pd.all_table_data.push(table_row_data);

      results.append(global.pd.fn.make_table_row(group_idx, table_row_data));

      // Attach row group handler
      $("#" + "pd-row-" + group_idx).on("click", function draw_hist() {
        // Set status msg to rendering
        $("#" + global.pd.html.id.hist_status).text("Rendering!");

        setTimeout(function () {
          // var jk_stats = global.pd.fn.stats.jackknife_stats(
          //   leaves,
          //   group_nodes.length,
          //   global.pd.hist.jackknife_iters
          // );

          // We also want to show the user which points in the main scatter are in this group.
          global.pd.fn.draw.color_points_by_name(tree_scatter, names);

          global.pd.fn.draw_jk_hist(stats, jackknife_stats, svg);

          // Update the tree with new colors
          global.pd.fn.draw.tree(tree, names);


          // Set status msg to done
          $("#" + global.pd.html.id.hist_status).text("Done!");

        }, TIMEOUT);
      });


      // results.append(
      //   global.pd.fn.make_table_row(
      //     group + "___",
      //     global.pd.fn.collate_jackknife_stats(jackknife_stats)
      //   )
      // );

      $("#" + global.pd.html.id.results_status).text("Done!");
    });
  }, TIMEOUT);
};

/*
global.pd.fn.len_to_root = function (node) {
  var len   = 0;
  var depth = node.depth;

  var n = node;
  for (var i = 0; i < depth; ++i) {
    len += n.data.branch_length;

    n = n.parent;
  }

  return len;
};

global.pd.fn.avg_len_to_root = function (nodes) {
  return fn.ary.mean(nodes.map(function (d) {
    return global.pd.fn.len_to_root(d);
  }));
};

global.pd.fn.all_phylo_disp = function (leaves) {
  var n1, n2, disp;
  var disps = [];

  for (var i = 0; i < leaves.length - 1; ++i) {
    n1 = leaves[i];

    for (var j = i + 1; j < leaves.length; ++j) {
      n2 = leaves[j];

      disp = global.pd.fn.len_to(n1, n2);
      disps.push([n1, n2, disp]);
    }
  }
};

global.pd.fn.sort_all_phylo_disp = function (all_phylo_disp) {
  all_phylo_disp.sort(function (a, b) {
    var a_disp = a[2];
    var b_disp = b[2];

    if (a_disp < b_disp) {
      return -1;
    }
    else if (a_disp > b_disp) {
      return 1;
    }
    else {
      return 0;
    }
  });
};

*/

global.pd.fn.len_to = function (n1, n2) {
  var path      = n1.path(n2);
  var depths    = path.map(function (d) {
    return d.depth;
  });
  var min_depth = d3.min(depths);

  var len = 0;

  path.forEach(function (n) {
    // The node at the min depth is the least common ancestor.  The branch length of that node is not part of the dispance between the two nodes.
    if (n.depth !== min_depth) {
      len += n.data.branch_length;
    }
  });

  return len;
};

// See https://bost.ocks.org/mike/shuffle/
global.pd.fn.fy_shuf = function (array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t        = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
};

/**
 * Format the stats into an array of data ready to be turned into HTML row.
 *
 * @param group
 * @param stats
 * @param pvals
 * @returns {*[]}
 */
global.pd.fn.make_table_row_data = function (group, stats, pvals) {
  var precision = 3;

  var node_count = fn.math.round(stats.node_count, precision);
  var pair_count = fn.math.round(stats.pair_count, precision);
  var sum        = fn.math.round(stats.sum, precision);
  var mean       = fn.math.round(stats.mean, precision);
  var disp       = fn.math.round(stats.disp, precision);
  var pval;

  // pvals should all be the same
  if (pvals.sum !== undefined) {
    pval = pvals.sum;
  }
  else if (pvals.mean !== undefined) {
    pval = pvals.mean;
  }
  else if (pvals.disp !== undefined) {
    pval = pvals.disp;
  }
  else {
    pval = "";
  }

  // if (!(pvals === undefined)) {
  //   if (!(pvals.sum === undefined)) {
  //     sum += " (p = " + fn.math.round(pvals.sum, precision) + ")";
  //   }
  //
  //   if (!(pvals.mean === undefined)) {
  //     mean += " (p = " + fn.math.round(pvals.mean, precision) + ")";
  //   }
  //   if (!(pvals.disp === undefined)) {
  //     disp += " (p = " + fn.math.round(pvals.disp, precision) + ")";
  //   }
  // }

  return [group, node_count, pair_count, sum, mean, disp, pval];
};

/**
 * Convert the array of table data into HTML row.  Also adds a unique id based on the index.
 *
 * @param idx
 * @param ary
 * @returns {string}
 */
global.pd.fn.make_table_row = function (idx, ary) {
  var row_html = ary.map(function (elem) {
    return "<td>" + elem + "</td>";
  });

  // The table row has the id pd-row-groupName
  return "<tr id=\"pd-row-" + idx + "\">" + row_html + "</tr>";
};

var t, l;


//// Stats

/**
 * The main tree stats function to calculate phylo dist and disp for all pairs of nodes.
 *
 * @param nodes
 * @param keep_pairs if this is true, will also return an array of all dists.  Could take up a lot of space!
 * @returns {{node_count: *, pair_count: number, sum: number, mean: number, disp: number}}
 */
global.pd.fn.stats.calc_stats = function (nodes, keep_pairs) {
  // The total distance for all tip to tip pairs of nodes.
  var total = 0.0;
  var dist  = 0.0;

  // The number of tip to tip pairs.
  var npairs = 0;
  var n1, n2;

  var pairs = [];

  for (var i = 0; i < nodes.length - 1; ++i) {
    n1 = nodes[i];

    for (var j = i + 1; j < nodes.length; ++j) {
      n2 = nodes[j];

      dist = global.pd.fn.len_to(n1, n2);
      total += dist;
      npairs += 1;

      if (keep_pairs) {
        pairs.push([n1, n2, dist]);
      }
    }
  }

  return {
    pairs: pairs,
    node_count: nodes.length,
    pair_count: npairs,
    sum: total,
    mean: total / npairs,
    disp: total / nodes.length
  };

};

/**
 * I shuffle the original array in place, so make sure that's what you want!
 * Also, I return shallow copies!
 */
global.pd.fn.stats.random_sample = function (ary, size) {
  return global.pd.fn.fy_shuf(ary).slice(0, size);
};

/**
 * Calculate stats of random samples of the data.
 *
 * @param nodes
 * @param sample_size
 * @param iters
 * @returns {Array}
 */
global.pd.fn.stats.jackknife_stats = function (nodes, sample_size, iters) {
  var sample, all_stats = [];
  for (var i = 0; i < iters; ++i) {
    sample = global.pd.fn.stats.random_sample(nodes, sample_size);

    all_stats.push(global.pd.fn.stats.calc_stats(sample));
  }

  return all_stats;
};

/**
 * Want to get (sort of) p-values for your stats?  Use this fn.  P value represents number of samples where the jackknife stat was less than actual stat.
 * @param stats
 * @param jackknife_stats
 */
global.pd.fn.stats.compare_to_jackknife_stats = function (stats, jackknife_stats) {
  var sum = 0, mean = 0, disp = 0;

  jackknife_stats.forEach(function (jstats, i) {
    if (jstats.sum < stats.sum) {
      sum++;
    }

    if (jstats.mean < stats.mean) {
      mean++;
    }

    if (jstats.disp < stats.disp) {
      disp++;
    }
  });

  return {
    sum: sum / jackknife_stats.length,
    mean: mean / jackknife_stats.length,
    disp: disp / jackknife_stats.length,
  };
};

global.pd.fn.stats.project_pairs = function (pairs) {
  var names    = new Set();
  var graph    = {};
  var dist_mat = [];


  pairs.forEach(function (pair) {
    var source = pair[0].data.name;
    var target = pair[1].data.name;
    var dist   = pair[2];

    if (graph[source] === undefined) {
      graph[source] = {};
    }
    if (graph[target] === undefined) {
      graph[target] = {};
    }

    graph[source][target] = dist;
    graph[target][source] = dist;

    // Self hits have zero distance.
    graph[source][source] = 0.0;
    graph[target][target] = 0.0;

    names.add(source);
    names.add(target);
  });

  names.forEach(function (k1) {
    var row = [];
    names.forEach(function (k2) {
      row.push(graph[k1][k2]);
    });

    dist_mat.push(row);
  });

  // var proj     = fn.project.project_with_num_pcs_cutoff(
  //   lalolib.array2mat(dist_mat),
  //   2
  // );
  // //console.log(dist_mat)
  // var proj_mat = fn.lalolib.mat2array(proj);
  //
  // return { names: names, mat: proj_mat };

  var proj = fn.project.project_2d_ret_var_exp(
    lalolib.array2mat(dist_mat),
    false
  );

  return { names: names, mat: proj.proj_mat, var_exp: proj.var_exp };

};


/**
 * Call this to set the x, y, and radius values for the tree so that you can draw it later!
 *
 * @param d3_hier I will modify this arg in place!
 */
global.pd.fn.set_up_hierarchy = function (d3_hier) {
  /**
   * From the given `node`, what is sum of branches to the furthest leaf node?
   * @param node
   */
  function len_to_furthest_leaf(node) {
    return node.data.branch_length + (node.children ? d3.max(node.children, len_to_furthest_leaf) : 0);
  }

  /**
   * Set the radius of each node by recursively summing and scaling the distance from the root.
   *
   * @param node You probably want to start with the root.
   * @param r If you start with the root, you'll want to pass 0 for this.
   * @param scale_factor Probably you want to weight the radius by the longest root to leaf length.
   */
  function set_radius(node, r, scale_factor) {
    node.radius = (r += node.data.branch_length) * scale_factor;

    if (node.children) {
      node.children.forEach(function (child) {
        set_radius(child, r, scale_factor);
      });
    }
  }

  var theta  = 360,
      radius = 200;

  var cluster = d3.cluster().size([theta, radius]);

  // This modifies d3_hier!
  cluster(d3_hier);

  // The root is defined to have 0 branch length.
  d3_hier.data.branch_length = 0;

  set_radius(
    d3_hier,
    d3_hier.data.branch_length,
    radius / len_to_furthest_leaf(d3_hier)
  );

  // Now d3_hier is ready to be plotted!
};

/**
 * You need to make sure to run set_up_hierarchy() on `d3_hier` before running this function!
 *
 * @param d3_hier
 */
global.pd.fn.draw.tree = function (d3_hier, group_names) {
  // remove tree TODO merge the old values rather than remove.
  d3.select("#" + global.pd.html.id.tree_svg).remove();

  var svg = d3.select("#" + global.pd.html.id.tree_container).append("svg")
              .attr("width", 500).attr("height", 500)
              .attr("id", global.pd.html.id.tree_svg).classed("pd-svg", true)
              .append("g")
              .attr("transform", "translate(250, 250)");

  var leaves = d3_hier.leaves();

  if (group_names !== undefined) {
    // We want to make sure all paths to the root for these group nodes will be colored.  So mark it.
    leaves.forEach(function (node) {
      var group_status = group_names.includes(node.data.name) ? "in-current-group" : "not-current-group";

      node.group_status = group_status;
      node.ancestors().forEach(function (parent) {
        parent.group_status = group_status;
      });
    });
  }
  else {
    // No group names, make sure all the color vals are unset
    leaves.forEach(function (node) {
      node.group_status = "not-current-group";
      node.ancestors().forEach(function (parent) {
        parent.group_status = "not-current-group";
      });
    });
  }

  // var all_nodes = d3_hier.descendants();
  var all_links = d3_hier.links();
  // var circles   = svg.selectAll("circle").data(all_nodes);

  // function transform_circle(d) {
  //   return "rotate(" + d.x + ") translate(" + d.radius + ", 0)";
  // }

  // circles.enter().append("circle")
  //        .attr("r", 4)
  //        .merge(circles)
  //        .attr("transform", function (d) {
  //          return transform_circle(d);
  //        })
  //        // .attr("cx", function (d) {
  //        //   return Math.cos(d.x) * d.radius;
  //        // })
  //        // .attr("cy", function (d) {
  //        //   return Math.sin(d.y) * d.radius;
  //        // })
  //        .attr("class", function (d) {
  //          return d.data.name;
  //        });
  //
  // circles.exit().remove();

  var links = svg.selectAll("path").data(all_links);

  function link_path(start_angle, start_radius, end_angle, end_radius) {
    var start_radians = start_angle / 180 * Math.PI;
    var end_radians   = end_angle / 180 * Math.PI;

    var x0 = Math.cos(start_radians) * start_radius,
        y0 = Math.sin(start_radians) * start_radius,
        x1 = Math.cos(end_radians) * end_radius,
        y1 = Math.sin(end_radians) * end_radius;

    var arc;

    if (end_angle === start_angle) {
      // e.g., coming straight from the root, no arc necessary
      arc = "";
    }
    else {
      // sweep from the inner node to the outer node
      var sweep_positive  = 1; // clockwise
      var sweep_negative  = 0; // counter clockwise
      var arc_start_x     = start_radius;
      var arc_start_y     = start_radius;
      var x_axis_rotation = 0; // do not rotate x-axis of the ellipse
      var large_arc_flag  = 0; // draw the smaller arc
      var sweep_flag      = end_angle > start_angle ? sweep_positive : sweep_negative;
      var arc_end_x       = start_radius * Math.cos(end_radians);
      var arc_end_y       = start_radius * Math.sin(end_radians);

      arc = " A" + [
        arc_start_x,
        arc_start_y,
        x_axis_rotation,
        large_arc_flag,
        sweep_flag,
        arc_end_x,
        arc_end_y
      ].join(",");
    }


    var path =
          // Move to the source location
          "M" + x0 + "," + y0 +
          // draw the arc if necessary
          arc +
          // Finally draw the line to the endpoint
          " L" + x1 + "," + y1;

    return path;
  }

  links.enter().append("path")
       .attr("fill", "none")
       .attr("stroke-width", 2)
       .merge(links)
       .attr("stroke", function (d) {
         // Only give it the color if its target is also colored.  That way it'll more or less show the Faith's PD.
         return d.target.group_status === "in-current-group" ? global.pd.colors.yellow : global.pd.colors.black;
       })
       .attr("d", function (d) {
         return link_path(d.source.x, d.source.radius, d.target.x, d.target.radius);
       });

  links.exit().remove();
};

// x is always x, y is y in cladograms and r in true dist trees