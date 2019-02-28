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
        beforeEach(function () {
          reset_all_to_defaults();
        });

        it("sets default layout shape", function () {
          expect(
            $("#" + global.html.id.tree_layout).val()
          ).to.equal(global.html.id.tree_layout_radial);

          expect(
            $("#" + global.html.id.tree_layout_radial).prop("selected")
          ).to.be.true;
        });

        it("sets default branch style", function () {
          expect(
            $("#" + global.html.id.tree_branch_style).val()
          ).to.equal(global.html.id.tree_branch_style_normal);

          expect(
            $("#" + global.html.id.tree_branch_style_normal).prop("selected")
          ).to.be.true;
        });

        it("sets default sorting", function () {
          expect(
            $("#" + global.html.id.tree_sorting).val()
          ).to.equal(global.html.id.tree_sorting_forward);

          expect(
            $("#" + global.html.id.tree_sorting_forward).prop("selected")
          ).to.be.true;
        });

        it("sets default tree rotation", function () {
          expect(
            parseInt($("#" + global.html.id.tree_rotation).val())
          ).to.equal(viewer.defaults.tree_rotation);
        });

        it("sets default tree root option", function() {
          expect(
            $("#" + global.html.id.biologically_rooted).prop("checked")
          ).to.be.true;
        })
      });
    });
  });
});