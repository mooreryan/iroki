# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160912201318) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "delayed_jobs", force: :cascade do |t|
    t.integer  "priority",   default: 0, null: false
    t.integer  "attempts",   default: 0, null: false
    t.text     "handler",                null: false
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["priority", "run_at"], name: "delayed_jobs_priority", using: :btree
  end

  create_table "iroki_inputs", force: :cascade do |t|
    t.string   "upload_id"
    t.text     "newick_str"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.text     "color_map_str"
    t.text     "name_map_str"
    t.text     "biom_str"
  end

  create_table "iroki_outputs", force: :cascade do |t|
    t.text     "nexus"
    t.text     "error"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "dj_id"
    t.string   "filename"
  end

end
