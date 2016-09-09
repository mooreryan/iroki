class AddDjIdFromIrokiOutput < ActiveRecord::Migration[5.0]
  def change
    add_column :iroki_outputs, :dj_id, :string
  end
end
