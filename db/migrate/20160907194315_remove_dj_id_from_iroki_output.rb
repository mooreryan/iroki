class RemoveDjIdFromIrokiOutput < ActiveRecord::Migration[5.0]
  def change
    remove_column :iroki_outputs, :dj_id, :integer
  end
end
