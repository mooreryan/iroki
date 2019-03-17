global.classify.fn.main = function () {
  var tree_uploader  =
        document.getElementById(global.classify.html.id.upload_tree_input);
  var group_uploader =
        document.getElementById(global.classify.html.id.upload_group_input);
  var submit_button  =
        document.getElementById(global.classify.html.id.upload_submit);
  var tree_reader    =
        new FileReader();
  var group_reader   =
        new FileReader();

  submit_button.addEventListener("click", function classify_submit_handler() {
    var tree_file = tree_uploader.files[0];

    if (tree_file) {
      tree_reader.readAsText(tree_file);
    }
    else {
      alert("Don't forget a tree file!");
    }
  });
  // For easier testing, this lets you just click submit and get some test data.
  // submit_button.addEventListener("click", function () {
  //   global.classify.fn.handle_data(silly.tree, silly.class_labels);
  //   // global.classify.fn.handle_data(silly.weird2, silly.weird2_class_labels);
  // });


  tree_reader.onload = function tree_reader_onload(event) {
    var newick_string = event.target.result;
    var group_file    = group_uploader.files[0];
    if (group_file) {
      group_reader.readAsText(group_file);
    }
    else {
      alert("Don't forget the class label file!");
    }

    group_reader.onload = function (event) {
      var group_string = event.target.result;

      global.classify.fn.handle_data(newick_string, group_string);
    };
  };


  var save_table_button =
        document.getElementById(global.classify.html.id.results_save);
  save_table_button.addEventListener("click", function () {
    global.classify.fn.save_table(global.classify.all_table_data);
  });


};

global.classify.fn.save_table = function (table_data) {
  if (table_data !== undefined && table_data.length > 0) {
    var header = [
      "Name",
      "1-NN",
      "3-NN",
      "5-NN",
      "10-NN"
    ].join("\t");

    var table = table_data.map(function (row_data) {
      return row_data.join("\t");
    }).join("\n");

    var table_str = [header, table].join("\n");

    var blob = new Blob(
      [table_str],
      { type: "text/plain;charset=utf-8" }
    );

    // Unicode standard does not recommend using the BOM for UTF-8, so pass in true to NOT put it in.
    saveAs(blob, "classifications.txt", true);
  }
  else {
    alert("No table data!");
  }
};


global.fn.d3.hierarchy_from_newick = function (parsed_newick) {
  return d3
    .hierarchy(parsed_newick, function (d) {
      return d.branchset;
    })
    .sum(function (d) {
      return d.branchset ? 0 : 1;
    })
    .sort(sort_ascending);
};

global.classify.fn.name2label = function (group_string) {
  if (group_string) {
    var lines = group_string.split("\n");

    var name2label = {};

    lines.forEach(function (line) {
      var ary = line.split("\t");

      var name  = ary[0];
      var label = ary[1];

      if (name && label) {
        if (name2label[name] === undefined) {
          name2label[name] = label;
        }
        else {
          console.log("WARNING -- #{name} was repeated in the class labels file.  Only using the first appearance.");
        }
      }
    });

    return name2label;
  }
  else {
    alert("Upload a class labels file!");
    return null;
  }
};

global.classify.fn.add_known_class_labels = function (d3_hier, name2label) {
  d3_hier.leaves().forEach(function (leaf) {
    var label = name2label[leaf.data.name];

    // TODO when parsing label file, ensure no user classes are the empty string
    if (label === undefined) {
      leaf.class_label = "";
    }
    else {
      leaf.class_label = label;
    }
  });
};

var gryan;
global.classify.fn.handle_data = function (newick_string, group_string) {
  $("#" + global.classify.html.id.results_status)
    .text("Calculating stats! (could take a while...)")
    .css("color", global.colors.blue)
    .toggleClass("blink", true);

  setTimeout(function () {
    // reset table data
    global.classify.all_table_data = [];

    var name2label    = global.classify.fn.name2label(group_string);
    var parsed_newick = newick__parse(newick_string);

    var d3_hier = global.fn.d3.hierarchy_from_newick(parsed_newick);
    gryan       = d3_hier;
    global.fn.d3.set_up_hierarchy(d3_hier);

    global.classify.fn.add_known_class_labels(d3_hier, name2label);

    var classifications = global.classify.fn.classify_nodes(d3_hier);

    var results = $("#" + global.classify.html.id.results_table);
    results.empty();

    results.append(
      "<tr>" +
      "<th>Name</th>" +
      "<th>1-NN</th>" +
      "<th>3-NN</th>" +
      "<th>5-NN</th>" +
      "<th>10-NN</th>" +
      "</tr>"
    );

    fn.obj.each(classifications, function (name, nn_predictions) {
      var dat = [name, nn_predictions].reduce(function (ary, elem) {
        return ary.concat(elem);
      }, []);

      global.classify.all_table_data.push(dat);

      var pred_html = nn_predictions.map(function (str) {
        return "<td>" + str + "</td>";
      }).join("");

      results.append(
        "<tr>" +
        "<td>" + name + "</td>" +
        pred_html +
        "</tr>"
      );
    });


    $("#" + global.classify.html.id.results_status)
      .text("Done! (scroll to see whole table)")
      .css("color", "")
      .toggleClass("blink", false);

  }, TIMEOUT);
};


// Need to have already added the classifications to the d3_hier.  TODO this is a naive algorithm in that it will check each unclassified node against every other classified node, rather than use the tree structure for guidance.
global.classify.fn.classify_nodes = function (d3_hier) {
  var classified = {};

  var unclassified_nodes = d3_hier.leaves().filter(function (leaf) {
    return leaf.class_label === "";
  });

  var classified_nodes = d3_hier.leaves().filter(function (leaf) {
    return leaf.class_label !== "";
  });

  unclassified_nodes.forEach(function (this_node) {
    var dists          = [];
    var classification = [];

    classified_nodes.forEach(function (other_node) {
      dists.push(
        {
          node: other_node.data.name,
          label: other_node.class_label,
          dist: global.fn.d3.branch_length_dist(this_node, other_node)
        }
      );
    });

    // Sort by the dist from lowest to highest
    dists.sort(function (a, b) {
      if (a.dist < b.dist) {
        return -1;
      }
      else if (a.dist === b.dist) {
        return 0;
      }
      else {
        return 1;
      }
    });

    [1, 3, 5, 10].forEach(function (k, i) {
      var counts = {};
      // calculate k-NN for each of these K

      var sl = dists.slice(0, k).map(function (el) {
        return el.label;
      });

      if (sl.length >= k) {
        // we can classify it

        // First count the labels
        sl.forEach(function (label) {
          if (counts[label] === undefined) {
            counts[label] = 1;
          }
          else {
            counts[label] += 1;
          }
        });

        // Then pick the max
        var max_count = -1, best_label = [];
        fn.obj.each(counts, function (label, count) {
          if (count >= max_count) {
            best_label.push(label);
            max_count = count;
          }
        });

        // There can be ties!
        classification[i] = best_label.join("___");
      }
      else {
        // Not enough neighbors!
        classification[i] = "NA";
      }
    });

    classified[this_node.data.name] = classification;
  });

  return classified;
};