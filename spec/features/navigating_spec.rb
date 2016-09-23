require "rails_helper"

RSpec.describe "Navigating", :type => :feature do

  shared_examples_for "has the nav bar" do
    it "has the nav bar links" do
      visit path

      expect(page).to have_link "Iroki",    href: root_path
      expect(page).to have_link "About",    href: about_path
      expect(page).to have_link "Contact",  href: contact_path
      expect(page).to have_link "Citation", href: citation_path
    end
  end

  shared_examples_for "has the proper title" do
    it "has the proper title" do
      visit path

      expect(page).to have_title page_title
    end
  end

  shared_examples_for "has the proper h1" do
    it "has the proper h1" do
      visit path

      expect(page).to have_css "h1", text: page_title
    end
  end

  describe "Home page" do
    let(:path) { root_path }
    let(:page_title) { "" }

    include_examples "has the nav bar"
    include_examples "has the proper title"

    it "should not have | Iroki in the title" do
      visit root_path

      expect(page).not_to have_title "| Iroki"
    end
  end

  describe "About page" do
    let(:path) { about_path }
    let(:page_title) { "About" }

    include_examples "has the nav bar"
    include_examples "has the proper title"
    include_examples "has the proper h1"
  end

  describe "Contact page" do
    let(:path) { contact_path }
    let(:page_title) { "Contact" }

    include_examples "has the nav bar"
    include_examples "has the proper title"
    include_examples "has the proper h1"
  end

  describe "Citation page" do
    let(:path) { citation_path }
    let(:page_title) { "Citation" }

    include_examples "has the nav bar"
    include_examples "has the proper title"
    include_examples "has the proper h1"
  end
end
