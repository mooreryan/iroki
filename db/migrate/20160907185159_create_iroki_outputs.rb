class CreateIrokiOutputs < ActiveRecord::Migration[5.0]
  def change
    create_table :iroki_outputs do |t|
      t.string :email
      t.text :nexus
      t.text :error
      t.integer :dj_id

      t.timestamps
    end
  end
end
