class AddColumnToIrokiOutput < ActiveRecord::Migration[5.0]
  def change
    add_column :iroki_outputs, :filename, :string
  end
end
