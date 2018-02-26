class DropIrokiOutputs < ActiveRecord::Migration[5.0]
  def change
    drop_table :iroki_outputs
  end
end
