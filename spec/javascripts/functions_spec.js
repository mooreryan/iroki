describe("fn", function() {
  describe("math", function() {
    describe("round", function() {
      it("rounds to a certain precesion", function() {
        expect(fn.math.round(4.41, 1)).to.equal(4.4);
      });
    });
  });
});