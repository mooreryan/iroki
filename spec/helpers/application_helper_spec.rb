require 'rails_helper'

include ApplicationHelper

describe ApplicationHelper do
  describe "full_title" do
    let(:base_title) { "Iroki" }

    it "should include the page title" do
      expect(full_title "foo").to match /foo/
    end

    it "should include the base title" do
      expect(full_title "foo").to match /^#{base_title}/
    end

    it "should not include a bar for the home page" do
      expect(full_title "").not_to match /\|/
    end
  end
end