function leaf_names(tree)
{
  var names = [];
  function get_names(branchset)
  {
    branchset.forEach(function (set) {
      if (set.branchset) {
        // Not at a leaf yet, recurse
        get_names(set.branchset);
      } else {
        // it's a leaf, get the name
        names.push(set.name);
      }
    });
  }

  var branchset = tree.branchset;
  get_names(branchset);

  return names;
}