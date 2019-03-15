function arst_main() {

  var pairs = [
    ["apple", "pieee", 9],
    ["apple", "grape", 5],
    ["pieee", "grape", 3]
  ];

  var keys = new Set();
  var graph = {};
  var dist_mat = []


  pairs.forEach(function(line) {
    source = line[0]
    target = line[1]
    dist = line[2]

    if (graph[source] === undefined) {
      graph[source] = {}
    }
    if (graph[target] === undefined) {
      graph[target] = {}
    }

    graph[source][target] = dist
    graph[target][source] = dist
    graph[source][source] = 0.0
    graph[target][target] = 0.0

    keys.add(source)
    keys.add(target)
  })

  console.log(graph)

  keys.forEach(function(k1) {
    var row = []
    keys.forEach(function(k2) {
      row.push(graph[k1][k2])
    })

    dist_mat.push(row)
  })


  console.log("values", keys.values())
  console.log("dist_mat", dist_mat)


  var proj = fn.project.project_with_num_pcs_cutoff(
    lalolib.array2mat(dist_mat),
    2
  )

  console.log("proj", proj)

  var proj_mat = fn.lalolib.mat2array(proj)

  console.log("proj_mat", proj_mat)

  // This will be the lovely d3 data.
}
