require 'rails_helper'

RSpec.describe "layouts/biom/_chroma_options.html.slim", js: true do
  it "corrects bad values for chroma min" do
    visit biom_path

    click_link "Chroma (saturation) options"

    fill_in("chroma-min", with: "-1234")

    val = find_field("chroma-min").value

    expect(val).to eq "0"
  end
end
