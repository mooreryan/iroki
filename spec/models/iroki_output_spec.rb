require 'rails_helper'

RSpec.describe IrokiOutput, type: :model do
  subject {
    described_class.new(nexus: "foo",
                        error: "foo",
                        dj_id: "1")
  }

  describe "validations" do
    it "is valid with valid attrs" do
      expect(subject).to be_valid
    end

    it "is not valid without a dj_id" do
      subject.dj_id = nil

      expect(subject).not_to be_valid
    end
  end

  # describe "associations" do
  #   it { should have_one :dj_id }
  # end
end
