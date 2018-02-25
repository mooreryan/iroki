require 'rails_helper'

RSpec.describe "layouts/biom/_chroma_options.html.slim", js: true do
  it "displays the todo title" do
    visit biom_path

    click_link "Chroma (saturation) options"

    fill_in("chroma-min", with: "15")

    val = find_field("chroma-min").value

    ""

    expect(val).to eq "15"
  end
end
