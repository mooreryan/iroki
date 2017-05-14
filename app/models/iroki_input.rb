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

class IrokiInput < ApplicationRecord
  def to_tmp_file!
    { newick:    write_tmp_file!(self.newick_str),
      color_map: write_tmp_file!(self.color_map_str),
      name_map:  write_tmp_file!(self.name_map_str),
      biom:      write_tmp_file!(self.biom_str) }
  end

  def write_tmp_file! str
    if str.nil? || str.empty?
      return nil
    else
      tmp = Tempfile.new 'foo'
      tmp.write str
      tmp.close

      return tmp.path
    end
  end
end
