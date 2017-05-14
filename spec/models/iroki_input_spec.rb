# == Schema Information
#
# Table name: iroki_inputs
#
#  id            :integer          not null, primary key
#  upload_id     :string
#  newick_str    :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  color_map_str :text
#  name_map_str  :text
#  biom_str      :text
#

require 'rails_helper'

RSpec.describe IrokiInput, type: :model do
  let(:iroki_input) { IrokiInput.new newick_str: "hi",
                                     color_map_str: "bob",
                                     name_map_str: "how are",
                                     biom_str: "you" }

  shared_examples "sets tmp file" do |file, str|
    it "makes a tmp file for the #{file} str" do
      expect(File.exists? paths[file.to_sym]).to be true
    end

    it "writes the proper content for the #{file} file" do
      content = IO.read(paths[file.to_sym]).chomp
      expect(content).to eq str
    end
  end

  shared_examples "doesn't set tmp file" do |file|
    it "puts nil into the hash table" do
      iroki_input.send "#{file}_str=".to_sym, nil
      paths = iroki_input.to_tmp_file!

      expect(paths[file.to_sym]).to be nil
    end
  end

  describe "#to_tmp_file!" do
    context "when all strings have content" do

    let(:paths) { iroki_input.to_tmp_file! }

    include_examples "sets tmp file", "newick", "hi"
    include_examples "sets tmp file", "color_map", "bob"
    include_examples "sets tmp file", "name_map", "how are"
    include_examples "sets tmp file", "biom", "you"
    end
  end

  context "when some of the strings don't have content" do
    include_examples "doesn't set tmp file", "newick"
    include_examples "doesn't set tmp file", "color_map"
    include_examples "doesn't set tmp file", "name_map"
    include_examples "doesn't set tmp file", "biom"
  end
end

