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
