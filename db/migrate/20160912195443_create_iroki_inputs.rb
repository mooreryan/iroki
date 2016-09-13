class CreateIrokiInputs < ActiveRecord::Migration[5.0]
  def change
    create_table :iroki_inputs do |t|
      t.string :upload_id
      t.text :newick_str

      t.timestamps
    end
  end
end
