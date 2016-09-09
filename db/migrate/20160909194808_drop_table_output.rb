class DropTableOutput < ActiveRecord::Migration[5.0]
  def change
    drop_table :outputs
  end
end
