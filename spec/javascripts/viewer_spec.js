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

        describe("tree format options", function () {
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

          it("sets default tree root option", function () {
            expect(
              $("#" + global.html.id.biologically_rooted).prop("checked")
            ).to.be.true;
          });
        });

        describe("tree size options", function () {
          it("sets default tree width", function () {
            expect(
              parseInt($("#" + global.html.id.tree_width).val())
            ).to.equal(viewer.defaults.radial.width);
          });

          it("sets default tree height", function () {
            expect(
              parseInt($("#" + global.html.id.tree_height).val())
            ).to.equal(viewer.defaults.radial.height);
          });

          it("sets default tree padding", function () {
            expect(
              parseFloat($("#" + global.html.id.tree_padding).val())
            ).to.equal(viewer.defaults.tree_padding);
          });
        });

        describe("scale bar options", function () {

          it("checks show scale bar", function () {
            expect(
              $("#" + global.html.id.scale_bar_show).prop("checked")
            ).to.be.true;
          });

          it("sets default scale bar offset", function () {
            expect(
              parseFloat($("#" + global.html.id.scale_bar_offset_weight).val())
            ).to.equal(viewer.defaults.scale_bar_offset_weight);
          });

          it("checks autosize scale bar", function () {
            expect(
              $("#" + global.html.id.scale_bar_autosize).prop("checked")
            ).to.equal(viewer.defaults.scale_bar_autosize_is_checked);
          });

          it("sets the default scale bar length", function () {
            expect(
              parseFloat($("#" + global.html.id.scale_bar_length).val())
            ).to.equal(viewer.defaults.scale_bar_length);

            expect(
              $("#" + global.html.id.scale_bar_length).prop("disabled")
            ).to.equal(viewer.defaults.scale_bar_length_is_disabled);
          });
        });

        describe("label options", function () {
          describe("inner label options", function () {
            it("unchecks show leaf labels", function () {
              expect(
                $("#" + global.html.id.inner_labels_show).prop("checked")
              ).to.be.false;
            });

            it("sets inner label default size", function () {
              expect(
                parseInt($("#" + global.html.id.inner_labels_size).val())
              ).to.equal(viewer.defaults.inner_labels_size);
            });

            it("sets inner label default color", function () {
              expect(
                $("#" + global.html.id.inner_labels_color).val()
              ).to.equal(viewer.defaults.inner_labels_color);
            });

            it("sets the inner label default font", function () {
              expect(
                $("#" + global.html.id.inner_labels_font).val()
              ).to.equal(viewer.defaults.inner_labels_font);

              expect(
                $("#" + global.html.id.inner_labels_font_helvetica).prop("selected")
              ).to.be.true;
            });
          });

          describe("leaf label options", function () {
            it("sets show leaf labels to default", function () {
              expect(
                $("#" + global.html.id.leaf_labels_show).prop("checked")
              ).to.equal(viewer.defaults.leaf_labels_show);
            });

            it("sets default leaf label size", function () {
              expect(
                parseInt($("#" + global.html.id.leaf_labels_size).val())
              ).to.equal(viewer.defaults.leaf_labels_size);
            });

            it("sets default leaf label padding", function () {
              expect(
                parseFloat($("#" + global.html.id.leaf_labels_padding).val())
              ).to.equal(viewer.defaults.leaf_labels_padding);
            });

            it("sets the default for aligning tip labels", function () {
              "align-tip-labels";
              expect(
                $("#" + global.html.id.leaf_labels_align).prop("checked")
              ).to.equal(viewer.defaults.leaf_labels_align);
            });

            it("sets the default label rotation", function () {
              expect(
                parseFloat($("#" + global.html.id.leaf_labels_rotation).val())
              ).to.equal(viewer.defaults.leaf_labels_rotation);
            });

            it("sets the default leaf label color", function () {
              expect(
                $("#" + global.html.id.leaf_labels_color).val()
              ).to.equal(viewer.defaults.leaf_labels_color);
            });

            it("sets the default leaf label font", function () {
              expect(
                $("#" + global.html.id.leaf_labels_font).val()
              ).to.equal(viewer.defaults.leaf_labels_font);

              expect(
                $("#" + global.html.id.leaf_labels_font_helvetica).prop("selected")
              ).to.be.true;
            });
          });
        });

        describe("dot options", function () {
          describe("inner dot options", function () {
            it("sets show inner dots default", function () {
              expect(
                $("#" + global.html.id.inner_dots_show).val()
              ).to.equal(viewer.defaults.inner_dots_show);

              expect(
                $("#" + viewer.defaults.inner_dots_show).prop("selected")
              ).to.be.true;
            });

            it("sets open dot cutoff default", function () {
              expect(
                parseFloat($("#" + global.html.id.inner_dots_cutoff_unfilled).val())
              ).to.equal(viewer.defaults.inner_dots_cutoff_unfilled);
            });

            it("sets filled dot cutoff default", function () {
              expect(
                parseFloat($("#" + global.html.id.inner_dots_cutoff_filled).val())
              ).to.equal(viewer.defaults.inner_dots_cutoff_filled);
            });

            it("sets inner dot color default", function () {
              expect(
                $("#" + global.html.id.inner_dots_color).val()
              ).to.equal(viewer.defaults.inner_dots_color);
            });

            it("sets inner dot size default", function () {
              expect(
                parseFloat($("#" + global.html.id.inner_dots_size).val())
              ).to.equal(viewer.defaults.inner_dots_size);
            });
          });

          describe("leaf dot options", function () {
            it("sets show leaf dots default", function () {
              expect(
                $("#" + global.html.id.leaf_dots_show).prop("checked")
              ).to.eq(viewer.defaults.leaf_dots_show);
            });

            it("sets align leaf dots default", function () {
              expect(
                $("#" + global.html.id.leaf_dots_align).prop("checked")
              ).to.eq(viewer.defaults.leaf_dots_align);
            });

            it("sets leaf dot color default", function () {
              expect(
                $("#" + global.html.id.leaf_dots_color).val()
              ).to.equal(viewer.defaults.leaf_dots_color);
            });

            it("sets leaf dot size default", function () {
              expect(
                parseFloat($("#" + global.html.id.leaf_dots_size).val())
              ).to.equal(viewer.defaults.leaf_dots_size);
            });
          });
        });

        describe("bar options"); // START HERE
      });
    });
  });
});