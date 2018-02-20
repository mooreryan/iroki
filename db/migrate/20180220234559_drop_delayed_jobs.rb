class DropDelayedJobs < ActiveRecord::Migration[5.0]
  def change
    drop_table :delayed_jobs
  end
end
