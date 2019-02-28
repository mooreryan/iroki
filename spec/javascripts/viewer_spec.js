describe("viewer", function () {
  // afterEach("Remove all fixtures", function () {
  //   MagicLamp.polish();
  // });

  describe("options panel", function () {
    beforeEach("load the thing", function () {
      MagicLamp.wish("options_panel");
    });

    context("setting the default options", function () {
      describe("reset_all_to_defaults()", function () {
        before(function () {
          reset_all_to_defaults();
        });

        it("sets default layout shape", function () {
          expect($("#tree-shape").val()).to.equal("radial-tree");
          expect($("#radial-tree").prop("selected")).to.be.true;
        });
      });
    });
  });
});