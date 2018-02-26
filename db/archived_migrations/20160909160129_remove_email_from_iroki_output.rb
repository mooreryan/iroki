class RemoveEmailFromIrokiOutput < ActiveRecord::Migration[5.0]
  def change
    remove_column :iroki_outputs, :email, :string
  end
end
