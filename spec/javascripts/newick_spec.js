//= require spec_helper_functions

describe("newick__parse", function () {
  it("parses a newick file", function () {
    var expected = '{"branch_length":1,"branchset":[{"branch_length":3,"name":"apple"},{"branch_length":10,"name":"","branchset":[{"branch_length":4,"name":"pie"},{"branch_length":5,"name":"good"}]}],"name":""}';

    var actual = JSON.stringify(newick__parse("(apple:3, (pie:4, good:5):10)"));

    expect(actual).to.equal(expected);
  });

  it("handles loads of edge cases");
});