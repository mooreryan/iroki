# == Schema Information
#
# Table name: iroki_outputs
#
#  id         :integer          not null, primary key
#  nexus      :text
#  error      :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  dj_id      :string
#  filename   :string
#

class IrokiOutput < ApplicationRecord
  # has_one :dj_id, class_name: Delayed::Job

  validates_presence_of :dj_id

  def send_result
    # TODO assert :nexus col is not empty
    if self.nexus.nil? && self.error.nil?
      # TODO error
    elsif !self.nexus.nil? && !self.error.nil?
      # TODO error
    elsif !self.nexus.nil?
      self.nexus
    else
      self.error
    end
  end
end
