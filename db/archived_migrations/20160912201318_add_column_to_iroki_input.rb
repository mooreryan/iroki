class AddColumnToIrokiInput < ActiveRecord::Migration[5.0]
  def change
    add_column :iroki_inputs, :color_map_str, :text
    add_column :iroki_inputs, :name_map_str, :text
    add_column :iroki_inputs, :biom_str, :text
  end
end
