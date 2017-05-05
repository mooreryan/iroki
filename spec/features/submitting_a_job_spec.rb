require "rails_helper"

RSpec.describe "User submits a job", type: :feature do
  let(:test_files) { File.join File.dirname(__FILE__), "..", "test_files" }

  let(:color_map_override_biom) {
    File.join test_files, "color_map_override.biom.txt" }
  let(:color_map_override_tre) {
    File.join test_files, "color_map_override.tre.txt" }
  let(:color_map_override_color_map) {
    File.join test_files, "color_map_override.color_map.txt" }
  let(:color_map_override_name_map) {
    File.join test_files, "color_map_override.name_map.txt" }
  let(:color_map_override_nex) { # expected result
    File.join test_files, "color_map_override.nex.txt" }

  let(:min_lumin) { 50 }
  let(:max_lumin) { 90 }

  scenario "when they submit a color map, name map, and biom file" do
    visit root_path

    attach_file :newick_file, color_map_override_tre
    attach_file :color_map,   color_map_override_color_map
    attach_file :name_map,    color_map_override_name_map
    attach_file :biom_file,   color_map_override_biom

    check :color_branches
    check :color_labels
    check :exact

    choose :single_color_false

    select min_lumin, from: :min_lumin
    select max_lumin, from: :max_lumin

    click_button "Submit"

    expect(page).to have_content "Job Info"
  end
end
