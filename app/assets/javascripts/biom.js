function ary_min_max(ary)
{
  var min = null;
  var max = null;
  ary.forEach(function(val){
    if (!max || val > max) {
      max = val;
    }

    if (!min || val < min) {
      min = val;
    }
  });

  return { min: min, max: max };
}



function parse_biom_file(str)
{
  // Parse mapping string.
  var csv = Papa.parse(chomp(str), PAPA_CONFIG);

  // TODO test
  // Check for erros
  if (has_papa_errors(csv)) {
    return null;
  }

  // TODO test
  if (csv.meta.fields.indexOf("name") === -1) {
    alert("ERROR -- Missing the 'name' column header in the biom file.");
    return null;
  }

  // TODO check for duplicated sample name headers.

  var column_info = {};


  csv.meta.fields.forEach(function(field) {
    column_info[field] = [];
  });

  csv.data.map(function(line) {
    json_each(line, function(col_header, col_data) {
      column_info[col_header].push(col_data);
    })
  });

  var scaled_counts = {};

  json_each(column_info, function(sample_name, ary) {
    if (sample_name !== "name") {
      // Key is one of the samples with the counts.
      var min_max = ary_min_max(ary);
      var min = min_max.min;
      var max_minus_min = min_max.max - min;

      scaled_counts[sample_name] = ary.map(function(count) {
        return (count - min) / max_minus_min;
      });
    }
  });

  return csv;
}

function round_to(x, place)
{
  return Math.round(place * x) / place;
}

// TODO should this be multiplyed by two?
function get_point(count, sample_idx, num_samples)
{
  var angle = sample_to_angle(sample_idx, num_samples);

  var pt = {
    x: round_to(count * Math.cos(angle), 10000),
    y: round_to(count * Math.sin(angle), 10000)
  };

  return pt;
}

// Sample idx starts at zero
function sample_to_angle(sample_idx, num_samples)
{
  return (2 * Math.PI / num_samples) * sample_idx;
}

// Count data is from the csv.data from Papa.
// samples is from csv.meta.fields
function sample_counts_to_points(csv)
{
  var count_data = csv.data;
  var samples = csv.meta.fields;

  // subtract 1 to account for the 'name' field
  var num_samples = samples.length - 1;

  // TODO check to see if the json keeps the order.
  var points = {};

  count_data.forEach(function(dat) {
    var leaf_name = "";

    // First you need the max count.
    var max_count = null;
    json_each(dat, function(sample_name, count) {
      if (sample_name !== "name") {
        var count = dat[sample_name];

        if (!max_count || max_count < count) {
          max_count = count;
        }
      }
    });


    samples.forEach(function(sample, sample_idx) {
      // subract one to account for the 'name' field.
      sample_idx -= 1;

      if (sample === "name") {
        leaf_name = dat[sample];
        points[leaf_name] = {};
      } else  { // one of the fields is name (not a sample)
        var count = dat[sample] / max_count;
        var pt = get_point(count, sample_idx, num_samples);

        points[leaf_name][sample] = pt;
      }
    });
  });

  return points;
}


function signed_area_of_triangle(p1, p2, p3)
{
  return ((p1.x * (p2.y - p3.y)) + (p2.x * (p3.y - p1.y)) + (p3.x * (p1.y - p2.y))) / 2;
}

function centroid_of_triangle(p1, p2, p3)
{
  return { x: (p1.x + p2.x + p3.x) / 3, y: (p1.y + p2.y + p3.y) / 3 };
}

// TODO instead of calculating all triangles, could save some steps by removing p2 from the points obj and rerunning.  (this would also required using signed area)
// TODO needs at least 3 samples.
function centroids_of_points(all_points)
{

  var centroids = {};

  json_each(all_points, function(leaf, points) {
    var samples = json_keys(points);
    var sum_x_numer = 0;
    var sum_y_numer = 0;
    var sum_denom = 0;

    // For each triangle...
    for (var i = 0; i < samples.length; ++i) {
      if (i < samples.length - 2) {
        var p1 = points[samples[i]    ];
        var p2 = points[samples[i + 1]];
        var p3 = points[samples[i + 2]];
      } else if (i < samples.length - 1) {
        var p1 = points[samples[i]    ];
        var p2 = points[samples[i + 1]];
        var p3 = points[samples[0]    ];
      } else {
        var p1 = points[samples[i]];
        var p2 = points[samples[0]];
        var p3 = points[samples[1]];
      }

      var signed_area = signed_area_of_triangle(p1, p2, p3);
      var area = Math.abs(signed_area);
      var centroid = centroid_of_triangle(p1, p2, p3);

      sum_x_numer += area * centroid.x;
      sum_y_numer += area * centroid.y;
      sum_denom += area;
    }

    centroids[leaf] = {
      x: sum_x_numer / sum_denom,
      y: sum_y_numer / sum_denom
    };
  });

  return centroids;
}

function centroids_of_samples(biom_txt)
{
  var points = sample_counts_to_points(parse_biom_file(biom_txt));

  return centroids_of_points(points);
}

function colors_from_centroids(centroids, csv)
{
  function mag(pt)
  {
    return Math.sqrt(Math.pow(pt.x, 2) + Math.pow(pt.y, 2));
  }

  function rad_to_deg(rad)
  {
    return rad * 180 / Math.PI;
  }


  console.log(centroids);
  console.log(csv);

  var avg_counts = {};
  var max_avg_count = 0;
  csv.data.forEach(function(dat) {
    var n = 0;
    var this_leaf = "";
    console.log("dat is: " + JSON.stringify(dat, null, 2));
    json_each(dat, function(key, val) {
      if (key === "name") {
        this_leaf = val;
        avg_counts[this_leaf] = 0;
      } else {
        avg_counts[this_leaf] += val;
        n += 1;
      }
    });


    console.log("n: " + n);
    console.log("avg_counts before: " + JSON.stringify(avg_counts));
    avg_counts[this_leaf] /= n;

    if (max_avg_count < avg_counts[this_leaf]) {
      max_avg_count = avg_counts[this_leaf];
    }
  });

  console.log(avg_counts);

  var colors = {}
  json_each(centroids, function(leaf, pt) {
    // the angle of the vector from origin to centroid.
    var hue = rad_to_deg(Math.atan2(pt.y, pt.x));
    console.log("RYAN: leaf: " + leaf + " pt: " + JSON.stringify(pt) + " hue: " + hue);

    // double it cos the max is half the radius but should be 1.
    var saturation = mag(pt) * 2;

    // we want the highest to be 0.5 ie pure color.
    var lightness = avg_counts[leaf] / max_avg_count / 2;

    console.log("leaf: " + leaf + " " + chroma.hsl(hue, saturation, lightness).hsl());

    colors[leaf] = chroma.hsl(hue, saturation, lightness).hex();
  });

  return colors;
}

function biom__colors_from_biom_str(biom_str) {
  var centroids = centroids_of_samples(biom_str)
  var biom_csv = parse_biom_file(biom_str);

  return colors_from_centroids(centroids, biom_csv);
}

function json_to_tsv(json) {
  var strings = [];
  json_each(json, function(key, val) {
    var str = [key, val].join("\t");

    strings.push(str);
  });

  return strings.join("\n");
}

function biom__save_abundance_colors(biom_str) {
  var colors = biom__colors_from_biom_str(biom_str);
  var tsv_str = json_to_tsv(colors);

  var blob = new Blob([tsv_str], {type: "text/plain;charset=utf-8"});

  saveAs(blob, "mapping.txt");
}