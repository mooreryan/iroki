class DropIrokiInputs < ActiveRecord::Migration[5.0]
  def change
    drop_table :iroki_inputs
  end
end
