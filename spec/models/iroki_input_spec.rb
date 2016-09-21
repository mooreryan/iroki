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
  # pending "add some examples to (or delete) #{__FILE__}"
end
