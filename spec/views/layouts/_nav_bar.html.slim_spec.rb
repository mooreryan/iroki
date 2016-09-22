require 'rails_helper'

def it_has_link name
  path = if name == "Iroki"
           "/"
         else
           "/#{name.downcase}"
         end

  it "has the #{name} link" do
    render partial: "layouts/nav_bar.html.slim"

    expect(rendered).to have_link name, href: path
  end
end

RSpec.describe "nav_bar.html.slim" do
  it_has_link "Iroki"
  it_has_link "About"
  it_has_link "Contact"
  it_has_link "Citation"
end
