require 'rails_helper'

RSpec.describe "layouts/biom/_chroma_options.html.slim", js: true do
  it "corrects bad values for chroma min" do
    visit biom_path

    # See https://stackoverflow.com/questions/20134085/how-to-select-option-in-drop-down-using-capybara
    find("select#biom-conversion-style").find("option#biom-conversion-style-geometry").select_option

    click_link "Options"

    click_link "Chroma (saturation) options"

    fill_in("chroma-min", with: "-1234")

    val = find_field("chroma-min").value

    expect(val).to eq "0"
  end
end
